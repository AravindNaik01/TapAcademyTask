import express from 'express';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import { protect, managerOnly, employeeOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * Get current date in YYYY-MM-DD format
 */
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * @route   POST /api/attendance/checkin
 * @desc    Employee check-in
 * @access  Private (Employee only)
 */
router.post('/checkin', protect, employeeOnly, async (req, res) => {
  try {
    const today = getCurrentDate();

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in today',
        data: existingAttendance,
      });
    }

    // Create check-in record
    const attendance = await Attendance.create({
      userId: req.user._id,
      date: today,
      checkInTime: new Date(),
      status: 'present',
    });

    res.status(201).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/attendance/checkout
 * @desc    Employee check-out
 * @access  Private (Employee only)
 */
router.post('/checkout', protect, employeeOnly, async (req, res) => {
  try {
    const today = getCurrentDate();

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'Please check in first',
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out today',
        data: attendance,
      });
    }

    // Update check-out time
    attendance.checkOutTime = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/attendance/my-history
 * @desc    Get current employee's attendance history
 * @access  Private (Employee only)
 */
router.get('/my-history', protect, employeeOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const attendance = await Attendance.find({ userId: req.user._id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email employeeId department');

    const total = await Attendance.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/attendance/my-summary
 * @desc    Get current employee's attendance summary
 * @access  Private (Employee only)
 */
router.get('/my-summary', protect, employeeOnly, async (req, res) => {
  try {
    const today = getCurrentDate();

    // Get today's attendance
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    // Get last 7 days attendance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo.toISOString().split('T')[0] },
    }).sort({ date: -1 });

    // Calculate statistics
    const totalPresent = await Attendance.countDocuments({
      userId: req.user._id,
      status: 'present',
    });
    const totalAbsent = await Attendance.countDocuments({
      userId: req.user._id,
      status: 'absent',
    });
    const totalHalfDay = await Attendance.countDocuments({
      userId: req.user._id,
      status: 'half-day',
    });

    res.status(200).json({
      success: true,
      data: {
        today: todayAttendance,
        last7Days,
        statistics: {
          totalPresent,
          totalAbsent,
          totalHalfDay,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/attendance/all
 * @desc    Get all attendance records (Manager only)
 * @access  Private (Manager only)
 */
router.get('/all', protect, managerOnly, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      employeeId,
      status,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter object
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    if (status) {
      filter.status = status;
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        filter.userId = user._id;
      } else {
        return res.status(404).json({
          success: false,
          message: 'Employee not found',
        });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendance = await Attendance.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email employeeId department');

    const total = await Attendance.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/attendance/employee/:id
 * @desc    Get attendance for specific employee (Manager only)
 * @access  Private (Manager only)
 */
router.get('/employee/:id', protect, managerOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Find user by employeeId or userId
    let user = await User.findOne({
      $or: [{ employeeId: id }, { _id: id }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Build filter
    const filter = { userId: user._id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    res.status(200).json({
      success: true,
      count: attendance.length,
      employee: {
        _id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
      },
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/attendance/export
 * @desc    Export attendance data as CSV (Manager only)
 * @access  Private (Manager only)
 */
router.get('/export', protect, managerOnly, async (req, res) => {
  try {
    const { startDate, endDate, employeeId, status } = req.query;

    // Build filter object
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    if (status) {
      filter.status = status;
    }

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        filter.userId = user._id;
      }
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    // Generate CSV content
    let csvContent = 'Date,Employee ID,Name,Email,Department,Check In,Check Out,Total Hours,Status\n';

    attendance.forEach((record) => {
      const date = record.date;
      const employeeId = record.userId?.employeeId || 'N/A';
      const name = record.userId?.name || 'N/A';
      const email = record.userId?.email || 'N/A';
      const department = record.userId?.department || 'N/A';
      const checkIn = record.checkInTime
        ? new Date(record.checkInTime).toLocaleString()
        : 'N/A';
      const checkOut = record.checkOutTime
        ? new Date(record.checkOutTime).toLocaleString()
        : 'N/A';
      const totalHours = record.totalHours || 0;
      const status = record.status || 'N/A';

      csvContent += `${date},${employeeId},${name},${email},${department},${checkIn},${checkOut},${totalHours},${status}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-export-${Date.now()}.csv`
    );

    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

export default router;

