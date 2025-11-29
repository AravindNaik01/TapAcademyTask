import dayjs from 'dayjs';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const escapeCSVField = (field) => {
  if (field === null || field === undefined) {
    return '';
  }
  
  const str = String(field);
  
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
};

const getCurrentDate = () => {
  return dayjs().format('YYYY-MM-DD');
};

export const checkin = async (req, res, next) => {
  try {
    const today = getCurrentDate();

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
    next(error);
  }
};

export const checkout = async (req, res, next) => {
  try {
    const today = getCurrentDate();

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

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const myHistory = async (req, res, next) => {
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
    next(error);
  }
};

export const mySummary = async (req, res, next) => {
  try {
    const today = getCurrentDate();

    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
    const last7Days = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: -1 });

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
    next(error);
  }
};

export const today = async (req, res, next) => {
  try {
    const today = getCurrentDate();

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    let status = 'not checked in';
    if (attendance) {
      if (attendance.checkOutTime) {
        status = 'checked out';
      } else if (attendance.checkInTime) {
        status = 'checked in';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        attendance: attendance || null,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const all = async (req, res, next) => {
  try {
    const {
      startDate,
      endDate,
      employeeId,
      status,
      page = 1,
      limit = 50,
    } = req.query;

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
      const user = await User.findOne({
        $or: [{ employeeId }, { _id: employeeId }],
      });
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
    next(error);
  }
};

export const getEmployeeAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    let user = await User.findOne({
      $or: [{ employeeId: id }, { _id: id }],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

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
    next(error);
  }
};

export const summary = async (req, res, next) => {
  try {
    const today = getCurrentDate();
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const todayPresent = await Attendance.countDocuments({
      date: today,
      status: 'present',
    });

    const todayAbsent = await User.countDocuments({ role: 'employee' }) - todayPresent;

    const monthCheckins = await Attendance.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const monthHours = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
          totalHours: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: '$totalHours' },
          count: { $sum: 1 },
        },
      },
    ]);

    const avgHours = monthHours.length > 0 && monthHours[0].count > 0
      ? parseFloat((monthHours[0].totalHours / monthHours[0].count).toFixed(2))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        today: {
          present: todayPresent,
          absent: todayAbsent,
        },
        month: {
          checkins: monthCheckins,
          avgHours,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, employeeId, status } = req.query;

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
      const user = await User.findOne({
        $or: [{ employeeId }, { _id: employeeId }],
      });
      if (user) {
        filter.userId = user._id;
      }
    }

    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .populate('userId', 'name email employeeId department');

    const headers = ['Date', 'Employee ID', 'Name', 'Email', 'Department', 'Check In', 'Check Out', 'Total Hours', 'Status'];

    let csvContent = headers.map(escapeCSVField).join(',') + '\n';

    attendance.forEach((record) => {
      const row = [
        record.date,
        record.userId?.employeeId || 'N/A',
        record.userId?.name || 'N/A',
        record.userId?.email || 'N/A',
        record.userId?.department || 'N/A',
        record.checkInTime ? new Date(record.checkInTime).toLocaleString() : 'N/A',
        record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A',
        record.totalHours || 0,
        record.status || 'N/A',
      ];
      csvContent += row.map(escapeCSVField).join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-export-${Date.now()}.csv`
    );

    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const todayStatus = async (req, res, next) => {
  try {
    const today = getCurrentDate();
    const { department } = req.query;

    const userFilter = { role: 'employee' };
    if (department) {
      userFilter.department = department;
    }

    const employees = await User.find(userFilter).select('name email employeeId department');

    const attendanceRecords = await Attendance.find({
      date: today,
      userId: { $in: employees.map(e => e._id) },
    }).populate('userId', 'name email employeeId department');

    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      attendanceMap.set(record.userId._id.toString(), record);
    });

    const result = employees.map(employee => {
      const attendance = attendanceMap.get(employee._id.toString());
      let status = 'absent';
      
      if (attendance) {
        if (attendance.checkOutTime) {
          status = 'checked-out';
        } else if (attendance.checkInTime) {
          status = 'present';
        }
      }

      return {
        employee: {
          _id: employee._id,
          name: employee.name,
          email: employee.email,
          employeeId: employee.employeeId,
          department: employee.department,
        },
        status,
        attendance: attendance || null,
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

