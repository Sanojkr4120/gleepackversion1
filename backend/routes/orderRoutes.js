import express from 'express';
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { protect, adminOnly, staffOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, placeOrder).get(protect, staffOnly, getAllOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id/status').put(protect, staffOnly, updateOrderStatus);
router.route('/:id/payment-status').put(protect, staffOnly, updatePaymentStatus);
router.route('/:id').delete(protect, adminOnly, deleteOrder);

export default router;
