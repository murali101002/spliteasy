import crypto from 'crypto';

const CODE_LENGTH = 8;
const CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function generateInviteCode(): string {
  let code = '';
  const randomBytes = crypto.randomBytes(CODE_LENGTH);
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARSET[randomBytes[i] % CHARSET.length];
  }
  return code;
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
