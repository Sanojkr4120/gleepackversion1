import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star,
    Truck,
    ShieldCheck,
    Clock,
    ArrowRight,
    ShoppingBag,
    Moon,
    Check,
    Zap,
    Menu,
    ChevronRight,
    Award,
    Heart,
    Sparkles
} from 'lucide-react';

// --- Assets & Data ---

const heroSlides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=2542&auto=format&fit=crop",
        title: "Sleep Like a Dream",
        subtitle: "Upgrade to hotel-quality comfort with our premium memory foam mattresses and bedding.",
        cta: "Shop Mattresses",
        link: "/menu?category=mattress"
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?q=80&w=2000&auto=format&fit=crop",
        title: "Protect Your Investment",
        subtitle: "Waterproof, breathable mattress protectors starting at just ₹999.",
        cta: "Shop Protectors",
        link: "/menu?category=protectors"
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=2000&auto=format&fit=crop",
        title: "Luxury You Can Feel",
        subtitle: "100% Cotton, 300TC printed bedsheets to brighten up your bedroom.",
        cta: "Shop Bedsheets",
        link: "/menu?category=bedsheets"
    }
];

const features = [
    { icon: <Truck className="text-blue-600" size={24} />, title: "Free Shipping", desc: "On all orders above ₹499" },
    { icon: <ShieldCheck className="text-blue-600" size={24} />, title: "1 Year Warranty", desc: "On all mattress protectors" },
    { icon: <Moon className="text-blue-600" size={24} />, title: "100-Night Trial", desc: "Love it or return it" },
    { icon: <Award className="text-blue-600" size={24} />, title: "Top Quality", desc: "Certified non-toxic materials" }
];

// Product cards removed as per request
const bundleOffer = {
    title: "The Ultimate Sleep Upgrade Bundle",
    items: [
        "Orthopedic Mattress",
        "Waterproof Protector",
        "Cotton Bedsheet Set",
        "2 Premium Pillows"
    ],
    price: 2999,
    mrp: 8999,
    savings: "65%",
    image: "https://images.unsplash.com/photo-1616627547584-bf28cee262db?q=80&w=2000&auto=format&fit=crop"
};

const Home = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 59, seconds: 59 });
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return { hours: 11, minutes: 59, seconds: 59 }; // Reset loop
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const slideTimer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(slideTimer);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-slate-800">
            {/* Header / Urgency Strip */}
            <div className="bg-slate-900 text-white text-xs sm:text-sm py-2 px-4 shadow-md sticky top-16 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400 fill-current animate-pulse" />
                        <span className="font-semibold">Flash Sale: Flat 60% OFF ends in:</span>
                    </div>
                    <div className="flex gap-1 font-mono font-bold text-yellow-400">
                        <span>{String(timeLeft.hours).padStart(2, '0')}h</span> :
                        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span> :
                        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                    </div>
                </div>
            </div>

            {/* Premium Hero Carousel Section */}
            <div className="relative bg-slate-900 overflow-hidden h-[70vh] min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Background Image with Ken Burns Effect */}
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 6, ease: "linear" }}
                            src={heroSlides[currentSlide].image}
                            alt={heroSlides[currentSlide].title}
                            className="w-full h-full object-cover"
                        />

                        {/* Cinematic Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent">
                            <div className="container mx-auto px-4 md:px-8 h-full flex items-center">
                                <div className="max-w-2xl">
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                    >
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-blue-200 text-sm font-medium mb-6 border border-white/10 uppercase tracking-widest">
                                            <Sparkles size={14} className="text-yellow-400" />
                                            Premium Collection
                                        </div>
                                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300 mb-6 leading-tight tracking-tight">
                                            {heroSlides[currentSlide].title}
                                        </h1>
                                        <p className="text-lg md:text-2xl text-slate-300 mb-10 font-light leading-relaxed max-w-xl">
                                            {heroSlides[currentSlide].subtitle}
                                        </p>
                                        <div className="flex gap-4">
                                            <Link
                                                to={heroSlides[currentSlide].link}
                                                className="group relative px-8 py-4 bg-white text-slate-950 text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    {heroSlides[currentSlide].cta} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            </Link>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Premium Navigation Controls */}
                <div className="absolute bottom-10 left-0 w-full z-20">
                    <div className="container mx-auto px-4 flex items-center justify-between border-t border-white/10 pt-6">
                        {/* Progress Indicators */}
                        <div className="flex gap-3">
                            {heroSlides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className="relative h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300"
                                    style={{ width: idx === currentSlide ? '60px' : '30px' }}
                                >
                                    {idx === currentSlide && (
                                        <motion.div
                                            className="absolute inset-0 bg-yellow-400"
                                            layoutId="progress"
                                            initial={{ x: '-100%' }}
                                            animate={{ x: '0%' }}
                                            transition={{ duration: 5, ease: "linear" }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Counter */}
                        <div className="text-white/50 font-mono text-sm">
                            <span className="text-white font-bold text-lg">0{currentSlide + 1}</span> / 0{heroSlides.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Strip */}
            <div className="bg-white border-b border-gray-200 shadow-sm py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 min-w-[200px] flex-1">
                                {feature.icon}
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">{feature.title}</h3>
                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service Attraction Section */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-blue-600 font-semibold tracking-wider uppercase text-sm">Why Choose Us</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">Services You Can Trust</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Service 1 */}
                        <div className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-200 group text-center">
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Truck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Fast Delivery</h3>
                            <p className="text-gray-600 mb-6">Indore to anywhere in India. Get your sleep essentials delivered safely and quickly.</p>
                            <Link to="/menu" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all">
                                Let's Get It <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Service 2 */}
                        <div className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-200 group text-center">
                            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Premium Quality</h3>
                            <p className="text-gray-600 mb-6">Hotel-grade materials ensuring maximum comfort and durability for your home.</p>
                            <Link to="/menu" className="inline-flex items-center gap-2 text-purple-600 font-bold hover:gap-3 transition-all">
                                Explore Now <ArrowRight size={18} />
                            </Link>
                        </div>

                        {/* Service 3 */}
                        <div className="bg-white rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-yellow-200 group text-center">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Bulk & Custom</h3>
                            <p className="text-gray-600 mb-6">Need bulk orders for hotels or hostels? value offers for bulk purchases.</p>
                            <Link to="/contact" className="inline-flex items-center gap-2 text-yellow-600 font-bold hover:gap-3 transition-all">
                                Let's Talk <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bundle Deal Banner - High Conversion Focus */}
            <div className="py-16 bg-gradient-to-br from-slate-900 to-blue-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 lg:order-2">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                                <img src={bundleOffer.image} alt="Bundle Deal" className="relative rounded-2xl shadow-2xl border-4 border-white/10 w-full max-w-lg mx-auto transform hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 right-4 bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg rotate-3">
                                    Save {bundleOffer.savings}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 lg:order-1 text-center lg:text-left">
                            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-semibold mb-4 border border-blue-500/30">Limited Time Offer</span>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{bundleOffer.title}</h2>

                            <ul className="space-y-3 mb-8 inline-block text-left">
                                {bundleOffer.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-lg text-gray-200">
                                        <span className="bg-green-500/20 text-green-400 p-1 rounded-full"><Check size={16} /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                                <div className="text-left">
                                    <p className="text-gray-400 text-sm line-through">Total Value: ₹{bundleOffer.mrp}</p>
                                    <p className="text-4xl font-bold text-white">₹{bundleOffer.price}</p>
                                </div>
                                <Link to="/menu" className="w-full sm:w-auto bg-yellow-400 text-slate-900 px-8 py-4 rounded-full font-bold text-xl hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.4)] transition-all transform hover:-translate-y-1 animate-shimmer">
                                    Claim Deal Now
                                </Link>
                            </div>
                            <p className="mt-4 text-sm text-gray-400 flex items-center justify-center lg:justify-start gap-2">
                                <Clock size={14} /> Offer expires in {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Happy Sleepers Across India</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Rahul M.", role: "Verified Buyer", text: "The mattress protector is a lifesaver! Spilled coffee on day 2 and the mattress was bone dry. Amazing quality." },
                            { name: "Priya S.", role: "Verified Buyer", text: "Bought the bundle. The sheets are so soft, and the pillows actually helped with my neck pain. Best purchase of 2024!" },
                            { name: "Amit K.", role: "Verified Buyer", text: "Fast delivery to Indore. Packaging was premium. The prices are unbeatable for this quality." }
                        ].map((t, i) => (
                            <div key={i} className="bg-gray-50 p-6 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex gap-1 text-yellow-400 mb-4">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-gray-600 mb-6 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                        {t.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{t.name}</p>
                                        <p className="text-xs text-green-600 flex items-center gap-1"><Check size={12} /> {t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-slate-900 py-12 text-center text-white">
                <div className="container mx-auto px-4 max-w-2xl">
                    <h2 className="text-3xl font-bold mb-4">Ready for Better Sleep?</h2>
                    <p className="text-gray-400 mb-8">Join 10,000+ happy customers who wake up refreshed every day.</p>
                    <Link to="/menu" className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors">
                        Explore Full Collection
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
