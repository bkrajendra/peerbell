import { Server } from 'ws';

const sockets = new Map<string, any>();

export function initWs(httpServer: any) {
  const wss = new Server({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'register-owner' && msg.ownerId) sockets.set(msg.ownerId, ws);
      } catch {
        // ignore
      }
    });

    ws.on('close', () => {
      for (const [ownerId, sock] of sockets.entries()) {
        if (sock === ws) sockets.delete(ownerId);
      }
    });
  });
}

export function notifyOwnerSocket(ownerId: string, payload: Record<string, unknown>) {
  const ws = sockets.get(ownerId);
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(payload));
}
