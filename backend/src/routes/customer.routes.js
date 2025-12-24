import express from 'express';
import * as customerController from '../controllers/customer.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'));

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);

export default router;
