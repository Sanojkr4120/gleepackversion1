import express from 'express';
import { 
    getPincodes, 
    getActivePincodes, 
    checkPincode, 
    addPincode, 
    updatePincode, 
    deletePincode,
    bulkAddPincodes 
} from '../controllers/pincodeController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPincodes);
router.get('/active', getActivePincodes);
router.get('/check/:pincode', checkPincode);

// Admin only routes
router.post('/', protect, adminOnly, addPincode);
router.post('/bulk', protect, adminOnly, bulkAddPincodes);
router.put('/:id', protect, adminOnly, updatePincode);
router.delete('/:id', protect, adminOnly, deletePincode);

export default router;
