import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Clock, Save, Loader, AlertCircle, CheckCircle } from 'lucide-react';

const HandleBookingTime = () => {
    const [openingTime, setOpeningTime] = useState('09:00');
    const [closingTime, setClosingTime] = useState('21:00');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalOpeningTime, setOriginalOpeningTime] = useState('09:00');
    const [originalClosingTime, setOriginalClosingTime] = useState('21:00');

    useEffect(() => {
        fetchSettings();
    }, []);

    // Track changes
    useEffect(() => {
        setHasChanges(openingTime !== originalOpeningTime || closingTime !== originalClosingTime);
    }, [openingTime, closingTime, originalOpeningTime, originalClosingTime]);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/admin/settings');
            if (res.data) {
                const open = res.data.openingTime || '09:00';
                const close = res.data.closingTime || '21:00';
                setOpeningTime(open);
                setClosingTime(close);
                setOriginalOpeningTime(open);
                setOriginalClosingTime(close);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load settings');
            setLoading(false);
        }
    };

    // Validate times - closing should be after opening
    const isValidTimeRange = () => {
        if (!openingTime || !closingTime) return false;
        const [openHour, openMin] = openingTime.split(':').map(Number);
        const [closeHour, closeMin] = closingTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        return closeMinutes > openMinutes;
    };

    // Calculate active hours
    const getActiveHours = () => {
        if (!openingTime || !closingTime) return 0;
        const [openHour, openMin] = openingTime.split(':').map(Number);
        const [closeHour, closeMin] = closingTime.split(':').map(Number);
        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;
        const diff = closeMinutes - openMinutes;
        if (diff <= 0) return 0;
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
    };

    const handleSave = async () => {
        if (!isValidTimeRange()) {
            toast.error('Closing time must be after opening time');
            return;
        }

        setSaving(true);
        try {
            await api.put('/api/admin/settings', {
                openingTime,
                closingTime
            });
            setOriginalOpeningTime(openingTime);
            setOriginalClosingTime(closingTime);
            setHasChanges(false);
            toast.success('Booking time updated successfully!');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update booking time');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setOpeningTime(originalOpeningTime);
        setClosingTime(originalClosingTime);
        setHasChanges(false);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hour, minute] = timeStr.split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minute} ${ampm}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center text-white p-10 gap-3">
                <Loader className="animate-spin" size={24} />
                <span>Loading settings...</span>
            </div>
        );
    }

    const validRange = isValidTimeRange();

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden max-w-2xl mx-auto">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
                    <Clock size={28} /> Booking Time Controller
                </h2>
                <p className="text-gray-400 mt-1">Set the daily opening and closing hours for accepting orders.</p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
                {/* Active Hours Indicator */}
                <div className={`p-4 rounded-lg border ${validRange ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                        {validRange ? (
                            <CheckCircle className="text-green-500" size={20} />
                        ) : (
                            <AlertCircle className="text-red-500" size={20} />
                        )}
                        <span className={`font-medium ${validRange ? 'text-green-400' : 'text-red-400'}`}>
                            {validRange
                                ? `Active booking window: ${getActiveHours()}`
                                : 'Invalid time range - closing time must be after opening time'
                            }
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Opening Time</label>
                        <input
                            type="time"
                            value={openingTime}
                            onChange={(e) => setOpeningTime(e.target.value)}
                            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-orange-500 text-lg transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Orders will be accepted starting from <span className="text-orange-400 font-bold">{formatTime(openingTime)}</span>.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Closing Time</label>
                        <input
                            type="time"
                            value={closingTime}
                            onChange={(e) => setClosingTime(e.target.value)}
                            className={`w-full bg-gray-700 text-white px-4 py-3 rounded-lg border focus:outline-none focus:border-orange-500 text-lg transition-colors ${!validRange ? 'border-red-500' : 'border-gray-600'}`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Orders will not be accepted after <span className="text-orange-400 font-bold">{formatTime(closingTime)}</span>.
                        </p>
                    </div>
                </div>

                {/* Current Status Display */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Current Schedule Preview</h4>
                    <div className="flex items-center justify-between text-white">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-400">{formatTime(openingTime)}</p>
                            <p className="text-xs text-gray-500">Opens</p>
                        </div>
                        <div className="flex-1 mx-4 h-2 bg-gray-700 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-orange-500 to-red-500 rounded-full"></div>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-400">{formatTime(closingTime)}</p>
                            <p className="text-xs text-gray-500">Closes</p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
                    {hasChanges && (
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="px-6 py-3 rounded-lg font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition disabled:opacity-50"
                        >
                            Reset
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !validRange || !hasChanges}
                        className={`px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition transform ${saving || !validRange || !hasChanges
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-600 hover:bg-orange-700 text-white hover:scale-105'
                            }`}
                    >
                        {saving ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                {hasChanges ? 'Save Changes' : 'No Changes'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HandleBookingTime;

