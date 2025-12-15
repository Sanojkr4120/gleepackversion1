import React from 'react';

const Footer = () => {
    return (
        <footer className="hidden md:block bg-gray-800 py-6 border-t border-gray-700 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} ShopSy24. All rights reserved.</p>
                <p className="text-sm mt-2">Delicious Food delivered to your doorstep.</p>
            </div>
        </footer>
    );
};

export default Footer;
