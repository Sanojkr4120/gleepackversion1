import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Search } from 'lucide-react';

const CustomerList = () => {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        api.get('/api/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error(err));
    }, []);

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            (user.registerId && user.registerId.toLowerCase().includes(query)) ||
            (user.name && user.name.toLowerCase().includes(query)) ||
            (user.email && user.email.toLowerCase().includes(query)) ||
            (user.phone && user.phone.includes(query))
        );
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-orange-500">Registered Customers</h2>

                {/* Search Bar */}
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by ID, Name, Email, or Phone..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Register ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="hover:bg-gray-700/50">
                                <td className="p-4 font-mono text-orange-400">{user.registerId || 'N/A'}</td>
                                <td className="p-4">{user.name}</td>
                                <td className="p-4">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                                        user.role === 'employee' ? 'bg-blue-500/20 text-blue-500' :
                                            'bg-green-500/20 text-green-500'
                                        }`}>
                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {user.phone ? (
                                        <a href={`tel:${user.phone}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                                            {user.phone}
                                        </a>
                                    ) : (
                                        'N/A'
                                    )}
                                </td>
                                <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && <p className="p-4 text-center text-gray-500">No customers found matching your search.</p>}
            </div>
        </div>
    );
};

export default CustomerList;
