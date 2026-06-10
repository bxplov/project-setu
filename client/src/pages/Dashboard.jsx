import React, { useEffect } from 'react';
import { useSocketStore } from '../stores/socketStore';
import { motion } from 'framer-motion';

import PeaceView from './views/PeaceView';
import DisasterView from './views/DisasterView';

export default function Dashboard() {
  const { systemMode } = useSocketStore();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      {systemMode === 'DISASTER' ? <DisasterView /> : <PeaceView />}
    </motion.div>
  );
}
