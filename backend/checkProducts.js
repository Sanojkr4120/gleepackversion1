import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MenuItem from './models/MenuItem.js';

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const count = await MenuItem.countDocuments();
        const items = await MenuItem.find({}).limit(3);
        console.log(`Total Products: ${count}`);
        console.log('Sample Products:', items.map(i => i.name));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkProducts();
