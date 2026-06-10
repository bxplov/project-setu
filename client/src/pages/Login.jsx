import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocketStore } from '../stores/socketStore';
import IncidentMap from '../components/IncidentMap';

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');
  
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(initialRole === 'admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  
  const connect = useSocketStore((state) => state.connect);
  const user = useSocketStore((state) => state.user);
  const authError = useSocketStore((state) => state.authError);
  const navigate = useNavigate();

  // Watch for successful auth (user populated in store)
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
      // Scroll to top on navigation (fixes mobile scroll issue)
      window.scrollTo(0, 0);
    }
  }, [user, navigate]);

  // Watch for auth error from socket
  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsConnecting(false);
    }
  }, [authError]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('USERNAME MUST BE 3+ CHARACTERS');
      return;
    }
    
    setIsConnecting(true);

    if (isAdmin) {
      if (!adminPassword.trim()) {
        setError('SECURITY KEY REQUIRED');
        setIsConnecting(false);
        return;
      }
      
      try {
        const API_URL = import.meta.env.PROD ? '' : `http://${window.location.hostname}:3000`;
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'AUTHENTICATION FAILED');
          setIsConnecting(false);
          return;
        }
        
        connect(username, 'admin', data.token);
      } catch (err) {
        setError('NETWORK ERROR: UNABLE TO CONTACT SERVER');
        setIsConnecting(false);
      }
    } else {
      connect(username, 'civilian');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black p-4 overflow-hidden">
      {/* Cinematic Background Map Layer */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ scale: 1.02 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 60, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 opacity-90 saturate-[1.5] contrast-[1.3] brightness-[1.1] filter hue-rotate-[210deg] sepia-[0.3]"
        >
          <IncidentMap interactive={false} customZoom={6} />
          <div className="map-overlay opacity-50"></div>
        </motion.div>
        
        {/* Deep Premium Vignette & Edge Fades */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.8)_80%,rgba(0,0,0,1)_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-black opacity-60"></div>
      </div>

      {/* Scanline overlay effect */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md space-y-8 border border-white/5 border-t-white/20 border-l-white/20 bg-black/40 backdrop-blur-2xl p-6 md:p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] relative z-10"
      >
        
        <div className="text-center border-b border-white/10 pb-6 flex flex-col items-center">
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6 flex justify-center relative"
          >
            <Shield className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" strokeWidth={1} />
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
          </motion.div>
          <div className="mb-2 text-[10px] md:text-xs text-blue-200/40 font-mono tracking-widest">SYSTEM ACCESS</div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-blue-500/50 font-mono tracking-tight drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">PROJECT SETU</h2>
          <p className="mt-2 text-[10px] md:text-xs text-white/40 font-mono tracking-wider">SECURE EMERGENCY TACTICAL UNIT</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs font-mono text-noir-muted mb-2 tracking-wider">USERNAME</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full border border-white/20 bg-white/5 p-3 rounded-lg text-white placeholder-white/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:bg-blue-500/10 focus:outline-none font-mono transition-all duration-300"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 p-3 border border-white/20 bg-white/5 rounded-lg transition-colors hover:bg-white/10">
              <input
                id="admin-mode"
                name="admin-mode"
                type="checkbox"
                className="h-4 w-4 border border-white/50 rounded-sm bg-transparent accent-emerald-500 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-black cursor-pointer"
                checked={isAdmin}
                onChange={(e) => {
                  setIsAdmin(e.target.checked);
                  setError('');
                  if (!e.target.checked) setAdminPassword('');
                }}
              />
              <label htmlFor="admin-mode" className="block text-xs text-white font-mono tracking-wider cursor-pointer">
                ADMINISTRATOR LOGIN
              </label>
            </div>

            {/* Admin Password Field — beautifully animated expansion */}
            <AnimatePresence>
              {isAdmin && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="relative overflow-hidden"
                >
                  {/* Panel border removed */}
                <div className="border border-emerald-500/30 bg-emerald-500/5 p-4 rounded-lg space-y-3 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-500 text-xs font-mono">⚠</span>
                    <span className="text-xs text-emerald-500 font-mono tracking-wider">ADMIN AUTHENTICATION</span>
                  </div>
                  <label htmlFor="admin-password" className="block text-xs font-mono text-noir-muted mb-2 tracking-wider">
                    SECURITY KEY
                  </label>
                  <input
                    id="admin-password"
                    name="admin-password"
                    type="password"
                    className="relative block w-full border border-white/20 bg-black/30 p-3 rounded-lg text-white placeholder-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-black/50 focus:outline-none font-mono transition-all duration-300"
                    placeholder="Enter Password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setError('');
                    }}
                    autoFocus
                  />
                  <p className="text-[10px] text-white/40 font-mono mt-2">
                    PROVIDE VALID CREDENTIALS FOR ELEVATED ACCESS
                  </p>
                </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="overflow-hidden"
              >
                <div className="border border-red-500/30 bg-red-500/10 backdrop-blur-md p-3 rounded-lg flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                    <span className="text-red-500 text-[10px] font-mono">✖</span>
                  </div>
                  <span className="text-xs text-red-400 font-mono tracking-wider leading-relaxed">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: isConnecting ? 1 : 1.02 }}
            whileTap={{ scale: isConnecting ? 1 : 0.98 }}
            type="submit"
            disabled={isConnecting}
            className={`group relative flex w-full justify-center items-center gap-3 border px-6 py-4 rounded-lg text-sm font-mono font-bold tracking-widest transition-all duration-300 ${
              isConnecting 
                ? 'border-white/10 bg-black/40 text-white/40 cursor-not-allowed' 
                : 'border-emerald-500/50 bg-emerald-500/10 text-white hover:bg-emerald-500 hover:text-black shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:border-emerald-500'
            }`}
          >
            {isConnecting && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
            <span className="relative z-10">
              {isConnecting ? 'AUTHENTICATING...' : 'SIGN IN'}
            </span>
          </motion.button>

          <div className="text-center">
            <p className="text-xs text-white/30 font-mono">
              UNAUTHORIZED ACCESS PROHIBITED
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
