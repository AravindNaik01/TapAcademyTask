# Employee Attendance Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing employee attendance with role-based access control (Employee & Manager).

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (Employee & Manager)

### Employee Features
- Check-in / Check-out functionality
- View today's attendance status
- View last 7 days attendance summary
- Full attendance history with pagination
- Statistics dashboard (Total Present, Half Days, Absent)

### Manager Features
- View all employees' attendance records
- Filter attendance by:
  - Date range (start date & end date)
  - Employee ID
  - Status (Present, Half Day, Absent)
- Export attendance data to CSV
- Paginated attendance list

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React 18** with Vite
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling

## Project Structure

```
TapAcademyTask/
├── server/                 # Backend application
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── models/
│   │   ├── User.js        # User model
│   │   └── Attendance.js  # Attendance model
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   └── attendance.js  # Attendance routes
│   ├── seed.js            # Database seeder
│   ├── server.js          # Express server
│   └── package.json
│
└── client/                 # Frontend application
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── services/      # API service functions
    │   ├── store/         # Redux store & slices
    │   ├── App.jsx        # Main app component
    │   └── main.jsx       # Entry point
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/employee-attendance
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

4. Make sure MongoDB is running on your system.

5. Seed the database (optional - creates test users):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend application will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Employee Attendance
- `POST /api/attendance/checkin` - Employee check-in (Protected, Employee only)
- `POST /api/attendance/checkout` - Employee check-out (Protected, Employee only)
- `GET /api/attendance/my-history` - Get employee's attendance history (Protected, Employee only)
- `GET /api/attendance/my-summary` - Get employee's attendance summary (Protected, Employee only)

### Manager Attendance
- `GET /api/attendance/all` - Get all attendance records (Protected, Manager only)
- `GET /api/attendance/employee/:id` - Get specific employee's attendance (Protected, Manager only)
- `GET /api/attendance/export` - Export attendance as CSV (Protected, Manager only)

## Seed Data

After running `npm run seed` in the server directory, the following test accounts will be created:

### Manager Account
- **Email:** manager@company.com
- **Password:** manager123
- **Employee ID:** MGR001

### Employee Accounts
- **Email:** alice@company.com
- **Password:** employee123
- **Employee ID:** EMP001

- **Email:** bob@company.com
- **Password:** employee123
- **Employee ID:** EMP002

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Employee Dashboard**: 
   - View today's attendance status
   - Check in/Check out
   - View last 7 days summary
   - Access full attendance history
3. **Manager Dashboard**:
   - View all employees' attendance
   - Apply filters (date range, employee ID, status)
   - Export data to CSV

## Database Schema

### User Model
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, enum: ['employee', 'manager'])
- `employeeId` (String, required, unique)
- `department` (String, required)
- `createdAt`, `updatedAt` (timestamps)

### Attendance Model
- `userId` (ObjectId, reference to User)
- `date` (String, format: YYYY-MM-DD)
- `checkInTime` (Date)
- `checkOutTime` (Date, optional)
- `status` (String, enum: ['present', 'absent', 'half-day'])
- `totalHours` (Number, calculated on checkout)
- `createdAt`, `updatedAt` (timestamps)

## Features Implementation

- ✅ JWT Authentication with secure token storage
- ✅ Role-based route protection (Employee & Manager)
- ✅ Automatic total hours calculation on checkout
- ✅ Prevent multiple check-ins/outs on the same day
- ✅ Pagination for attendance lists
- ✅ CSV export functionality
- ✅ Responsive UI with Tailwind CSS
- ✅ Error handling and validation

## Development

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd client
npm run dev  # Vite dev server with hot reload
```

## Production Build

### Frontend Build
```bash
cd client
npm run build
```

The production build will be in the `client/dist` directory.

## License

This project is open source and available for educational purposes.

## Author

Built as a complete MERN stack project for employee attendance management.

