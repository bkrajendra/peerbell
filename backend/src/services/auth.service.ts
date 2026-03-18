import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type OwnerClaims = { sub: string; email: string; role: 'owner' };
export type VisitorClaims = { sub: string; doorId: string; jti: string; role: 'visitor' };

export function signOwnerToken(sub: string, email: string) {
  return jwt.sign({ sub, email, role: 'owner' }, JWT_SECRET, { expiresIn: '7d' });
}

export function issueVisitorToken(doorId: string) {
  const jti = uuid();
  const token = jwt.sign({ sub: `visitor:${doorId}`, doorId, jti, role: 'visitor' }, JWT_SECRET, {
    expiresIn: '90s',
  });
  return { token, jti };
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
