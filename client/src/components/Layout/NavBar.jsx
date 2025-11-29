import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice.js'

const NavBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {user?.role === 'employee' && (
                <>
                  <Link
                    to="/employee/dashboard"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/employee/history"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    History
                  </Link>
                  <Link
                    to="/employee/profile"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Profile
                  </Link>
                </>
              )}
              {user?.role === 'manager' && (
                <>
                  <Link
                    to="/manager/dashboard"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/manager/attendance"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    All Attendance
                  </Link>
                  <Link
                    to="/manager/calendar"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Calendar
                  </Link>
                  <Link
                    to="/manager/reports"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Reports
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              {user?.name} (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                {user?.role}
              </span>
              )
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar

