import asyncHandler from 'express-async-handler';
import DeliveryArea from '../models/DeliveryArea.js';

// @desc    Get all delivery areas
// @route   GET /api/areas
// @access  Public
const getDeliveryAreas = asyncHandler(async (req, res) => {
    const areas = await DeliveryArea.find({});
    res.json(areas);
});

// @desc    Create a delivery area
// @route   POST /api/areas
// @access  Private/Admin
const createDeliveryArea = asyncHandler(async (req, res) => {
    const { name, latitude, longitude, radius } = req.body;

    const area = await DeliveryArea.create({
        name,
        latitude,
        longitude,
        radius
    });

    res.status(201).json(area);
});

// @desc    Delete a delivery area
// @route   DELETE /api/areas/:id
// @access  Private/Admin
const deleteDeliveryArea = asyncHandler(async (req, res) => {
    const area = await DeliveryArea.findById(req.params.id);

    if (area) {
        await area.deleteOne();
        res.json({ message: 'Delivery area removed' });
    } else {
        res.status(404);
        throw new Error('Delivery area not found');
    }
});

// @desc    Update a delivery area status
// @route   PUT /api/areas/:id
// @access  Private/Admin
const updateDeliveryArea = asyncHandler(async (req, res) => {
    const area = await DeliveryArea.findById(req.params.id);

    if (area) {
        area.isActive = req.body.isActive !== undefined ? req.body.isActive : area.isActive;
        area.radius = req.body.radius || area.radius;
        area.name = req.body.name || area.name;
        
        const updatedArea = await area.save();
        res.json(updatedArea);
    } else {
        res.status(404);
        throw new Error('Delivery area not found');
    }
});

export { getDeliveryAreas, createDeliveryArea, deleteDeliveryArea, updateDeliveryArea };
