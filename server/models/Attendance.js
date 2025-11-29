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
  // Logic: Check-in before 9:00 AM and Check-out after 5:00 PM (17:00)
  const checkInDate = new Date(this.checkInTime);

  // 9:00 AM Threshold for Late
  const lateThreshold = new Date(this.checkInTime);
  lateThreshold.setHours(9, 0, 0, 0);
  const isLate = checkInDate > lateThreshold;

  if (this.checkOutTime) {
    const checkOutDate = new Date(this.checkOutTime);

    // 5:00 PM (17:00) Threshold for Half-day
    // We use the check-in date as the base for the 5 PM threshold to handle the same working day
    const earlyLeaveThreshold = new Date(this.checkInTime);
    earlyLeaveThreshold.setHours(17, 0, 0, 0);
    const isEarlyLeave = checkOutDate < earlyLeaveThreshold;

    const diffInMs = this.checkOutTime - this.checkInTime;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    this.totalHours = parseFloat(diffInHours.toFixed(2));

    if (isEarlyLeave) {
      this.status = 'half-day';
    } else if (isLate) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  } else {
    // On initial check-in, we can only determine if they are late
    if (isLate) {
      this.status = 'late';
    } else {
      this.status = 'present';
    }
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
