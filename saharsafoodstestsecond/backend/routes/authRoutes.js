import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getMe, 
    forgotPassword, 
    resetPassword, 
    updatePassword,
    updateProfile,
    googleAuthCallback
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';
import passport from 'passport';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/updatepassword', protect, updatePassword);
router.put('/profile', protect, upload.single('profileImage'), updateProfile);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleAuthCallback);

export default router;


