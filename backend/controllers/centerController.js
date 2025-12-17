import asyncHandler from 'express-async-handler';
import AreaCenter from '../models/AreaCenter.js';

// @desc    Get all area centers
// @route   GET /api/centers
// @access  Public
const getAreaCenters = asyncHandler(async (req, res) => {
    const centers = await AreaCenter.find({});
    res.json(centers);
});

// @desc    Create an area center
// @route   POST /api/centers
// @access  Private/Admin
const createAreaCenter = asyncHandler(async (req, res) => {
    const { name, latitude, longitude, address } = req.body;

    const center = await AreaCenter.create({
        name,
        latitude,
        longitude,
        address
    });

    res.status(201).json(center);
});

// @desc    Delete an area center
// @route   DELETE /api/centers/:id
// @access  Private/Admin
const deleteAreaCenter = asyncHandler(async (req, res) => {
    const center = await AreaCenter.findById(req.params.id);

    if (center) {
        await center.deleteOne();
        res.json({ message: 'Area center removed' });
    } else {
        res.status(404);
        throw new Error('Area center not found');
    }
});

// @desc    Update an area center status
// @route   PUT /api/centers/:id
// @access  Private/Admin
const updateAreaCenter = asyncHandler(async (req, res) => {
    const center = await AreaCenter.findById(req.params.id);

    if (center) {
        center.isActive = req.body.isActive !== undefined ? req.body.isActive : center.isActive;
        center.name = req.body.name || center.name;
        center.address = req.body.address || center.address;
        
        const updatedCenter = await center.save();
        res.json(updatedCenter);
    } else {
        res.status(404);
        throw new Error('Area center not found');
    }
});

export { getAreaCenters, createAreaCenter, deleteAreaCenter, updateAreaCenter };
