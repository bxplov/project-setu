import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSocketStore } from '../stores/socketStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Activity, LayoutDashboard, Shield } from 'lucide-react';

export default function Layout() {
  const { isConnected, systemMode, user, disconnect } = useSocketStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    disconnect();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col bg-noir-bg text-noir-text font-mono transition-colors duration-500 relative overflow-x-hidden ${systemMode === 'DISASTER' ? 'border-4 border-noir-error shadow-[inset_0_0_50px_rgba(255,0,60,0.2)]' : ''}`}>

      {/* CRT Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-20 mix-blend-overlay" style={{
        background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
        backgroundSize: '100% 4px, 3px 100%'
      }}></div>

      {/* Top Bar - Premium Glass Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-2xl shadow-lg">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Premium Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-white/20 blur-md rounded-full group-hover:bg-white/30 transition-colors"></div>
                <Shield className="text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 font-mono tracking-tight drop-shadow-md">
                PROJECT SETU
              </span>
            </Link>
            
            {/* Status Badges */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border rounded-lg ml-2 shadow-inner transition-colors duration-300 ${isConnected ? 'border-noir-success/30 bg-noir-success/10 text-noir-success' : 'border-noir-error/30 bg-noir-error/10 text-noir-error animate-pulse'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-noir-success shadow-[0_0_8px_#00ff66]' : 'bg-noir-error shadow-[0_0_8px_#ff003c]'}`}></div>
              <span className="text-[10px] font-bold tracking-widest uppercase">
                {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-white/5 rounded-lg shadow-inner">
              <span className="text-[10px] text-white/50 uppercase tracking-widest">SYSTEM MODE:</span>
              <span className={`text-[10px] font-bold tracking-widest uppercase ${systemMode === 'DISASTER' ? 'text-noir-error animate-pulse drop-shadow-[0_0_5px_rgba(255,0,60,0.5)]' : 'text-noir-accent drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]'}`}>
                {systemMode}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 lg:gap-4 text-[10px] font-bold tracking-widest">
            {user && (
              <>
                <Link 
                  to="/" 
                  className={`group relative overflow-hidden flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${location.pathname === '/' ? 'border-noir-accent/50 bg-noir-accent/10 text-noir-accent shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-noir-accent/30 hover:shadow-[inset_2px_0_0_0_#3b82f6]'}`}
                >
                  <div className={`absolute top-0 left-0 w-full h-[1px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-noir-accent/50 to-transparent ${location.pathname === '/' ? 'opacity-100 via-noir-accent' : ''}`}></div>
                  <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline font-bold">DASHBOARD</span>
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className={`group relative overflow-hidden flex items-center gap-2 px-4 py-2 border transition-all duration-300 ${location.pathname === '/admin' ? 'border-noir-purple/50 bg-noir-purple/10 text-noir-purple shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-noir-purple/30 hover:shadow-[inset_2px_0_0_0_#a855f7]'}`}
                  >
                    <div className={`absolute top-0 left-0 w-full h-[1px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-noir-purple/50 to-transparent ${location.pathname === '/admin' ? 'opacity-100 via-noir-purple' : ''}`}></div>
                    <Shield size={14} className="group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline uppercase font-bold">ADMIN DASHBOARD</span>
                  </Link>
                )}
                
                <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block"></div>
                
                <button 
                  onClick={handleLogout}
                  className="group relative overflow-hidden flex items-center gap-2 px-4 py-2 border border-transparent text-white/50 hover:text-noir-error hover:bg-noir-error/10 hover:border-noir-error/30 hover:shadow-[inset_2px_0_0_0_#ff003c] transition-all duration-300"
                  title="LOGOUT"
                >
                  <div className="absolute top-0 left-0 w-full h-[1px] opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-noir-error/50 to-transparent"></div>
                  <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline font-bold">LOGOUT</span>
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main View with Smooth Transitions */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-1 flex flex-col w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
