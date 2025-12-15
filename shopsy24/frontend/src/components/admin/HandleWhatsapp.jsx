import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Save, MessageCircle } from 'lucide-react';

const HandleWhatsapp = () => {
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/api/admin/settings');
            if (data && data.whatsappNumber) {
                setWhatsappNumber(data.whatsappNumber);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            toast.error("Failed to load WhatsApp settings");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/api/admin/settings', { whatsappNumber });
            toast.success('WhatsApp number updated successfully!');
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to update WhatsApp number");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                    <MessageCircle className="text-green-500" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Handle WhatsApp</h2>
                    <p className="text-gray-400 text-sm">Manage the WhatsApp number for "Custom Kits" direct communication.</p>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                    <label className="block text-gray-300 font-semibold mb-2">WhatsApp Number</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">+</span>
                        <input
                            type="text"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))} // Only numbers
                            placeholder="919876543210"
                            className="w-full bg-gray-700 text-white pl-8 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:border-green-500 transition"
                        />
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                        Enter number with country code (without +). Example: 919876543210.
                    </p>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-bold text-orange-400 mb-2">How it works:</h4>
                    <p className="text-gray-300 text-sm">
                        Products in the <span className="text-white font-bold">"Custom Kits"</span> category will display a WhatsApp icon instead of an "Add to Cart" button.
                        Clicking the icon will open a chat with this number.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="animate-pulse">Updating...</span>
                    ) : (
                        <>
                            <Save size={20} /> Update Number
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default HandleWhatsapp;
