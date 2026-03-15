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
        setStatus('Ringing...');
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
  const end = () => stream?.getTracks().forEach((t) => t.stop());

  return (
    <div className="container">
      <h1>Visitor Doorbell</h1>
      <p>{status}</p>
      <div className="row">
        <button onClick={() => toggle('audio')}>Mute/Unmute</button>
        <button onClick={() => toggle('video')}>Camera On/Off</button>
        <button onClick={end}>End Call</button>
      </div>
      <div className="videos">
        <VideoPanel label="Your camera" refObj={localRef} muted />
        <VideoPanel label="Homeowner" refObj={remoteRef} />
      </div>
    </div>
  );
}
