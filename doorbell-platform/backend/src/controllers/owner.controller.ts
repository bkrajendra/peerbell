import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database';
import { hashPassword, verifyPassword } from '../services/password.service';
import { signOwnerToken } from '../services/auth.service';
import { saveSubscription } from '../services/push.service';

export async function registerOwner(req: Request, res: Response) {
  const { email, password, peerId } = req.body;
  if (!email || !password || !peerId) return res.status(400).json({ error: 'missing_fields' });

  const db = getDb();
  const id = uuid();
  try {
    await db.run(
      `INSERT INTO owners (id, email, password_hash, peer_id) VALUES (?, ?, ?, ?)`,
      id,
      email,
      hashPassword(password),
      peerId
    );
    const token = signOwnerToken(id, email);
    return res.json({ ownerId: id, token });
  } catch (err) {
    return res.status(409).json({ error: 'owner_exists' });
  }
}

export async function loginOwner(req: Request, res: Response) {
  const { email, password } = req.body;
  const db = getDb();
  const owner = await db.get(`SELECT * FROM owners WHERE email = ?`, email);
  if (!owner || !verifyPassword(password, owner.password_hash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const token = signOwnerToken(owner.id, owner.email);
  return res.json({ token, ownerId: owner.id, peerId: owner.peer_id });
}

export async function registerDevice(req: Request, res: Response) {
  await saveSubscription((req as any).owner.sub, req.body.subscription);
  return res.status(204).send();
}
