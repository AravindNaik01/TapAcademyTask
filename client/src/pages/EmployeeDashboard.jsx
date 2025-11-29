import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import attendanceService from '../services/attendanceService'

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    loadSummary()
  }, [])

  const loadSummary = async () => {
    try {
      setLoading(true)
      const response = await attendanceService.getMySummary()
      setSummary(response.data.data)
    } catch (error) {
      console.error('Error loading summary:', error)
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to load summary',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true)
      setMessage(null)
      const response = await attendanceService.checkIn()
      setMessage({
        type: 'success',
        text: response.data.message || 'Checked in successfully!',
      })
      await loadSummary()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to check in',
      })
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true)
      setMessage(null)
      const response = await attendanceService.checkOut()
      setMessage({
        type: 'success',
        text: response.data.message || 'Checked out successfully!',
      })
      await loadSummary()
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to check out',
      })
    } finally {
      setCheckingOut(false)
    }
  }

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const todayAttendance = summary?.today
  const canCheckIn = !todayAttendance?.checkInTime
  const canCheckOut = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Employee ID: {user?.employeeId} | Department: {user?.department}
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700 border border-green-400'
              : 'bg-red-100 text-red-700 border border-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Today's Status Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Today's Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Check In</p>
            <p className="text-xl font-bold">
              {formatTime(todayAttendance?.checkInTime)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Check Out</p>
            <p className="text-xl font-bold">
              {formatTime(todayAttendance?.checkOutTime)}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-xl font-bold">
              {todayAttendance?.totalHours || 0} hrs
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={!canCheckIn || checkingIn}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold ${
              canCheckIn
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {checkingIn ? 'Checking In...' : 'Check In'}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!canCheckOut || checkingOut}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold ${
              canCheckOut
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {checkingOut ? 'Checking Out...' : 'Check Out'}
          </button>
        </div>
      </div>

      {/* Last 7 Days */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Last 7 Days</h2>
          <Link
            to="/history"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            View Full History →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {summary?.last7Days && summary.last7Days.length > 0 ? (
                summary.last7Days.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.totalHours || 0} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'half-day'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      {summary?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Total Present</p>
            <p className="text-3xl font-bold text-green-600">
              {summary.statistics.totalPresent}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Half Days</p>
            <p className="text-3xl font-bold text-yellow-600">
              {summary.statistics.totalHalfDay}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-3xl font-bold text-red-600">
              {summary.statistics.totalAbsent}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeDashboard

