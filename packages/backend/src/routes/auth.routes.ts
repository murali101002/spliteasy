import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../middleware/validation.middleware.js';
import { authLimiter, loginLimiter } from '../middleware/rateLimiter.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../utils/validation.js';
import * as authService from '../services/auth.service.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({ message: 'If an account exists, a reset link has been sent' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
