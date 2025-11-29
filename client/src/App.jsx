import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './features/auth/Login.jsx'
import Register from './features/auth/Register.jsx'
import EmployeeDashboard from './features/attendance/EmployeeDashboard.jsx'
import MarkAttendance from './features/attendance/MarkAttendance.jsx'
import MyHistory from './features/attendance/MyHistory.jsx'
import Profile from './features/auth/Profile.jsx'
import ManagerDashboard from './features/attendance/ManagerDashboard.jsx'
import AllAttendance from './features/attendance/AllAttendance.jsx'
import TeamCalendar from './features/attendance/TeamCalendar.jsx'
import Reports from './features/attendance/Reports.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NavBar from './components/Layout/NavBar.jsx'
import Toast from './components/Toast.jsx'

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <NavBar />}
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute requiredRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/mark-attendance"
          element={
            <ProtectedRoute requiredRole="employee">
              <MarkAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/history"
          element={
            <ProtectedRoute requiredRole="employee">
              <MyHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/profile"
          element={
            <ProtectedRoute requiredRole="employee">
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/attendance"
          element={
            <ProtectedRoute requiredRole="manager">
              <AllAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/calendar"
          element={
            <ProtectedRoute requiredRole="manager">
              <TeamCalendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute requiredRole="manager">
              <Reports />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/"
          element={
            <Navigate
              to={user?.role === 'manager' ? '/manager/dashboard' : '/employee/dashboard'}
              replace
            />
          }
        />
      </Routes>
    </div>
  )
}

export default App
