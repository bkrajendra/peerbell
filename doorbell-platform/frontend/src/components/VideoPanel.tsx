import { RefObject } from 'react';

export function VideoPanel({ label, refObj, muted }: { label: string; refObj: RefObject<HTMLVideoElement>; muted?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="mb-3 text-sm font-semibold text-slate-600">{label}</p>
      <video autoPlay playsInline muted={muted} ref={refObj} className="h-56 w-full rounded-xl bg-slate-100 object-cover" />
    </div>
  );
}
