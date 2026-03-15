import { NextFunction, Request, Response } from 'express';
import { verifyToken, OwnerClaims, VisitorClaims } from '../services/auth.service';

export function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const claims = verifyToken<OwnerClaims>(token);
    if (claims.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
    (req as any).owner = claims;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireVisitorAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const claims = verifyToken<VisitorClaims>(token);
    if (claims.role !== 'visitor') return res.status(403).json({ error: 'Forbidden' });
    (req as any).visitor = claims;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
