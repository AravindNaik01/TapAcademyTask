import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useGetTodayQuery } from './attendanceApi.js'
import CheckInOutButtons from './CheckInOutButtons.jsx'
import { formatTime, formatDate, getYYYYMMDD } from '../../utils/date.js'

const MarkAttendance = () => {
  const { user } = useSelector((state) => state.auth)
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data: todayData, isLoading, error, refetch } = useGetTodayQuery(undefined, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
    skip: !user || user.role !== 'employee',
  })

  const attendance = todayData?.data?.attendance
  const status = todayData?.data?.status || 'not checked in'

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Calculate elapsed time if checked in but not checked out
  const getElapsedTime = () => {
    if (!attendance?.checkInTime || attendance?.checkOutTime) return null
    const checkInTime = new Date(attendance.checkInTime)
    const elapsed = (currentTime - checkInTime) / 1000 / 60 / 60 // hours
    return elapsed.toFixed(2)
  }

  const elapsedHours = getElapsedTime()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-semibold mb-2">Error Loading Attendance</p>
            <p className="text-red-600 text-sm">{error.data?.message || 'Failed to load attendance data'}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked in':
        return 'bg-green-100 text-green-800 border-green-400 shadow-lg'
      case 'checked out':
        return 'bg-blue-100 text-blue-800 border-blue-400 shadow-lg'
      case 'not checked in':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked in':
        return '✓'
      case 'checked out':
        return '✓✓'
      case 'not checked in':
        return '○'
      default:
        return '○'
    }
  }

  const todayDate = getYYYYMMDD()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mark Attendance</h1>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </p>
          <p className="text-sm text-gray-500">
            Employee ID: {user?.employeeId} | Department: {user?.department}
          </p>
        </div>

        {/* Current Time Display */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 mb-6 text-white">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-1">Current Time</p>
            <p className="text-4xl font-bold font-mono">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </p>
            <p className="text-sm opacity-90 mt-2">{formatDate(todayDate)}</p>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2">
          <h2 className="text-xl font-semibold mb-4">Today's Attendance Status</h2>

          {/* Status Badge */}
          <div className="flex items-center justify-center mb-6">
            <div
              className={`px-8 py-6 rounded-xl border-2 transition-all duration-300 ${getStatusColor(
                status
              )} text-center min-w-[250px] transform hover:scale-105`}
            >
              <div className="text-5xl mb-3 animate-pulse">{getStatusIcon(status)}</div>
              <div className="text-xl font-bold capitalize">{status}</div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="border-2 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">Check In Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance?.checkInTime ? (
                  <span className="text-green-600">{formatTime(attendance.checkInTime)}</span>
                ) : (
                  <span className="text-gray-400">--:--</span>
                )}
              </p>
            </div>
            <div className="border-2 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">Check Out Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance?.checkOutTime ? (
                  <span className="text-blue-600">{formatTime(attendance.checkOutTime)}</span>
                ) : (
                  <span className="text-gray-400">--:--</span>
                )}
              </p>
            </div>
            <div className="border-2 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                {attendance?.checkOutTime ? 'Total Hours' : elapsedHours ? 'Elapsed Time' : 'Total Hours'}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance?.checkOutTime ? (
                  <span className="text-purple-600">{attendance.totalHours?.toFixed(2) || '0.00'} hrs</span>
                ) : elapsedHours ? (
                  <span className="text-orange-600 animate-pulse">{elapsedHours} hrs</span>
                ) : (
                  <span className="text-gray-400">0 hrs</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Actions</h3>
            <CheckInOutButtons />
          </div>
        </div>

        {/* Live Status Indicator */}
        {status === 'checked in' && !attendance?.checkOutTime && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  You are currently checked in. Working time is being tracked...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">ℹ️</span>
            Instructions
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>Click <strong className="text-blue-900">"Check In"</strong> when you arrive at work</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>Click <strong className="text-blue-900">"Check Out"</strong> when you leave work</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>You can only check in once per day</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>You must check in before you can check out</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>Total working hours are calculated automatically when you check out</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 font-bold">•</span>
              <span>Elapsed time is shown in real-time while checked in</span>
            </li>
          </ul>
        </div>

        {/* Today's Summary */}
        {attendance && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Today's Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Attendance Status</p>
                <p className="text-lg font-semibold capitalize text-gray-900">
                  {attendance.status || 'N/A'}
                </p>
              </div>
              {attendance.checkInTime && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {attendance.checkOutTime ? 'Working Hours' : 'Currently Working'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {attendance.checkOutTime
                      ? `${attendance.totalHours?.toFixed(2) || 0} hours`
                      : elapsedHours
                        ? `${elapsedHours} hours`
                        : 'Just started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="mt-4 text-center text-xs text-gray-500">
          <span className="inline-flex items-center">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Auto-refreshing every 30 seconds
          </span>
        </div>
      </div>
    </div>
  )
}

export default MarkAttendance
