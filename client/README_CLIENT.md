# Employee Attendance System - Client

React + Vite frontend application using RTK Query for API calls and Tailwind CSS for styling.

## Features

- Employee Dashboard with check-in/check-out functionality
- Attendance history with pagination and filtering
- Manager dashboard with team overview
- All attendance records with advanced filtering
- Calendar view for monthly attendance
- Reports with CSV export
- Role-based access control
- Toast notifications for user feedback

## Setup

1. Install dependencies:
```bash
cd client
npm install
```

2. Create `.env` file (if not exists):
```
VITE_API_URL=http://localhost:5000/api
```

3. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Tech Stack

- React 18
- Vite
- Redux Toolkit (RTK Query)
- React Router v6
- Tailwind CSS

## Project Structure

```
client/
├── src/
│   ├── app/              # Redux store and API slice
│   ├── features/         # Feature-based modules
│   │   ├── auth/         # Authentication
│   │   └── attendance/   # Attendance features
│   ├── components/       # Shared components
│   ├── utils/            # Utility functions
│   └── main.jsx          # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

