import { RefObject } from 'react';

export function VideoPanel({ label, refObj, muted }: { label: string; refObj: RefObject<HTMLVideoElement>; muted?: boolean }) {
  return (
    <div className="video-card">
      <p>{label}</p>
      <video autoPlay playsInline muted={muted} ref={refObj} />
    </div>
  );
}
