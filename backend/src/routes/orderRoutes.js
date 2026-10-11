import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// User authenticated routes
router.post('/', authenticateUser, createOrder);
router.get('/my-orders', authenticateUser, getMyOrders);
router.get('/:id', authenticateUser, getOrderById);

// Admin-only routes
router.get('/', authenticateUser, requireAdmin, getAllOrders);
router.put('/:id/status', authenticateUser, requireAdmin, updateOrderStatus);

export default router;
