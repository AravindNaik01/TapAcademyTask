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

    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Department.deleteMany({});

    console.log('Cleared existing data...');

    const departments = [
      { name: 'Development', description: 'Software Development Team' },
      { name: 'Design', description: 'UI/UX Design Team' },
      { name: 'Testing', description: 'QA and Testing Team' },
      { name: 'Marketing', description: 'Marketing and Sales Team' }
    ];

    await Department.insertMany(departments);
    console.log('✓ Created Departments');

    const manager = await User.create({
      name: 'Arjun Reddy',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management',
    });

    console.log('✓ Created Manager:', manager.email);

    const employee1 = await User.create({
      name: 'Sneha Gupta',
      email: 'sneha@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP001',
      department: 'Development',
    });

    console.log('✓ Created Employee 1:', employee1.email);

    const employee2 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP002',
      department: 'Design',
    });

    console.log('✓ Created Employee 2:', employee2.email);

    const employee3 = await User.create({
      name: 'Ananya Roy',
      email: 'ananya@company.com',
      password: 'employee123',
      role: 'employee',
      employeeId: 'EMP003',
      department: 'Marketing',
    });

    console.log('✓ Created Employee 3:', employee3.email);

    const employees = [employee1, employee2, employee3];

    for (let i = 0; i < 7; i++) {
      const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD');

      for (const employee of employees) {
        // Randomize times slightly
        const randomCheckInMinute = Math.floor(Math.random() * 30); // 0-29 mins late/early
        const randomCheckOutMinute = Math.floor(Math.random() * 30);

        if (i === 0 || i === 2 || i === 4 || i === 6) {
          // Full day: ~9:00 AM to ~6:00 PM
          const checkIn = dayjs(date).hour(9).minute(randomCheckInMinute).second(0).toDate();
          const checkOut = dayjs(date).hour(18).minute(randomCheckOutMinute).second(0).toDate();

          // Calculate actual hours
          const diffInMs = checkOut - checkIn;
          const totalHours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

          await Attendance.create({
            userId: employee._id,
            date,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status: 'present',
            totalHours: totalHours,
          });
        } else if (i === 1) {
          // Half day: ~9:00 AM to ~1:00 PM
          const checkIn = dayjs(date).hour(9).minute(randomCheckInMinute).second(0).toDate();
          const checkOut = dayjs(date).hour(13).minute(randomCheckOutMinute).second(0).toDate();

          const diffInMs = checkOut - checkIn;
          const totalHours = parseFloat((diffInMs / (1000 * 60 * 60)).toFixed(2));

          await Attendance.create({
            userId: employee._id,
            date,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status: 'half-day',
            totalHours: totalHours,
          });
        }
        // Skip some days to simulate absence (i=3, i=5)
      }
    }

    console.log('✓ Created 7 days of attendance records for each employee');

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Manager:');
    console.log('  Email: manager@company.com');
    console.log('  Password: manager123');
    console.log('\nEmployees:');
    console.log('  Email: alice@company.com / Password: employee123');
    console.log('  Email: bob@company.com / Password: employee123');
    console.log('  Email: charlie@company.com / Password: employee123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};


seedData();

