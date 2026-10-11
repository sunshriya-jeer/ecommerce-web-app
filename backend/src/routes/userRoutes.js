import express from 'express';
import { getAllUsers, getUserById } from '../controllers/userController.js';
import { authenticateUser, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateUser, requireAdmin, getAllUsers);
router.get('/:id', authenticateUser, getUserById);

export default router;
