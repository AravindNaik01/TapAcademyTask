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
    const last7DaysStart = dayjs().subtract(6, 'day').format('YYYY-MM-DD');

    // 1. Today's Stats
    const todayAttendance = await Attendance.find({ date: today }).populate('userId', 'name email employeeId department profileImage');

    const presentCount = todayAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'half-day').length;
    const lateCount = todayAttendance.filter(a => a.status === 'late').length;

    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const absentCount = totalEmployees - presentCount;

    // 2. Absent Employees List
    const presentUserIds = todayAttendance.map(a => a.userId._id);
    const absentEmployees = await User.find({
      role: 'employee',
      _id: { $nin: presentUserIds }
    }).select('name email employeeId department profileImage');

    // 3. Weekly Attendance Trend
    const weeklyTrend = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: last7DaysStart, $lte: today }
        }
      },
      {
        $group: {
          _id: '$date',
          present: { $sum: 1 },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days for the chart
    const filledWeeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const dayData = weeklyTrend.find(d => d._id === date);
      filledWeeklyTrend.push({
        date: dayjs(date).format('ddd'), // Mon, Tue, etc.
        fullDate: date,
        present: dayData ? dayData.present : 0,
        late: dayData ? dayData.late : 0,
      });
    }

    // 4. Department-wise Attendance (Today)
    // We need to group the present employees by department
    const departmentStats = {};
    todayAttendance.forEach(record => {
      const dept = record.userId.department || 'Unknown';
      if (!departmentStats[dept]) {
        departmentStats[dept] = 0;
      }
      departmentStats[dept]++;
    });

    const departmentChartData = Object.keys(departmentStats).map(dept => ({
      name: dept,
      value: departmentStats[dept]
    }));

    // 5. Month Stats (Existing)
    const monthAttendance = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    // 6. Top Performers (Restored)
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
        stats: {
          totalEmployees,
          present: presentCount,
          absent: absentCount,
          late: lateCount,
        },
        charts: {
          weeklyTrend: filledWeeklyTrend,
          department: departmentChartData,
        },
        absentEmployees,
        month: {
          totalCheckins: monthAttendance.length,
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

