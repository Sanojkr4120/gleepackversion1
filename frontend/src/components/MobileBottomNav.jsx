import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Package, Phone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MobileBottomNav = () => {
    const { user } = useContext(AuthContext);

    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/menu', icon: UtensilsCrossed, label: 'Items' },
        { to: '/my-orders', icon: Package, label: 'Orders', requiresAuth: true },
        { to: '/contact', icon: Phone, label: 'Contact' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-gray-700 z-50 safe-area-bottom">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    // Skip "My Orders" if user is not logged in
                    if (item.requiresAuth && !user) return null;

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive
                                    ? 'text-orange-500'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-orange-500/20' : ''}`}>
                                        <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className={`text-xs mt-0.5 font-medium ${isActive ? 'text-orange-500' : ''}`}>
                                        {item.label}
                                    </span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
