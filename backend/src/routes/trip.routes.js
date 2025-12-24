import express from 'express';
import * as tripController from '../controllers/trip.controller.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = express.Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, tripController.getTrips);
router.get('/:slug', optionalAuth, tripController.getTripBySlug);
router.get('/:id/departures', tripController.getTripDepartures);

export default router;
