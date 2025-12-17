import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  registerId: { type: String, unique: true },
  googleId: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'admin', 'employee'], 
    default: 'customer' 
  },
  phone: { type: String },
  address: { type: String },
  profileImage: { type: String },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
