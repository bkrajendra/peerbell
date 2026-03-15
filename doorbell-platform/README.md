# QR Video Doorbell Platform

Production-oriented minimal monorepo for QR-based WebRTC doorbell using React PWA + Node.js + PeerJS.

## Structure

- `backend/` Express API + auth + SQLite + WS notifications
- `frontend/` React PWA (visitor and owner flows) + PeerJS client
- `infra/` Docker, nginx reverse proxy, coturn, peer server
- `scripts/generate-qrcode.js` QR generation utility

## Core flow

1. Owner registers/logs in and creates door IDs.
2. QR points to `/r/:doorId`.
3. Visitor opens URL, gets one-time visitor token (`/call/session`) and media permissions.
4. Visitor triggers `/call/ring` once (token consumed) and then calls owner via PeerJS.
5. Owner receives WS/push notification and answers call from stable peer ID.
6. Call logs are persisted in `call_logs`.

## Local run (Docker)

```bash
cd infra
docker-compose up --build
```

Open `http://localhost`.

## Local run (without Docker)

```bash
npm install
npm run install:all
npm run dev:backend
npm run dev:frontend
```

## QR generation

```bash
node scripts/generate-qrcode.js house123 http://localhost
```

## API surface

- `POST /owners/register`
- `POST /owners/login`
- `POST /owners/device`
- `POST /doors`
- `GET /doors/:id`
- `GET /doors`
- `POST /call/session`
- `POST /call/ring`
- `POST /call/status`
- `GET /call/history`

## Security controls

- JWT auth for owner and visitor scopes
- One-time visitor token with short TTL and replay prevention
- helmet + CORS + rate limiting
- TURN/STUN ICE config support
- HTTPS termination via nginx (see deployment below)

## Deployment to VPS

1. Provision Ubuntu server and install Docker + Docker Compose.
2. Set DNS `app.domain.com` to VPS public IP.
3. Copy repo and configure env values in `infra/docker-compose.yml` (JWT, VAPID, TURN creds).
4. Run stack:
   ```bash
   cd infra
   docker-compose up -d --build
   ```
5. Install certbot and enable TLS in host nginx:
   ```bash
   sudo apt update && sudo apt install -y certbot python3-certbot-nginx nginx
   sudo certbot --nginx -d app.domain.com
   ```
6. Reverse proxy host nginx -> container nginx (`127.0.0.1:80`) with TLS certs.
7. Use `wss://app.domain.com/ws` and `https://app.domain.com/peerjs` through TLS.

## Notes

- Replace VAPID placeholders with generated keys (`npx web-push generate-vapid-keys`).
- For production TURN, expose coturn on public IP and set long-term credentials.
- Always serve app via HTTPS in production, otherwise camera/microphone may fail.
