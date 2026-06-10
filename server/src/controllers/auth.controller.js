import { User } from '../models/User.js';
import { env } from '../config/env.js';
import jwt from 'jsonwebtoken';

export const loginAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    if (password !== env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid Password' });
    }
    
    // Sign a secure JWT payload
    const token = jwt.sign(
      { role: 'admin', systemAccess: true },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({ success: true, token }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
