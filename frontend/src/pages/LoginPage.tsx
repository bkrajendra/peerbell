import { useState } from 'react';
import { api } from '../services/api';

export function LoginPage({ onLoggedIn }: { onLoggedIn: (token: string, ownerId: string, peerId: string) => void }) {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('changeme');
  const [peerId, setPeerId] = useState('owner-house');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function run(action: 'register' | 'login') {
    setLoading(true);
    setError('');
    try {
      if (action === 'register') {
        const data = await api<{ token: string; ownerId: string }>('/owners/register', {
          method: 'POST',
          body: JSON.stringify({ email, password, peerId }),
        });
        onLoggedIn(data.token, data.ownerId, peerId);
      } else {
        const data = await api<{ token: string; ownerId: string; peerId: string }>('/owners/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        onLoggedIn(data.token, data.ownerId, data.peerId);
      }
    } catch (e: any) {
      setError('Authentication failed. Verify email/password or register first.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold text-slate-900">Owner Sign In</h2>
      <p className="mt-1 text-sm text-slate-500">Manage doors, receive calls, and review history.</p>
      <div className="mt-5 space-y-3">
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <input className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" value={peerId} onChange={(e) => setPeerId(e.target.value)} placeholder="Stable Peer ID (for register)" />
      </div>
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button disabled={loading} onClick={() => run('login')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
          Login
        </button>
        <button disabled={loading} onClick={() => run('register')} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-70">
          Register
        </button>
      </div>
    </section>
  );
}
