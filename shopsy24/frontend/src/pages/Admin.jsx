import React, { useState } from 'react';
import DashboardHome from '../components/admin/DashboardHome';
import ManageOrders from '../components/admin/ManageOrders';
import CustomerList from '../components/admin/CustomerList';
import OrderHistory from '../components/admin/OrderHistory';
import HandleOccasions from '../components/admin/HandleOccasions';
import HandleMenuItems from '../components/admin/HandleMenuItems';
import HandleArea from '../components/admin/HandleArea';
import HandleAreaCenter from '../components/admin/HandleAreaCenter';
import HandlePincodes from '../components/admin/HandlePincodes';
import HandleDelivery from '../components/admin/HandleDelivery';
import HandleOrderLocations from '../components/admin/HandleOrderLocations';
import HandleUserRoles from '../components/admin/HandleUserRoles';
import HandleBookingTime from '../components/admin/HandleBookingTime';
import HandleWhatsapp from '../components/admin/HandleWhatsapp';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardHome />;
            case 'orders':
                return <ManageOrders />;
            case 'customers':
                return <CustomerList />;
            case 'history':
                return <OrderHistory />;
            case 'occasions':
                return <HandleOccasions />;
            case 'menu':
                return <HandleMenuItems />;
            case 'areas':
                return <HandleArea />;
            case 'centers':
                return <HandleAreaCenter />;
            case 'pincodes':
                return <HandlePincodes />;
            case 'delivery':
                return <HandleDelivery />;
            case 'locations':
                return <HandleOrderLocations />;
            case 'roles':
                return <HandleUserRoles />;
            case 'bookingTime':
                return <HandleBookingTime />;
            case 'whatsapp':
                return <HandleWhatsapp />;
            default:
                return <DashboardHome />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 min-h-[80vh]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 md:flex-shrink-0 bg-gray-800 rounded-xl border border-gray-700 p-4 h-fit md:sticky md:top-24">
                <h2 className="text-xl font-bold mb-6 text-center text-white border-b border-gray-700 pb-4">Admin Panel</h2>
                <nav className="space-y-2 max-h-[60vh] md:max-h-none overflow-y-auto">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'orders' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Manage Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'customers' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Customers
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'history' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Order History
                    </button>
                    <button
                        onClick={() => setActiveTab('menu')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'menu' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Handle Menu Items
                    </button>
                    <button
                        onClick={() => setActiveTab('occasions')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'occasions' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Handle Occasions
                    </button>
                    <button
                        onClick={() => setActiveTab('areas')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'areas' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Handle Area
                    </button>
                    <button
                        onClick={() => setActiveTab('centers')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'centers' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Handle Area Center
                    </button>
                    <button
                        onClick={() => setActiveTab('pincodes')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'pincodes' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Handle Pincodes
                    </button>
                    <button
                        onClick={() => setActiveTab('delivery')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'delivery' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Handle Delivery
                    </button>
                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'locations' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Order Locations
                    </button>
                    <button
                        onClick={() => setActiveTab('roles')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'roles' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Role Controller
                    </button>
                    <button
                        onClick={() => setActiveTab('bookingTime')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'bookingTime' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Booking Time
                    </button>
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'whatsapp' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Handle WhatsApp
                    </button>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                {renderContent()}
            </div>
        </div>
    );
};

export default Admin;
