import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Star,
    Truck,
    Calendar,
    Gift,
    PartyPopper,
    Cake,
    Heart,
    Store,
    Sparkles,
    ShieldCheck,
    Clock,
    Award,
    Package,
    ArrowRight,
    Quote,
    Mail,
    CheckCircle,
    Zap,
    Crown,
    Percent
} from 'lucide-react';

// Hero Slider Data
const sliderImages = [
    {
        url: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?q=80&w=2000&auto=format&fit=crop",
        title: "Make Every Celebration Magical",
        subtitle: "Premium Party Supplies & Decorations for Every Occasion",
        badge: "🎉 New Arrivals",
        cta: "Shop Birthday",
        ctaLink: "/menu?category=birthday"
    },
    {
        url: "https://images.unsplash.com/photo-1464349153912-bc6163bd89a7?q=80&w=2000&auto=format&fit=crop",
        title: "Love Deserves the Best",
        subtitle: "Exquisite Anniversary & Romance Collections",
        badge: "💕 Trending Now",
        cta: "Shop Anniversary",
        ctaLink: "/menu?category=anniversary"
    },
    {
        url: "https://images.unsplash.com/photo-1556125574-d7f27ec36a06?q=80&w=2000&auto=format&fit=crop",
        title: "Grand Openings Made Grander",
        subtitle: "Professional Inauguration & Business Celebration Kits",
        badge: "🏪 Business Special",
        cta: "Shop Opening Kits",
        ctaLink: "/menu?category=opening"
    },
    {
        url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=2000&auto=format&fit=crop",
        title: "Festival Ready, Always",
        subtitle: "Celebrate Every Festival with Style & Joy",
        badge: "🎊 Festival Collection",
        cta: "Explore Festivals",
        ctaLink: "/menu?category=festival"
    },
    {
        url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=2000&auto=format&fit=crop",
        title: "Gifts That Speak Love",
        subtitle: "Curated Gift Hampers for Your Special Someone",
        badge: "🎁 Gift Ideas",
        cta: "Shop Gifts",
        ctaLink: "/menu?category=gifts"
    }
];

// Categories Data
const categories = [
    {
        id: 1,
        name: "Birthday Party",
        icon: <Cake size={36} />,
        image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?q=80&w=800&auto=format&fit=crop",
        color: "from-pink-500 to-rose-600",
        items: "500+ Items"
    },
    {
        id: 2,
        name: "Anniversary",
        icon: <Heart size={36} />,
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=800&auto=format&fit=crop",
        color: "from-red-500 to-pink-600",
        items: "300+ Items"
    },
    {
        id: 3,
        name: "Shop Opening",
        icon: <Store size={36} />,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop",
        color: "from-amber-500 to-orange-600",
        items: "200+ Items"
    },
    {
        id: 4,
        name: "Baby Shower",
        icon: <Gift size={36} />,
        image: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?q=80&w=800&auto=format&fit=crop",
        color: "from-cyan-500 to-blue-600",
        items: "250+ Items"
    },
    {
        id: 5,
        name: "Festivals",
        icon: <PartyPopper size={36} />,
        image: "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?q=80&w=800&auto=format&fit=crop",
        color: "from-purple-500 to-indigo-600",
        items: "400+ Items"
    },
    {
        id: 6,
        name: "Wedding",
        icon: <Sparkles size={36} />,
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
        color: "from-emerald-500 to-teal-600",
        items: "350+ Items"
    }
];



// Services/Features
const services = [
    {
        icon: <Truck size={40} />,
        title: "Free Express Delivery",
        description: "Free shipping on orders above ₹999. Same day delivery available.",
        color: "text-emerald-500"
    },
    {
        icon: <ShieldCheck size={40} />,
        title: "Quality Guaranteed",
        description: "Premium quality materials with 100% satisfaction guarantee.",
        color: "text-blue-500"
    },
    {
        icon: <Clock size={40} />,
        title: "24/7 Support",
        description: "Round the clock customer support for all your queries.",
        color: "text-purple-500"
    },
    {
        icon: <Package size={40} />,
        title: "Easy Returns",
        description: "Hassle-free 7-day returns and exchange policy.",
        color: "text-orange-500"
    }
];

// Testimonials
const testimonials = [
    {
        id: 1,
        name: "Priya Sharma",
        role: "Birthday Party Host",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
        content: "GleePack made my daughter's birthday absolutely magical! The quality of decorations was outstanding and delivery was super quick.",
        rating: 5
    },
    {
        id: 2,
        name: "Rahul Verma",
        role: "Business Owner",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
        content: "Used their shop opening kit for my new store. Professional quality and amazing customer service. Highly recommended!",
        rating: 5
    },
    {
        id: 3,
        name: "Anita Patel",
        role: "Event Planner",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
        content: "As an event planner, I need reliable suppliers. GleePack has never disappointed me. Best party supplies in the market!",
        rating: 5
    }
];

// Stats
const stats = [
    { label: "Happy Customers", value: 15000, suffix: "+", icon: <Heart size={24} /> },
    { label: "Orders Delivered", value: 50000, suffix: "+", icon: <Package size={24} /> },
    { label: "Products Available", value: 2500, suffix: "+", icon: <Gift size={24} /> },
    { label: "Cities Covered", value: 100, suffix: "+", icon: <Truck size={24} /> }
];

// Trust Badges
const trustBadges = [
    { icon: <ShieldCheck size={20} />, text: "Secure Payments" },
    { icon: <Award size={20} />, text: "Premium Quality" },
    { icon: <Truck size={20} />, text: "Fast Delivery" },
    { icon: <Clock size={20} />, text: "24/7 Support" }
];

// Counter Animation Hook
const useCounter = (target, duration = 2000) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const increment = target / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= target) {
                    setCount(target);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [inView, target, duration]);

    return { count, ref };
};

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-950 overflow-x-hidden">

            {/* Floating Promo Banner */}
            <motion.div
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 text-white py-2 px-4 text-center text-sm font-medium"
            >
                <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Zap size={16} className="animate-pulse" />
                    <span>🎉 Grand Sale Live! Your first <strong>purchase</strong> for 25% OFF on all orders!</span>
                    <Link to="/menu" className="underline hover:text-yellow-200 transition ml-2">Shop Now →</Link>
                </div>
            </motion.div>

            {/* Section 1: Hero Slider */}
            <section className="relative min-h-[400px] h-[80vh] sm:h-[600px] md:h-[700px] lg:h-[800px] max-h-[900px] w-full overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={sliderImages[currentSlide].url}
                            alt="Hero"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30"></div>
                    </motion.div>
                </AnimatePresence>

                {/* Hero Content */}
                <div className="absolute inset-0 flex items-center z-10">
                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="max-w-3xl">
                            <motion.div
                                key={`badge-${currentSlide}`}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm mb-6"
                            >
                                <span>{sliderImages[currentSlide].badge}</span>
                            </motion.div>

                            <motion.h1
                                key={`title-${currentSlide}`}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight"
                            >
                                <span className="bg-gradient-to-r from-white via-orange-200 to-orange-400 bg-clip-text text-transparent">
                                    {sliderImages[currentSlide].title}
                                </span>
                            </motion.h1>

                            <motion.p
                                key={`sub-${currentSlide}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                                className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed"
                            >
                                {sliderImages[currentSlide].subtitle}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link
                                    to="/menu"
                                    className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-1 flex items-center gap-2"
                                >
                                    {sliderImages[currentSlide].cta}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/menu"
                                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all flex items-center gap-2"
                                >
                                    View All Products
                                </Link>
                            </motion.div>

                            {/* Trust Badges */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="flex flex-wrap gap-6 mt-10"
                            >
                                {trustBadges.map((badge, index) => (
                                    <div key={index} className="flex items-center gap-2 text-gray-400 text-sm">
                                        <span className="text-orange-500">{badge.icon}</span>
                                        {badge.text}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Slider Controls */}
                <button
                    onClick={prevSlide}
                    className="absolute hidden md:block left-4 lg:left-8 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 lg:p-4 rounded-full transition z-20 border border-white/20"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute hidden md:block right-4 lg:right-8 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 lg:p-4 rounded-full transition z-20 border border-white/20"
                >
                    <ChevronRight size={24} />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {sliderImages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                                ? 'w-8 bg-orange-500'
                                : 'w-2 bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Section 2: Categories */}
            <section className="pt-20 bg-gray-950 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-900/10 via-transparent to-transparent pointer-events-none"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-orange-500 font-semibold text-sm tracking-widest uppercase">Shop by Occasion</span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">Celebrate Every Moment</h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
                        <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg">
                            From intimate gatherings to grand celebrations, find everything you need for any occasion.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Link
                                    to={`/menu?category=${category.name.toLowerCase().replace(' ', '-')}`}
                                    className="group block relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
                                >
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-70 group-hover:opacity-80 transition-opacity`}></div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            {category.icon}
                                        </div>
                                        <h3 className="font-bold text-lg text-center">{category.name}</h3>
                                        <p className="text-sm opacity-80 mt-1">{category.items}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Section 4: Features/Services */}
            <section className="py-20 bg-gray-950 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="bg-gray-800/30 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 hover:border-orange-500/30 transition-all group hover:bg-gray-800/50"
                            >
                                <div className={`${service.color} mb-6 group-hover:scale-110 transition-transform`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 5: Special Offer Banner */}
            <section className="py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-pink-600"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-center lg:text-left"
                        >
                            <div className="flex items-center gap-2 justify-center lg:justify-start mb-4">
                                <Crown className="text-yellow-300" size={28} />
                                <span className="text-yellow-200 font-semibold">Limited Time Offer</span>
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4">
                                Up to <span className="text-yellow-300">50% OFF</span> on Party Kits
                            </h2>
                            <p className="text-white/80 text-lg max-w-xl">
                                Get amazing discounts on complete party decoration kits. Make your celebration extraordinary without breaking the bank!
                            </p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                to="/menu"
                                className="inline-flex items-center gap-3 bg-white text-red-600 font-bold py-4 px-10 rounded-full text-lg transition-all hover:bg-yellow-100 hover:scale-105 shadow-2xl"
                            >
                                Shop the Sale
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Section 6: Testimonials */}
            <section className="py-20 bg-gray-900">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="text-orange-500 font-semibold text-sm tracking-widest uppercase">Testimonials</span>
                        <h2 className="text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">What Our Customers Say</h2>
                        <div className="w-24 h-1.5 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl border border-gray-700/50 relative"
                            >
                                <Quote className="absolute top-6 right-6 text-orange-500/20" size={48} />
                                <div className="flex items-center gap-4 mb-6">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
                                    />
                                    <div>
                                        <h4 className="font-bold text-white">{testimonial.name}</h4>
                                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="text-yellow-400" fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-gray-300 leading-relaxed">{testimonial.content}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Section 7: Stats Counter */}
            <section className="py-16 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-gray-700/50">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const { count, ref } = useCounter(stat.value);
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="text-center"
                                    ref={ref}
                                >
                                    <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500/20 text-orange-500 rounded-full mb-4">
                                        {stat.icon}
                                    </div>
                                    <div className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                                        {count.toLocaleString()}{stat.suffix}
                                    </div>
                                    <div className="text-gray-400 font-medium">{stat.label}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Section 8: Newsletter */}
            <section className="py-20 bg-gray-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Mail size={16} />
                            Newsletter
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                            Stay Updated with Latest Offers
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg">
                            Subscribe to our newsletter and get exclusive discounts, new product alerts, and celebration tips delivered to your inbox.
                        </p>

                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-xl mx-auto px-2 sm:px-0">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 bg-gray-800/50 border border-gray-700 text-white px-6 py-4 rounded-full focus:outline-none focus:border-orange-500 transition placeholder-gray-500"
                                required
                            />
                            <button
                                type="submit"
                                disabled={subscribed}
                                className={`px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${subscribed
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:scale-105'
                                    }`}
                            >
                                {subscribed ? (
                                    <>
                                        <CheckCircle size={20} />
                                        Subscribed!
                                    </>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </form>

                        <p className="text-gray-500 text-sm mt-4">
                            🔒 We respect your privacy. Unsubscribe anytime.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Section 9: Final CTA */}
            <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950">
                <div className="container mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                            Ready to Make Your <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Celebration Special</span>?
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                            Browse our extensive collection of party supplies, decorations, and gift items. Everything you need for a memorable celebration is just a click away.
                        </p>
                        <Link
                            to="/menu"
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold sm:py-5 py-3 sm:px-12 px-8 rounded-full text-lg transition-all sm:shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-1"
                        >
                            Start Shopping Now
                            <ArrowRight size={22} />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
