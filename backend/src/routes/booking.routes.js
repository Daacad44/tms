import express from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, createBookingSchema } from '../middlewares/validation.js';

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

router.post('/', validate(createBookingSchema), bookingController.createBooking);
router.get('/my', bookingController.getMyBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/cancel', bookingController.cancelBooking);

export default router;
