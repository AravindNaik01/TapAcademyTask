import dayjs from 'dayjs';
import mongoose from 'mongoose';
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
      // status handled by pre-save hook
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

    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    // Fetch all records for the month
    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 });

    const last7Days = monthAttendance.slice(0, 7);

    // Calculate stats from the fetched records
    let totalPresent = 0;
    let totalLate = 0;
    let totalHalfDay = 0;
    let totalHoursWorked = 0;
    let explicitAbsent = 0;

    // Set of dates that have records
    const recordedDates = new Set();

    monthAttendance.forEach(record => {
      recordedDates.add(record.date);
      if (record.status === 'present') totalPresent++;
      else if (record.status === 'late') totalLate++;
      else if (record.status === 'half-day') totalHalfDay++;
      else if (record.status === 'absent') explicitAbsent++;

      totalHoursWorked += record.totalHours || 0;
    });

    // Calculate Implicit Absent Days (Past weekdays with no record)
    let implicitAbsent = 0;
    const todayDate = dayjs();
    let currentDate = dayjs().startOf('month');

    // Iterate until yesterday
    while (currentDate.isBefore(todayDate, 'day')) {
      const dateStr = currentDate.format('YYYY-MM-DD');
      const dayOfWeek = currentDate.day(); // 0 is Sunday, 6 is Saturday

      // If it's a weekday and no record exists
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !recordedDates.has(dateStr)) {
        implicitAbsent++;
      }

      currentDate = currentDate.add(1, 'day');
    }

    const totalAbsent = explicitAbsent + implicitAbsent;

    res.status(200).json({
      success: true,
      data: {
        today: todayAttendance,
        last7Days,
        monthAttendance, // Required for the Calendar view
        statistics: {
          totalPresent,
          totalAbsent,
          totalHalfDay,
          totalLate,
          totalHoursWorked: parseFloat(totalHoursWorked.toFixed(2)),
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

    if (employeeId && employeeId.trim() !== '') {
      const userQuery = [{ employeeId: new RegExp(employeeId, 'i') }]; // Case-insensitive partial match for employeeId

      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        userQuery.push({ _id: employeeId });
      }

      const user = await User.findOne({
        $or: userQuery,
      });

      if (user) {
        filter.userId = user._id;
      } else {
        // If employeeId is provided but not found, we should return empty results
        // or a specific error. Returning empty results is often safer for filters.
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: parseInt(page),
          pages: 0,
          data: [],
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

    const query = { $or: [{ employeeId: id }] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }

    let user = await User.findOne(query);

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
        profileImage: user.profileImage,
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
      status: { $in: ['present', 'late', 'half-day'] },
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
