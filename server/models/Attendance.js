import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      // Format: YYYY-MM-DD
    },
    checkInTime: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'half-day'],
      default: 'present',
    },
    totalHours: {
      type: Number,
      default: 0,
      // Stored in hours (decimal format, e.g., 8.5 for 8 hours 30 minutes)
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate check-ins on same day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours before saving if checkout time exists
attendanceSchema.pre('save', function (next) {
  if (this.checkOutTime && this.checkInTime) {
    const diffInMs = this.checkOutTime - this.checkInTime;
    const diffInHours = diffInMs / (1000 * 60 * 60); // Convert milliseconds to hours
    this.totalHours = parseFloat(diffInHours.toFixed(2));
    
    // Update status based on total hours
    if (this.totalHours < 4) {
      this.status = 'half-day';
    } else {
      this.status = 'present';
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;

