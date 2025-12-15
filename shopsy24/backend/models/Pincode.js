import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        unique: true,
        match: [/^\d{6}$/, 'Pincode must be exactly 6 digits']
    },
    areaName: {
        type: String,
        required: [true, 'Area name is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Index for faster lookups
pincodeSchema.index({ pincode: 1, isActive: 1 });

export default mongoose.model('Pincode', pincodeSchema);
