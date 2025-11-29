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
      enum: ['present', 'absent', 'late', 'half-day'],
      default: 'present',
    },
    totalHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function (next) {
  if (this.checkOutTime && this.checkInTime) {
    const diffInMs = this.checkOutTime - this.checkInTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    this.totalHours = parseFloat(diffInHours.toFixed(2));
    
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
