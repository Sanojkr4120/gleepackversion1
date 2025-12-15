import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { getDashboardStats, getUsers, getSettings, updateSettings, updateUserRole } from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/users', protect, adminOnly, getUsers);
router.put('/users/:id/role', protect, adminOnly, updateUserRole);
router.get('/settings', getSettings); // Public access for checking status
router.put('/settings', protect, adminOnly, updateSettings);

export default router;
