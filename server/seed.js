import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';
import Department from './models/Department.js';
import dayjs from 'dayjs';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Department.deleteMany({});

    console.log('Cleared existing data...');

    // Create Departments
    const departments = [
      { name: 'Development', description: 'Software Development Team' },
      { name: 'Design', description: 'UI/UX Design Team' },
      { name: 'Testing', description: 'QA and Testing Team' },
      { name: 'Marketing', description: 'Marketing and Sales Team' },
      { name: 'HR', description: 'Human Resources' },
      { name: 'Sales', description: 'Sales Department' },
    ];

    await Department.insertMany(departments);
    console.log('✓ Created Departments');

    // Create Manager
    const manager = await User.create({
      name: 'Arjun Reddy',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management',
    });

    console.log('✓ Created Manager:', manager.email);

    // Create 10 Employees
    const employeeData = [
      { name: 'Sneha Gupta', email: 'sneha@company.com', department: 'Development' },
      { name: 'Vikram Singh', email: 'vikram@company.com', department: 'Design' },
      { name: 'Ananya Roy', email: 'ananya@company.com', department: 'Marketing' },
      { name: 'Rahul Sharma', email: 'rahul@company.com', department: 'Development' },
      { name: 'Priya Patel', email: 'priya@company.com', department: 'Testing' },
      { name: 'Amit Kumar', email: 'amit@company.com', department: 'Sales' },
      { name: 'Neha Verma', email: 'neha@company.com', department: 'HR' },
      { name: 'Rohan Das', email: 'rohan@company.com', department: 'Development' },
      { name: 'Kavita Krishnan', email: 'kavita@company.com', department: 'Design' },
      { name: 'Suresh Raina', email: 'suresh@company.com', department: 'Testing' },
    ];

    const employees = [];
    for (const emp of employeeData) {
      const user = await User.create({
        name: emp.name,
        email: emp.email,
        password: 'employee123',
        role: 'employee',
        department: emp.department,
      });
      employees.push(user);
    }

    console.log(`✓ Created ${employees.length} Employees`);

    // Generate Attendance for last 7 days
    const today = dayjs();
    const startDate = today.subtract(6, 'day'); // 7 days including today

    for (let i = 0; i < 7; i++) {
      const currentDate = startDate.add(i, 'day');
      const dateStr = currentDate.format('YYYY-MM-DD');
      const isWeekend = currentDate.day() === 0 || currentDate.day() === 6; // 0=Sun, 6=Sat

      if (isWeekend) continue; // Skip weekends usually

      for (const employee of employees) {
        // Random Status Determination
        const rand = Math.random();
        let statusType = 'present';

        if (rand < 0.1) statusType = 'absent'; // 10% Absent
        else if (rand < 0.25) statusType = 'half-day'; // 15% Half-day
        else if (rand < 0.4) statusType = 'late'; // 15% Late
        else statusType = 'present'; // 60% Present

        if (statusType === 'absent') {
          // Do not create record
          continue;
        }

        let checkInHour = 9;
        let checkInMinute = Math.floor(Math.random() * 15); // 0-14 mins
        let checkOutHour = 18;
        let checkOutMinute = Math.floor(Math.random() * 30); // 0-29 mins

        if (statusType === 'late') {
          checkInHour = 9;
          checkInMinute = 30 + Math.floor(Math.random() * 30); // 9:30 - 10:00 AM
        } else if (statusType === 'half-day') {
          checkOutHour = 13; // 1:00 PM
        } else {
          // Present (On Time)
          // Ensure check-in is before 9:00 AM for 'present' status logic in model
          // Model logic: Late if > 9:00 AM.
          // So for 'present', we need <= 9:00 AM.
          // Let's make it 8:45 - 9:00 AM
          checkInHour = 8;
          checkInMinute = 45 + Math.floor(Math.random() * 15);
        }

        const checkInTime = currentDate.hour(checkInHour).minute(checkInMinute).second(0).toDate();
        const checkOutTime = currentDate.hour(checkOutHour).minute(checkOutMinute).second(0).toDate();

        // Calculate total hours manually to pass to create (though pre-save hook might overwrite)
        const diffInMs = checkOutTime - checkInTime;
        const totalHours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

        await Attendance.create({
          userId: employee._id,
          date: dateStr,
          checkInTime: checkInTime,
          checkOutTime: checkOutTime,
          totalHours: totalHours,
          // Status will be set by pre-save hook based on times
        });
      }
    }

    console.log('✓ Created 1 week of attendance records for all employees');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Manager:');
    console.log('  Email: manager@company.com');
    console.log('  Password: manager123');
    console.log('\nEmployees (Sample):');
    employees.slice(0, 3).forEach(emp => {
      console.log(`  Email: ${emp.email} / Password: employee123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

