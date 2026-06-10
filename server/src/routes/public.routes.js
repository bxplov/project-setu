import express from 'express';
import { Incident } from '../models/Incident.js';

const router = express.Router();

// GET /incidents (Public access for the map)
router.get('/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find({ status: 'OPEN' }).sort({ createdAt: -1 }).limit(100);
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

export default router;
