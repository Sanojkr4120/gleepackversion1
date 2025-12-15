import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const HandleDelivery = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [charges, setCharges] = useState([]);
    const [times, setTimes] = useState([]);
    const [testDistance, setTestDistance] = useState('');
    const [testResult, setTestResult] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/api/admin/settings');
            setSettings(res.data);

            if (res.data.deliveryCharges && res.data.deliveryCharges.length > 0) {
                setCharges(res.data.deliveryCharges);
            } else {
                setCharges([
                    { minDistance: 0, maxDistance: 1, charge: 0 },
                    { minDistance: 1, maxDistance: 2, charge: 20 },
                    { minDistance: 2, maxDistance: 3, charge: 40 },
                    { minDistance: 3, maxDistance: 5, charge: 60 }
                ]);
            }

            if (res.data.deliveryTimes && res.data.deliveryTimes.length > 0) {
                setTimes(res.data.deliveryTimes);
            } else {
                setTimes([
                    { minDistance: 0, maxDistance: 1, time: 15 },
                    { minDistance: 1, maxDistance: 2, time: 30 },
                    { minDistance: 2, maxDistance: 3, time: 45 },
                    { minDistance: 3, maxDistance: 5, time: 60 }
                ]);
            }

            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load delivery settings");
            setLoading(false);
        }
    };

    const handleChargeChange = (index, field, value) => {
        const newCharges = [...charges];
        newCharges[index][field] = Number(value);
        setCharges(newCharges);
    };

    const addChargeSlot = () => {
        setCharges([...charges, { minDistance: 0, maxDistance: 0, charge: 0 }]);
    };

    const removeChargeSlot = (index) => {
        const newCharges = charges.filter((_, i) => i !== index);
        setCharges(newCharges);
    };

    const handleTimeChange = (index, field, value) => {
        const newTimes = [...times];
        newTimes[index][field] = Number(value);
        setTimes(newTimes);
    };

    const addTimeSlot = () => {
        setTimes([...times, { minDistance: 0, maxDistance: 0, time: 0 }]);
    };

    const removeTimeSlot = (index) => {
        const newTimes = times.filter((_, i) => i !== index);
        setTimes(newTimes);
    };

    const saveSettings = async () => {
        try {
            await api.put('/api/admin/settings', {
                deliveryCharges: charges,
                deliveryTimes: times
            });
            toast.success("Delivery settings updated successfully");
        } catch (error) {
            console.error("Failed to update settings", error);
            toast.error("Failed to update delivery settings");
        }
    };

    const handleTestDistance = () => {
        const distance = parseFloat(testDistance);
        
        if (isNaN(distance) || distance < 0) {
            toast.error("Please enter a valid distance");
            return;
        }

        // Sort charges and times to match Cart logic
        const sortedCharges = [...charges].sort((a, b) => a.minDistance - b.minDistance);
        const sortedTimes = [...times].sort((a, b) => a.minDistance - b.minDistance);

        // Check if distance is within any charge range (inclusive of maxDistance)
        const chargeSlot = sortedCharges.find(c => distance >= c.minDistance && distance <= c.maxDistance);
        const timeSlot = sortedTimes.find(t => distance >= t.minDistance && distance <= t.maxDistance);

        if (!chargeSlot && !timeSlot) {
            setTestResult({
                isOutOfRange: true,
                distance: distance
            });
        } else {
            setTestResult({
                isOutOfRange: false,
                distance: distance,
                charge: chargeSlot ? chargeSlot.charge : null,
                time: timeSlot ? timeSlot.time : null
            });
        }
    };

    if (loading) return <div className="text-white">Loading...</div>;

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-8">
            {/* Delivery Charges Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Handle Delivery Charges</h2>
                <div className="space-y-4">
                    {charges.map((slot, index) => (
                        <div key={index} className="flex items-center gap-4 bg-gray-700 p-4 rounded-lg flex-wrap">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm text-gray-400 mb-1">Min Distance (km)</label>
                                <input
                                    type="number"
                                    value={slot.minDistance}
                                    onChange={(e) => handleChargeChange(index, 'minDistance', e.target.value)}
                                    className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm text-gray-400 mb-1">Max Distance (km)</label>
                                <input
                                    type="number"
                                    value={slot.maxDistance}
                                    onChange={(e) => handleChargeChange(index, 'maxDistance', e.target.value)}
                                    className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm text-gray-400 mb-1">Charge (₹)</label>
                                <input
                                    type="number"
                                    value={slot.charge}
                                    onChange={(e) => handleChargeChange(index, 'charge', e.target.value)}
                                    className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <button
                                onClick={() => removeChargeSlot(index)}
                                className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                                title="Remove Slot"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <button
                        onClick={addChargeSlot}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold transition"
                    >
                        Add New Charge Slot
                    </button>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* Delivery Times Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Handle Delivery Times</h2>
                <div className="space-y-4">
                    {times.map((slot, index) => (
                        <div key={index} className="flex items-center gap-4 bg-gray-700 p-4 rounded-lg flex-wrap">
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm text-gray-400 mb-1">Min Distance (km)</label>
                                <input
                                    type="number"
                                    value={slot.minDistance}
                                    onChange={(e) => handleTimeChange(index, 'minDistance', e.target.value)}
                                    className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm text-gray-400 mb-1">Max Distance (km)</label>
                                <input
                                    type="number"
                                    value={slot.maxDistance}
                                    onChange={(e) => handleTimeChange(index, 'maxDistance', e.target.value)}
                                    className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label className="block text-sm text-gray-400 mb-1">Time (Minutes)</label>
                                <input
                                    type="number"
                                    value={slot.time}
                                    onChange={(e) => handleTimeChange(index, 'time', e.target.value)}
                                    className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <button
                                onClick={() => removeTimeSlot(index)}
                                className="mt-6 bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                                title="Remove Slot"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <button
                        onClick={addTimeSlot}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold transition"
                    >
                        Add New Time Slot
                    </button>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* Test Delivery Range Section */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-6">Test Delivery Range</h2>
                <div className="bg-gray-700 p-6 rounded-lg space-y-4">
                    <p className="text-gray-300 text-sm mb-4">
                        Enter a distance to check if it falls within your configured delivery ranges and see the applicable charge and estimated time.
                    </p>
                    
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-400 mb-1">Test Distance (km)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={testDistance}
                                onChange={(e) => setTestDistance(e.target.value)}
                                placeholder="e.g., 2.5"
                                className="w-full bg-gray-600 border border-gray-500 rounded p-2 text-white focus:outline-none focus:border-orange-500"
                            />
                        </div>
                        <button
                            onClick={handleTestDistance}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-bold transition h-[42px]"
                        >
                            Test Range
                        </button>
                    </div>

                    {/* Test Result Display */}
                    {testResult && (
                        <div className={`mt-4 p-4 rounded-lg border-2 ${
                            testResult.isOutOfRange 
                                ? 'bg-red-500/10 border-red-500' 
                                : 'bg-green-500/10 border-green-500'
                        }`}>
                            {testResult.isOutOfRange ? (
                                <div className="flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-500">Out of Range</h3>
                                        <p className="text-red-400 mt-1">
                                            Distance <span className="font-bold">{testResult.distance} km</span> is outside your configured delivery ranges.
                                        </p>
                                        <p className="text-red-300 text-sm mt-2">
                                            Customers at this distance will not be able to place orders.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-green-500">Within Range</h3>
                                        <p className="text-green-400 mt-1">
                                            Distance <span className="font-bold">{testResult.distance} km</span> is within your configured delivery ranges.
                                        </p>
                                        <div className="mt-3 grid grid-cols-2 gap-4">
                                            {testResult.charge !== null && (
                                                <div className="bg-gray-800 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Delivery Charge</p>
                                                    <p className="text-xl font-bold text-orange-400">
                                                        {testResult.charge === 0 ? 'Free' : `₹${testResult.charge}`}
                                                    </p>
                                                </div>
                                            )}
                                            {testResult.time !== null && (
                                                <div className="bg-gray-800 p-3 rounded">
                                                    <p className="text-xs text-gray-400 mb-1">Estimated Time</p>
                                                    <p className="text-xl font-bold text-blue-400">
                                                        {testResult.time} mins
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
                <button
                    onClick={saveSettings}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-bold transition text-lg"
                >
                    Save All Settings
                </button>
            </div>
        </div>
    );
};

export default HandleDelivery;
