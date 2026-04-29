import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

interface TokenPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}
