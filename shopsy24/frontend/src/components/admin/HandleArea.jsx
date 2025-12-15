import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Trash2, MapPin, Plus } from 'lucide-react';

const HandleArea = () => {
    const [areas, setAreas] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: '',
        radius: 5 // Default 5km
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const res = await api.get('/api/areas');
            setAreas(res.data);
        } catch (error) {
            console.error('Error fetching areas:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/api/areas', formData);
            setAreas([...areas, res.data]);
            setFormData({ name: '', latitude: '', longitude: '', radius: 5 });
            toast.success('Delivery area added successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add area');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this area?')) {
            try {
                await api.delete(`/api/areas/${id}`);
                setAreas(areas.filter(area => area._id !== id));
                toast.success('Area deleted successfully');
            } catch (error) {
                toast.error('Failed to delete area');
            }
        }
    };

    const toggleStatus = async (area) => {
        try {
            const res = await api.put(`/api/areas/${area._id}`, { isActive: !area.isActive });
            setAreas(areas.map(a => a._id === area._id ? res.data : a));
            toast.success(`Area ${res.data.isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    toast.success('Location fetched successfully');
                },
                (error) => {
                    toast.error('Unable to retrieve your location');
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-orange-500">Manage Delivery Areas</h2>

            {/* Add Area Form */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-orange-500" /> Add New Area
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-400 mb-2">Area Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Downtown, North Zone"
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Radius (km)</label>
                        <input
                            type="number"
                            name="radius"
                            value={formData.radius}
                            onChange={handleChange}
                            placeholder="e.g. 5"
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Latitude</label>
                        <input
                            type="number"
                            step="any"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            placeholder="e.g. 12.9716"
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Longitude</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="e.g. 77.5946"
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                                required
                            />
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                                title="Use Current Location"
                            >
                                <MapPin size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Delivery Area'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Areas List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map(area => (
                    <div key={area._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-white">{area.name}</h4>
                                <p className="text-gray-400 text-sm">Radius: {area.radius} km</p>
                            </div>
                            <button
                                onClick={() => handleDelete(area._id)}
                                className="text-red-500 hover:text-red-400 transition"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p><span className="text-gray-500">Lat:</span> {area.latitude}</p>
                            <p><span className="text-gray-500">Lng:</span> {area.longitude}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${area.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {area.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => toggleStatus(area)}
                                className={`text-sm font-medium ${area.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                            >
                                {area.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
                {areas.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No delivery areas defined.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HandleArea;
