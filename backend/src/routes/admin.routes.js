import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import {
    validate,
    createTripSchema,
    createDepartureSchema,
    updateBookingStatusSchema,
} from '../middlewares/validation.js';

const router = express.Router();

// All admin routes require authentication and admin/agent role
router.use(authenticate);

// ===== TRIPS MANAGEMENT =====
router.get('/trips', authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), adminController.getAllTrips);
router.post('/trips', authorize('ADMIN', 'SUPER_ADMIN'), validate(createTripSchema), adminController.createTrip);
router.put('/trips/:id', authorize('ADMIN', 'SUPER_ADMIN'), adminController.updateTrip);
router.delete('/trips/:id', authorize('ADMIN', 'SUPER_ADMIN'), adminController.deleteTrip);

// ===== DEPARTURES MANAGEMENT =====
router.get('/departures', authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), adminController.getAllDepartures);
router.post('/departures', authorize('ADMIN', 'SUPER_ADMIN'), validate(createDepartureSchema), adminController.createDeparture);
router.put('/departures/:id', authorize('ADMIN', 'SUPER_ADMIN'), adminController.updateDeparture);
router.delete('/departures/:id', authorize('ADMIN', 'SUPER_ADMIN'), adminController.deleteDeparture);

// ===== BOOKINGS MANAGEMENT =====
router.get('/bookings', authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), adminController.getAllBookings);
router.put('/bookings/:id/status', authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), validate(updateBookingStatusSchema), adminController.updateBookingStatus);

// ===== DESTINATIONS =====
router.get('/destinations', authorize('ADMIN', 'SUPER_ADMIN'), adminController.getAllDestinations);
router.post('/destinations', authorize('ADMIN', 'SUPER_ADMIN'), adminController.createDestination);

// ===== USERS MANAGEMENT =====
router.get('/users', authorize('SUPER_ADMIN'), adminController.getAllUsers);
router.put('/users/:id/status', authorize('SUPER_ADMIN'), adminController.updateUserStatus);
router.put('/users/:id/role', authorize('SUPER_ADMIN'), adminController.updateUserRole);

export default router;
