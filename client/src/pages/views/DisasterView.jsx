import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ShieldAlert } from 'lucide-react';
import IncidentMap from '../../components/IncidentMap';
import ChatWindow from '../../components/ChatWindow';
import SOSButton from '../../components/SOSButton';

export default function DisasterView() {
  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            acc: position.coords.accuracy
          });
        },
        (error) => {
          setGeoError(error.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setGeoError('GEOLOCATION_UNAVAILABLE');
    }
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-y-auto lg:overflow-hidden font-mono bg-transparent custom-scrollbar">
      
      {/* Cinematic Background Map Layer */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ scale: 1.02 }}
          animate={{ scale: 1.12 }}
          transition={{ duration: 60, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0 opacity-90 contrast-[1.3] brightness-[1.1] filter sepia hue-rotate-[-50deg] saturate-[2]"
        >
          <IncidentMap interactive={false} customCenter={coords} customZoom={14} />
          <div className="map-overlay opacity-50"></div>
        </motion.div>
        
        {/* Deep Premium Vignette & Edge Fades */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(255,0,0,0.2)_80%,rgba(0,0,0,1)_100%)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-black opacity-60"></div>
      </div>

      {/* Floating UI Layer */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:absolute lg:inset-0 pointer-events-none p-4 md:p-8 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left: Critical Comms */}
        <section className="flex-1 glass-panel flex flex-col overflow-hidden pointer-events-auto shrink-0 min-h-[400px] lg:min-h-0 border-noir-error shadow-[0_0_40px_rgba(255,0,60,0.2)] relative">
           <div className="absolute top-0 left-0 w-1 h-full bg-noir-error shadow-[0_0_20px_#ff003c] z-10"></div>
           <div className="bg-gradient-to-r from-noir-error/30 via-noir-error/10 to-transparent border-b border-noir-error px-4 py-4 text-center backdrop-blur-md flex items-center justify-center gap-3 relative">
             <ShieldAlert size={22} className="text-noir-error animate-pulse" />
             <span className="text-white font-bold text-sm tracking-[0.3em] drop-shadow-[0_0_15px_rgba(255,0,60,1)]">CRITICAL EMERGENCY OVERRIDE</span>
             <ShieldAlert size={22} className="text-noir-error animate-pulse" />
           </div>
           <div className="flex-1 min-h-0 relative bg-black/60">
             <ChatWindow />
           </div>
        </section>

        {/* Right: Actions */}
        <section className="relative w-full md:w-80 lg:w-[400px] glass-panel p-6 flex flex-col gap-6 overflow-hidden pointer-events-auto shrink-0 border-noir-error/50">
           {/* Line removed */}
           <h2 className="text-xs font-bold tracking-widest border-b border-noir-border pb-3 text-noir-error flex items-center gap-2 uppercase drop-shadow-[0_0_8px_rgba(255,0,60,0.5)]">
             <Terminal size={16} /> EMERGENCY ACTIONS
           </h2>
           
           <div className="space-y-4">
             <SOSButton 
               type="SOS" 
               label="REPORT EMERGENCY (S.O.S)" 
               color="bg-black/50 border-noir-error text-noir-error hover:bg-noir-error/20 hover:text-white hover:shadow-[inset_2px_0_0_0_#ff003c,0_0_20px_rgba(255,0,60,0.3)] transition-all duration-300 shadow-md" 
               coordinates={coords} 
             />
             <SOSButton 
               type="MEDICAL" 
               label="REQUEST MEDICAL HELP" 
               color="bg-black/50 border-noir-accent text-noir-accent hover:bg-noir-accent/20 hover:text-white hover:shadow-[inset_2px_0_0_0_#3b82f6,0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 shadow-md" 
               coordinates={coords} 
             />
             <SOSButton 
               type="FIRE" 
               label="REPORT FIRE" 
               color="bg-black/50 border-noir-warning text-noir-warning hover:bg-noir-warning/20 hover:text-white hover:shadow-[inset_2px_0_0_0_#ff9900,0_0_20px_rgba(255,153,0,0.3)] transition-all duration-300 shadow-md" 
               coordinates={coords} 
             />
           </div>
           
           <div className="mt-auto border-t border-noir-border pt-4">
             <h3 className="text-[10px] font-bold text-noir-muted mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
               YOUR LOCATION
             </h3>
             <div className="text-xs text-noir-text font-mono tracking-widest">
                {coords ? (
                  <div className="space-y-2">
                    <div className="group flex justify-between items-center bg-black/50 px-3 py-2 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 transition-all cursor-default">
                      <span className="text-noir-muted uppercase group-hover:text-white transition-colors">LATITUDE</span> 
                      <span className="text-noir-accent group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all">{coords.lat.toFixed(6)}°</span>
                    </div>
                    <div className="group flex justify-between items-center bg-black/50 px-3 py-2 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 transition-all cursor-default">
                      <span className="text-noir-muted uppercase group-hover:text-white transition-colors">LONGITUDE</span> 
                      <span className="text-noir-accent group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all">{coords.lng.toFixed(6)}°</span>
                    </div>
                    <div className="group flex justify-between items-center bg-black/50 px-3 py-2 border border-noir-border hover:border-noir-accent hover:bg-noir-accent/5 transition-all cursor-default">
                      <span className="text-noir-muted uppercase group-hover:text-white transition-colors">ACCURACY</span> 
                      <span className="text-noir-accent group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-all">±{Math.round(coords.acc)}M</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-noir-warning bg-noir-warning/10 p-3 border border-noir-warning/50 flex items-center justify-center gap-2 animate-pulse uppercase">
                    <Terminal size={14} />
                    {geoError || 'FINDING YOUR LOCATION...'}
                  </div>
                )}
             </div>
           </div>
        </section>
      </div>
    </div>
  );
}
