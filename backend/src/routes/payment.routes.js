import express from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, createPaymentSchema } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticate);

// Customer & staff can create payments
router.post('/', validate(createPaymentSchema), paymentController.createPayment);

// Admin routes
router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'FINANCE'), paymentController.getAllPayments);
router.put('/:id/confirm', authorize('ADMIN', 'SUPER_ADMIN', 'FINANCE'), paymentController.confirmPayment);

export default router;
