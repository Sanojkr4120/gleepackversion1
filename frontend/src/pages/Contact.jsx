import React from 'react';

const Contact = () => {
    return (
        <div className="flex flex-col min-h-[130vh] sm:min-h-screen bg-gray-950 overflow-x-hidden max-w-2xl mx-auto text-center px-4">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-orange-500">Contact Us</h2>
            <div className="bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-700">
                <p className="text-lg sm:text-xl mb-4">We'd love to hear from you!</p>
                <p className="text-gray-400 mb-6 text-sm sm:text-base">For orders, feedback, or just to say hello.</p>

                <div className="space-y-3 sm:space-y-4 text-left">
                    <p className="text-sm sm:text-base"><strong>📍 Address:</strong> Saharsa, Bihar, India</p>
                    <p className="text-sm sm:text-base"><strong>📞 Phone:</strong> <a href="tel:+919876543210" className="text-orange-400 hover:underline">+91 98765 43210</a></p>
                    <p className="text-sm sm:text-base"><strong>📧 Email:</strong> <a href="mailto:hello@gleepack.com" className="text-orange-400 hover:underline">hello@gleepack.com</a></p>
                </div>
            </div>
        </div>
    );
};

export default Contact;
