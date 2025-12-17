import express from 'express';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../controllers/menuController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getMenuItems)
  .post(protect, adminOnly, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createMenuItem);

router.route('/:id')
  .put(protect, adminOnly, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateMenuItem)
  .delete(protect, adminOnly, deleteMenuItem);

export default router;
