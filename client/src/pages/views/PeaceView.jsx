import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Activity, Cpu, MessageSquare, X } from 'lucide-react';
import IncidentMap from '../../components/IncidentMap';
import ChatWindow from '../../components/ChatWindow';

export default function PeaceView() {
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const protocols = [
    { id: 'fire', title: 'FIRE SAFETY', icon: <Terminal size={16} className="text-noir-warning" />, desc: 'Evacuation routes and safety points.' },
    { id: 'earthquake', title: 'EARTHQUAKE SAFETY', icon: <Activity size={16} className="text-noir-error" />, desc: 'Structural safety and cover instructions.' },
    { id: 'medical', title: 'MEDICAL EMERGENCY', icon: <Shield size={16} className="text-noir-success" />, desc: 'First aid and emergency response.' }
  ];

  const protocolDetails = {
    fire: ["Activate the nearest fire alarm", "Evacuate using the stairs, do not use elevators", "Assemble at the designated safe zone", "Do not re-enter until cleared by authorities"],
    earthquake: ["Drop to the ground", "Take cover under a sturdy desk or table", "Hold on until the shaking stops", "Be prepared for aftershocks"],
    medical: ["Assess the scene for safety", "Call emergency services immediately", "Provide first aid if you are qualified", "Locate the nearest trauma kit"]
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden font-mono bg-transparent custom-scrollbar">
      
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

      {/* Floating UI Layer */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:absolute lg:inset-0 pointer-events-none p-4 md:p-8 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Content Area (Scrollable) */}
        <div className="flex-1 flex flex-col gap-6 lg:overflow-y-auto custom-scrollbar lg:pr-2 lg:pb-4 pointer-events-auto shrink-0">
          
          {/* Status Banner */}
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="p-6 glass-panel w-full flex flex-col shrink-0 border-noir-success/50 bg-gradient-to-r from-noir-success/10 to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-noir-success shadow-[0_0_15px_#00ff66]"></div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-4 w-4 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-noir-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-noir-success shadow-[0_0_10px_#00ff66]"></span>
              </span>
              <h2 className="text-xl font-bold tracking-widest text-noir-success uppercase drop-shadow-[0_0_10px_rgba(0,255,102,0.5)]">SYSTEM STATUS: NORMAL</h2>
            </div>
            <p className="text-noir-muted text-xs tracking-widest ml-7 uppercase">EVERYTHING IS RUNNING SMOOTHLY. NO ACTIVE EMERGENCIES.</p>
          </motion.div>
          
          {/* Row 2: Bulletins and Protocols */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full shrink-0">
            
            {/* System Bulletins */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="glass-panel p-6 flex flex-col"
            >
              <h2 className="text-sm font-bold tracking-widest border-b border-noir-border pb-3 text-noir-accent flex items-center gap-2  uppercase">
                 <Cpu size={16} /> SYSTEM UPDATES
              </h2>
              
              <div className="mt-4 space-y-3">
                 <div className="group p-4 bg-black/50 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 hover:shadow-[inset_2px_0_0_0_#3b82f6] transition-all cursor-default relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-accent/0 via-noir-accent/50 to-noir-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-white font-bold tracking-widest uppercase">SYSTEM CHECK</span>
                     <span className="text-[10px] text-noir-muted">08:00 AM</span>
                   </div>
                   <div className="text-xs text-noir-muted leading-relaxed tracking-wider uppercase">System health check completed successfully.</div>
                 </div>
                 
                 <div className="group p-4 bg-black/50 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 hover:shadow-[inset_2px_0_0_0_#3b82f6] transition-all cursor-default relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-accent/0 via-noir-accent/50 to-noir-accent/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-white font-bold tracking-widest uppercase">WEATHER ALERT</span>
                     <span className="text-[10px] text-noir-muted">YESTERDAY</span>
                   </div>
                   <div className="text-xs text-noir-muted leading-relaxed tracking-wider uppercase">Heavy rain expected. Please drive safely.</div>
                 </div>
              </div>
            </motion.div>

            {/* Emergency Protocols */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="glass-panel p-6 flex flex-col"
            >
              <h2 className="text-sm font-bold tracking-widest border-b border-noir-border pb-3 text-noir-purple flex items-center gap-2  uppercase">
                 <Terminal size={16} /> SAFETY INSTRUCTIONS
              </h2>
              
              <div className="mt-4 grid grid-cols-1 gap-3">
                {protocols.map((protocol) => (
                  <div 
                    key={protocol.id}
                    onClick={() => setSelectedProtocol(protocol.id)}
                    className="group relative overflow-hidden p-4 bg-black/50 border border-noir-border hover:border-noir-purple hover:bg-noir-purple/5 hover:shadow-[inset_2px_0_0_0_#a855f7] cursor-pointer transition-all flex items-start gap-4"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-noir-purple/0 via-noir-purple/50 to-noir-purple/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="mt-0.5 p-2 bg-noir-surface border border-noir-border">
                      {protocol.icon}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-widest text-white group-hover:text-noir-purple transition-colors">{protocol.title}</h3>
                      <p className="text-[10px] text-noir-muted mt-2 tracking-wider leading-relaxed uppercase">{protocol.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Content Area: Chat Window */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="relative w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col h-[500px] lg:h-full glass-panel overflow-hidden pointer-events-auto"
        >
           {/* Line removed */}
           <div className="p-4 border-b border-noir-border bg-black/80 flex items-center justify-between shrink-0">
             <h2 className="text-xs font-bold tracking-widest text-white flex items-center gap-2 uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
               <MessageSquare size={16} className="text-noir-accent" /> COMMUNITY CHAT
             </h2>
             <div className="flex items-center gap-2 px-2 py-1 bg-black border border-noir-success">
               <span className="w-2 h-2 rounded-full bg-noir-success shadow-[0_0_5px_#00ff66] animate-pulse"></span>
               <span className="text-[10px] text-noir-success font-bold uppercase tracking-widest">ONLINE</span>
             </div>
           </div>
           <div className="flex-1 min-h-0 relative bg-black/40">
             <ChatWindow />
           </div>
        </motion.div>

      </div>

      {/* Protocol Modal */}
      <AnimatePresence>
        {selectedProtocol && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProtocol(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-panel p-6 border border-noir-purple shadow-[0_0_30px_rgba(168,85,247,0.3)] bg-black"
            >
              <button 
                onClick={() => setSelectedProtocol(null)}
                className="absolute top-4 right-4 text-noir-purple hover:text-white transition-colors p-1"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black border border-noir-purple shadow-md">
                  {protocols.find(p => p.id === selectedProtocol)?.icon}
                </div>
                <h2 className="text-md font-bold tracking-widest text-noir-purple ">
                  {protocols.find(p => p.id === selectedProtocol)?.title}
                </h2>
              </div>
              
              <ul className="space-y-4">
                {protocolDetails[selectedProtocol].map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs tracking-wider text-white uppercase">
                    <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-black border border-noir-purple text-noir-purple font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8 pt-4 flex justify-end border-t border-noir-border">
                <button 
                  onClick={() => setSelectedProtocol(null)}
                  className="px-6 py-2 border border-noir-purple text-noir-purple font-bold text-xs tracking-widest hover:bg-noir-purple hover:text-white transition-colors shadow-md uppercase"
                >
                  UNDERSTOOD
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
