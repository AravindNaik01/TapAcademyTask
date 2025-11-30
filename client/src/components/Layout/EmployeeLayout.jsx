import { useState } from 'react'
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
    LayoutDashboard,
    Calendar,
    User,
    LogOut,
    ChevronLeft,
    Menu
} from 'lucide-react'
import { logout } from '../../features/auth/authSlice.js'

const EmployeeLayout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/')
    }

    // Helper for active link
    const isActive = (path) => location.pathname === path

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0f172a] text-white transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">TAP Academy</h1>
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Attendance</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <Link
                        to="/employee/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/employee/dashboard') ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <LayoutDashboard size={20} />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        to="/employee/history"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/employee/history') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <Calendar size={20} />
                        <span className="font-medium">My History</span>
                    </Link>
                    <Link
                        to="/employee/profile"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive('/employee/profile') ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                        <User size={20} />
                        <span className="font-medium">My Profile</span>
                    </Link>
                </nav>

                {/* User Profile Footer */}
                <div className="p-4 border-t border-gray-800">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600 group-hover:border-blue-500 transition-colors">
                            {user?.profileImage ? (
                                <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{user?.name?.charAt(0)}</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-400 truncate">Employee</p>
                        </div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'
                    }`}
            >
                {/* Toggle Button (Visible when sidebar is closed) */}
                {!isSidebarOpen && (
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed top-6 left-6 z-40 p-2 bg-white text-gray-600 hover:text-gray-900 shadow-md rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* Page Content */}
                <Outlet context={{ isSidebarOpen }} />
            </div>
        </div>
    )
}

export default EmployeeLayout
