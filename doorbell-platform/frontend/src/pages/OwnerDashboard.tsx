import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { createPeer } from '../webrtc/peerClient';
import { VideoPanel } from '../components/VideoPanel';

type IncomingCall = { callId: string; doorId: string; doorName: string; visitorPeerId: string };

type CallLog = { id: string; door_id: string; status: string; created_at: string };

export function OwnerDashboard({ token, ownerId, peerId }: { token: string; ownerId: string; peerId: string }) {
  const [incoming, setIncoming] = useState<IncomingCall | null>(null);
  const [history, setHistory] = useState<CallLog[]>([]);
  const [doorId, setDoorId] = useState('house123');
  const [message, setMessage] = useState('Listening for incoming calls...');
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>();
  const localStreamRef = useRef<MediaStream>();

  useEffect(() => {
    const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
    ws.onopen = () => ws.send(JSON.stringify({ type: 'register-owner', ownerId }));
    ws.onmessage = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.type === 'incoming-call') {
        setIncoming(msg);
        setMessage(`Incoming call from ${msg.doorName}`);
      }
    };

    peerRef.current = createPeer(peerId);
    peerRef.current.on('call', async (call: any) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      call.answer(stream);
      call.on('stream', (remote: MediaStream) => {
        if (remoteRef.current) remoteRef.current.srcObject = remote;
        setMessage('Call connected');
      });
    });

    api<CallLog[]>('/call/history', {}, token).then(setHistory).catch(() => setMessage('Unable to load call history'));

    return () => {
      ws.close();
      peerRef.current?.destroy();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [ownerId, peerId, token]);

  async function addDoor() {
    await api('/doors', { method: 'POST', body: JSON.stringify({ id: doorId, name: `Door ${doorId}` }) }, token);
    setMessage(`Door created. QR URL: ${location.origin}/r/${doorId}`);
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Owner Dashboard</h2>
        <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">{message}</p>
        {incoming && (
          <p className="mt-3 text-sm text-slate-600">
            Incoming call at <span className="font-semibold">{incoming.doorName}</span> from peer <span className="font-mono">{incoming.visitorPeerId}</span>
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={doorId}
            onChange={(e) => setDoorId(e.target.value)}
            placeholder="door id"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <button onClick={addDoor} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Create Door + QR URL
          </button>
          <button onClick={() => localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled))} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
            Mute/Unmute
          </button>
          <button onClick={() => localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled))} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
            Camera On/Off
          </button>
          <button onClick={() => localStreamRef.current?.getTracks().forEach((t) => t.stop())} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
            End Call
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <VideoPanel label="Owner local" refObj={localRef} muted />
        <VideoPanel label="Visitor remote" refObj={remoteRef} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h3 className="text-lg font-semibold text-slate-900">Recent Call History</h3>
        <ul className="mt-3 space-y-2">
          {history.map((h) => (
            <li key={h.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{h.door_id}</span> · {h.status} · {new Date(h.created_at).toLocaleString()}
            </li>
          ))}
          {history.length === 0 && <li className="text-sm text-slate-500">No calls yet.</li>}
        </ul>
      </div>
    </section>
  );
}
