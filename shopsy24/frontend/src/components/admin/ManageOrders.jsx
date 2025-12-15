import React, { useEffect, useState, useContext, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Download, Trash2, Calendar, Share2, Search, Bell, X, Volume2, VolumeX } from 'lucide-react';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useContext(AuthContext);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // New Order Notification States
    const [notifications, setNotifications] = useState([]);
    const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(true);
    const notificationDropdownRef = useRef(null);
    const audioContextRef = useRef(null);

    // Play notification sound - Multiple beeps
    const playNotificationSound = () => {
        if (!isSoundEnabled) return;

        try {
            // Create a new AudioContext or reuse existing one
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }

            const audioContext = audioContextRef.current;

            // Resume audio context if suspended (browser policy)
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const now = audioContext.currentTime;

            // Create multiple beeps for alert
            for (let i = 0; i < 3; i++) {
                const oscillator = audioContext.createOscillator();
                const gain = audioContext.createGain();

                oscillator.connect(gain);
                gain.connect(audioContext.destination);

                oscillator.frequency.value = 1000;
                oscillator.type = 'sine';

                // Start and stop each beep
                const startTime = now + i * 0.3;
                gain.gain.setValueAtTime(0.5, startTime);
                gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

                oscillator.start(startTime);
                oscillator.stop(startTime + 0.2);
            }
        } catch (error) {
            console.error("Audio error:", error);
        }
    };

    // Simplified text-to-speech - Just key details
    const speakNotification = (order) => {
        if (!isSoundEnabled) return;

        try {
            // Play alert beep first
            playNotificationSound();

            setTimeout(() => {
                const synth = window.speechSynthesis;

                if (synth) {
                    // Cancel any previous speech
                    synth.cancel();

                    // Wait for voices to load
                    const loadVoices = () => {
                        const voices = synth.getVoices();

                        if (voices.length === 0) {
                            console.log("Voices not loaded, retrying...");
                            setTimeout(loadVoices, 100);
                            return;
                        }

                        // Message with Customer Name, Order Placed, Order ID, and Package Name
                        const customerName = order.customerName || 'Customer';
                        const orderId = order._id ? order._id.slice(-6).toUpperCase() : 'NEW';

                        const packageNames = order.items && order.items.length > 0
                            ? order.items.map(item => item.name).join(', ')
                            : 'items';

                        const message = `${customerName} has placed an order. Order ID is ${orderId}. Package is ${packageNames}.`;

                        const utterance = new SpeechSynthesisUtterance(message);

                        // Find English voice
                        const englishVoices = voices.filter(voice => voice.lang.includes('en'));
                        if (englishVoices.length > 0) {
                            utterance.voice = englishVoices[0];
                            console.log("Using voice:", englishVoices[0].name);
                        }

                        utterance.rate = 0.9;
                        utterance.pitch = 1;
                        utterance.volume = 1;
                        utterance.lang = 'en-US';

                        utterance.onstart = () => {
                            console.log("✓ Speaking started");
                        };

                        utterance.onend = () => {
                            console.log("✓ Speaking ended");
                        };

                        utterance.onerror = (event) => {
                            console.error("Speech error:", event.error);
                        };

                        console.log("Speaking:", message);
                        synth.speak(utterance);
                    };

                    // Start voice loading
                    loadVoices();
                } else {
                    console.warn("Speech Synthesis not supported in this browser");
                }
            }, 900);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // Add notification with voice alert
    const addNotification = (order) => {
        const notif = {
            id: Date.now(),
            order: order,
            timestamp: new Date().toLocaleTimeString(),
        };
        setNotifications((prev) => [notif, ...prev]);

        // Text to speech announcement
        speakNotification(order);
    };

    // Clear a single notification
    const clearNotification = (notifId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    };

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
        setShowNotificationDropdown(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
                setShowNotificationDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reference to track previous orders for polling comparison
    const previousOrdersRef = useRef([]);

    // Initial fetch
    useEffect(() => {
        if (user) {
            api.get('/api/orders')
                .then(res => {
                    setOrders(res.data);
                    previousOrdersRef.current = res.data;
                })
                .catch(err => console.error(err));
        }
    }, [user]);

    // HTTP Polling for real-time updates (fallback for Vercel)
    useEffect(() => {
        if (!user) return;

        const POLLING_INTERVAL = 5000; // 5 seconds

        const pollOrders = async () => {
            try {
                const res = await api.get('/api/orders');
                const newOrders = res.data;
                const prevOrders = previousOrdersRef.current;

                // Detect new orders (orders that exist in newOrders but not in prevOrders)
                const prevOrderIds = new Set(prevOrders.map(o => o._id));
                const newlyAddedOrders = newOrders.filter(order => !prevOrderIds.has(order._id));

                // Trigger notifications for new orders
                if (newlyAddedOrders.length > 0) {
                    newlyAddedOrders.forEach(order => {
                        toast.info(`New Order Received: #${order._id.slice(-6)}`);
                        addNotification(order);
                    });
                }

                // Update state and reference
                setOrders(newOrders);
                previousOrdersRef.current = newOrders;

            } catch (err) {
                // Silently handle polling errors
            }
        };

        // Start polling interval
        const intervalId = setInterval(pollOrders, POLLING_INTERVAL);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [user]);

    const updateStatus = async (id, status, isPaymentUpdate = false) => {
        try {
            const endpoint = isPaymentUpdate ? `/api/orders/${id}/payment-status` : `/api/orders/${id}/status`;
            await api.put(endpoint, { status });
            toast.success(`Order ${isPaymentUpdate ? 'payment ' : ''}status updated to ${status}`);
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to update status');
        }
    };

    const deleteOrder = async (id) => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            try {
                await api.delete(`/api/orders/${id}`);
                setOrders(prev => prev.filter(order => order._id !== id));
                toast.success('Order deleted successfully');
            } catch (error) {
                toast.error(error.formattedMessage || 'Failed to delete order');
            }
        }
    };

    const shareOrder = async (order) => {
        let shareText = `
*Order Details*
Order ID: #${order._id.slice(-6)}
Customer: ${order.customerName}
Contact: ${order.contactNumber}
Delivery Date: ${order.deliveryDate}
Delivery Time: ${order.deliveryTime}
Address: ${order.address}${order.flatBuilding ? `\nFlat/Building: ${order.flatBuilding}` : ''}${order.floorUnit ? `\nFloor/Unit: ${order.floorUnit}` : ''}${order.pincode ? `\nPincode: ${order.pincode}` : ''}
Location: ${order.location}
Items:
${order.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}
Total Amount: ₹${order.totalAmount}
Payment: ${order.paymentMethod} (${order.paymentStatus})
Status: ${order.status}
`.trim();

        if (order.latitude && order.longitude) {
            shareText += `\nMap Location: https://www.google.com/maps?q=${order.latitude},${order.longitude}`;
        }

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Order #${order._id.slice(-6)}`,
                    text: shareText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareText);
                toast.success('Order details copied to clipboard!');
            } catch (err) {
                toast.error('Failed to copy order details.');
            }
        }
    };

    const getFilteredOrders = () => {
        return orders.filter(order => {
            // Date Filter
            if (startDate && endDate) {
                const orderDate = new Date(order.createdAt);
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                if (orderDate < start || orderDate > end) return false;
            }

            // Search Filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const orderId = order._id.toLowerCase();
                const customerName = order.customerName.toLowerCase();
                const contactNumber = order.contactNumber.toLowerCase();
                const email = order.user?.email?.toLowerCase() || '';

                return orderId.includes(term) ||
                    customerName.includes(term) ||
                    contactNumber.includes(term) ||
                    email.includes(term);
            }

            return true;
        });
    };

    const filteredOrders = getFilteredOrders();

    const exportToExcel = () => {
        if (filteredOrders.length === 0) {
            toast.warn('No orders found for the selected date range.');
            return;
        }

        const dataToExport = filteredOrders.map(order => ({
            'Order ID': order._id,
            'Date': new Date(order.createdAt).toLocaleString(),
            'Customer Name': order.customerName,
            'Contact': order.contactNumber,
            'Address': order.address,
            'Flat/Building': order.flatBuilding || '',
            'Floor/Unit': order.floorUnit || '',
            'Pincode': order.pincode || '',
            'Location': order.location || '',
            'Items': order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
            'Total Amount': order.totalAmount,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Order Status': order.status,
            'Handled By': order.handledBy ? `${order.handledBy.name} (${order.handledBy.role})` : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        saveAs(data, `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Orders exported successfully!');
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-orange-500">Manage Orders</h2>

                    {/* Notification Bell Icon */}
                    <div className="relative" ref={notificationDropdownRef}>
                        <button
                            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                            className="relative p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition"
                            title="New Order Notifications"
                        >
                            <Bell size={22} className={notifications.length > 0 ? "text-orange-400 animate-pulse" : "text-gray-400"} />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {showNotificationDropdown && (
                            <div className="absolute top-12 right-0 w-80 md:w-96 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900/50">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Bell size={18} className="text-orange-400" />
                                        New Orders
                                        {notifications.length > 0 && (
                                            <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </h3>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={clearAllNotifications}
                                            className="text-sm text-gray-400 hover:text-red-400 transition"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                <div className="overflow-y-auto max-h-72">
                                    {notifications.length === 0 ? (
                                        <div className="p-6 text-center text-gray-500">
                                            <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                            <p>No new order notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className="p-4 border-b border-gray-700/50 hover:bg-gray-700/50 transition flex justify-between items-start gap-3"
                                            >
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white">
                                                        🛒 New Order #{notif.order._id?.slice(-6)}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Customer: {notif.order.customerName}
                                                    </p>
                                                    <p className="text-xs text-orange-400 mt-1">
                                                        ₹{notif.order.totalAmount}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {notif.timestamp}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => clearNotification(notif.id)}
                                                    className="text-gray-500 hover:text-red-400 transition p-1"
                                                    title="Dismiss"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sound Toggle Button */}
                    <button
                        onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                        className={`p-2 rounded-full transition ${isSoundEnabled ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'}`}
                        title={isSoundEnabled ? "Sound On - Click to mute" : "Sound Off - Click to unmute"}
                    >
                        {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search ID, Name, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-700 text-white pl-10 pr-4 py-1.5 rounded border border-gray-600 focus:outline-none focus:border-orange-500 w-full text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-orange-500"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-gray-700 text-white text-sm rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-orange-500"
                        />
                    </div>
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-2 transition w-full md:w-auto justify-center"
                    >
                        <Download size={16} /> Export Excel
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredOrders.map(order => (
                    <div key={order._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-orange-400">Order #{order._id.slice(-6)}</h3>
                                <p className="text-sm text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                                {order.handledBy && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        Handled by: <span className="text-white font-medium">{order.handledBy.name}</span> <span className="text-xs bg-gray-700 px-1 rounded">{order.handledBy.role}</span>
                                    </p>
                                )}
                            </div>
                            <div className="mt-2 md:mt-0">
                                <span className={`px-3 py-1 rounded text-sm font-bold ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                    order.status === 'Confirmed' ? 'bg-purple-500/20 text-purple-500' :
                                        order.status === 'Processing' ? 'bg-blue-500/20 text-blue-500' :
                                            order.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                                                'bg-red-500/20 text-red-500'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-gray-700/50 p-4 rounded">
                                <h4 className="font-bold mb-2 text-gray-300">Customer Details</h4>
                                <p><span className="text-gray-400">Name:</span> {order.customerName}</p>
                                <p><span className="text-gray-400">Contact:</span> <a href={`tel:${order.contactNumber}`} className="text-blue-400 hover:text-blue-300 hover:underline">{order.contactNumber}</a></p>
                                <p><span className="text-gray-400">Delivery Date:</span> {order.deliveryDate}</p>
                                <p><span className="text-gray-400">Delivery Time:</span> {order.deliveryTime}</p>
                                <p><span className="text-gray-400">Address:</span> {order.address}</p>
                                {order.flatBuilding && (
                                    <p><span className="text-gray-400">Flat/Building:</span> {order.flatBuilding}</p>
                                )}
                                {order.floorUnit && (
                                    <p><span className="text-gray-400">Floor/Unit:</span> {order.floorUnit}</p>
                                )}
                                {order.pincode && (
                                    <p><span className="text-gray-400">Pincode:</span> {order.pincode}</p>
                                )}
                                <p><span className="text-gray-400">Location:</span> {order.location}</p>
                                {order.latitude && order.longitude && (
                                    <p>
                                        <a
                                            href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 underline text-sm"
                                        >
                                            View on Map ({order.latitude}, {order.longitude})
                                        </a>
                                    </p>
                                )}
                                <p><span className="text-gray-400">Payment:</span> {order.paymentMethod} <span className={`text-xs px-2 py-0.5 rounded ${order.paymentStatus === 'Paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{order.paymentStatus}</span></p>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded">
                                <h4 className="font-bold mb-2 text-gray-300">Order Items</h4>
                                <ul className="space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>₹{item.price * item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="border-t border-gray-600 mt-2 pt-2 flex justify-between font-bold text-orange-400">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => updateStatus(order._id, 'Confirmed')} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition">Confirm</button>
                            <button onClick={() => updateStatus(order._id, 'Processing')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Process</button>
                            <button onClick={() => updateStatus(order._id, 'Delivered')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">Delivered</button>
                            <button onClick={() => updateStatus(order._id, 'Cancelled')} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">Cancel</button>
                            {order.paymentMethod === 'COD' && order.paymentStatus !== 'Paid' && (
                                <button onClick={() => updateStatus(order._id, 'Paid', true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded transition">Mark Paid</button>
                            )}
                            {order.paymentMethod === 'COD' && order.paymentStatus === 'Paid' && (
                                <button onClick={() => updateStatus(order._id, 'Pending', true)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition">Mark Pending</button>
                            )}
                            {user && user.role === 'admin' && (
                                <button
                                    onClick={() => deleteOrder(order._id)}
                                    className="bg-red-900/80 hover:bg-red-900 text-red-200 px-4 py-2 rounded transition flex items-center gap-1"
                                    title="Delete Order"
                                >
                                    <Trash2 size={18} /> Delete
                                </button>
                            )}
                            <button
                                onClick={() => shareOrder(order)}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-4 py-2 rounded transition flex items-center gap-1 ml-auto"
                                title="Share Order Details"
                            >
                                <Share2 size={18} /> Share
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageOrders;
