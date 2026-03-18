import { Request, Response } from 'express';
import { getDb } from '../db/database';

export async function createDoor(req: Request, res: Response) {
  const { id, name } = req.body;
  const ownerId = (req as any).owner.sub;
  if (!id || !name) return res.status(400).json({ error: 'missing_fields' });

  const db = getDb();
  try {
    await db.run(`INSERT INTO doors (id, owner_id, name) VALUES (?, ?, ?)`, id, ownerId, name);
    return res.status(201).json({ id, name, ownerId, route: `/r/${id}` });
  } catch {
    return res.status(409).json({ error: 'door_exists' });
  }
}

export async function getDoor(req: Request, res: Response) {
  const db = getDb();
  const row = await db.get(
    `SELECT d.id, d.name, d.active, o.peer_id ownerPeerId, o.id ownerId FROM doors d JOIN owners o ON o.id = d.owner_id WHERE d.id = ?`,
    req.params.id
  );
  if (!row) return res.status(404).json({ error: 'not_found' });
  return res.json(row);
}

export async function listDoors(req: Request, res: Response) {
  const db = getDb();
  const rows = await db.all(`SELECT * FROM doors WHERE owner_id = ?`, (req as any).owner.sub);
  res.json(rows);
}
