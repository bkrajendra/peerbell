import { Route, Routes, Link } from 'react-router-dom';
import { VisitorPage } from '../pages/VisitorPage';
import { LoginPage } from '../pages/LoginPage';
import { OwnerDashboard } from '../pages/OwnerDashboard';
import { useState } from 'react';

export function App() {
  const [auth, setAuth] = useState<{ token: string; ownerId: string; peerId: string } | null>(null);

  return (
    <>
      <nav><Link to="/">Owner</Link></nav>
      <Routes>
        <Route path="/r/:doorId" element={<VisitorPage />} />
        <Route
          path="/"
          element={auth ? <OwnerDashboard {...auth} /> : <LoginPage onLoggedIn={(token, ownerId, peerId) => setAuth({ token, ownerId, peerId })} />}
        />
      </Routes>
    </>
  );
}
