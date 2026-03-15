import { useState } from 'react';
import { api } from '../services/api';

export function LoginPage({ onLoggedIn }: { onLoggedIn: (token: string, ownerId: string, peerId: string) => void }) {
  const [email, setEmail] = useState('owner@example.com');
  const [password, setPassword] = useState('changeme');
  const [peerId, setPeerId] = useState('owner-house');

  async function register() {
    const data = await api<{ token: string; ownerId: string }>('/owners/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, peerId }),
    });
    onLoggedIn(data.token, data.ownerId, peerId);
  }

  async function login() {
    const data = await api<{ token: string; ownerId: string; peerId: string }>('/owners/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    onLoggedIn(data.token, data.ownerId, data.peerId);
  }

  return (
    <div className="container">
      <h1>Owner Login</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder="password" />
      <input value={peerId} onChange={(e) => setPeerId(e.target.value)} placeholder="peer id for register" />
      <div className="row">
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    </div>
  );
}
