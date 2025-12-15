import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate Total Revenue (Paid orders)
    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Calculate Daily Stats (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: sevenDaysAgo }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                dailyRevenue: { 
                    $sum: { 
                        $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0] 
                    } 
                },
                dailyOrders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        totalUsers,
        totalOrders,
        totalRevenue,
        dailyStats
    });
});

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
});

// @desc    Get System Settings
// @route   GET /api/admin/settings
// @access  Public (so users can check status)
const getSettings = asyncHandler(async (req, res) => {
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create({});
    }
    res.json(settings);
});

// @desc    Update System Settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
    const { isOrderingDisabled, occasionName, occasionMessage, startDate, endDate, deliveryCharges, deliveryTimes, openingTime, closingTime } = req.body;
    
    let settings = await Setting.findOne();
    if (!settings) {
        settings = await Setting.create({});
    }

    settings.isOrderingDisabled = isOrderingDisabled !== undefined ? isOrderingDisabled : settings.isOrderingDisabled;
    settings.occasionName = occasionName !== undefined ? occasionName : settings.occasionName;
    settings.occasionMessage = occasionMessage !== undefined ? occasionMessage : settings.occasionMessage;
    settings.startDate = startDate !== undefined ? startDate : settings.startDate;
    settings.endDate = endDate !== undefined ? endDate : settings.endDate;
    settings.openingTime = openingTime !== undefined ? openingTime : settings.openingTime;
    settings.closingTime = closingTime !== undefined ? closingTime : settings.closingTime;
    if (req.body.whatsappNumber !== undefined) {
        settings.whatsappNumber = req.body.whatsappNumber;
    }
    if (deliveryCharges) {
        settings.deliveryCharges = deliveryCharges;
    }
    if (deliveryTimes) {
        settings.deliveryTimes = deliveryTimes;
    }

    const updatedSettings = await settings.save();
    
    // Emit socket event for real-time updates
    req.io.emit('settingsUpdated', updatedSettings);
    
    res.json(updatedSettings);
});

// @desc    Update User Role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
        // Prevent changing own role to avoid lockout
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('You cannot change your own role');
        }

        user.role = role;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

export { getDashboardStats, getUsers, getSettings, updateSettings, updateUserRole };
