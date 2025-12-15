import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, MapPin, Check, X, Upload } from 'lucide-react';

const HandlePincodes = () => {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingPincode, setEditingPincode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        pincode: '',
        areaName: '',
        isActive: true
    });

    // Bulk add state
    const [bulkData, setBulkData] = useState('');

    useEffect(() => {
        fetchPincodes();
    }, []);

    const fetchPincodes = async () => {
        try {
            const { data } = await api.get('/api/pincodes');
            setPincodes(data);
        } catch (error) {
            toast.error('Failed to fetch pincodes');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(formData.pincode)) {
            toast.error('Pincode must be exactly 6 digits');
            return;
        }

        try {
            if (editingPincode) {
                await api.put(`/api/pincodes/${editingPincode._id}`, formData);
                toast.success('Pincode updated successfully');
            } else {
                await api.post('/api/pincodes', formData);
                toast.success('Pincode added successfully');
            }
            setShowAddModal(false);
            setEditingPincode(null);
            setFormData({ pincode: '', areaName: '', isActive: true });
            fetchPincodes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (pincode) => {
        setEditingPincode(pincode);
        setFormData({
            pincode: pincode.pincode,
            areaName: pincode.areaName,
            isActive: pincode.isActive
        });
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this pincode?')) {
            try {
                await api.delete(`/api/pincodes/${id}`);
                toast.success('Pincode deleted successfully');
                fetchPincodes();
            } catch (error) {
                toast.error('Failed to delete pincode');
            }
        }
    };

    const toggleStatus = async (pincode) => {
        try {
            await api.put(`/api/pincodes/${pincode._id}`, {
                ...pincode,
                isActive: !pincode.isActive
            });
            toast.success(`Pincode ${!pincode.isActive ? 'activated' : 'deactivated'}`);
            fetchPincodes();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleBulkAdd = async () => {
        // Parse bulk data: each line should be "pincode,areaName"
        const lines = bulkData.trim().split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            toast.error('Please enter pincodes in the format: pincode,areaName (one per line)');
            return;
        }

        const pincodeList = [];
        for (const line of lines) {
            const [pincode, areaName] = line.split(',').map(s => s.trim());
            if (pincode && areaName && /^\d{6}$/.test(pincode)) {
                pincodeList.push({ pincode, areaName });
            }
        }

        if (pincodeList.length === 0) {
            toast.error('No valid pincodes found. Format: 852201,Saharsa');
            return;
        }

        try {
            const { data } = await api.post('/api/pincodes/bulk', { pincodes: pincodeList });
            toast.success(data.message);
            setShowBulkModal(false);
            setBulkData('');
            fetchPincodes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Bulk add failed');
        }
    };

    const filteredPincodes = pincodes.filter(p =>
        p.pincode.includes(searchTerm) ||
        p.areaName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activePincodes = pincodes.filter(p => p.isActive).length;

    if (loading) {
        return <div className="text-center text-white p-10">Loading pincodes...</div>;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
                        <MapPin className="h-6 w-6" />
                        Handle Delivery Pincodes
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {activePincodes} active / {pincodes.length} total pincodes
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowBulkModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                        <Upload size={18} />
                        Bulk Add
                    </button>
                    <button
                        onClick={() => {
                            setEditingPincode(null);
                            setFormData({ pincode: '', areaName: '', isActive: true });
                            setShowAddModal(true);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                    >
                        <Plus size={18} />
                        Add Pincode
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by pincode or area name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                />
            </div>

            {/* Pincodes Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-700/50 text-gray-300">
                        <tr>
                            <th className="px-4 py-3 rounded-tl-lg">Pincode</th>
                            <th className="px-4 py-3">Area Name</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 rounded-tr-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredPincodes.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                                    {searchTerm ? 'No pincodes match your search' : 'No pincodes added yet. Add your first pincode!'}
                                </td>
                            </tr>
                        ) : (
                            filteredPincodes.map((pincode) => (
                                <tr key={pincode._id} className="hover:bg-gray-700/30 transition">
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-lg font-bold text-white bg-gray-700 px-3 py-1 rounded">
                                            {pincode.pincode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-white">{pincode.areaName}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => toggleStatus(pincode)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${pincode.isActive
                                                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                        >
                                            {pincode.isActive ? '✓ Active' : '✗ Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(pincode)}
                                                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pincode._id)}
                                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">
                            {editingPincode ? 'Edit Pincode' : 'Add New Pincode'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Pincode *</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                                    placeholder="e.g., 852201"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Area Name *</label>
                                <input
                                    type="text"
                                    value={formData.areaName}
                                    onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                                    placeholder="e.g., Saharsa"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 accent-orange-500"
                                />
                                <label htmlFor="isActive" className="text-gray-300">Active (deliverable)</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingPincode(null);
                                    }}
                                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition"
                                >
                                    {editingPincode ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Add Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold text-white mb-2">Bulk Add Pincodes</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Enter one pincode per line in format: <code className="bg-gray-700 px-1 rounded">pincode,areaName</code>
                        </p>
                        <textarea
                            value={bulkData}
                            onChange={(e) => setBulkData(e.target.value)}
                            placeholder="852201,Saharsa
852202,Simri Bakhtiyarpur
852212,Nauhatta"
                            className="w-full h-48 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500 font-mono text-sm"
                        />
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowBulkModal(false);
                                    setBulkData('');
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkAdd}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                <Upload size={18} />
                                Import Pincodes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandlePincodes;
