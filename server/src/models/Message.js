import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true // Denormalized for speed
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'alert', 'system'],
    default: 'text'
  },
  ackStatus: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  systemMode: {
    type: String,
    enum: ['PEACE', 'DISASTER'],
    default: 'PEACE'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  strict: true
});

messageSchema.index({ createdAt: -1 }); // For chat history
messageSchema.index({ type: 1 });

export const Message = mongoose.model('Message', messageSchema);
