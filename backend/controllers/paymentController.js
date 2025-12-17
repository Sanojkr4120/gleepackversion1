import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { calculateDeliveryCharge, calculateOrderTotal } from '../utils/orderUtils.js';

// Lazy initialization of Razorpay - ensures env vars are loaded
let razorpayInstance = null;

const getRazorpay = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error('Razorpay credentials are not configured. Please check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

// @desc    Initiate Payment (Create DB Order + Razorpay Order)
// @route   POST /api/payment/initiate
// @access  Private
const initiatePayment = asyncHandler(async (req, res) => {
    const { items, totalAmount, customerName, contactNumber, address, flatBuilding, floorUnit, deliveryDate, deliveryTime, pincode, location, latitude, longitude } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('No items provided for order');
    }

    if (!customerName || !contactNumber || !address || !deliveryDate || !deliveryTime) {
        res.status(400);
        throw new Error('Missing required order details');
    }

    const { itemsTotal, formattedItems } = await calculateOrderTotal(items);
    const { deliveryCharge, distance, estimatedDeliveryTime } = await calculateDeliveryCharge(latitude, longitude);

    // Calculate final total using DB prices + delivery charge
    const finalTotalAmount = itemsTotal + deliveryCharge;

    // Validate amount is positive
    if (finalTotalAmount <= 0) {
        res.status(400);
        throw new Error('Order total must be greater than zero');
    }

    // 1. Create DB Order (Pending)
    const newOrder = new Order({
        user: req.user._id,
        items: formattedItems,
        totalAmount: finalTotalAmount,
        customerName,
        contactNumber,
        address,
        flatBuilding,
        floorUnit,
        deliveryDate,
        deliveryTime,
        pincode,
        location,
        latitude,
        longitude,
        deliveryCharge,
        distance,
        estimatedDeliveryTime,
        paymentMethod: 'Online',
        paymentStatus: 'Pending',
        status: 'Pending'
    });
    await newOrder.save();

    // 2. Create Razorpay Order
    try {
        const razorpay = getRazorpay();
        
        const options = {
            amount: Math.round(finalTotalAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: `receipt_${newOrder._id}`,
            notes: {
                orderId: newOrder._id.toString()
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 3. Update DB Order with Razorpay Order ID
        newOrder.paymentDetails = {
            razorpay_order_id: razorpayOrder.id
        };
        await newOrder.save();

        res.json({
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (razorpayError) {
        // If Razorpay order creation fails, delete the pending DB order
        await Order.findByIdAndDelete(newOrder._id);
        
        console.error('Razorpay Order Creation Error:', razorpayError);
        res.status(500);
        throw new Error(razorpayError.error?.description || razorpayError.message || 'Failed to create payment order. Please try again.');
    }
});

// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === razorpay_signature) {
        // Update Order
        order.paymentStatus = 'Paid';
        order.status = 'Confirmed'; // Auto-confirm on successful payment
        order.paymentDetails = {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        };
        await order.save();

        // Notify Admin
        if (req.io) {
            req.io.emit('newOrder', order);
        }

        res.json({ success: true, order });
    } else {
        res.status(400);
        throw new Error('Invalid signature');
    }
});

export { initiatePayment, verifyPayment };
