import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createExpenseSchema, updateExpenseSchema } from '../utils/validation.js';
import * as expenseService from '../services/expense.service.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.post(
  '/',
  validate(createExpenseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.createExpense(
        req.user!.id,
        req.params.groupId as string,
        req.body
      );
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeDeleted = req.query.includeDeleted !== 'false';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await expenseService.getExpenses(req.user!.id, req.params.groupId as string, {
      includeDeleted,
      limit,
      offset,
    });

    res.json({
      ...result,
      limit,
      offset,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:expenseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await expenseService.getExpense(
      req.user!.id,
      req.params.groupId as string,
      req.params.expenseId as string
    );
    res.json(expense);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/:expenseId',
  validate(updateExpenseSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const expense = await expenseService.updateExpense(
        req.user!.id,
        req.params.groupId as string,
        req.params.expenseId as string,
        req.body
      );
      res.json(expense);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:expenseId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await expenseService.deleteExpense(req.user!.id, req.params.groupId as string, req.params.expenseId as string);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
