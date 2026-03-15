import Peer from 'peerjs';

export function createPeer(peerId?: string) {
  return new Peer(peerId, {
    host: import.meta.env.VITE_PEER_HOST || location.hostname,
    port: Number(import.meta.env.VITE_PEER_PORT || 9000),
    path: import.meta.env.VITE_PEER_PATH || '/peerjs',
    secure: (import.meta.env.VITE_PEER_SECURE || 'false') === 'true',
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: import.meta.env.VITE_TURN_URL || 'turn:localhost:3478',
          username: import.meta.env.VITE_TURN_USER || 'doorbell',
          credential: import.meta.env.VITE_TURN_PASS || 'doorbellpass',
        },
      ],
    },
  });
}
