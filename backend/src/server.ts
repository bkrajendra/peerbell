import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import http from 'http';
import ownerRoutes from './routes/owner.routes';
import doorRoutes from './routes/door.routes';
import callRoutes from './routes/call.routes';
import { initDb } from './db/database';
import { initWs } from './websocket/ws.server';
import { peerConfig } from './peerjs/config';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'https://localhost'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get('/health', (_, res) => res.json({ status: 'ok', peer: peerConfig }));
app.use('/owners', ownerRoutes);
app.use('/doors', doorRoutes);
app.use('/call', callRoutes);

const port = Number(process.env.PORT || 8080);

initDb().then(() => {
  initWs(server);
  server.listen(port, () => {
    console.log(`Backend on ${port}`);
  });
});
