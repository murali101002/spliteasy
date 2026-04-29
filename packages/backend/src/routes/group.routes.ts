import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createGroupSchema } from '../utils/validation.js';
import * as groupService from '../services/group.service.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(createGroupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group = await groupService.createGroup(req.user!.id, req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const groups = await groupService.getGroups(req.user!.id);
    res.json({ groups });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const group = await groupService.getGroup(req.user!.id, req.params.id as string);
    res.json(group);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/regenerate-invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await groupService.regenerateInviteCode(req.user!.id, req.params.id as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/join/:inviteCode', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await groupService.joinGroup(req.user!.id, req.params.inviteCode as string);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/leave', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await groupService.leaveGroup(req.user!.id, req.params.id as string);
    res.json({ message: 'Successfully left group' });
  } catch (error) {
    next(error);
  }
});

export default router;
