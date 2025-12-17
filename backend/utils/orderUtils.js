import AreaCenter from '../models/AreaCenter.js';
import Setting from '../models/Setting.js';
import { calculateDistance } from './calcDistance.js';

export const calculateDeliveryCharge = async (latitude, longitude) => {
    if (!latitude || !longitude) return { deliveryCharge: 0, distance: 0 };

    const areaCenter = await AreaCenter.findOne({ isActive: true });
    if (!areaCenter) return { deliveryCharge: 0, distance: 0 };

    const distance = calculateDistance(areaCenter.latitude, areaCenter.longitude, latitude, longitude);
    
    const settings = await Setting.findOne();
    const charges = (settings?.deliveryCharges && settings.deliveryCharges.length > 0) ? settings.deliveryCharges : [
            { minDistance: 0, maxDistance: 1, charge: 0 },
            { minDistance: 1, maxDistance: 2, charge: 20 },
            { minDistance: 2, maxDistance: 3, charge: 40 },
            { minDistance: 3, maxDistance: 5, charge: 60 }
    ];

    const times = (settings?.deliveryTimes && settings.deliveryTimes.length > 0) ? settings.deliveryTimes : [
            { minDistance: 0, maxDistance: 1, time: 15 },
            { minDistance: 1, maxDistance: 2, time: 30 },
            { minDistance: 2, maxDistance: 3, time: 45 },
            { minDistance: 3, maxDistance: 5, time: 60 }
    ];

    const applicableCharge = charges.find(c => distance >= c.minDistance && distance < c.maxDistance);
    const applicableTime = times.find(t => distance >= t.minDistance && distance < t.maxDistance);
    
    return {
        deliveryCharge: applicableCharge ? applicableCharge.charge : 0,
        distance,
        estimatedDeliveryTime: applicableTime ? applicableTime.time : 0
    };
};

import MenuItem from '../models/MenuItem.js';

export const calculateOrderTotal = async (items) => {
    let itemsTotal = 0;
    const formattedItems = [];

    for (const item of items) {
        const menuItem = await MenuItem.findById(item._id || item.id);
        if (!menuItem) {
            throw new Error(`Menu item not found: ${item.name}`);
        }
        
        // Use price from DB, not from request
        const price = menuItem.price;
        itemsTotal += price * item.quantity;

        formattedItems.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            quantity: item.quantity,
            price: price,
            image: menuItem.image
        });
    }

    return { itemsTotal, formattedItems };
};
