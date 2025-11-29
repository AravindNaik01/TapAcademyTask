# Quick Start Guide

## Prerequisites
- Node.js (v16+)
- MongoDB running locally or MongoDB Atlas account
- npm or yarn

## Step 1: Backend Setup

```bash
cd server
npm install

# Create .env file with these contents:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/employee-attendance
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# NODE_ENV=development

# Seed database (creates test users)
npm run seed

# Start backend server (runs on port 5000)
npm run dev
```

## Step 2: Frontend Setup (in a new terminal)

```bash
cd client
npm install

# Create .env file with these contents:
# VITE_API_URL=http://localhost:5000/api

# Start frontend server (runs on port 5173)
npm run dev
```

## Step 3: Access the Application

Open your browser and navigate to: **http://localhost:5173**

## Test Credentials

After running the seed script, you can login with:

### Manager:
- Email: `manager@company.com`
- Password: `manager123`

### Employee:
- Email: `alice@company.com`
- Password: `employee123`

## Common Issues

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod` (or start MongoDB service)
- Or use MongoDB Atlas and update MONGODB_URI in .env

### Port Already in Use
- Backend: Change PORT in server/.env
- Frontend: Change port in client/vite.config.js

### CORS Issues
- Ensure backend is running on port 5000
- Check VITE_API_URL in client/.env matches backend URL

