import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Layout from './components/Layout.jsx';
import { useSocketStore } from './stores/socketStore.js';

const ProtectedRoute = () => {
  const user = useSocketStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const user = useSocketStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

function App() {
  const user = useSocketStore((state) => state.user);
  const socket = useSocketStore((state) => state.socket);
  const connect = useSocketStore((state) => state.connect);

  // Auto-reconnect on page load if user session exists but socket is disconnected
  useEffect(() => {
    if (user && !socket) {
      console.log('Restoring session for:', user.username);
      connect(user.username, user.role, user.token);
    }
  }, [user, socket, connect]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route element={<ProtectedRoute />}>
           <Route element={<Layout />}>
             <Route path="/" element={<Dashboard />} />
           </Route>
        </Route>

        <Route element={<AdminRoute />}>
           <Route element={<Layout />}>
             <Route path="/admin" element={<AdminDashboard />} />
           </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
