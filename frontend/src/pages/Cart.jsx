import React, { useState, useContext, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { SystemContext } from '../context/SystemContext';
import { loadRazorpay } from '../utils/razorpay';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { olaRestApi } from '../utils/olaRestApi';

const CheckoutSchema = Yup.object().shape({
    customerName: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full Name is required'),
    contactNumber: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
        .required('Contact Number is required'),
    address: Yup.string()
        .min(10, 'Address must be at least 10 characters')
        .required('Delivery Address is required'),
    flatBuilding: Yup.string().optional(),
    floorUnit: Yup.string().optional(),
    deliveryDate: Yup.string().required('Delivery Date is required'),
    deliveryTime: Yup.string().required('Delivery Time is required'),
    pincode: Yup.string()
        .matches(/^[0-9]{6}$/, 'Pincode must be exactly 6 digits')
        .required('Pincode is required'),
    location: Yup.string().required('Location is required for delivery calculation'),
    paymentMethod: Yup.string().required('Payment Method is required')
});

const Cart = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { settings } = useContext(SystemContext);
    const items = state?.items || [];

    const [deliveryAreas, setDeliveryAreas] = useState([]);
    const [areaCenter, setAreaCenter] = useState(null);
    const [deliverySettings, setDeliverySettings] = useState([]);
    const [deliveryTimes, setDeliveryTimes] = useState([]);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState(null);
    const [isOutOfRange, setIsOutOfRange] = useState(false);
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
    const [isLocating, setIsLocating] = useState(false);
    const [selectedDeliveryDate, setSelectedDeliveryDate] = useState('');

    // Autocomplete states
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
    const suggestionsRef = useRef(null);
    const blurTimerRef = useRef(null);

    // Location Permission Modal State
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [locationPermissionState, setLocationPermissionState] = useState('unknown'); // 'unknown', 'prompt', 'granted', 'denied'
    const setFieldValueRef = useRef(null); // To store setFieldValue for modal callback
    const autocompleteTimeoutRef = useRef(null); // Debounce timer for autocomplete

    // Pincode Validation State
    const [isPincodeValid, setIsPincodeValid] = useState(null); // null=not checked, true=valid, false=invalid
    const [pincodeAreaName, setPincodeAreaName] = useState('');
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);

    useEffect(() => {
        fetchDeliveryAreas();
        fetchAreaCenter();
        fetchSettings();

        // Click outside to close suggestions
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchDeliveryAreas = async () => {
        try {
            const res = await api.get('/api/areas');
            setDeliveryAreas(res.data.filter(area => area.isActive));
        } catch (error) {
            console.error("Failed to fetch delivery areas", error);
        }
    };

    const fetchAreaCenter = async () => {
        try {
            const res = await api.get('/api/centers');
            const activeCenter = res.data.find(c => c.isActive);
            setAreaCenter(activeCenter);
        } catch (error) {
            console.error("Failed to fetch area center", error);
        }
    };

    // Validate pincode against allowed delivery areas
    const validatePincode = async (pincode) => {
        if (!pincode || pincode.length !== 6) {
            setIsPincodeValid(null);
            setPincodeAreaName('');
            return;
        }

        setIsCheckingPincode(true);
        try {
            const { data } = await api.get(`/api/pincodes/check/${pincode}`);
            setIsPincodeValid(data.isDeliverable);
            setPincodeAreaName(data.areaName || '');

            if (data.isDeliverable) {
                toast.success(`✅ ${data.message}`);
            } else {
                toast.warning(`⚠️ ${data.message}`);
            }
        } catch (error) {
            console.error("Pincode validation error:", error);
            setIsPincodeValid(null);
        } finally {
            setIsCheckingPincode(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/admin/settings');
            if (res.data.deliveryCharges && res.data.deliveryCharges.length > 0) {
                const sortedCharges = res.data.deliveryCharges.sort((a, b) => a.minDistance - b.minDistance);
                setDeliverySettings(sortedCharges);
            } else {
                setDeliverySettings([
                    { minDistance: 0, maxDistance: 1, charge: 0 },
                    { minDistance: 1, maxDistance: 2, charge: 20 },
                    { minDistance: 2, maxDistance: 3, charge: 40 },
                    { minDistance: 3, maxDistance: 5, charge: 60 }
                ]);
            }

            if (res.data.deliveryTimes && res.data.deliveryTimes.length > 0) {
                const sortedTimes = res.data.deliveryTimes.sort((a, b) => a.minDistance - b.minDistance);
                setDeliveryTimes(sortedTimes);
            } else {
                setDeliveryTimes([
                    { minDistance: 0, maxDistance: 1, time: 15 },
                    { minDistance: 1, maxDistance: 2, time: 30 },
                    { minDistance: 2, maxDistance: 3, time: 45 },
                    { minDistance: 3, maxDistance: 5, time: 60 }
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    // Fallback Haversine distance calculation
    const calculateDistanceHaversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const calculateDeliveryDetails = async (lat, lng) => {
        if (!areaCenter) return;

        let distanceInKm = 0;

        try {
            // Use Ola Maps Distance Matrix API
            const origins = `${areaCenter.latitude},${areaCenter.longitude}`;
            const destinations = `${lat},${lng}`;

            const data = await olaRestApi.getDistanceMatrix(origins, destinations);
            console.log('Ola Maps Distance Matrix Response:', JSON.stringify(data, null, 2));

            if (data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0]) {
                const element = data.rows[0].elements[0];
                if (element.status === 'OK') {
                    // distance.value is in meters in standard Google/Ola Maps API
                    if (element.distance && typeof element.distance.value === 'number') {
                        distanceInKm = element.distance.value / 1000;
                    } else if (typeof element.distance === 'number') {
                        // Some APIs return direct km/meters
                        distanceInKm = element.distance / 1000;
                    } else if (element.distance && typeof element.distance === 'string') {
                        // Parse "12.5 km" or similar string responses if necessary
                        const numeric = parseFloat(element.distance.replace(/[^0-9.]/g, ''));
                        if (!isNaN(numeric)) {
                            distanceInKm = element.distance.includes('m') && !element.distance.includes('km') ? numeric / 1000 : numeric;
                        }
                    }

                    // Fallback if parsing failed but we have a text description
                    if (distanceInKm === 0 && element.distance && element.distance.text) {
                        const numeric = parseFloat(element.distance.text.replace(/[^0-9.]/g, ''));
                        distanceInKm = numeric;
                    }

                    // Final sanity check - if distance is still 0 or insanely high, fallback
                    if (distanceInKm < 0 || distanceInKm > 20000) { // >20000km is impossible on earth typically for delivery
                        console.warn('Sanity check failed for API distance, using Haversine');
                        distanceInKm = calculateDistanceHaversine(areaCenter.latitude, areaCenter.longitude, lat, lng);
                    }

                    console.log(`Ola Maps Calculated Distance: ${distanceInKm.toFixed(3)} km`);
                } else {
                    console.warn('Ola Maps Distance Matrix returned non-OK status, falling back to Haversine');
                    distanceInKm = calculateDistanceHaversine(areaCenter.latitude, areaCenter.longitude, lat, lng);
                }
            } else {
                console.warn('Invalid Ola Maps Distance Matrix response structure, falling back to Haversine');
                distanceInKm = calculateDistanceHaversine(areaCenter.latitude, areaCenter.longitude, lat, lng);
            }

        } catch (error) {
            console.error('Error calculating distance with Ola Maps, falling back to Haversine', error);
            distanceInKm = calculateDistanceHaversine(areaCenter.latitude, areaCenter.longitude, lat, lng);
        }

        // Check Area Range (Geofencing)
        let inAreaRange = false;
        if (deliveryAreas.length === 0) {
            inAreaRange = true;
        } else {
            for (const area of deliveryAreas) {
                // We use Haversine for "as the crow flies" radius check which is standard for delivery zones
                const dist = calculateDistanceHaversine(lat, lng, area.latitude, area.longitude);
                if (dist <= area.radius) {
                    inAreaRange = true;
                    break;
                }
            }
        }

        // Check Delivery Distance Range (from Handle Delivery settings)
        let inDistanceRange = false;
        const hasCharges = deliverySettings.length > 0;
        const hasTimes = deliveryTimes.length > 0;

        if (!hasCharges && !hasTimes) {
            inDistanceRange = true;
        } else {
            // Check if the distance falls into any defined charge slot OR time slot
            // Using <= for maxDistance to be inclusive of the upper bound
            const coveredByCharge = hasCharges && deliverySettings.some(slot => distanceInKm >= slot.minDistance && distanceInKm <= slot.maxDistance);
            const coveredByTime = hasTimes && deliveryTimes.some(slot => distanceInKm >= slot.minDistance && distanceInKm <= slot.maxDistance);

            inDistanceRange = coveredByCharge || coveredByTime;
        }

        const isOut = !inAreaRange || !inDistanceRange;
        setIsOutOfRange(isOut);

        if (isOut) {
            setShowRangeModal(true);
            setDeliveryCharge(0);
            setEstimatedTime(null);
            return;
        }

        // Calculate Charge based on road distance (distanceInKm)
        if (deliverySettings.length > 0) {
            // Using <= for maxDistance
            const applicableCharge = deliverySettings.find(c => distanceInKm >= c.minDistance && distanceInKm <= c.maxDistance);
            setDeliveryCharge(applicableCharge ? applicableCharge.charge : 0);
        }

        // Calculate Time based on road distance
        if (deliveryTimes.length > 0) {
            // Using <= for maxDistance
            const applicableTime = deliveryTimes.find(t => distanceInKm >= t.minDistance && distanceInKm <= t.maxDistance);
            setEstimatedTime(applicableTime ? applicableTime.time : null);
        }
    };

    const handleLocationInput = (e, setFieldValue, pincode) => {
        const value = e.target.value;
        setFieldValue('location', value);

        // Clear existing timer
        if (autocompleteTimeoutRef.current) {
            clearTimeout(autocompleteTimeoutRef.current);
        }

        // Debounce API call by 400ms
        autocompleteTimeoutRef.current = setTimeout(async () => {
            if (value.length > 2) {
                setIsFetchingSuggestions(true);
                try {
                    // Pass current location bias if available
                    const locationBias = coordinates.lat ? `${coordinates.lat},${coordinates.lng}` : null;

                    // Enhanced Search: Append pincode to query for better relevance if user hasn't typed it
                    let searchQuery = value;
                    if (pincode && pincode.length === 6 && !value.includes(pincode)) {
                        searchQuery = `${value} ${pincode}`;
                    }

                    const data = await olaRestApi.autocomplete(searchQuery, locationBias);
                    if (data && data.predictions) {
                        setSuggestions(data.predictions);
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("Autocomplete error:", error);
                } finally {
                    setIsFetchingSuggestions(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 400);
    };

    const handleLocationBlur = (e, setFieldValue) => {
        const value = e.target.value;
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);

        blurTimerRef.current = setTimeout(async () => {
            if (!value || value.length < 3) return;

            try {
                const data = await olaRestApi.geocode(value);
                if (data && data.results && data.results.length > 0) {
                    const { lat, lng } = data.results[0].geometry.location;
                    setCoordinates({ lat, lng });
                    await calculateDeliveryDetails(lat, lng);
                    toast.success("Location updated from text!");
                }
            } catch (error) {
                console.error("Geocode error:", error);
            }
        }, 200);
    };

    const handleSuggestionClick = async (suggestion, setFieldValue) => {
        if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
        setFieldValue('location', suggestion.description);
        setShowSuggestions(false);

        try {
            const data = await olaRestApi.getPlaceDetails(suggestion.place_id);
            if (data && data.result && data.result.geometry && data.result.geometry.location) {
                const { lat, lng } = data.result.geometry.location;
                setCoordinates({ lat, lng });
                await calculateDeliveryDetails(lat, lng);
                toast.success("Location set and delivery calculated!");
            }
        } catch (error) {
            console.error("Place details error:", error);
            toast.error("Failed to get location details");
        }
    };

    // Step 1: Show location permission modal when icon is clicked
    const handleLocationIconClick = async (setFieldValue) => {
        // Store setFieldValue for later use in modal callback
        setFieldValueRef.current = setFieldValue;

        // Check current permission status
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'geolocation' });
                setLocationPermissionState(result.state);
                console.log("📍 Current Permission State:", result.state);
            }
        } catch (err) {
            console.warn("Permissions API not supported:", err);
            setLocationPermissionState('unknown');
        }

        // Show the confirmation modal
        setShowLocationModal(true);
    };

    // Step 2: Actually fetch the location after user confirms in modal
    const fetchDeviceLocation = async () => {
        const setFieldValue = setFieldValueRef.current;
        if (!setFieldValue) return;

        // Check if geolocation is supported
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by this browser.");
            setShowLocationModal(false);
            return;
        }

        setShowLocationModal(false);
        setIsLocating(true);
        toast.info("📍 Accessing your device location...");

        // Use a timeout wrapper for additional safety
        const locationTimeout = setTimeout(() => {
            setIsLocating(false);
            toast.error("Location request took too long. Please try again or enter manually.");
        }, 20000);

        // Request fresh location (maximumAge: 0 ensures no caching)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(locationTimeout);

                try {
                    const { latitude, longitude, accuracy } = position.coords;
                    console.log("📍 Geolocation Success:", { latitude, longitude, accuracy });

                    // Update permission state to granted
                    setLocationPermissionState('granted');

                    // Immediately update coordinates state
                    setCoordinates({ lat: latitude, lng: longitude });

                    // 1. Immediate UI Feedback: Set fallback location so input isn't empty
                    setFieldValue('location', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

                    // 2. Calculate delivery details in background (don't block UI)
                    calculateDeliveryDetails(latitude, longitude).catch(err => {
                        console.warn("Delivery calculation issue:", err);
                    });

                    // 3. Try to get human-readable address via reverse geocoding
                    try {
                        console.log("🔄 Calling Ola Maps Reverse Geocode...");
                        const addressData = await olaRestApi.reverseGeocode(latitude, longitude);
                        console.log("📬 Reverse Geocode Response:", addressData);

                        if (addressData && addressData.results && addressData.results.length > 0) {
                            const formattedAddress = addressData.results[0].formatted_address;
                            setFieldValue('location', formattedAddress);
                            toast.success("✅ Location updated successfully!");
                        } else {
                            toast.info("Location set (detailed address unavailable)");
                        }
                    } catch (geocodeError) {
                        console.error("Reverse geocode failed:", geocodeError);
                        toast.info("Location coordinates captured successfully");
                    }
                } catch (processingError) {
                    console.error("Error processing location:", processingError);
                    toast.warning("Location partially captured. Please verify.");
                } finally {
                    setIsLocating(false);
                }
            },
            (error) => {
                clearTimeout(locationTimeout);
                console.error("❌ Geolocation Error:", error);

                let errorMessage = "Failed to access device location.";

                switch (error.code) {
                    case 1: // PERMISSION_DENIED
                        setLocationPermissionState('denied');
                        errorMessage = "Location permission denied. Please click the lock/info icon in your browser's address bar, allow location access, and try again.";
                        break;
                    case 2: // POSITION_UNAVAILABLE
                        errorMessage = "Location signal unavailable. Please check your device's GPS/Location settings.";
                        break;
                    case 3: // TIMEOUT
                        errorMessage = "Location request timed out. Please try again.";
                        break;
                    default:
                        errorMessage = `Location error: ${error.message || 'Unknown error'}`;
                }

                toast.error(errorMessage);
                setIsLocating(false);
            },
            {
                enableHighAccuracy: true,  // Request high accuracy GPS
                timeout: 15000,            // Wait up to 15 seconds
                maximumAge: 0              // Force fresh location (no cache)
            }
        );
    };

    const handleAddressBlur = async (e) => {
        const address = e.target.value;
        if (address && address.length > 5) {
            try {
                // Use geocode instead of validateAddress as validateAddress endpoint is causing 400
                const data = await olaRestApi.geocode(address);
                if (data && data.results && data.results.length > 0) {
                    toast.success("Address verified!");
                }
            } catch (error) {
                console.error("Address validation (geocode) failed", error);
            }
        }
    };

    const itemsTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = itemsTotal + deliveryCharge;

    const placeCodOrder = async (values, lat, lng) => {
        // Check if pincode is valid
        if (isPincodeValid === false) {
            toast.error('Sorry, we do not deliver to this pincode');
            return;
        }

        if (isOutOfRange) {
            setShowRangeModal(true);
            return;
        }
        try {
            const orderData = {
                ...values,
                items,
                totalAmount: itemsTotal, // Send items total, backend adds delivery charge
                latitude: lat,
                longitude: lng
            };

            await api.post('/api/orders', orderData);
            toast.success('Order placed successfully!');
            navigate('/my-orders');
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to place order. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOnlinePayment = async (values, lat, lng) => {
        // Check if pincode is valid
        if (isPincodeValid === false) {
            toast.error('Sorry, we do not deliver to this pincode');
            return;
        }

        if (isOutOfRange) {
            setShowRangeModal(true);
            return;
        }
        try {
            const { data: initData } = await api.post(
                '/api/payment/initiate',
                {
                    items,
                    totalAmount: itemsTotal, // Send items total, backend adds delivery charge
                    customerName: values.customerName,
                    contactNumber: values.contactNumber,
                    address: values.address,
                    flatBuilding: values.flatBuilding,
                    floorUnit: values.floorUnit,
                    deliveryDate: values.deliveryDate,
                    deliveryTime: values.deliveryTime,
                    pincode: values.pincode,
                    location: values.location,
                    latitude: lat,
                    longitude: lng
                }
            );

            const isLoaded = await loadRazorpay();
            if (!isLoaded) {
                toast.error('Razorpay SDK failed to load. Please check your internet connection.');
                setLoading(false);
                return;
            }

            const cleanContact = values.contactNumber.replace(/\D/g, '');

            const options = {
                key: initData.key,
                amount: initData.amount,
                currency: initData.currency,
                name: "GleePack",
                description: "Order Payment",
                order_id: initData.razorpayOrderId,
                handler: async function (response) {
                    try {
                        await api.post(
                            '/api/payment/verify',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: initData.orderId
                            }
                        );
                        toast.success('Payment successful! Order placed.');
                        navigate('/my-orders');
                    } catch (verifyError) {
                        console.error("Verification Error:", verifyError);
                        toast.error('Payment verification failed. Please contact support.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: values.customerName,
                    contact: cleanContact,
                    email: user?.email
                },
                theme: {
                    color: "#F97316"
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        toast.info('Payment cancelled');
                    }
                },
                retry: {
                    enabled: false
                }
            };

            if (!options.prefill.email) {
                delete options.prefill.email;
            }

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                console.error("Payment Failed:", response.error);
                if (response.error.code === 'BAD_REQUEST_ERROR' && response.error.description.includes('International')) {
                    toast.error('International cards are not supported. Please use a domestic (Indian) card.');
                } else {
                    toast.error(response.error.description || 'Payment failed. Please try again.');
                }
                setLoading(false);
            });

            rzp.open();

        } catch (error) {
            console.error("Razorpay Error:", error);
            toast.error(error.formattedMessage || 'Failed to initiate payment.');
            setLoading(false);
        }
    };

    const handleCheckout = async (values, { setSubmitting }) => {
        setLoading(true);

        let currentLat = coordinates.lat;
        let currentLng = coordinates.lng;

        // Safety check: If location is present but coordinates are missing (e.g. user typed and hit enter immediately), try to geocode
        if (values.location && (!currentLat || !currentLng)) {
            try {
                const data = await olaRestApi.geocode(values.location);
                if (data && data.results && data.results.length > 0) {
                    currentLat = data.results[0].geometry.location.lat;
                    currentLng = data.results[0].geometry.location.lng;
                    setCoordinates({ lat: currentLat, lng: currentLng });
                    await calculateDeliveryDetails(currentLat, currentLng);
                }
            } catch (e) {
                console.error("Geocode before checkout failed", e);
            }
        }

        if (isOutOfRange) {
            setShowRangeModal(true);
            setLoading(false);
            setSubmitting(false);
            return;
        }

        if (values.paymentMethod === 'COD') {
            await placeCodOrder(values, currentLat, currentLng);
        } else {
            await handleOnlinePayment(values, currentLat, currentLng);
        }
        setSubmitting(false);
    };

    if (items.length === 0) {
        return <div className="text-center py-20">Your cart is empty. <a href="/menu" className="text-orange-500 underline">Go to Menu</a></div>;
    }

    // Helper to get local date string YYYY-MM-DD
    const getTodayDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Checkout</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <div className="bg-gray-800 sm:p-6 px-2 py-4 rounded-xl border border-gray-700 h-fit">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Order Summary</h3>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item._id || item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-gray-400">x {item.quantity}</p>
                                </div>
                                <p className="font-bold">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Subtotal</span>
                            <span>₹{itemsTotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-400">
                            <span>Delivery Charge</span>
                            <span>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span>
                        </div>
                        {
                            selectedDeliveryDate === getTodayDate() ? estimatedTime && (
                                <div className="flex justify-between items-center text-orange-400 font-semibold">
                                    <span>Estimated Delivery Time</span>
                                    <span>{estimatedTime} mins</span>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center text-orange-400 font-semibold">
                                    <span>Delivery Date</span>
                                    <span>{selectedDeliveryDate}</span>
                                </div>
                            )
                        }
                        <div className="border-t border-gray-700 pt-4 flex justify-between items-center text-xl font-bold text-orange-400">
                            <span>Total</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 sm:p-6 px-2 py-4 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Delivery Details</h3>

                    <Formik
                        enableReinitialize
                        initialValues={{
                            customerName: user?.name || '',
                            contactNumber: user?.phone || '',
                            address: user?.address || '',
                            flatBuilding: '',
                            floorUnit: '',
                            deliveryDate: '',
                            deliveryTime: '',
                            pincode: '',
                            location: '',
                            paymentMethod: 'COD'
                        }}
                        validationSchema={CheckoutSchema}
                        onSubmit={handleCheckout}
                    >
                        {({ isSubmitting, setFieldValue, values, errors, touched, handleBlur, isValid, dirty }) => (
                            <Form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <Field
                                        type="text"
                                        name="customerName"
                                        className={`w-full bg-gray-700 border rounded p-2 focus:outline-none focus:border-orange-500 ${errors.customerName && touched.customerName ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                    />
                                    <ErrorMessage name="customerName" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Contact Number</label>
                                    <Field
                                        type="tel"
                                        name="contactNumber"
                                        className={`w-full bg-gray-700 border rounded p-2 focus:outline-none focus:border-orange-500 ${errors.contactNumber && touched.contactNumber ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                    />
                                    <ErrorMessage name="contactNumber" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Delivery Address</label>
                                    <Field
                                        as="textarea"
                                        name="address"
                                        rows="3"
                                        className={`w-full bg-gray-700 border rounded p-2 focus:outline-none focus:border-orange-500 ${errors.address && touched.address ? 'border-red-500' : 'border-gray-600'
                                            }`}
                                        onBlur={(e) => {
                                            handleBlur(e);
                                            handleAddressBlur(e);
                                        }}
                                    />
                                    <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Flat / Building Name <span className="text-xs text-gray-500">(Optional)</span></label>
                                        <Field
                                            type="text"
                                            name="flatBuilding"
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Floor / Unit No. <span className="text-xs text-gray-500">(Optional)</span></label>
                                        <Field
                                            type="text"
                                            name="floorUnit"
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Delivery Date <span className="text-orange-500">*</span>
                                        </label>
                                        <Field name="deliveryDate">
                                            {({ field, form }) => (
                                                <input
                                                    {...field}
                                                    type="date"
                                                    min={getTodayDate()}
                                                    className={`w-full bg-gray-700 border rounded p-2 focus:outline-none focus:border-orange-500 text-white placeholder-gray-400 ${form.errors.deliveryDate && form.touched.deliveryDate ? 'border-red-500' : 'border-gray-600'}`}
                                                    onChange={(e) => {
                                                        form.setFieldValue(field.name, e.target.value);
                                                        setSelectedDeliveryDate(e.target.value);
                                                    }}
                                                />
                                            )}
                                        </Field>
                                        <ErrorMessage name="deliveryDate" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">
                                            Delivery Time <span className="text-orange-500">*</span>
                                        </label>
                                        <Field
                                            type="time"
                                            name="deliveryTime"
                                            className={`w-full bg-gray-700 border rounded p-2 focus:outline-none focus:border-orange-500 text-white placeholder-gray-400 ${errors.deliveryTime && touched.deliveryTime ? 'border-red-500' : 'border-gray-600'}`}
                                        />
                                        <ErrorMessage name="deliveryTime" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">
                                        Pincode <span className="text-red-400">*</span>
                                        {isCheckingPincode && <span className="text-blue-400 ml-2 text-xs">Checking...</span>}
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type="text"
                                            name="pincode"
                                            maxLength="6"
                                            className={`w-full bg-gray-700 border rounded p-2 pr-10 focus:outline-none focus:border-orange-500 ${errors.pincode && touched.pincode ? 'border-red-500' :
                                                isPincodeValid === true ? 'border-green-500' :
                                                    isPincodeValid === false ? 'border-red-500' : 'border-gray-600'
                                                }`}
                                            onBlur={(e) => {
                                                handleBlur(e);
                                                validatePincode(e.target.value);
                                            }}
                                            onChange={(e) => {
                                                setFieldValue('pincode', e.target.value.replace(/\D/g, ''));
                                                // Reset validation when pincode changes
                                                if (e.target.value.length !== 6) {
                                                    setIsPincodeValid(null);
                                                    setPincodeAreaName('');
                                                }
                                            }}
                                        />
                                        {/* Validation Icon */}
                                        {isPincodeValid !== null && !isCheckingPincode && (
                                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isPincodeValid ? 'text-green-500' : 'text-red-500'}`}>
                                                {isPincodeValid ? '✓' : '✗'}
                                            </span>
                                        )}
                                    </div>
                                    <ErrorMessage name="pincode" component="div" className="text-red-500 text-sm mt-1" />
                                    {/* Show area name if valid */}
                                    {isPincodeValid === true && pincodeAreaName && (
                                        <p className="text-green-400 text-sm mt-1">📍 Delivery available to {pincodeAreaName}</p>
                                    )}
                                    {/* Show error if invalid */}
                                    {isPincodeValid === false && (
                                        <p className="text-red-400 text-sm mt-1">⚠️ Sorry, we don't deliver to this pincode yet</p>
                                    )}
                                </div>

                                <div className="relative" ref={suggestionsRef}>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Location (Required)</label>
                                    <div className="flex gap-2">
                                        <Field
                                            type="text"
                                            name="location"
                                            placeholder="Search for your location..."
                                            className={`w-full bg-gray-700 border rounded p-2 focus:outline-none focus:border-orange-500 ${errors.location && touched.location ? 'border-red-500' : 'border-gray-600'}`}
                                            autoComplete="off"
                                            onChange={(e) => handleLocationInput(e, setFieldValue, values.pincode)}
                                            onBlur={(e) => {
                                                handleBlur(e);
                                                handleLocationBlur(e, setFieldValue);
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleLocationIconClick(setFieldValue)}
                                            disabled={isLocating}
                                            className={`p-2 rounded transition text-white ${isLocating ? 'bg-gray-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            title="Use Current Location"
                                        >
                                            {isLocating ? (
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="location" component="div" className="text-red-500 text-sm mt-1" />

                                    {/* Autocomplete Suggestions */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                                            {suggestions.map((suggestion) => (
                                                <div
                                                    key={suggestion.place_id}
                                                    className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                                                    onClick={() => handleSuggestionClick(suggestion, setFieldValue)}
                                                >
                                                    <p className="font-medium text-white">{suggestion.structured_formatting?.main_text || suggestion.description}</p>
                                                    <p className="text-xs text-gray-400">{suggestion.structured_formatting?.secondary_text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Show Detected Coordinates for confirmation */}
                                    {coordinates.lat && coordinates.lng && (
                                        <div className="mt-1 text-xs text-gray-500">
                                            <p>Detected Coords: {coordinates.lat}, {coordinates.lng}</p>
                                            <p className="text-[10px] text-gray-600">Last Updated: {new Date().toLocaleTimeString()}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-700">
                                    <label className="block text-sm font-medium text-gray-400 mb-3">Payment Method</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFieldValue('paymentMethod', 'COD')}
                                            className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition ${values.paymentMethod === 'COD'
                                                ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span>Cash on Delivery</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFieldValue('paymentMethod', 'Online')}
                                            className={`p-3 rounded-lg border flex items-center justify-center gap-2 transition ${values.paymentMethod === 'Online'
                                                ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                                                : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                                                }`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            <span>Pay Online</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Check if required fields are filled */}
                                {(() => {
                                    const requiredFieldsEmpty = !values.customerName || !values.contactNumber || !values.address || !values.pincode || !values.location;
                                    const isButtonDisabled = loading || isSubmitting || (settings && settings.isOrderingDisabled) || isOutOfRange || isPincodeValid === false || requiredFieldsEmpty || !isValid;

                                    let buttonText = `Place Order - ₹${totalAmount}`;
                                    if (settings && settings.isOrderingDisabled) {
                                        buttonText = 'Ordering Paused';
                                    } else if (requiredFieldsEmpty) {
                                        buttonText = 'Please Fill All Required Fields';
                                    } else if (!isValid) {
                                        buttonText = 'Please Fix Form Errors';
                                    } else if (isPincodeValid === false) {
                                        buttonText = 'Pincode Not Serviceable';
                                    } else if (isOutOfRange) {
                                        buttonText = 'Out of Delivery Range';
                                    } else if (loading || isSubmitting) {
                                        buttonText = 'Processing...';
                                    }

                                    return (
                                        <button
                                            type="submit"
                                            disabled={isButtonDisabled}
                                            className={`w-full font-bold py-3 rounded-lg transition mt-4 ${isButtonDisabled
                                                ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                                                }`}
                                        >
                                            {buttonText}
                                        </button>
                                    );
                                })()}
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

            {/* Out of Range Modal */}
            {showRangeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 sm:p-8 max-w-md w-full text-center max-h-[85vh] overflow-y-auto">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Out of Delivery Range</h3>
                        <p className="text-gray-400 mb-6">
                            Sorry, we currently do not deliver to your location. Please try a different location or contact us for more information.
                        </p>
                        <button
                            onClick={() => setShowRangeModal(false)}
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Location Permission Modal - Shows every time user clicks location icon */}
            {showLocationModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 sm:p-8 max-w-md w-full text-center max-h-[85vh] overflow-y-auto">
                        {/* Location Icon */}
                        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2">Use Your Location</h3>

                        <p className="text-gray-400 mb-4">
                            Allow Saharsa Food's to access your device location for accurate delivery address and delivery charge calculation.
                        </p>

                        {/* Permission Status Indicator */}
                        {locationPermissionState === 'denied' && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                                <p className="text-red-400 text-sm">
                                    ⚠️ Location permission is blocked. Please click the lock icon in your browser's address bar and allow location access.
                                </p>
                            </div>
                        )}

                        {locationPermissionState === 'prompt' && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
                                <p className="text-yellow-400 text-sm">
                                    📍 Your browser will ask for location permission after you click "Allow Location".
                                </p>
                            </div>
                        )}

                        {locationPermissionState === 'granted' && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                                <p className="text-green-400 text-sm">
                                    ✅ Location permission already granted. Click below to fetch your current location.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowLocationModal(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={fetchDeviceLocation}
                                disabled={locationPermissionState === 'denied'}
                                className={`font-bold py-3 px-6 rounded-lg transition flex items-center gap-2 ${locationPermissionState === 'denied'
                                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {locationPermissionState === 'denied' ? 'Permission Blocked' : 'Allow Location'}
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-gray-500 text-xs mt-4">
                            Your location will only be used to calculate delivery distance and charges. We respect your privacy.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
