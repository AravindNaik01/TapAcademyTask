import express from 'express';
import { register, login, refresh, logout, me, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/profile', protect, updateProfile);

export default router;
