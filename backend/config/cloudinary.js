import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'momo_bites_menu',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'avi', 'webm', 'mkv', 'wmv', 'flv'],
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
