import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  video: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    default: 'Momos'
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
});

export default mongoose.model('MenuItem', menuItemSchema);
