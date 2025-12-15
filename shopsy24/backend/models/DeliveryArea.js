import mongoose from 'mongoose';

const deliveryAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radius: { type: Number, required: true, default: 5 }, // Radius in km
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('DeliveryArea', deliveryAreaSchema);
