import React, { useEffect, useState, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useContext(AuthContext);

    const getTodayDate = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year.slice(-2)}`;
    };

    // Initial fetch
    useEffect(() => {
        if (user) {
            api.get('/api/orders/myorders')
                .then(res => setOrders(res.data))
                .catch(err => {
                    console.error(err);
                });
        }
    }, [user]);

    // HTTP Polling for real-time updates
    useEffect(() => {
        if (!user) return;

        const POLLING_INTERVAL = 5000; // 5 seconds

        const pollOrders = async () => {
            try {
                const res = await api.get('/api/orders/myorders');
                setOrders(res.data);
            } catch (err) {
                // Silently handle polling errors
            }
        };

        // Start polling interval
        const intervalId = setInterval(pollOrders, POLLING_INTERVAL);

        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, [user]);

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Order Status</h2>
            <div className="space-y-4">
                {orders.map(order => (
                    <div key={order._id} className="bg-gray-800 p-4 sm:p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg truncate">Order #{order._id.slice(-6)}</p>
                            <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                            <p className="text-gray-300 mt-2 text-sm sm:text-base break-words">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</p>
                        </div>
                        <div className="mt-2 md:mt-0 text-left md:text-right w-full md:w-auto flex-shrink-0">
                            <span className={`px-4 py-2 rounded-full font-bold text-sm ${order.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                order.status === 'Confirmed' ? 'bg-purple-500/20 text-purple-500' :
                                    order.status === 'Processing' ? 'bg-blue-500/20 text-blue-500' :
                                        order.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                                            'bg-red-500/20 text-red-500'
                                }`}>
                                {order.status}
                            </span>
                            {['Pending', 'Confirmed', 'Processing'].includes(order.status) && (
                                order.deliveryDate === getTodayDate() ? (
                                    order.estimatedDeliveryTime > 0 && (
                                        <p className="text-sm text-purple-400 mt-2 font-semibold animate-pulse">
                                            Your estimated delivery time is {order.estimatedDeliveryTime} minutes
                                        </p>
                                    )
                                ) : (
                                    <p className="text-sm text-purple-400 mt-2 font-semibold animate-pulse">
                                        Delivery Date: {formatDisplayDate(order.deliveryDate)}
                                    </p>
                                )
                            )}
                            <p className="font-bold text-xl mt-2">₹{order.totalAmount}</p>
                            <p className={`text-xs mt-1 font-semibold ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                {order.paymentMethod} - {order.paymentStatus}
                            </p>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && <p className="text-center text-gray-500">No orders found.</p>}
            </div>
        </div>
    );
};

export default MyOrders;
