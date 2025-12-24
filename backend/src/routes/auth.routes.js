import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../middlewares/validation.js';
import { authenticate } from '../middlewares/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased limit for development/testing
    message: 'Too many attempts, please try again later',
});

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
