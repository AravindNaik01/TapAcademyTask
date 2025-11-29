import dayjs from 'dayjs';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const getCurrentDate = () => {
  return dayjs().format('YYYY-MM-DD');
};

export const employeeDashboard = async (req, res, next) => {
  try {
    const today = getCurrentDate();
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');
    const sevenDaysAgo = dayjs().subtract(7, 'day').format('YYYY-MM-DD');

    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today,
    });

    const last7Days = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo },
    }).sort({ date: -1 });

    const monthAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const presentDays = monthAttendance.filter(a => a.status === 'present').length;
    const totalHours = monthAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    const avgHours = monthAttendance.length > 0 
      ? parseFloat((totalHours / monthAttendance.length).toFixed(2))
      : 0;

    let todayStatus = 'not checked in';
    if (todayAttendance) {
      if (todayAttendance.checkOutTime) {
        todayStatus = 'checked out';
      } else if (todayAttendance.checkInTime) {
        todayStatus = 'checked in';
      }
    }

    res.status(200).json({
      success: true,
      data: {
        today: {
          status: todayStatus,
          attendance: todayAttendance || null,
        },
        last7Days,
        monthly: {
          presentDays,
          totalHours: parseFloat(totalHours.toFixed(2)),
          averageHours: avgHours,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const managerDashboard = async (req, res, next) => {
  try {
    const today = getCurrentDate();
    const startOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const todayPresent = await Attendance.countDocuments({
      date: today,
      status: 'present',
    });

    const todayAbsent = await User.countDocuments({ role: 'employee' }) - todayPresent;

    const monthAttendance = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate('userId', 'name email employeeId department');

    const employeeHours = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth },
          totalHours: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalHours: { $sum: '$totalHours' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          name: '$user.name',
          employeeId: '$user.employeeId',
          department: '$user.department',
          totalHours: { $round: ['$totalHours', 2] },
          avgHours: { $round: [{ $divide: ['$totalHours', '$count'] }, 2] },
        },
      },
      {
        $sort: { totalHours: -1 },
      },
    ]);

    const topPerformers = employeeHours.slice(0, 5);
    const bottomPerformers = employeeHours.slice(-5).reverse();

    res.status(200).json({
      success: true,
      data: {
        today: {
          present: todayPresent,
          absent: todayAbsent,
        },
        month: {
          totalCheckins: monthAttendance.length,
          totalEmployees: await User.countDocuments({ role: 'employee' }),
        },
        performers: {
          top: topPerformers,
          bottom: bottomPerformers,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

