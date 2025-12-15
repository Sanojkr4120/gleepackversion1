import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  address: { type: String, required: true },
  flatBuilding: { type: String }, // Flat / Building Name (Optional)
  floorUnit: { type: String },    // Floor / Unit No. (Optional)
  deliveryDate: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  pincode: { type: String },      // Pincode
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      image: { type: String }
    }
  ],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  distance: { type: Number },
  estimatedDeliveryTime: { type: Number }, // In minutes
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Online'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentDetails: {
    razorpay_payment_id: String,
    razorpay_order_id: String,
    razorpay_signature: String
  },
  handledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  handledAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Index for faster queries
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

export default mongoose.model('Order', orderSchema);
