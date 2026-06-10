import React, { useState, useEffect } from 'react';
import { useSocketStore } from '../stores/socketStore';
import { motion } from 'framer-motion';

export default function SOSButton({ type, label, color, coordinates, onClick }) {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handlePress = () => {
    if (!isConnected || !socket || cooldown > 0) return;
    if (!confirm(`CONFIRM: Send ${type} Alert?`)) return;

    const payload = {
      type,
      coordinates: coordinates || { lat: 0, lng: 0 }
    };
    
    socket.emit('incident:report', payload);
    setCooldown(10);
    if (onClick) onClick();
  };

  return (
    <motion.button
      whileHover={isConnected && cooldown === 0 ? { scale: 1.02 } : {}}
      whileTap={isConnected && cooldown === 0 ? { scale: 0.95 } : {}}
      onClick={handlePress}
      disabled={!isConnected || cooldown > 0}
      className={`w-full rounded-sm px-4 py-8 text-center text-lg font-mono font-bold border ${isConnected && cooldown === 0 ? color : 'border-noir-muted/30 text-noir-muted/50 bg-black/40'} relative overflow-hidden group shadow-lg backdrop-blur-sm ${(!isConnected || cooldown > 0) ? 'cursor-not-allowed grayscale' : ''}`}
    >
      {isConnected && cooldown === 0 && <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
      <span className="relative z-10 tracking-[0.2em] drop-shadow-md">
        {!isConnected ? '[ OFFLINE ]' : cooldown > 0 ? `[ TRANSMITTING... ${cooldown}S ]` : label}
      </span>
    </motion.button>
  );
}
