import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Trash2, MapPin, Plus, Edit2 } from 'lucide-react';
import { initOlaMaps } from '../../utils/olaMaps';
import { olaRestApi } from '../../utils/olaRestApi';

const HandleAreaCenter = () => {
    const [centers, setCenters] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Autocomplete states
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        fetchCenters();
    }, []);

    useEffect(() => {
        if (formData.latitude && formData.longitude && mapContainerRef.current) {
            if (!mapInstanceRef.current) {
                const olaMaps = initOlaMaps();
                const myMap = olaMaps.init({
                    style: "https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json",
                    container: mapContainerRef.current,
                    center: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
                    zoom: 15,
                });
                mapInstanceRef.current = myMap;

                myMap.on('load', () => {
                    addMarker(parseFloat(formData.longitude), parseFloat(formData.latitude));
                });

                // Add click listener to update coordinates
                myMap.on('click', (e) => {
                    const { lng, lat } = e.lngLat;
                    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                    addMarker(lng, lat);
                });

            } else {
                mapInstanceRef.current.flyTo({
                    center: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
                    zoom: 15
                });
                addMarker(parseFloat(formData.longitude), parseFloat(formData.latitude));
            }
        }
    }, [formData.latitude, formData.longitude]);

    const addMarker = (lng, lat) => {
        if (markerRef.current) {
            markerRef.current.remove();
        }

        const olaMaps = initOlaMaps();
        const marker = olaMaps
            .addMarker({ offset: [0, -10], anchor: 'bottom', color: '#F97316', draggable: true })
            .setLngLat([lng, lat])
            .addTo(mapInstanceRef.current);
        
        marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            setFormData(prev => ({ ...prev, latitude: lngLat.lat, longitude: lngLat.lng }));
        });

        markerRef.current = marker;
    };

    const fetchCenters = async () => {
        try {
            const res = await api.get('/api/centers');
            setCenters(res.data);
        } catch (error) {
            console.error('Error fetching area centers:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNameChange = async (e) => {
        const value = e.target.value;
        setFormData({ ...formData, name: value });

        if (value.length > 2) {
            try {
                const data = await olaRestApi.autocomplete(value);
                if (data && data.predictions) {
                    setSuggestions(data.predictions);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Autocomplete error:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = async (suggestion) => {
        setFormData(prev => ({ ...prev, name: suggestion.description }));
        setShowSuggestions(false);

        try {
            const data = await olaRestApi.getPlaceDetails(suggestion.place_id);
            if (data && data.result && data.result.geometry && data.result.geometry.location) {
                const { lat, lng } = data.result.geometry.location;
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                // Map update will be handled by the existing useEffect on formData change
            }
        } catch (error) {
            console.error("Place details error:", error);
            toast.error("Failed to get location details");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                const res = await api.put(`/api/centers/${editingId}`, formData);
                setCenters(centers.map(center => center._id === editingId ? res.data : center));
                toast.success('Area center updated successfully');
                setEditingId(null);
            } else {
                const res = await api.post('/api/centers', formData);
                setCenters([...centers, res.data]);
                toast.success('Area center added successfully');
            }
            setFormData({ name: '', latitude: '', longitude: '', address: '' });
            if (markerRef.current) markerRef.current.remove();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save area center');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (center) => {
        setFormData({
            name: center.name,
            latitude: center.latitude,
            longitude: center.longitude,
            address: center.address || ''
        });
        setEditingId(center._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ name: '', latitude: '', longitude: '', address: '' });
        if (markerRef.current) markerRef.current.remove();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this area center?')) {
            try {
                await api.delete(`/api/centers/${id}`);
                setCenters(centers.filter(center => center._id !== id));
                toast.success('Area center deleted successfully');
            } catch (error) {
                toast.error('Failed to delete area center');
            }
        }
    };

    const toggleStatus = async (center) => {
        try {
            const res = await api.put(`/api/centers/${center._id}`, { isActive: !center.isActive });
            setCenters(centers.map(c => c._id === center._id ? res.data : c));
            toast.success(`Area center ${res.data.isActive ? 'activated' : 'deactivated'}`);
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
            <h2 className="text-2xl font-bold mb-6 text-orange-500">Manage Area Centers</h2>

            {/* Add/Edit Center Form */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {editingId ? <Edit2 size={20} className="text-orange-500" /> : <Plus size={20} className="text-orange-500" />}
                    {editingId ? 'Edit Area Center' : 'Add New Area Center'}
                </h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <label className="block text-gray-400 mb-2">Center Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleNameChange}
                            placeholder="Search place or enter name..."
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                            required
                            autoComplete="off"
                        />
                        {/* Autocomplete Suggestions */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-lg mt-1 shadow-xl max-h-60 overflow-y-auto">
                                {suggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.place_id}
                                        className="p-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-0 text-white"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        <p className="font-medium">{suggestion.structured_formatting?.main_text || suggestion.description}</p>
                                        <p className="text-xs text-gray-400">{suggestion.structured_formatting?.secondary_text}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Address (Optional)</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="e.g. 123 Main St"
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Latitude (Optional)</label>
                        <input
                            type="number"
                            step="any"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            placeholder="e.g. 12.9716"
                            className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-2">Longitude (Optional)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                step="any"
                                name="longitude"
                                value={formData.longitude}
                                onChange={handleChange}
                                placeholder="e.g. 77.5946"
                                className="w-full bg-gray-700 text-white p-2 rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
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
                    <div className="md:col-span-2 flex gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (editingId ? 'Update Center' : 'Add Center')}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>

                {/* Map Preview */}
                <div className={`mt-6 rounded-lg overflow-hidden border border-gray-600 h-96 ${(!formData.latitude || !formData.longitude) ? 'hidden' : ''}`}>
                    <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
                </div>
            </div>

            {/* Centers List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centers.map(center => (
                    <div key={center._id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-xl font-bold text-white">{center.name}</h4>
                                {center.address && <p className="text-gray-400 text-sm">{center.address}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(center)}
                                    className="text-blue-500 hover:text-blue-400 transition"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(center._id)}
                                    className="text-red-500 hover:text-red-400 transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p><span className="text-gray-500">Lat:</span> {center.latitude}</p>
                            <p><span className="text-gray-500">Lng:</span> {center.longitude}</p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${center.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                {center.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                                onClick={() => toggleStatus(center)}
                                className={`text-sm font-medium ${center.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                            >
                                {center.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                        </div>
                    </div>
                ))}
                {centers.length === 0 && (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No area centers defined.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HandleAreaCenter;
