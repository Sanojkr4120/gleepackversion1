import express from 'express';
import {
    getAreaCenters,
    createAreaCenter,
    deleteAreaCenter,
    updateAreaCenter
} from '../controllers/centerController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getAreaCenters)
    .post(protect, adminOnly, createAreaCenter);

router.route('/:id')
    .delete(protect, adminOnly, deleteAreaCenter)
    .put(protect, adminOnly, updateAreaCenter);

export default router;
