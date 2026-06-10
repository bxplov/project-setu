import React, { useState, useEffect } from 'react';
import { useSocketStore } from '../stores/socketStore';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, Download, Settings, RefreshCw, Radio, MessageSquare, Database, Terminal, Shield } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import IncidentMap from '../components/IncidentMap';

export default function AdminDashboard() {
  const { socket, systemMode, user } = useSocketStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchStats = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('/api/admin/status', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  const toggleMode = async (newMode) => {
    if (!user?.token) return;
    
    if (newMode === 'DISASTER') {
      const confirmed = window.confirm("CRITICAL WARNING: Are you sure you want to activate GLOBAL EMERGENCY MODE? This will alert all connected users.");
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm("Are you sure you want to return the system to NORMAL MODE?");
      if (!confirmed) return;
    }

    try {
      await fetch('/api/admin/mode', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ mode: newMode })
      });
    } catch (err) {
      console.error("Failed to toggle mode", err);
    }
  };

  const exportLogs = async () => {
    if (!user?.token) return;
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/export', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `setu-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export Failed: Unauthorized or Server Error');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden font-mono bg-transparent custom-scrollbar">
      
      {/* Interactive Tactical Map Layer */}
      <div className={`relative h-[40vh] lg:h-full w-full shrink-0 lg:absolute lg:inset-0 z-0 overflow-hidden transition-all duration-1000 ${systemMode === 'DISASTER' ? 'sepia hue-rotate-[-50deg] saturate-[2]' : ''}`}>
        <div className="absolute inset-0">
          {/* Framed perfectly over a tight city-level radius to show the dense local mesh */}
          <IncidentMap interactive={true} customZoom={12} customCenter={{ lat: 21.15, lng: 80.20 }} />
          <div className="map-overlay opacity-10 pointer-events-none"></div>
        </div>
        
        {/* Subtle inner shadow framing to keep the tactical feel without hiding the map */}
        <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] pointer-events-none"></div>
      </div>

      {/* UI Layer - Stacked Flex on Mobile, Absolute Overlay on Desktop */}
      <div className="relative z-10 flex flex-col lg:absolute lg:inset-0 pointer-events-none p-4 lg:p-6 gap-6">
        
        {/* Left Overlay (Controls) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative lg:absolute lg:top-6 lg:left-6 lg:bottom-6 w-full lg:w-[320px] pointer-events-auto flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar no-scrollbar shrink-0"
        >
          {/* Header */}
          <div className="glass-panel p-4 flex items-center gap-4 shrink-0 border-t-noir-purple/50 border-l-noir-purple/50 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_10px_20px_rgba(168,85,247,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-purple via-noir-purple/50 to-transparent"></div>
            <div className="p-3 bg-black border border-noir-purple/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] relative overflow-hidden">
              <Terminal className="text-noir-purple relative z-10" size={24} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-white font-mono tracking-widest drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] leading-none uppercase">ADMIN DASHBOARD</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-noir-purple shadow-[0_0_8px_#a855f7] animate-pulse"></span>
                <p className="text-[10px] text-noir-purple tracking-widest uppercase font-bold">SYSTEM CONTROLS</p>
              </div>
            </div>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="flex flex-col gap-6 shrink-0">
            
            {/* System Control */}
            <motion.div variants={itemVariants} className="glass-panel p-5 relative overflow-hidden">
              <h2 className="text-xs font-bold tracking-widest mb-4 flex items-center gap-2 text-white border-b border-noir-border pb-2 uppercase">
                <ShieldAlert size={14} className="text-noir-purple" /> SYSTEM MODE
              </h2>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => toggleMode('PEACE')}
                  className={`py-3 px-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 ${systemMode === 'PEACE' ? 'bg-noir-success/20 border-noir-success text-noir-success shadow-[0_0_20px_rgba(0,255,102,0.2)]' : 'bg-white/5 border-white/10 text-white/50 hover:border-noir-success/50 hover:text-white hover:bg-white/10'}`}
                >
                  <Activity size={18} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">NORMAL MODE</span>
                </button>
                
                <button 
                  onClick={() => toggleMode('DISASTER')}
                  className={`py-3 px-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 ${systemMode === 'DISASTER' ? 'bg-noir-error/20 border-noir-error text-noir-error shadow-[0_0_20px_rgba(255,0,60,0.2)]' : 'bg-white/5 border-white/10 text-white/50 hover:border-noir-error/50 hover:text-white hover:bg-white/10'}`}
                >
                  <Radio size={18} className={systemMode === 'DISASTER' ? 'animate-pulse' : ''} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">EMERGENCY MODE</span>
                </button>
              </div>
            </motion.div>

            {/* Statistics */}
            <motion.div variants={itemVariants} className="glass-panel p-5">
               <h2 className="text-xs font-bold tracking-widest mb-4 flex items-center gap-2 text-white border-b border-noir-border pb-2 uppercase">
                <Activity size={14} className="text-noir-accent" /> SYSTEM HEALTH
              </h2>
              
              {stats ? (
                <div className="space-y-3">
                  <div className="group flex justify-between items-center bg-black/50 px-4 py-3 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 hover:shadow-[inset_2px_0_0_0_#3b82f6] transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-accent/0 via-noir-accent/50 to-noir-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase group-hover:text-white transition-colors">STATUS</span>
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full bg-noir-success opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 bg-noir-success shadow-[0_0_8px_#00ff66]"></span>
                      </span>
                      <span className="text-noir-success text-xs font-bold tracking-widest uppercase group-hover:drop-shadow-[0_0_8px_rgba(0,255,102,0.8)] transition-all">{stats.status}</span>
                    </div>
                  </div>
                  
                  <div className="group flex justify-between items-center bg-black/50 px-4 py-3 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 hover:shadow-[inset_2px_0_0_0_#3b82f6] transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-accent/0 via-noir-accent/50 to-noir-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase group-hover:text-white transition-colors">ACTIVE NODES</span>
                    <span className="text-noir-accent text-xs font-bold group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all">{stats.activeConnections}</span>
                  </div>
                  
                  <div className="group flex justify-between items-center bg-black/50 px-4 py-3 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 hover:shadow-[inset_2px_0_0_0_#3b82f6] transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-accent/0 via-noir-accent/50 to-noir-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase group-hover:text-white transition-colors">UPTIME</span>
                    <span className="text-noir-accent text-xs font-bold group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all">{Math.floor(stats.uptime)}S</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-noir-muted border border-noir-border border-dashed bg-black/30">
                  <RefreshCw className="animate-spin mb-2" size={16} />
                  <span className="text-[10px] tracking-widest font-bold uppercase">LOADING DATA...</span>
                </div>
              )}
            </motion.div>

            {/* Data Management */}
            <motion.div variants={itemVariants} className="glass-panel p-5">
              <h2 className="text-xs font-bold tracking-widest mb-4 flex items-center gap-2 text-white border-b border-noir-border pb-2 uppercase">
                <Database size={14} className="text-noir-warning" /> DATA MANAGEMENT
              </h2>
              <button 
                className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-4 py-4 border border-noir-warning text-noir-warning bg-black/50 hover:bg-noir-warning/20 hover:text-white hover:shadow-[inset_2px_0_0_0_#ff9900,0_0_20px_rgba(245,158,11,0.4)] transition-all duration-300 text-xs font-bold tracking-widest group disabled:opacity-50" 
                onClick={exportLogs}
                disabled={isExporting}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-warning/0 via-noir-warning/50 to-noir-warning/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isExporting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                )}
                {isExporting ? 'DOWNLOADING...' : 'DOWNLOAD SYSTEM LOGS'}
              </button>
            </motion.div>
            
          </motion.div>
        </motion.div>

        {/* Right Overlay (Comms Feed) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="relative lg:absolute lg:top-6 lg:right-6 lg:bottom-6 w-full lg:w-[400px] pointer-events-auto glass-panel flex flex-col overflow-hidden shrink-0 min-h-[500px]"
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-noir-accent/50 to-transparent"></div>
          <div className="p-4 border-b border-noir-border bg-gradient-to-b from-black/80 to-black/40 flex items-center justify-between shrink-0 backdrop-blur-md">
             <h2 className="text-xs font-bold text-white flex items-center gap-2 tracking-widest uppercase">
               <MessageSquare size={14} className="text-noir-accent" /> GLOBAL CHAT
             </h2>
             <div className="flex items-center gap-2 px-2 py-1 bg-black border border-noir-success">
               <span className="w-2 h-2 bg-noir-success shadow-[0_0_5px_#00ff66] animate-pulse"></span>
               <span className="text-[10px] text-noir-success font-bold uppercase tracking-widest">ONLINE</span>
             </div>
           </div>
           <div className="flex-1 min-h-0 relative bg-black/40">
             <ChatWindow showHistory={true} />
           </div>
        </motion.div>

        {/* Top Center Floating Element */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="hidden lg:block absolute top-6 left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className={`glass-panel px-6 py-3 flex items-center gap-3 border ${systemMode === 'DISASTER' ? 'border-t-noir-error/50 border-l-noir-error/50 shadow-[0_10px_30px_rgba(255,0,60,0.3)]' : 'border-t-noir-accent/50 border-l-noir-accent/50 shadow-[0_10px_30px_rgba(59,130,246,0.3)]'}`}>
             <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full opacity-75 ${systemMode === 'DISASTER' ? 'bg-noir-error' : 'bg-noir-accent'}`}></span>
                <span className={`relative inline-flex h-2 w-2 ${systemMode === 'DISASTER' ? 'bg-noir-error shadow-[0_0_5px_#ff003c]' : 'bg-noir-accent shadow-[0_0_5px_#3b82f6]'}`}></span>
              </span>
             <span className={`font-bold text-[10px] tracking-widest uppercase ${systemMode === 'DISASTER' ? 'text-noir-error ' : 'text-noir-accent '}`}>LOCATION TRACKING ACTIVE</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
