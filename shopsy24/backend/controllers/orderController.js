import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';

import { calculateDeliveryCharge, calculateOrderTotal } from '../utils/orderUtils.js';

// @desc    Place new order
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
    // Check if ordering is disabled
    const settings = await Setting.findOne();
    if (settings && settings.isOrderingDisabled) {
        res.status(403);
        throw new Error(`Ordering is currently disabled due to ${settings.occasionName || 'an occasion'}.`);
    }

    // Check Booking Time
    if (settings) {
        // Get current time in IST (India Standard Time = UTC + 5:30)
        const now = new Date();
        // Convert to IST by adding 5 hours 30 minutes offset
        const istOffset = 5.5 * 60; // IST is UTC + 5:30 (in minutes)
        const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
        let currentTimeIST = utcMinutes + istOffset;
        
        // Handle day overflow (if IST goes past midnight)
        if (currentTimeIST >= 24 * 60) {
            currentTimeIST -= 24 * 60;
        }

        const [openHour, openMinute] = (settings.openingTime || '09:00').split(':').map(Number);
        const openTime = openHour * 60 + openMinute;

        const [closeHour, closeMinute] = (settings.closingTime || '21:00').split(':').map(Number);
        const closeTime = closeHour * 60 + closeMinute;

        console.log(`[Booking Time Check] Current IST Time: ${Math.floor(currentTimeIST / 60)}:${currentTimeIST % 60}, Open: ${openHour}:${openMinute}, Close: ${closeHour}:${closeMinute}`);

        if (currentTimeIST < openTime || currentTimeIST > closeTime) {
            const formatTime = (timeStr) => {
                const [hour, minute] = timeStr.split(':');
                const h = parseInt(hour, 10);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                return `${h12}:${minute} ${ampm}`;
            };

            res.status(403);
            throw new Error(`Please order after ${formatTime(settings.openingTime || '09:00')} and before ${formatTime(settings.closingTime || '21:00')}`);
        }
    }

    const { paymentMethod, paymentDetails, items, latitude, longitude, ...orderPayload } = req.body;

    const { itemsTotal, formattedItems } = await calculateOrderTotal(items);
    const { deliveryCharge, distance, estimatedDeliveryTime } = await calculateDeliveryCharge(latitude, longitude);
    
    // Calculate final total using DB prices + delivery charge
    const finalTotalAmount = itemsTotal + deliveryCharge;

    const orderData = {
        ...orderPayload,
        items: formattedItems,
        paymentMethod,
        paymentDetails: paymentMethod === 'Online' ? paymentDetails : undefined,
        paymentStatus: 'Pending',
        user: req.user._id,
        latitude,
        longitude,
        deliveryCharge,
        distance,
        estimatedDeliveryTime,
        totalAmount: finalTotalAmount
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    
    // Notify Admin
    if (req.io) {
        req.io.emit('newOrder', savedOrder);
    }
    
    res.status(201).json(savedOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ isArchived: { $ne: true } })
        .populate('user', 'email')
        .populate('handledBy', 'name role')
        .sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = status;
        order.handledBy = req.user._id;
        order.handledAt = Date.now();
        const updatedOrder = await order.save();
        await updatedOrder.populate('handledBy', 'name role');

        // Notify Customer (and update Admin UI)
        if (req.io) {
            req.io.emit('orderStatusChanged', updatedOrder);
        }
        
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
        order.paymentStatus = status;
        order.handledBy = req.user._id;
        order.handledAt = Date.now();
        const updatedOrder = await order.save();
        await updatedOrder.populate('handledBy', 'name role');

        // Notify Customer (and update Admin UI)
        if (req.io) {
            req.io.emit('orderStatusChanged', updatedOrder);
        }
        
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Delete order (Soft Delete)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isArchived = true;
        await order.save();
        
        if (req.io) {
            req.io.emit('orderDeleted', req.params.id);
        }

        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

export { placeOrder, getMyOrders, getAllOrders, updateOrderStatus, updatePaymentStatus, deleteOrder };
