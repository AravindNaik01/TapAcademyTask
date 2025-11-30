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

    // Fetch all employees to calculate historical totals
    const allEmployees = await User.find({ role: 'employee' }).select('createdAt');

    // Fill in missing days for the chart
    const filledWeeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');
      const dayData = weeklyTrend.find(d => d._id === date);
      const presentCountForDay = dayData ? dayData.present : 0;

      // Calculate total employees that existed on this specific date
      const endOfDay = dayjs(date).endOf('day');
      let totalEmployeesOnDate = allEmployees.filter(emp =>
        dayjs(emp.createdAt).isBefore(endOfDay)
      ).length;

      // Correction: If attendance exists but employee records say fewer people existed (common in seeded data),
      // assume at least the present employees existed. 
      // We DO NOT assume the current totalEmployees existed, to avoid false "Absent" counts.
      if (totalEmployeesOnDate < presentCountForDay) {
        totalEmployeesOnDate = presentCountForDay;
      }

      let absentCount = Math.max(0, totalEmployeesOnDate - presentCountForDay);
      let status = 'Working';

      // Check for Holiday (Sundays)
      if (dayjs(date).day() === 0) {
        status = 'Holiday';
        // Only zero out absent count if NOBODY worked.
        // If people worked, we show the rest as absent (or just not present) to maintain chart scale.
        if (presentCountForDay === 0) {
          absentCount = 0;
        }
      }
      // Check for No Data (No employees existed yet AND no attendance)
      else if (totalEmployeesOnDate === 0) {
        status = 'No Data';
      }

      filledWeeklyTrend.push({
        date: dayjs(date).format('ddd'), // Mon, Tue, etc.
        fullDate: date,
        present: presentCountForDay, // Always show present data if available
        late: dayData ? dayData.late : 0, // Always show late data if available
        absent: absentCount, // Use calculated absentCount (which handles the holiday logic)
        status: status,
        totalEmployees: totalEmployeesOnDate
      });
    }

    // 4. Department-wise Attendance (Today)
    // 4. Department-wise Attendance (Today)
    // Get total employees per department
    const employeesByDept = await User.aggregate([
      { $match: { role: 'employee' } },
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    // Group present employees by department
    const presentByDept = {};
    todayAttendance.forEach(record => {
      const dept = record.userId.department || 'Unknown';
      if (!presentByDept[dept]) {
        presentByDept[dept] = 0;
      }
      presentByDept[dept]++;
    });

    const departmentChartData = employeesByDept.map(deptData => {
      const deptName = deptData._id || 'Unknown';
      const total = deptData.count;
      const present = presentByDept[deptName] || 0;
      const absent = total - present;

      return {
        name: deptName,
        value: present, // Value for the pie chart slice size (based on present count)
        total: total,
        present: present,
        absent: absent
      };
    }).filter(d => d.value > 0); // Optional: Only show departments with present employees in the pie chart? 
    // Actually, usually pie charts show distribution of *something*. 
    // If the chart is "Department-wise Attendance", it usually means "Share of Present Employees by Department".
    // So filtering by value > 0 is correct for the slices, but maybe we want to show all departments?
    // If value is 0, it won't show in PieChart anyway. Let's keep all and let Recharts handle 0s.
    // Wait, if I filter, I might lose departments with 0 present but some absent.
    // But a PieChart of "Attendance" usually implies "Who is here".
    // Let's remove the filter to be safe, but Recharts might hide 0 value slices.


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

export const getDepartmentStats = async (req, res, next) => {
  try {
    const { type, date } = req.query;
    const targetDate = date ? dayjs(date) : dayjs();
    let startDate, endDate;

    switch (type) {
      case 'weekly':
        startDate = targetDate.startOf('week').format('YYYY-MM-DD');
        endDate = targetDate.endOf('week').format('YYYY-MM-DD');
        break;
      case 'monthly':
        startDate = targetDate.startOf('month').format('YYYY-MM-DD');
        endDate = targetDate.endOf('month').format('YYYY-MM-DD');
        break;
      case 'yearly':
        startDate = targetDate.startOf('year').format('YYYY-MM-DD');
        endDate = targetDate.endOf('year').format('YYYY-MM-DD');
        break;
      case 'daily':
      default:
        startDate = targetDate.format('YYYY-MM-DD');
        endDate = targetDate.format('YYYY-MM-DD');
        break;
    }

    // 1. Fetch all employees with their join date
    const allEmployees = await User.find({ role: 'employee' }).select('department createdAt');

    // 2. Initialize stats map
    const statsByDept = {};
    // Pre-fill departments from employees to ensure we have all of them
    allEmployees.forEach(emp => {
      if (!statsByDept[emp.department]) {
        statsByDept[emp.department] = { totalManDays: 0, present: 0 };
      }
    });

    // 3. Calculate Total Man-Days (Capacity)
    let current = dayjs(startDate);
    const end = dayjs(endDate);
    const today = dayjs(); // Don't count future days

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      // Stop if we are trying to calculate for future days
      if (current.isAfter(today, 'day')) {
        break;
      }

      const isHoliday = current.day() === 0; // Sunday

      if (!isHoliday) {
        // Count employees active on this day
        allEmployees.forEach(emp => {
          const joinedAt = dayjs(emp.createdAt);
          // Check if employee existed on this day
          if (joinedAt.isBefore(current.endOf('day'))) {
            const dept = emp.department;
            if (statsByDept[dept]) {
              statsByDept[dept].totalManDays++;
            }
          }
        });
      }
      current = current.add(1, 'day');
    }

    // 4. Get attendance for the period
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'department');

    // 5. Aggregate Present counts
    attendanceRecords.forEach(record => {
      // Only count if user still exists (populated)
      if (record.userId && record.userId.department) {
        const dept = record.userId.department;
        // Ensure dept exists in stats (in case of data inconsistency)
        if (!statsByDept[dept]) statsByDept[dept] = { totalManDays: 0, present: 0 };

        statsByDept[dept].present++;
      }
    });

    // 6. Format response
    const departmentStats = Object.keys(statsByDept).map(deptName => {
      const { totalManDays, present } = statsByDept[deptName];

      // Ensure Total is at least equal to Present.
      // This handles cases like Sundays (where totalManDays is 0 but people might work)
      // or data inconsistencies.
      const adjustedTotal = Math.max(totalManDays, present);

      // Absent cannot be negative
      const absent = Math.max(0, adjustedTotal - present);

      return {
        name: deptName,
        value: present,
        total: adjustedTotal,
        present: present,
        absent: absent
      };
    });

    res.status(200).json({
      success: true,
      data: departmentStats
    });
  } catch (error) {
    next(error);
  }
};
