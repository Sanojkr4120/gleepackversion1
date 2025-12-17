import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { X, Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        dailyStats: []
    });
    const [showRevenueModal, setShowRevenueModal] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [loadingStats, setLoadingStats] = useState(true);

    // Fetch stats function
    const fetchStats = async (showLoading = false) => {
        if (showLoading) setLoadingStats(true);
        try {
            const res = await api.get('/api/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
            if (showLoading) toast.error("Failed to load dashboard stats");
        } finally {
            if (showLoading) setLoadingStats(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchStats(true);
    }, []);

    // HTTP Polling for real-time dashboard updates
    useEffect(() => {
        const POLLING_INTERVAL = 10000; // 10 seconds for dashboard

        const intervalId = setInterval(() => {
            fetchStats(false); // Silent update (no loading indicator)
        }, POLLING_INTERVAL);

        return () => clearInterval(intervalId);
    }, []);

    const handleRevenueClick = async () => {
        setShowRevenueModal(true);
        if (allOrders.length === 0) {
            setLoadingOrders(true);
            try {
                const res = await api.get('/api/orders');
                setAllOrders(res.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoadingOrders(false);
            }
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Transaction ID copied!');
    };

    const filteredOrders = allOrders.filter(order => {
        const query = searchQuery.toLowerCase();
        return (
            order._id.toLowerCase().includes(query) ||
            (order.user?.email && order.user.email.toLowerCase().includes(query)) ||
            (order.customerName && order.customerName.toLowerCase().includes(query))
        );
    });

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-orange-500">Dashboard Overview</h2>

            {loadingStats ? (
                <div className="text-center py-20 text-gray-400">Loading dashboard data...</div>
            ) : (
                <>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div
                            onClick={handleRevenueClick}
                            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg cursor-pointer hover:bg-gray-750 transition hover:border-orange-500/50"
                        >
                            <h3 className="text-gray-400 text-sm font-bold uppercase">Total Revenue</h3>
                            <p className="text-3xl font-bold text-green-500 mt-2">₹{stats.totalRevenue}</p>
                            <p className="text-xs text-gray-500 mt-2">Click to view details</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-bold uppercase">Total Orders</h3>
                            <p className="text-3xl font-bold text-blue-500 mt-2">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className="text-gray-400 text-sm font-bold uppercase">Registered Customers</h3>
                            <p className="text-3xl font-bold text-purple-500 mt-2">{stats.totalUsers}</p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Revenue Chart */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-300 mb-4">Revenue Trend (Last 7 Days)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <AreaChart data={stats.dailyStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="_id" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#10B981' }}
                                        />
                                        <Area type="monotone" dataKey="dailyRevenue" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Orders Chart */}
                        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                            <h3 className="text-xl font-bold text-gray-300 mb-4">Orders Trend (Last 7 Days)</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={stats.dailyStats}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis dataKey="_id" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                        <YAxis stroke="#9CA3AF" allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
                                            itemStyle={{ color: '#3B82F6' }}
                                        />
                                        <Bar dataKey="dailyOrders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Details Modal */}
                    {showRevenueModal && (
                        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] flex flex-col">
                                <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center bg-gray-800 rounded-t-xl gap-4">
                                    <h3 className="text-xl font-bold text-white">Revenue & Order Details</h3>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search by Order ID, Email, Name..."
                                            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500 w-full md:w-64"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <button onClick={() => setShowRevenueModal(false)} className="text-gray-400 hover:text-white transition">
                                            <X size={24} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 overflow-auto flex-1">
                                    {loadingOrders ? (
                                        <div className="text-center py-10 text-gray-400">Loading orders...</div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-800 text-gray-300 sticky top-0">
                                                    <tr>
                                                        <th className="p-4 whitespace-nowrap">Order ID</th>
                                                        <th className="p-4 whitespace-nowrap">Date</th>
                                                        <th className="p-4 whitespace-nowrap">Customer Name</th>
                                                        <th className="p-4 whitespace-nowrap">Customer Email</th>
                                                        <th className="p-4 whitespace-nowrap">Items</th>
                                                        <th className="p-4 whitespace-nowrap">Amount</th>
                                                        <th className="p-4 whitespace-nowrap">Payment</th>
                                                        <th className="p-4 whitespace-nowrap">Transaction ID</th>
                                                        <th className="p-4 whitespace-nowrap">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-700">
                                                    {filteredOrders.map(order => (
                                                        <tr key={order._id} className="hover:bg-gray-800/50 transition">
                                                            <td className="p-4 font-mono text-sm text-orange-400">#{order._id.slice(-6)}</td>
                                                            <td className="p-4 text-sm text-gray-300">
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-4 text-white font-medium">{order.customerName}</td>
                                                            <td className="p-4 text-gray-300 text-sm">
                                                                {order.user?.email || 'N/A'}
                                                            </td>
                                                            <td className="p-4 text-sm text-gray-300 max-w-xs">
                                                                <div className="flex flex-col gap-1">
                                                                    {order.items.map((item, idx) => (
                                                                        <span key={idx} className="truncate">
                                                                            {item.quantity}x {item.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                            <td className="p-4 font-bold text-green-400">₹{order.totalAmount}</td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.paymentMethod === 'Online' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'
                                                                    }`}>
                                                                    {order.paymentMethod}
                                                                </span>
                                                            </td>
                                                            <td className="p-4 font-mono text-xs text-gray-400">
                                                                {order.paymentMethod === 'Online' && order.paymentDetails?.razorpay_payment_id ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{order.paymentDetails.razorpay_payment_id}</span>
                                                                        <button
                                                                            onClick={() => copyToClipboard(order.paymentDetails.razorpay_payment_id)}
                                                                            className="text-gray-500 hover:text-white transition"
                                                                            title="Copy Transaction ID"
                                                                        >
                                                                            <Copy size={14} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    '-'
                                                                )}
                                                            </td>
                                                            <td className="p-4">
                                                                <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                                                                    order.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                                                                        'bg-gray-500/20 text-gray-400'
                                                                    }`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredOrders.length === 0 && (
                                                <p className="text-center text-gray-500 py-8">No orders found matching your search.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardHome;
