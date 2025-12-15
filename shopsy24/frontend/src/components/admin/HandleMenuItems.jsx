import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const HandleMenuItems = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [imageType, setImageType] = useState('upload'); // 'upload' or 'url'
    const [videoType, setVideoType] = useState('url'); // 'upload' or 'url'
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: 'Pillows',
        image: null,
        imageUrl: '',
        video: null,
        videoUrl: '',
        isAvailable: true
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            const res = await api.get('/api/menu');
            setMenuItems(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load menu items');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'imageUrl') {
            setImagePreview(value);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, video: file }));
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                price: item.price,
                description: item.description,
                category: item.category,
                image: null,
                imageUrl: '', // We don't pre-fill URL if it was an uploaded image, but we could if we knew. 
                // For now, let's assume if they want to change it, they start fresh or we just show current.
                isAvailable: item.isAvailable
            });
            setImagePreview(item.image);
            setImageType('upload'); // Default to upload, or we could check if item.image is a URL vs Cloudinary path? 
            // Cloudinary paths are URLs too. Let's just default to upload for editing.

            // Set video data if exists
            if (item.video) {
                // Simple check to see if it's a youtube url or file url
                if (item.video.includes('youtube') || item.video.includes('youtu.be')) {
                    setVideoType('url');
                    setFormData(prev => ({ ...prev, videoUrl: item.video, video: null }));
                } else {
                    setVideoType('upload'); // Assume uploaded file if not youtube
                    // We can't pre-fill the file input, but we can show it exists or just let them replace it
                    setFormData(prev => ({ ...prev, videoUrl: '', video: null }));
                }
            } else {
                setVideoType('url');
                setFormData(prev => ({ ...prev, videoUrl: '', video: null }));
            }
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                price: '',
                description: '',
                category: 'Events',
                image: null,
                imageUrl: '',
                isAvailable: true
            });
            setImagePreview(null);
            setImageType('upload');
            setVideoType('url');
            setFormData(prev => ({ ...prev, video: null, videoUrl: '' }));
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('isAvailable', formData.isAvailable);

        if (imageType === 'upload' && formData.image) {
            data.append('image', formData.image);
        } else if (imageType === 'url' && formData.imageUrl) {
            data.append('imageUrl', formData.imageUrl);
        }

        if (videoType === 'upload' && formData.video) {
            data.append('video', formData.video);
        } else if (videoType === 'url' && formData.videoUrl) {
            let finalVideoUrl = formData.videoUrl;
            // Check if the input is an iframe tag
            if (formData.videoUrl.includes('<iframe')) {
                const srcMatch = formData.videoUrl.match(/src="([^"]+)"/);
                if (srcMatch && srcMatch[1]) {
                    finalVideoUrl = srcMatch[1];
                }
            }
            data.append('videoUrl', finalVideoUrl);
        }

        try {
            if (editingItem) {
                await api.put(`/api/menu/${editingItem._id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Menu item updated successfully');
            } else {
                if (imageType === 'upload' && !formData.image) {
                    toast.error('Please select an image');
                    return;
                }
                if (imageType === 'url' && !formData.imageUrl) {
                    toast.error('Please enter an image URL');
                    return;
                }

                await api.post('/api/menu', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Menu item created successfully');
            }
            setIsModalOpen(false);
            fetchMenuItems();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await api.delete(`/api/menu/${id}`);
                toast.success('Menu item deleted');
                fetchMenuItems();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete item');
            }
        }
    };

    if (loading) return <div className="text-center text-white p-10">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-orange-500">Manage Menu Items</h2>
                <button
                    onClick={() => openModal()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus size={20} /> Add Item
                </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300">
                        <tr>
                            <th className="p-4">Image</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Price</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {menuItems.map(item => (
                            <tr key={item._id} className="hover:bg-gray-700/50">
                                <td className="p-4">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                                </td>
                                <td className="p-4 font-medium text-white">{item.name}</td>
                                <td className="p-4 text-gray-300">{item.category}</td>
                                <td className="p-4 text-green-400 font-bold">₹{item.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${item.isAvailable ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {menuItems.length === 0 && <p className="p-8 text-center text-gray-500">No menu items found.</p>}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">
                                {editingItem ? 'Edit Menu Item' : 'Add New Item'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-gray-400 mb-1 text-sm">Item Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-orange-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 mb-1 text-sm">Price (₹)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-orange-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1 text-sm">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-orange-500 focus:outline-none"
                                    >
                                        <option value="Matrices">Matrices </option>
                                        <option value="Premiums Pillow's">Premiums Pillow's </option>
                                        <option value="Premiums Sleep Packages">Premiums Sleep Packages </option>
                                        <option value="Wedding">Wedding</option>
                                        <option value="Baby Shower">Baby Shower</option>
                                        <option value="Festivals">Festivals</option>
                                        <option value="Custom Kits">Custom Kits</option>
                                        <option value="Puja Kits">Puja Kits</option>
                                        <option value="Other Events"> Other Events</option>
                                        <option value="Decor Items">Decor Items</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-400 mb-1 text-sm">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-orange-500 focus:outline-none"
                                    required
                                ></textarea>
                            </div>

                            {/* Image Selection Section */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Image Source</label>
                                <div className="flex gap-4 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setImageType('upload')}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${imageType === 'upload'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        <Upload size={18} /> Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setImageType('url')}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${imageType === 'url'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        <LinkIcon size={18} /> Image URL
                                    </button>
                                </div>

                                {imageType === 'upload' ? (
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-orange-500 transition relative">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-sm">Click to upload image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-orange-500 focus:outline-none"
                                    />
                                )}

                                {/* Preview */}
                                {imagePreview && (
                                    <div className="mt-4 relative h-40 w-full bg-gray-700 rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Video Selection Section */}
                            <div>
                                <label className="block text-gray-400 mb-2 text-sm">Video Source (Optional)</label>
                                <div className="flex gap-4 mb-3">
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('upload')}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${videoType === 'upload'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        <Upload size={18} /> Upload Video
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVideoType('url')}
                                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition ${videoType === 'url'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                    >
                                        <LinkIcon size={18} /> Video URL
                                    </button>
                                </div>

                                {videoType === 'upload' ? (
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-orange-500 transition relative">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center text-gray-400">
                                            <Upload size={24} className="mb-2" />
                                            <span className="text-sm">Click to upload video (mp4, mov, avi, 4k, etc)</span>
                                            {formData.video && <span className="text-orange-500 mt-2 text-xs">{formData.video.name}</span>}
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="url"
                                        name="videoUrl"
                                        value={formData.videoUrl}
                                        onChange={handleInputChange}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-orange-500 focus:outline-none"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleInputChange}
                                    id="isAvailable"
                                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                                />
                                <label htmlFor="isAvailable" className="text-gray-300">Available for order</label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition mt-4"
                            >
                                {editingItem ? 'Update Item' : 'Create Item'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HandleMenuItems;
