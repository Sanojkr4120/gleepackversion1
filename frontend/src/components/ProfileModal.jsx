import React, { useState, useContext, useEffect } from 'react';
import { X, Camera, User, Lock, Save, Loader } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user, updateUser } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    // Password State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
            setImagePreview(user.profileImage || null);
        }
    }, [user, isOpen]);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submitProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('name', profileData.name);
        formData.append('phone', profileData.phone);
        formData.append('address', profileData.address);
        if (selectedImage) {
            formData.append('profileImage', selectedImage);
        }

        try {
            const res = await api.put('/api/auth/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data);
            toast.success('Profile updated successfully');
            onClose();
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        setIsLoading(true);
        try {
            await api.put('/api/auth/updatepassword', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            onClose();
        } catch (error) {
            toast.error(error.formattedMessage || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-white">Account Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <User size={18} /> Profile
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${activeTab === 'password' ? 'text-orange-500 border-b-2 border-orange-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200'}`}
                        onClick={() => setActiveTab('password')}
                    >
                        <Lock size={18} /> Security
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
                    {activeTab === 'profile' ? (
                        <form onSubmit={submitProfile} className="space-y-4">
                            {/* Image Upload */}
                            <div className="flex justify-center mb-6">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-orange-500 bg-gray-800">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition cursor-pointer rounded-full">
                                        <Camera className="text-white" size={24} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleProfileChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full bg-gray-800/50 border border-gray-700 rounded px-3 py-2 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleProfileChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={profileData.address}
                                    onChange={handleProfileChange}
                                    rows="3"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Save Changes</>}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={submitPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-orange-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? <Loader className="animate-spin" size={20} /> : <><Save size={20} /> Update Password</>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
