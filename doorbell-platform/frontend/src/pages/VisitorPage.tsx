import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { createPeer } from '../webrtc/peerClient';
import { VideoPanel } from '../components/VideoPanel';

export function VisitorPage() {
  const { doorId = '' } = useParams();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Initializing...');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let call: any;
    let peer: any;
    let localStream: MediaStream;

    (async () => {
      const { token } = await api<{ token: string }>('/call/session', { method: 'POST', body: JSON.stringify({ doorId }) });
      localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(localStream);
      if (localRef.current) localRef.current.srcObject = localStream;

      peer = createPeer();
      peer.on('open', async (visitorPeerId: string) => {
        const ring = await api<{ ownerPeerId: string }>('/call/ring', { method: 'POST', body: JSON.stringify({ visitorPeerId }) }, token);
        setStatus('Ringing homeowner...');
        call = peer.call(ring.ownerPeerId, localStream);
        call.on('stream', (remote: MediaStream) => {
          if (remoteRef.current) remoteRef.current.srcObject = remote;
          setStatus('Connected');
        });
      });
    })().catch((e) => setStatus(`Error: ${e.message}`));

    return () => {
      call?.close();
      peer?.destroy();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [doorId]);

  const toggle = (kind: 'audio' | 'video') => {
    stream?.getTracks().filter((t) => t.kind === kind).forEach((t) => (t.enabled = !t.enabled));
  };

  const end = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStatus('Call ended');
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold text-slate-900">Visitor Call</h2>
        <p className="mt-1 text-sm text-slate-600">Door ID: <span className="font-medium">{doorId}</span></p>
        <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{status}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => toggle('audio')} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Mute/Unmute</button>
          <button onClick={() => toggle('video')} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">Camera On/Off</button>
          <button onClick={end} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">End Call</button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <VideoPanel label="Your camera" refObj={localRef} muted />
        <VideoPanel label="Homeowner" refObj={remoteRef} />
      </div>
    </section>
  );
}
