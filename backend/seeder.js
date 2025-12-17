import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const adminExists = await User.findOne({ email: 'sanojkumar2467467@gmail.com' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('sanoj123', salt);

    const adminUser = new User({
      name: 'Sanoj Kumar',
      email: 'sanojkumar2467467@gmail.com',
      password: hashedPassword,
      role: 'admin',
      phone: '9999999999',
      address: 'GleePack HQ'
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: sanojkumar2467467@gmail.com');
    console.log('Password: sanoj123');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
