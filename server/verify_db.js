import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const checkDb = async () => {
    try {
        console.log('Connecting to DB:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!');

        const userCount = await User.countDocuments();
        console.log(`\nTotal Users: ${userCount}`);

        const users = await User.find({});
        users.forEach(u => console.log(` - ${u.name} (${u.email})`));

        const attendanceCount = await Attendance.countDocuments();
        console.log(`\nTotal Attendance Records: ${attendanceCount}`);

        const recentAttendance = await Attendance.find().sort({ date: -1 }).limit(5).populate('userId');
        console.log('\nMost Recent 5 Records:');
        recentAttendance.forEach(a => {
            console.log(` - ${a.date}: ${a.userId?.name} (${a.status})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDb();
