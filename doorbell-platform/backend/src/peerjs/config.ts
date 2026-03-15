export const peerConfig = {
  host: process.env.PEER_HOST || 'localhost',
  port: Number(process.env.PEER_PORT || 9000),
  path: process.env.PEER_PATH || '/peerjs',
  secure: process.env.PEER_SECURE === 'true',
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: process.env.TURN_URL || 'turn:coturn:3478',
      username: process.env.TURN_USER || 'doorbell',
      credential: process.env.TURN_PASS || 'doorbellpass',
    },
  ],
};
