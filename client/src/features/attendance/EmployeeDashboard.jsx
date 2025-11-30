import { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
    LayoutDashboard,
    Calendar,
    Bell,
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    Square
} from 'lucide-react'
import { useGetTodayQuery, useGetMySummaryQuery, useCheckInMutation, useCheckOutMutation } from './attendanceApi.js'
import { logout } from '../auth/authSlice.js'
import { formatDate, formatTime, formatDuration } from '../../utils/date.js'

const EmployeeDashboard = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth) // Fixed: user was undefined in previous context if not careful, but it comes from auth slice
    const { isSidebarOpen } = useOutletContext()

    // Queries
    const { data: todayData, isLoading: isLoadingToday, refetch: refetchToday } = useGetTodayQuery(undefined, {
        skip: !user || user.role !== 'employee',
        pollingInterval: 30000,
    })
    const { data: summaryData, isLoading: isLoadingSummary } = useGetMySummaryQuery(undefined, {
        skip: !user || user.role !== 'employee',
    })

    // Mutations
    const [checkIn, { isLoading: isCheckingIn }] = useCheckInMutation()
    const [checkOut, { isLoading: isCheckingOut }] = useCheckOutMutation()

    // State
    const [currentTime, setCurrentTime] = useState(new Date())
    const [greeting, setGreeting] = useState('')
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const notificationRef = useRef(null)

    const attendance = todayData?.data?.attendance
    const status = todayData?.data?.status || 'not checked in'
    const stats = summaryData?.data?.statistics || {}
    const recentActivity = summaryData?.data?.last7Days || []

    // Notifications Logic
    const notifications = useMemo(() => {
        const list = []
        if (attendance) {
            if (attendance.checkInTime) {
                list.push({
                    id: 'checkin',
                    title: 'Checked In',
                    message: `You checked in successfully.`,
                    time: attendance.checkInTime,
                    type: 'success'
                })
            }
            if (attendance.checkOutTime) {
                list.push({
                    id: 'checkout',
                    title: 'Checked Out',
                    message: `You checked out successfully.`,
                    time: attendance.checkOutTime,
                    type: 'info'
                })
            }
            if (attendance.status === 'late') {
                list.push({
                    id: 'late',
                    title: 'Late Arrival',
                    message: `You were marked late today.`,
                    time: attendance.checkInTime,
                    type: 'warning'
                })
            }
        }
        return list.sort((a, b) => new Date(b.time) - new Date(a.time))
    }, [attendance])

    // Close notifications on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Update Time & Greeting
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date()
            setCurrentTime(now)

            const hour = now.getHours()
            if (hour < 12) setGreeting('Good Morning')
            else if (hour < 18) setGreeting('Good Afternoon')
            else setGreeting('Good Evening')
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    // Handlers
    const handleCheckIn = async () => {
        try {
            await checkIn().unwrap()
            dispatch({ type: 'toast/show', payload: { message: 'Checked in successfully!', type: 'success' } })
            refetchToday()
        } catch (err) {
            dispatch({ type: 'toast/show', payload: { message: err.data?.message || 'Check in failed', type: 'error' } })
        }
    }

    const handleCheckOut = async () => {
        try {
            await checkOut().unwrap()
            dispatch({ type: 'toast/show', payload: { message: 'Checked out successfully!', type: 'success' } })
            refetchToday()
        } catch (err) {
            dispatch({ type: 'toast/show', payload: { message: err.data?.message || 'Check out failed', type: 'error' } })
        }
    }

    if (isLoadingToday || isLoadingSummary) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>
    }

    return (
        <div className="p-8">
            {/* Top Header */}
            <header className="flex justify-between items-center mb-8">
                <div className={`flex items-center gap-3 transition-all duration-300 ${!isSidebarOpen ? 'ml-24' : ''}`}>
                    <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative text-gray-500 hover:text-gray-700 transition-colors focus:outline-none p-2 rounded-full hover:bg-gray-100"
                        >
                            <Bell size={20} />
                            {notifications.length > 0 && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {isNotificationsOpen && (
                            <div className="absolute top-full -right-14 sm:right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-900">Notifications</h3>
                                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{notifications.length} New</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex gap-3">
                                                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-green-500' :
                                                    notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                                    }`}></div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatTime(notif.time)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                                <Bell size={24} />
                                            </div>
                                            <p className="text-gray-500 text-sm font-medium">No new notifications</p>
                                            <p className="text-gray-400 text-xs mt-1">We'll notify you when something arrives</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Today</p>
                        <p className="text-sm font-semibold text-gray-800">
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>
            </header>

            {/* Welcome Banner */}
            <div className="bg-[#0f172a] rounded-3xl p-8 text-white mb-8 relative overflow-hidden shadow-xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-medium mb-3 border border-white/10">
                            Staff Portal
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            {greeting}, {user?.name?.split(' ')[0]}
                        </h1>
                        <p className="text-blue-200">
                            You've contributed <span className="bg-blue-600/30 px-2 py-0.5 rounded text-white font-bold">{formatDuration(stats.totalHoursWorked)}</span> this month.
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-5xl md:text-6xl font-bold font-mono tracking-tight">
                            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()}
                        </div>
                        <div className="text-blue-300 font-medium mt-1 flex items-center justify-end gap-2">
                            <Calendar size={16} />
                            {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Status Card */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    {/* Progress Circle Mockup */}
                    <div className="relative w-48 h-48 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke={status === 'checked in' ? '#3b82f6' : '#e5e7eb'}
                                strokeWidth="12"
                                fill="none"
                                strokeDasharray={2 * Math.PI * 88}
                                strokeDashoffset={status === 'checked in' ? 0 : 2 * Math.PI * 88}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`w-32 h-32 rounded-full flex items-center justify-center ${status === 'checked in' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                <Clock size={48} />
                            </div>
                        </div>
                        {status === 'checked in' && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                Active
                            </div>
                        )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {status === 'checked in' ? 'Currently Working' : status === 'checked out' ? 'Shift Completed' : 'Not Checked In'}
                    </h3>
                    <p className="text-gray-500 mb-8 max-w-[200px]">
                        {status === 'checked in'
                            ? `Started at ${formatTime(attendance?.checkInTime)}. Don't forget to take breaks!`
                            : status === 'checked out'
                                ? "Great job today! See you tomorrow."
                                : "Ready to start your day? Mark your attendance now."}
                    </p>

                    {status === 'not checked in' && (
                        <button
                            onClick={handleCheckIn}
                            disabled={isCheckingIn}
                            className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            {isCheckingIn ? 'Checking In...' : <><Play size={20} fill="currentColor" /> Check In Now</>}
                        </button>
                    )}

                    {status === 'checked in' && (
                        <button
                            onClick={handleCheckOut}
                            disabled={isCheckingOut}
                            className="w-full bg-red-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 hover:shadow-xl hover:-translate-y-1"
                        >
                            {isCheckingOut ? 'Checking Out...' : <><Square size={20} fill="currentColor" /> Check Out</>}
                        </button>
                    )}

                    {status === 'checked out' && (
                        <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed">
                            Completed
                        </button>
                    )}
                </div>

                {/* Right Column: Stats & Activity */}
                <div className="lg:col-span-2 flex flex-col gap-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* On Time Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-blue-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">On Time</p>
                                    <h3 className="text-4xl font-bold text-gray-900">{stats.totalPresent || 0}</h3>
                                </div>
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                    <CheckCircle size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                    100%
                                </span>
                                <span className="text-xs text-gray-400">Days this month</span>
                            </div>
                        </div>

                        {/* Late Arrivals Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-yellow-200 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Late Arrivals</p>
                                    <h3 className="text-4xl font-bold text-gray-900">{stats.totalLate || 0}</h3>
                                </div>
                                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                                    <AlertCircle size={24} />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    0%
                                </span>
                                <span className="text-xs text-gray-400">Days this month</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <LayoutDashboard size={20} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                            </div>
                            <Link to="/employee/history" className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                View History
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b border-gray-100">
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timing</th>
                                        <th className="pb-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Hrs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.slice(0, 5).map((log, index) => (
                                            <tr key={index} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 text-sm font-medium text-gray-900">
                                                    {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${log.status === 'present' ? 'bg-green-100 text-green-700' :
                                                        log.status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                                                            log.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-sm text-gray-500 font-mono">
                                                    {log.checkInTime ? formatTime(log.checkInTime) : '--:--'} - {log.checkOutTime ? formatTime(log.checkOutTime) : '--:--'}
                                                </td>
                                                <td className="py-4 text-sm font-bold text-gray-900 text-right">
                                                    {formatDuration(log.totalHours)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-400 text-sm">
                                                No recent activity found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard
