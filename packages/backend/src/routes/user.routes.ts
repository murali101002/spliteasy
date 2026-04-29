import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateProfileSchema } from '../utils/validation.js';
import * as userService from '../services/user.service.js';
import { getUserBalance } from '../services/balance.service.js';

const router = Router();

router.use(authMiddleware);

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getProfile(req.user!.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/me',
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me/balance', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await getUserBalance(req.user!.id);
    res.json(balance);
  } catch (error) {
    next(error);
  }
});

export default router;
