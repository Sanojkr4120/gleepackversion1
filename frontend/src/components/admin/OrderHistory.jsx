import React, { useEffect, useState, useContext } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Download, Trash2, Calendar } from 'lucide-react';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useContext(AuthContext);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        api.get('/api/orders')
            .then(res => setOrders(res.data))
            .catch(err => console.error(err));
    }, []);

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

    const exportToExcel = () => {
        let filteredOrders = orders;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filteredOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= start && orderDate <= end;
            });
        }

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
            'Items': order.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
            'Total Amount': order.totalAmount,
            'Payment Method': order.paymentMethod,
            'Payment Status': order.paymentStatus,
            'Order Status': order.status,
            'Handled By': order.handledBy ? `${order.handledBy.name} (${order.handledBy.role})` : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Order History");

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

        saveAs(data, `order_history_export_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Order history exported successfully!');
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-orange-500">Order History</h2>

                <div className="flex flex-col md:flex-row items-center gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
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
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Payment</th>
                            {user && user.role === 'admin' && <th className="p-4">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {orders.map(order => (
                            <tr key={order._id} className="hover:bg-gray-700/50">
                                <td className="p-4 font-mono text-sm">#{order._id.slice(-6)}</td>
                                <td className="p-4">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</td>
                                <td className="p-4">{order.customerName}</td>
                                <td className="p-4">₹{order.totalAmount}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Delivered' ? 'bg-green-500/20 text-green-500' :
                                        order.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                                        {order.paymentMethod} ({order.paymentStatus})
                                    </span>
                                </td>
                                {user && user.role === 'admin' && (
                                    <td className="p-4">
                                        <button
                                            onClick={() => deleteOrder(order._id)}
                                            className="text-red-400 hover:text-red-300 transition"
                                            title="Delete Order"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {orders.length === 0 && <p className="p-4 text-center text-gray-500">No orders found.</p>}
            </div>
        </div>
    );
};

export default OrderHistory;
