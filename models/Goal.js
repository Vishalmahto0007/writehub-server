const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
  },
  targetDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['start', 'completed'],
    default: 'start',
  },
  completedAt: {
    type: Date,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Update completedAt when status changes to completed
goalSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status === 'start') {
    this.completedAt = null;
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);