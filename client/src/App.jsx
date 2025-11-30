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
import ManagerLayout from './components/Layout/ManagerLayout.jsx'

function App() {
  const { user } = useSelector((state) => state.auth)
  const location = useLocation()

  // Hide NavBar for home page and all employee/manager routes (since they have their own sidebar)
  const shouldShowNavBar = user && location.pathname !== '/' && !location.pathname.startsWith('/employee') && !location.pathname.startsWith('/manager')

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

        {/* Manager Routes with Sidebar Layout */}
        <Route element={<ProtectedRoute requiredRole="manager"><ManagerLayout /></ProtectedRoute>}>
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/attendance/all" element={<AllAttendance />} />
          <Route path="/manager/attendance" element={<AllAttendance />} />
          <Route path="/manager/attendance/:id" element={<EmployeeAttendanceDetails />} />
          <Route path="/manager/calendar" element={<TeamCalendar />} />
          <Route path="/manager/reports" element={<Reports />} />
        </Route>

        <Route
          path="/"
          element={<Home />}
        />
      </Routes>
    </div>
  )
}

export default App
