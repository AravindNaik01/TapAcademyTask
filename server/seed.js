import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data (optional - remove if you want to keep existing data)
    await User.deleteMany({});
    await Attendance.deleteMany({});

    console.log('Cleared existing data...');

    // Create Manager
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management',
    });

    console.log('✓ Created Manager:', manager.email);

    // Create Employee 1
    const employee1 = await User.create({
      name: 'Alice Employee',
      email: 'alice@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP001',
      department: 'Development',
    });

    console.log('✓ Created Employee 1:', employee1.email);

    // Create Employee 2
    const employee2 = await User.create({
      name: 'Bob Employee',
      email: 'bob@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP002',
      department: 'Design',
    });

    console.log('✓ Created Employee 2:', employee2.email);

    // Generate dates for last 2 days
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    const formatDate = (date) => date.toISOString().split('T')[0];

    // Create sample attendance for Employee 1 - Yesterday
    const emp1Yesterday = new Date(yesterday);
    emp1Yesterday.setHours(9, 0, 0, 0);
    const emp1YesterdayOut = new Date(yesterday);
    emp1YesterdayOut.setHours(18, 0, 0, 0);

    await Attendance.create({
      userId: employee1._id,
      date: formatDate(yesterday),
      checkInTime: emp1Yesterday,
      checkOutTime: emp1YesterdayOut,
      status: 'present',
      totalHours: 9.0,
    });

    console.log('✓ Created attendance for Employee 1 - Yesterday');

    // Create sample attendance for Employee 1 - Day before
    const emp1DayBefore = new Date(dayBefore);
    emp1DayBefore.setHours(9, 30, 0, 0);
    const emp1DayBeforeOut = new Date(dayBefore);
    emp1DayBeforeOut.setHours(17, 30, 0, 0);

    await Attendance.create({
      userId: employee1._id,
      date: formatDate(dayBefore),
      checkInTime: emp1DayBefore,
      checkOutTime: emp1DayBeforeOut,
      status: 'present',
      totalHours: 8.0,
    });

    console.log('✓ Created attendance for Employee 1 - Day before');

    // Create sample attendance for Employee 2 - Yesterday
    const emp2Yesterday = new Date(yesterday);
    emp2Yesterday.setHours(9, 15, 0, 0);
    const emp2YesterdayOut = new Date(yesterday);
    emp2YesterdayOut.setHours(17, 45, 0, 0);

    await Attendance.create({
      userId: employee2._id,
      date: formatDate(yesterday),
      checkInTime: emp2Yesterday,
      checkOutTime: emp2YesterdayOut,
      status: 'present',
      totalHours: 8.5,
    });

    console.log('✓ Created attendance for Employee 2 - Yesterday');

    // Create sample attendance for Employee 2 - Day before (half day)
    const emp2DayBefore = new Date(dayBefore);
    emp2DayBefore.setHours(9, 0, 0, 0);
    const emp2DayBeforeOut = new Date(dayBefore);
    emp2DayBeforeOut.setHours(13, 0, 0, 0);

    await Attendance.create({
      userId: employee2._id,
      date: formatDate(dayBefore),
      checkInTime: emp2DayBefore,
      checkOutTime: emp2DayBeforeOut,
      status: 'half-day',
      totalHours: 4.0,
    });

    console.log('✓ Created attendance for Employee 2 - Day before (half day)');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Manager:');
    console.log('  Email: manager@company.com');
    console.log('  Password: manager123');
    console.log('\nEmployee 1:');
    console.log('  Email: alice@company.com');
    console.log('  Password: employee123');
    console.log('\nEmployee 2:');
    console.log('  Email: bob@company.com');
    console.log('  Password: employee123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

