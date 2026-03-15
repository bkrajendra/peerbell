import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { createPeer } from '../webrtc/peerClient';
import { VideoPanel } from '../components/VideoPanel';

type IncomingCall = { callId: string; doorId: string; doorName: string; visitorPeerId: string };

export function OwnerDashboard({ token, ownerId, peerId }: { token: string; ownerId: string; peerId: string }) {
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [doorId, setDoorId] = useState('house123');
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>();
  const localStreamRef = useRef<MediaStream>();

  useEffect(() => {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
    ws.onopen = () => ws.send(JSON.stringify({ type: 'register-owner', ownerId }));
    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'incoming-call') setIncoming(msg);
    };

    peerRef.current = createPeer(peerId);
    peerRef.current.on('call', async (call: any) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      call.answer(stream);
      call.on('stream', (remote: MediaStream) => {
        if (remoteRef.current) remoteRef.current.srcObject = remote;
      });
    });

    api<any[]>('/call/history', {}, token).then(setHistory);

    return () => {
      ws.close();
      peerRef.current?.destroy();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [ownerId, peerId, token]);

  async function addDoor() {
    await api('/doors', { method: 'POST', body: JSON.stringify({ id: doorId, name: `Door ${doorId}` }) }, token);
    alert(`QR URL: ${location.origin}/r/${doorId}`);
  }

  return (
    <div className="container">
      <h1>Owner Dashboard</h1>
      {incoming && <p>Incoming call at {incoming.doorName} from peer {incoming.visitorPeerId}</p>}
      <div className="row">
        <input value={doorId} onChange={(e) => setDoorId(e.target.value)} placeholder="door id" />
        <button onClick={addDoor}>Create Door + QR URL</button>
      </div>

      <div className="row">
        <button onClick={() => localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled))}>Mute/Unmute</button>
        <button onClick={() => localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled))}>Camera On/Off</button>
        <button onClick={() => localStreamRef.current?.getTracks().forEach((t) => t.stop())}>End Call</button>
      </div>
      <div className="videos">
        <VideoPanel label="Owner local" refObj={localRef} muted />
        <VideoPanel label="Visitor remote" refObj={remoteRef} />
      </div>
      <h3>Call history</h3>
      <ul>{history.map((h) => <li key={h.id}>{h.door_id} - {h.status} - {h.created_at}</li>)}</ul>
    </div>
  );
}
