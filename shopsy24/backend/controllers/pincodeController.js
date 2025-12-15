import asyncHandler from 'express-async-handler';
import Pincode from '../models/Pincode.js';

// @desc    Get all pincodes
// @route   GET /api/pincodes
// @access  Public
const getPincodes = asyncHandler(async (req, res) => {
    const pincodes = await Pincode.find().sort({ createdAt: -1 });
    res.json(pincodes);
});

// @desc    Get active pincodes only
// @route   GET /api/pincodes/active
// @access  Public
const getActivePincodes = asyncHandler(async (req, res) => {
    const pincodes = await Pincode.find({ isActive: true }).sort({ areaName: 1 });
    res.json(pincodes);
});

// @desc    Check if pincode is deliverable
// @route   GET /api/pincodes/check/:pincode
// @access  Public
const checkPincode = asyncHandler(async (req, res) => {
    const { pincode } = req.params;
    
    const found = await Pincode.findOne({ pincode, isActive: true });
    
    if (found) {
        res.json({ 
            isDeliverable: true, 
            areaName: found.areaName,
            message: `Delivery available to ${found.areaName}`
        });
    } else {
        res.json({ 
            isDeliverable: false, 
            message: 'Sorry, we do not deliver to this pincode yet'
        });
    }
});

// @desc    Add a new pincode
// @route   POST /api/pincodes
// @access  Private/Admin
const addPincode = asyncHandler(async (req, res) => {
    const { pincode, areaName, isActive } = req.body;

    // Check if pincode already exists
    const existingPincode = await Pincode.findOne({ pincode });
    if (existingPincode) {
        res.status(400);
        throw new Error('This pincode already exists');
    }

    const newPincode = await Pincode.create({
        pincode,
        areaName,
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(newPincode);
});

// @desc    Update a pincode
// @route   PUT /api/pincodes/:id
// @access  Private/Admin
const updatePincode = asyncHandler(async (req, res) => {
    const { pincode, areaName, isActive } = req.body;

    const pincodeDoc = await Pincode.findById(req.params.id);

    if (!pincodeDoc) {
        res.status(404);
        throw new Error('Pincode not found');
    }

    // Check if new pincode value conflicts with existing one
    if (pincode && pincode !== pincodeDoc.pincode) {
        const existing = await Pincode.findOne({ pincode });
        if (existing) {
            res.status(400);
            throw new Error('This pincode already exists');
        }
    }

    pincodeDoc.pincode = pincode || pincodeDoc.pincode;
    pincodeDoc.areaName = areaName || pincodeDoc.areaName;
    pincodeDoc.isActive = isActive !== undefined ? isActive : pincodeDoc.isActive;

    const updatedPincode = await pincodeDoc.save();
    res.json(updatedPincode);
});

// @desc    Delete a pincode
// @route   DELETE /api/pincodes/:id
// @access  Private/Admin
const deletePincode = asyncHandler(async (req, res) => {
    const pincodeDoc = await Pincode.findById(req.params.id);

    if (!pincodeDoc) {
        res.status(404);
        throw new Error('Pincode not found');
    }

    await pincodeDoc.deleteOne();
    res.json({ message: 'Pincode removed successfully' });
});

// @desc    Bulk add pincodes
// @route   POST /api/pincodes/bulk
// @access  Private/Admin
const bulkAddPincodes = asyncHandler(async (req, res) => {
    const { pincodes } = req.body; // Array of { pincode, areaName }

    if (!pincodes || !Array.isArray(pincodes) || pincodes.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of pincodes');
    }

    const added = [];
    const skipped = [];

    for (const item of pincodes) {
        const existing = await Pincode.findOne({ pincode: item.pincode });
        if (existing) {
            skipped.push(item.pincode);
        } else {
            const newPincode = await Pincode.create({
                pincode: item.pincode,
                areaName: item.areaName,
                isActive: true
            });
            added.push(newPincode);
        }
    }

    res.status(201).json({
        added: added.length,
        skipped: skipped.length,
        skippedPincodes: skipped,
        message: `Added ${added.length} pincodes, skipped ${skipped.length} duplicates`
    });
});

export { 
    getPincodes, 
    getActivePincodes, 
    checkPincode, 
    addPincode, 
    updatePincode, 
    deletePincode,
    bulkAddPincodes 
};
