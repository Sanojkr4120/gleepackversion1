import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    isOrderingDisabled: { type: Boolean, default: false },
    occasionName: { type: String, default: '' },
    occasionMessage: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    openingTime: { type: String, default: '09:00' },
    closingTime: { type: String, default: '21:00' },
    whatsappNumber: { type: String, default: '' },
    deliveryCharges: {
        type: [
            {
                minDistance: { type: Number, required: true },
                maxDistance: { type: Number, required: true },
                charge: { type: Number, required: true }
            }
        ],
        default: [
            { minDistance: 0, maxDistance: 1, charge: 0 },
            { minDistance: 1, maxDistance: 2, charge: 20 },
            { minDistance: 2, maxDistance: 3, charge: 40 },
            { minDistance: 3, maxDistance: 5, charge: 60 }
        ]
    },
    deliveryTimes: {
        type: [
            {
                minDistance: { type: Number, required: true },
                maxDistance: { type: Number, required: true },
                time: { type: Number, required: true } // Time in minutes
            }
        ],
        default: [
            { minDistance: 0, maxDistance: 1, time: 15 },
            { minDistance: 1, maxDistance: 2, time: 30 },
            { minDistance: 2, maxDistance: 3, time: 45 },
            { minDistance: 3, maxDistance: 5, time: 60 }
        ]
    }
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
