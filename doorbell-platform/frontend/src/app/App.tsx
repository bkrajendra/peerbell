import { Route, Routes, Link } from 'react-router-dom';
import { VisitorPage } from '../pages/VisitorPage';
import { LoginPage } from '../pages/LoginPage';
import { OwnerDashboard } from '../pages/OwnerDashboard';
import { useState } from 'react';

export function App() {
  const [auth, setAuth] = useState<{ token: string; ownerId: string; peerId: string } | null>(null);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-semibold text-slate-900">QR Doorbell</h1>
          <Link to="/" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Owner Dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Routes>
          <Route path="/r/:doorId" element={<VisitorPage />} />
          <Route
            path="/"
            element={
              auth ? <OwnerDashboard {...auth} /> : <LoginPage onLoggedIn={(token, ownerId, peerId) => setAuth({ token, ownerId, peerId })} />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
