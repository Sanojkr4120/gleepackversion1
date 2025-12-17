import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../../utils/api';
import { SystemContext } from '../../context/SystemContext';
import { toast } from 'react-toastify';
import { initOlaMaps } from '../../utils/olaMaps';
import { olaRestApi } from '../../utils/olaRestApi';

const HandleOrderLocations = () => {
    const { socket } = useContext(SystemContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const olaMapsRef = useRef(null);
    const markersRef = useRef([]);

    const [streetViewImage, setStreetViewImage] = useState(null);
    const [showStreetViewModal, setShowStreetViewModal] = useState(false);
    const [loadingStreetView, setLoadingStreetView] = useState(false);

    useEffect(() => {
        window.viewStreetView = async (lat, lng) => {
            setLoadingStreetView(true);
            setStreetViewImage(null);
            setShowStreetViewModal(true);
            try {
                // 1. Get Image ID
                const imageIdData = await olaRestApi.streetView.getImageId(lat, lng);
                if (imageIdData && imageIdData.id) { // Note: API might return 'id' or 'imageId', checking response structure is safer but assuming 'id' based on typical patterns or 'imageId'
                    // The markdown says "Returns the ImageId". Let's try to use the data directly if it's a string or property.
                    // Markdown sample request returns "imageId".
                    const id = imageIdData.id || imageIdData.imageId;

                    // 2. Get Metadata (which has imageUrl)
                    const metadata = await olaRestApi.streetView.getMetadata(id);
                    if (metadata && metadata.imageUrl) {
                        setStreetViewImage(metadata.imageUrl);
                    } else {
                        toast.warn("No Street View imagery available here.");
                        setShowStreetViewModal(false);
                    }
                } else {
                    toast.warn("No Street View available for this location.");
                    setShowStreetViewModal(false);
                }
            } catch (e) {
                console.error("Street View Error:", e);
                toast.error("Failed to load Street View");
                setShowStreetViewModal(false);
            } finally {
                setLoadingStreetView(false);
            }
        };

        window.getElevation = async (lat, lng) => {
            try {
                const data = await olaRestApi.getElevation(lat, lng);
                if (data && data.elevation) {
                    toast.info(`Elevation at this location: ${data.elevation} meters`);
                } else {
                    toast.info("Elevation data not available.");
                }
            } catch (e) {
                console.error("Elevation Error:", e);
                toast.error("Failed to fetch elevation");
            }
        };

        return () => {
            delete window.viewStreetView;
            delete window.getElevation;
        };
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders');
            // Filter orders that have location data AND are from today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const ordersWithLocation = res.data.filter(order => {
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);

                return order.latitude &&
                    order.longitude &&
                    order.status !== 'Delivered' &&
                    order.status !== 'Cancelled' &&
                    orderDate.getTime() === today.getTime();
            });
            setOrders(ordersWithLocation);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load orders');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        if (!socket) return;

        // Handle new orders - add to map with animation
        socket.on('newOrder', (newOrder) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const orderDate = new Date(newOrder.createdAt);
            orderDate.setHours(0, 0, 0, 0);

            if (newOrder.latitude &&
                newOrder.longitude &&
                orderDate.getTime() === today.getTime()) {

                setOrders(prev => [newOrder, ...prev]);

                // Show prominent notification
                toast.success(`🆕 New Order #${newOrder._id.slice(-6)} - ${newOrder.customerName}`, {
                    autoClose: 5000,
                    icon: '📍'
                });

                // Pan map to new order location
                if (mapInstanceRef.current) {
                    const lat = parseFloat(newOrder.latitude);
                    const lng = parseFloat(newOrder.longitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        mapInstanceRef.current.flyTo({
                            center: [lng, lat],
                            zoom: 15,
                            duration: 1500
                        });
                    }
                }
            }
        });

        // Handle order status changes - update marker color dynamically
        socket.on('orderStatusChanged', (updatedOrder) => {
            setOrders(prev => {
                // If status is Delivered or Cancelled, remove from map
                if (updatedOrder.status === 'Delivered' || updatedOrder.status === 'Cancelled') {
                    toast.info(`Order #${updatedOrder._id.slice(-6)} ${updatedOrder.status === 'Delivered' ? '✅ Delivered' : '❌ Cancelled'}`);
                    return prev.filter(o => o._id !== updatedOrder._id);
                }

                // Status changed - show notification with new status
                const statusEmoji = {
                    'Pending': '🟡',
                    'Confirmed': '🟣',
                    'Processing': '🔵',
                };
                toast.info(`${statusEmoji[updatedOrder.status] || '📦'} Order #${updatedOrder._id.slice(-6)} → ${updatedOrder.status}`);

                // Update the order in the list (markers will refresh automatically)
                return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
            });
        });

        socket.on('orderDeleted', (deletedOrderId) => {
            setOrders(prev => {
                const order = prev.find(o => o._id === deletedOrderId);
                if (order) {
                    toast.info(`Order #${deletedOrderId.slice(-6)} deleted from map`);
                    return prev.filter(o => o._id !== deletedOrderId);
                }
                return prev;
            });
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderStatusChanged');
            socket.off('orderDeleted');
        };
    }, [socket]);

    // ... (fetchOrders)

    useEffect(() => {
        if (!loading && mapContainerRef.current && !mapInstanceRef.current) {
            try {
                const olaMaps = initOlaMaps();
                olaMapsRef.current = olaMaps;

                // Default center (Patna or first order)
                let center = [85.1376, 25.5941];
                if (orders.length > 0) {
                    const lat = parseFloat(orders[0].latitude);
                    const lng = parseFloat(orders[0].longitude);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        center = [lng, lat];
                    }
                }

                const myMap = olaMaps.init({
                    style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
                    container: mapContainerRef.current,
                    center: center,
                    zoom: 13,
                });
                mapInstanceRef.current = myMap;

                myMap.on('load', () => {
                    updateMarkers();
                });
            } catch (error) {
                console.error("Failed to initialize Ola Maps:", error);
                toast.error("Failed to load map. Please check configuration.");
            }
        } else if (!loading && mapInstanceRef.current && olaMapsRef.current) {
            updateMarkers();
        }
    }, [loading, orders]);

    const updateMarkers = () => {
        if (!mapInstanceRef.current || !olaMapsRef.current) return;

        try {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.remove());
            markersRef.current = [];

            const olaMaps = olaMapsRef.current;

            orders.forEach(order => {
                const lat = parseFloat(order.latitude);
                const lng = parseFloat(order.longitude);

                if (isNaN(lat) || isNaN(lng)) return;

                const color = getMarkerColor(order.status);

                const popupContent = `
                    <div style="min-width: 280px; padding: 8px; color: #333; font-family: system-ui, -apple-system, sans-serif;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 2px solid #F97316; padding-bottom: 8px;">
                            <strong style="font-size: 15px; color: #1a1a1a;">Order #${order._id.slice(-6).toUpperCase()}</strong>
                            <span style="background-color: ${color}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: bold;">${order.status}</span>
                        </div>
                        
                        <div style="font-size: 12px; line-height: 1.6; background: #f9f9f9; padding: 8px; border-radius: 6px; margin-bottom: 8px;">
                            <p style="margin: 3px 0;"><strong style="color: #666;">Name:</strong> <span style="color: #1a1a1a;">${order.customerName}</span></p>
                            <p style="margin: 3px 0;"><strong style="color: #666;">Contact:</strong> <a href="tel:${order.contactNumber}" style="color: #3B82F6; text-decoration: none;">${order.contactNumber}</a></p>
                            <p style="margin: 3px 0;"><strong style="color: #666;">Address:</strong> <span style="color: #1a1a1a;">${order.address}</span></p>
                            ${order.flatBuilding ? `<p style="margin: 3px 0;"><strong style="color: #666;">Flat/Building:</strong> <span style="color: #1a1a1a;">${order.flatBuilding}</span></p>` : ''}
                            ${order.floorUnit ? `<p style="margin: 3px 0;"><strong style="color: #666;">Floor/Unit:</strong> <span style="color: #1a1a1a;">${order.floorUnit}</span></p>` : ''}
                            ${order.pincode ? `<p style="margin: 3px 0;"><strong style="color: #666;">Pincode:</strong> <span style="color: #1a1a1a;">${order.pincode}</span></p>` : ''}
                            ${order.location ? `<p style="margin: 3px 0;"><strong style="color: #666;">Location:</strong> <span style="color: #1a1a1a; font-size: 11px;">${order.location}</span></p>` : ''}
                            <p style="margin: 3px 0;"><strong style="color: #666;">Coordinates:</strong> <span style="color: #1a1a1a; font-size: 11px;">(${lat}, ${lng})</span></p>
                            <p style="margin: 3px 0;"><strong style="color: #666;">Payment:</strong> <span style="color: #1a1a1a;">${order.paymentMethod}</span> <span style="background: ${order.paymentStatus === 'Paid' ? '#22C55E' : '#EAB308'}; color: white; padding: 1px 5px; border-radius: 3px; font-size: 10px;">${order.paymentStatus}</span></p>
                        </div>
                        
                        <div style="background: #fff8f0; padding: 6px; border-radius: 4px; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 12px;"><strong style="color: #666;">Amount:</strong> <span style="color: #F97316; font-weight: bold; font-size: 14px;">₹${order.totalAmount}</span></p>
                        </div>
                        
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="background: #22C55E; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; text-decoration: none; display: inline-flex; align-items: center; gap: 3px;">
                                📍 View on Map
                            </a>
                            <button onclick="viewStreetView(${lat}, ${lng})" style="background: #F97316; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">🛣️ Street View</button>
                            <button onclick="getElevation(${lat}, ${lng})" style="background: #3B82F6; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 11px;">⛰️ Elevation</button>
                        </div>
                    </div>
                `;

                const popup = olaMaps.addPopup({ offset: [0, -30], anchor: 'bottom' })
                    .setHTML(popupContent);

                const marker = olaMaps.addMarker({ offset: [0, -10], anchor: 'bottom', color: color })
                    .setLngLat([lng, lat])
                    .setPopup(popup)
                    .addTo(mapInstanceRef.current);

                markersRef.current.push(marker);
            });
        } catch (error) {
            console.error("Error updating markers:", error);
        }
    };

    const getMarkerColor = (status) => {
        switch (status) {
            case 'Pending': return '#EAB308'; // Yellow
            case 'Confirmed': return '#A855F7'; // Purple
            case 'Processing': return '#3B82F6'; // Blue
            case 'Delivered': return '#22C55E'; // Green
            case 'Cancelled': return '#EF4444'; // Red
            default: return '#3B82F6';
        }
    };

    if (loading) return <div className="text-center text-white p-10">Loading map data...</div>;

    return (
        <div className="h-[600px] w-full bg-gray-800 rounded-xl border border-gray-700 overflow-hidden relative z-0">
            {/* Header with Order Count */}
            <h2 className="text-2xl font-bold text-orange-500 p-4 absolute top-0 left-0 z-[10] bg-gray-900/80 rounded-br-xl backdrop-blur-sm">
                Live Order Locations ({orders.length})
            </h2>

            {/* Refresh Button */}
            <button
                onClick={fetchOrders}
                className="absolute top-4 right-4 z-[10] bg-gray-900/80 hover:bg-gray-800 text-white p-2 rounded-lg backdrop-blur-sm transition flex items-center gap-2"
                title="Refresh Orders"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm hidden md:inline">Refresh</span>
            </button>

            {/* Status Legend */}
            <div className="absolute bottom-4 left-4 z-[10] bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-2 font-semibold">Order Status Colors</p>
                <div className="flex flex-wrap gap-2 text-xs">
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="text-yellow-500">Pending</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-purple-500">Confirmed</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-blue-500">Processing</span>
                    </span>
                </div>
            </div>

            {/* No Orders Message */}
            {orders.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none">
                    <div className="bg-gray-900/90 p-6 rounded-xl text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-400">No active orders with location data</p>
                        <p className="text-gray-500 text-sm mt-1">New orders will appear here automatically</p>
                    </div>
                </div>
            )}

            <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

            {/* Street View Modal */}
            {showStreetViewModal && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 p-4 rounded-xl max-w-4xl w-full relative">
                        <button
                            onClick={() => setShowStreetViewModal(false)}
                            className="absolute top-2 right-2 text-white hover:text-red-500 z-10 bg-gray-800 rounded-full p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        {loadingStreetView ? (
                            <div className="h-[400px] flex items-center justify-center text-white">Loading Street View...</div>
                        ) : streetViewImage ? (
                            <img src={streetViewImage} alt="Street View" className="w-full h-[500px] object-cover rounded-lg" />
                        ) : (
                            <div className="h-[400px] flex items-center justify-center text-white">No image available</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandleOrderLocations;
