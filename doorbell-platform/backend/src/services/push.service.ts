import crypto from "crypto";
import webpush from 'web-push';
import { getDb } from '../db/database';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY || 'PUBLIC_KEY_PLACEHOLDER',
  process.env.VAPID_PRIVATE_KEY || 'PRIVATE_KEY_PLACEHOLDER'
);

export async function saveSubscription(ownerId: string, sub: any) {
  const db = getDb();
  await db.run(
    `INSERT OR REPLACE INTO devices (id, owner_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?, ?)`,
    crypto.randomUUID(),
    ownerId,
    sub.endpoint,
    sub.keys.p256dh,
    sub.keys.auth
  );
}

export async function notifyOwner(ownerId: string, payload: Record<string, unknown>) {
  const db = getDb();
  const rows = await db.all(`SELECT * FROM devices WHERE owner_id = ?`, ownerId);
  await Promise.all(
    rows.map(async (d: any) => {
      try {
        await webpush.sendNotification(
          { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth } },
          JSON.stringify(payload)
        );
      } catch {
        // noop
      }
    })
  );
}
