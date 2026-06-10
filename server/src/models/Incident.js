import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['SOS', 'FIRE', 'MEDICAL', 'OTHER'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['OPEN', 'RESOLVED', 'FALSE_ALARM'],
    default: 'OPEN'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

incidentSchema.index({ status: 1 });
incidentSchema.index({ type: 1 });

export const Incident = mongoose.model('Incident', incidentSchema);
