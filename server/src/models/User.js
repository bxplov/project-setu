import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  role: {
    type: String,
    enum: ['admin', 'civilian'],
    default: 'civilian'
  },
  password: { 
    type: String, 
    select: false // Only for admins
  },
  isSafe: {
    type: Boolean,
    default: true
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  socketId: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  strict: true
});

// Index for fast lookups

userSchema.index({ socketId: 1 });

export const User = mongoose.model('User', userSchema);
