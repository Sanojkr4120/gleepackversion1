import React from 'react';
import ManageOrders from '../components/admin/ManageOrders';
import HandleOrderLocations from '../components/admin/HandleOrderLocations';

const Employee = () => {
    return (
        <div className="max-w-7xl mx-auto min-h-[80vh] py-6">
            <h2 className="text-2xl font-bold mb-6 text-orange-500 text-center">Employee Dashboard</h2>
            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Live Order Map</h3>
                    <HandleOrderLocations />
                </section>
                <section>
                    <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-2">Manage Orders</h3>
                    <ManageOrders />
                </section>
            </div>
        </div>
    );
};

export default Employee;
