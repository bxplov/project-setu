import express from 'express';
import { z } from 'zod';
import { socketService } from '../services/socket.service.js';
import { Message } from '../models/Message.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Apply middleware to all admin routes
router.use(requireAdmin);

// GET /status
router.get('/status', (req, res) => {
  const io = req.app.get('io');
  res.json({
    status: 'ok',
    mode: socketService.getMode(),
    activeConnections: io ? io.engine.clientsCount : 0,
    uptime: process.uptime()
  });
});

// POST /mode
const modeSchema = z.object({
  mode: z.enum(['PEACE', 'DISASTER'], { required_error: 'Mode is required', invalid_type_error: 'Mode must be PEACE or DISASTER' })
});

router.post('/mode', (req, res, next) => {
  try {
    const { mode } = modeSchema.parse(req.body);
    socketService.setMode(mode);
    res.json({ success: true, data: { mode }, message: `System switched to ${mode} mode` });
  } catch (err) {
    next(err);
  }
});


import { Incident } from '../models/Incident.js';

// GET /incidents
router.get('/incidents', async (req, res) => {
  try {
    // Only return recent or open incidents (e.g., last 24h or status OPEN)
    const incidents = await Incident.find({ status: 'OPEN' }).sort({ createdAt: -1 }).limit(100);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// GET /export
router.get('/export', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 }).limit(1000);
    
    res.json({
      timestamp: new Date(),
      type: 'export_full',
      count: messages.length,
      data: messages 
    });
  } catch (err) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// POST /import
router.post('/import', (req, res) => {
  // Placeholder for data import
  res.json({ message: 'Import successful (mock)' });
});

export default router;
