import express from 'express';
import {
    getDeliveryAreas,
    createDeliveryArea,
    deleteDeliveryArea,
    updateDeliveryArea
} from '../controllers/areaController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getDeliveryAreas)
    .post(protect, adminOnly, createDeliveryArea);

router.route('/:id')
    .delete(protect, adminOnly, deleteDeliveryArea)
    .put(protect, adminOnly, updateDeliveryArea);

export default router;
