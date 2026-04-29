import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import groupRoutes from './group.routes.js';
import expenseRoutes from './expense.routes.js';
import settlementRoutes from './settlement.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/groups/:groupId/expenses', expenseRoutes);
router.use('/groups/:groupId', settlementRoutes);

export default router;
