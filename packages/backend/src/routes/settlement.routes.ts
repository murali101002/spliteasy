import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createSettlementSchema } from '../utils/validation.js';
import * as settlementService from '../services/settlement.service.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/settle-suggestions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suggestions = await settlementService.getSettleSuggestions(
      req.user!.id,
      req.params.groupId as string
    );
    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/settlements',
  validate(createSettlementSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settlement = await settlementService.createSettlement(
        req.user!.id,
        req.params.groupId as string,
        req.body
      );
      res.status(201).json(settlement);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/settlements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settlements = await settlementService.getSettlements(req.user!.id, req.params.groupId as string);
    res.json({ settlements });
  } catch (error) {
    next(error);
  }
});

export default router;
