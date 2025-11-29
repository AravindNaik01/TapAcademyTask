import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useGetTodayQuery, useGetMySummaryQuery } from './attendanceApi.js'
import CheckInOutButtons from './CheckInOutButtons.jsx'
import { formatDate, formatTime } from '../../utils/date.js'

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const { data: todayData, isLoading: isLoadingToday } = useGetTodayQuery()
  const { data: summaryData, isLoading: isLoadingSummary } = useGetMySummaryQuery()

  const attendance = todayData?.data?.attendance
  const status = todayData?.data?.status || 'not checked in'

  if (isLoadingToday || isLoadingSummary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">
          Employee ID: {user?.employeeId} | Department: {user?.department}
        </p>
      </div>


      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Today's Attendance</h2>
        <div className="mb-4">
          <p className="text-sm text-gray-600">Status: <span className="font-semibold">{status}</span></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Check In</p>
            <p className="text-xl font-bold">
              {attendance?.checkInTime ? formatTime(attendance.checkInTime) : 'N/A'}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Check Out</p>
            <p className="text-xl font-bold">
              {attendance?.checkOutTime ? formatTime(attendance.checkOutTime) : 'N/A'}
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-xl font-bold">{attendance?.totalHours || 0} hrs</p>
          </div>
        </div>

      </div>

      {summaryData?.data && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Last 7 Days</h2>
              <Link
                to="/employee/history"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Full History →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaryData.data.last7Days?.length > 0 ? (
                    summaryData.data.last7Days.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkInTime ? formatTime(record.checkInTime) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkOutTime ? formatTime(record.checkOutTime) : 'N/A'}
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

          {summaryData.data.statistics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Total Present</p>
                <p className="text-3xl font-bold text-green-600">
                  {summaryData.data.statistics.totalPresent || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Half Days</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {summaryData.data.statistics.totalHalfDay || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-3xl font-bold text-red-600">
                  {summaryData.data.statistics.totalAbsent || 0}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EmployeeDashboard

