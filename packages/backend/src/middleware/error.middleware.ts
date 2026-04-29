import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  console.error('Unexpected error:', err);

  const message = config.nodeEnv === 'production' ? 'Internal server error' : err.message;

  res.status(500).json({ message });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Not found' });
}
