import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import {
    Star,
    ShoppingCart,
    ArrowRight,
    Percent,
    Search,
    Package,
    Sparkles,
    ChevronDown
} from 'lucide-react';
import api from '../utils/api';
import { SystemContext } from '../context/SystemContext';


const Menu = () => {
    const navigate = useNavigate();
    const { settings } = useContext(SystemContext);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const { data } = await api.get('/api/menu');
                setMenuItems(data);
                // Extract unique categories
                const uniqueCategories = [...new Set(data.map(item => item.category))];
                setCategories(uniqueCategories);
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load menu items');
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    const addToCart = (item) => {
        if (item.isAvailable === false) {
            toast.warning('This item is currently unavailable.');
            return;
        }
        setCart(prev => ({
            ...prev,
            [item._id]: { ...item, quantity: (prev[item._id]?.quantity || 0) + 1 }
        }));
        toast.success(`Added ${item.name} to cart!`);
    };

    const proceedToCheckout = () => {
        const items = Object.values(cart);
        if (items.length === 0) {
            toast.error("Cart is empty!");
            return;
        }
        navigate('/cart', { state: { items } });
    };

    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = null;
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0`;
        }
        return url;
    };

    // Filter items based on search and category
    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500"></div>
                    <Package className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={28} />
                </div>
                <p className="text-gray-400 text-lg">Loading amazing products...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 py-8">
            {/* Header Section */}
            <div className="container mx-auto px-1 lg:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Sparkles size={16} />
                        Celebration Essentials
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        Our <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Collection</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Discover premium party supplies, decorations, and celebration kits for every special moment.
                    </p>
                </motion.div>

                {/* Search and Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col lg:flex-row gap-4 mb-10"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-800/50 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-orange-500 transition placeholder-gray-500"
                        />
                    </div>

                    {/* Category Filter Dropdown */}
                    <div className="relative z-30">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-800/80 backdrop-blur-sm text-white hover:bg-gray-700 border border-gray-700 transition-all min-w-[220px] justify-between shadow-lg"
                        >
                            <span className="capitalize">{selectedCategory === 'all' ? 'All Products' : selectedCategory}</span>
                            <ChevronDown size={20} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="absolute top-full left-0 mt-2 w-full min-w-[240px] bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden shadow-2xl p-2"
                            >
                                <button
                                    onClick={() => { setSelectedCategory('all'); setIsDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${selectedCategory === 'all'
                                        ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 font-medium'
                                        : 'text-gray-300 hover:bg-gray-800'
                                        }`}
                                >
                                    All Products
                                    {selectedCategory === 'all' && <motion.div layoutId="activeCheck" className="w-2 h-2 rounded-full bg-orange-500" />}
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => { setSelectedCategory(category); setIsDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${selectedCategory === category
                                            ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 font-medium'
                                            : 'text-gray-300 hover:bg-gray-800'
                                            }`}
                                    >
                                        {category}
                                        {selectedCategory === category && <motion.div layoutId="activeCheck" className="w-2 h-2 rounded-full bg-orange-500" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Results Count */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <p className="text-gray-400">
                        Showing <span className="text-white font-semibold">{filteredItems.length}</span> {filteredItems.length === 1 ? 'product' : 'products'}
                        {selectedCategory !== 'all' && <span> in <span className="text-orange-400">{selectedCategory}</span></span>}
                    </p>
                </motion.div>

                {/* Products Grid - EXACT UI MATCH */}
                {filteredItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Package className="mx-auto text-gray-600 mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-400 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                        {filteredItems.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-gray-800/50 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-700/50 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
                            >
                                <div className="relative overflow-hidden aspect-[4/3]">
                                    {/* Image/Video Logic - EXACT structure class names */}
                                    {item.video ? (
                                        (item.video.includes('youtube') || item.video.includes('youtu.be')) ? (
                                            <iframe
                                                src={getEmbedUrl(item.video)}
                                                className="w-full h-full object-cover"
                                                title={item.name}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>
                                        ) : (
                                            <video
                                                src={item.video}
                                                className="w-full h-full object-cover"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                            />
                                        )
                                    ) : (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    )}

                                    {/* Badge Logic (Sold Out / Category) */}
                                    <div className="absolute top-4 left-4">
                                        {!item.isAvailable ? (
                                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                Sold Out
                                            </span>
                                        ) : (
                                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                                {item.category || "Best Value"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Discount Badge Logic */}
                                    {item.originalPrice && item.originalPrice > item.price && (
                                        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                            <Percent size={12} />
                                            {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                                        </div>
                                    )}

                                    {/* Hover Overlay - EXACT class names */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>

                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-orange-400 transition-colors">
                                        {item.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2 min-h-[40px]">
                                        {item.description}
                                    </p>

                                    {/* Ratings - Added hardcoded 4.5 if missing to match UI look */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="flex items-center gap-1 text-yellow-400">
                                            <Star size={16} fill="currentColor" />
                                            <span className="text-sm font-medium text-white">{item.rating || 4.5}</span>
                                        </div>
                                        <span className="text-gray-500 text-sm">({item.reviews || 24} reviews)</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-orange-500">₹{item.price}</span>
                                            {item.originalPrice && item.originalPrice > item.price && (
                                                <span className="text-gray-500 line-through text-sm">₹{item.originalPrice}</span>
                                            )}
                                        </div>

                                        {/* EXACT Arrow Button Design */}
                                        {/* EXACT Arrow Button Design */}
                                        {item.category === 'Custom Kits' ? (
                                            <a
                                                href={`https://wa.me/${settings?.whatsappNumber || ''}?text=${encodeURIComponent('I want to buy Custom Kit: ' + item.name)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-all hover:scale-110"
                                                title="Chat on WhatsApp"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                </svg>
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(item)}
                                                disabled={!item.isAvailable}
                                                className={`bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-all hover:scale-110 ${!item.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Cart Button */}
            {Object.keys(cart).length > 0 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="fixed top-20 right-4 sm:right-8 z-50"
                >
                    <button
                        onClick={proceedToCheckout}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl shadow-green-500/30 flex items-center gap-3 transition-all hover:scale-105"
                    >
                        <ShoppingCart size={22} />
                        <span>Checkout ({Object.values(cart).reduce((a, b) => a + b.quantity, 0)} items)</span>
                        <ArrowRight size={20} />
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default Menu;
