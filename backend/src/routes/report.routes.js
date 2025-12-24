import express from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN', 'FINANCE'));

router.get('/summary', reportController.getSummary);
router.get('/revenue', reportController.getRevenue);
router.get('/bookings', reportController.getBookingsReport);

export default router;
