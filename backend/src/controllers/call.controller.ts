import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/database';
import { issueVisitorToken } from '../services/auth.service';
import { notifyOwner } from '../services/push.service';
import { notifyOwnerSocket } from '../websocket/ws.server';

export async function createVisitorSession(req: Request, res: Response) {
  const { doorId } = req.body;
  const db = getDb();
  const door = await db.get(`SELECT * FROM doors WHERE id = ? AND active = 1`, doorId);
  if (!door) return res.status(404).json({ error: 'door_not_found' });

  const { token, jti } = issueVisitorToken(doorId);
  const id = uuid();
  await db.run(
    `INSERT INTO visitor_sessions (id, door_id, token_jti, expires_at) VALUES (?, ?, ?, datetime('now', '+90 seconds'))`,
    id,
    doorId,
    jti
  );

  res.json({ token, expiresIn: 90 });
}

export async function ringOwner(req: Request, res: Response) {
  const visitor = (req as any).visitor;
  const { visitorPeerId } = req.body;
  const db = getDb();

  const session = await db.get(`SELECT * FROM visitor_sessions WHERE token_jti = ?`, visitor.jti);
  if (!session || session.used === 1) return res.status(403).json({ error: 'token_used' });
  await db.run(`UPDATE visitor_sessions SET used = 1 WHERE token_jti = ?`, visitor.jti);

  const door = await db.get(
    `SELECT d.id, d.name, o.id ownerId, o.peer_id ownerPeerId FROM doors d JOIN owners o ON o.id = d.owner_id WHERE d.id = ?`,
    visitor.doorId
  );
  if (!door) return res.status(404).json({ error: 'door_not_found' });

  const callId = uuid();
  await db.run(
    `INSERT INTO call_logs (id, door_id, owner_id, visitor_peer_id, status, started_at) VALUES (?, ?, ?, ?, 'ringing', CURRENT_TIMESTAMP)`,
    callId,
    door.id,
    door.ownerId,
    visitorPeerId || null
  );

  const payload = { type: 'incoming-call', callId, doorId: door.id, doorName: door.name, visitorPeerId };
  notifyOwnerSocket(door.ownerId, payload);
  await notifyOwner(door.ownerId, payload);

  res.json({ callId, ownerPeerId: door.ownerPeerId, iceServers: JSON.parse(process.env.ICE_SERVERS_JSON || '[]') });
}

export async function updateCallStatus(req: Request, res: Response) {
  const { callId, status } = req.body;
  const db = getDb();
  await db.run(`UPDATE call_logs SET status = ?, ended_at = CASE WHEN ? = 'ended' THEN CURRENT_TIMESTAMP ELSE ended_at END WHERE id = ?`, status, status, callId);
  res.status(204).send();
}

export async function listCallHistory(req: Request, res: Response) {
  const db = getDb();
  const rows = await db.all(`SELECT * FROM call_logs WHERE owner_id = ? ORDER BY created_at DESC LIMIT 100`, (req as any).owner.sub);
  res.json(rows);
}
