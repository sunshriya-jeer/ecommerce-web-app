import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin-protected routes
router.post('/', authenticateUser, requireAdmin, createProduct);
router.put('/:id', authenticateUser, requireAdmin, updateProduct);
router.delete('/:id', authenticateUser, requireAdmin, deleteProduct);

export default router;
