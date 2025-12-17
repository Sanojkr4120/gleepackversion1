import React, { useState, useEffect, useContext } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { Shield, ShieldAlert, ShieldCheck, User as UserIcon, Search } from 'lucide-react';

const HandleUserRoles = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const { user: currentUser } = useContext(AuthContext);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load users');
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (userId === currentUser._id) {
            toast.error("You cannot change your own role.");
            return;
        }

        try {
            await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update user role');
        }
    };

    if (loading) return <div className="text-center text-white p-10">Loading users...</div>;

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
                        <ShieldCheck size={28} /> User Role Controller
                    </h2>
                    <p className="text-gray-400 mt-1">Manage access levels for all registered users.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admins</option>
                        <option value="employee">Staff</option>
                        <option value="customer">Customers</option>
                    </select>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500 w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Current Role</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {users.filter(user => {
                            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
                            const matchesRole = filterRole === 'all' || user.role === filterRole;
                            return matchesSearch && matchesRole;
                        }).map(user => (
                            <tr key={user._id} className="hover:bg-gray-700/50 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-orange-500 font-bold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white">{user.name}</span>
                                        {user._id === currentUser._id && (
                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded ml-2">You</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                        user.role === 'employee' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                        {user.role === 'admin' && <ShieldAlert size={14} />}
                                        {user.role === 'employee' && <Shield size={14} />}
                                        {user.role === 'customer' && <UserIcon size={14} />}
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        {user._id !== currentUser._id && (
                                            <>
                                                <button
                                                    onClick={() => handleRoleChange(user._id, 'admin')}
                                                    disabled={user.role === 'admin'}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${user.role === 'admin'
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-red-900/50 text-red-200 hover:bg-red-900'
                                                        }`}
                                                >
                                                    Make Admin
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(user._id, 'employee')}
                                                    disabled={user.role === 'employee'}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${user.role === 'employee'
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-blue-900/50 text-blue-200 hover:bg-blue-900'
                                                        }`}
                                                >
                                                    Make Staff
                                                </button>
                                                <button
                                                    onClick={() => handleRoleChange(user._id, 'customer')}
                                                    disabled={user.role === 'customer'}
                                                    className={`px-3 py-1.5 rounded text-xs font-medium transition ${user.role === 'customer'
                                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-900/50 text-green-200 hover:bg-green-900'
                                                        }`}
                                                >
                                                    Make User
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <p className="p-8 text-center text-gray-500">No users found.</p>}
            </div>
        </div>
    );
};

export default HandleUserRoles;
