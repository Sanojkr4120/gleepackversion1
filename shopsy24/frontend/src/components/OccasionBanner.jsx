import React, { useContext, useState, useEffect } from 'react';
import { SystemContext } from '../context/SystemContext';
import { AnimatePresence, motion } from 'framer-motion';

const OccasionBanner = () => {
    const { settings } = useContext(SystemContext);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (settings && settings.isOrderingDisabled) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [settings]);

    // Auto-reopen modal every 10 seconds if closed while ordering is disabled
    // Auto-reopen modal every 10 seconds if closed while ordering is disabled
    useEffect(() => {
        let timer;
        // Only set timer if settings exist, ordering is disabled, and modal is currently hidden
        if (settings?.isOrderingDisabled && !isVisible) {
            timer = setTimeout(() => {
                setIsVisible(true);
            }, 10000);
        }
        return () => clearTimeout(timer);
    }, [settings, isVisible]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gray-800 border border-orange-500/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative"
                    >
                        <div className="mb-4">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-bold text-orange-500 mb-2">
                            {settings.occasionName || 'Special Occasion'}
                        </h2>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            {settings.occasionMessage || 'We are currently closed for orders. Please check back later!'}
                        </p>

                        {(settings.startDate || settings.endDate) && (
                            <div className="bg-gray-700/50 rounded-lg p-3 mb-6 text-sm text-gray-400">
                                {settings.startDate && <p>From: {new Date(settings.startDate).toLocaleDateString()}</p>}
                                {settings.endDate && <p>Until: {new Date(settings.endDate).toLocaleDateString()}</p>}
                            </div>
                        )}

                        <button
                            onClick={() => setIsVisible(false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-full transition transform hover:scale-105"
                        >
                            Got it
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default OccasionBanner;
