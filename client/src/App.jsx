import { Routes, Route, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './features/auth/Login.jsx'
import Register from './features/auth/Register.jsx'
import EmployeeDashboard from './features/attendance/EmployeeDashboard.jsx'
import MyHistory from './features/attendance/MyHistory.jsx'
import Profile from './features/auth/Profile.jsx'
import ManagerDashboard from './features/attendance/ManagerDashboard.jsx'
import AllAttendance from './features/attendance/AllAttendance.jsx'
import EmployeeAttendanceDetails from './features/attendance/EmployeeAttendanceDetails.jsx'
import TeamCalendar from './features/attendance/TeamCalendar.jsx'
import Reports from './features/attendance/Reports.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import NavBar from './components/Layout/NavBar.jsx'
import Toast from './components/Toast.jsx'
import Home from './pages/Home.jsx'
import EmployeeLayout from './components/Layout/EmployeeLayout.jsx'

function App() {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Hide NavBar for home page and all employee routes (since they have their own sidebar)
  const shouldShowNavBar = user && location.pathname !== '/' && !location.pathname.startsWith('/employee')

  return (
    <div className="min-h-screen bg-gray-50">
      {shouldShowNavBar && <NavBar />}
      <Toast />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />

        {/* Employee Routes with Sidebar Layout */}
        <Route element={<ProtectedRoute requiredRole="employee"><EmployeeLayout /></ProtectedRoute>}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/history" element={<MyHistory />} />
          <Route path="/employee/profile" element={<Profile />} />
        </Route>

        {/* Manager Routes */}
        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute requiredRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/attendance/all"
          element={
            <ProtectedRoute requiredRole="manager">
              <AllAttendance />
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
          path="/manager/attendance/:id"
          element={
            <ProtectedRoute requiredRole="manager">
              <EmployeeAttendanceDetails />
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
          element={<Home />}
        />
      </Routes>
    </div>
  )
}

export default App
