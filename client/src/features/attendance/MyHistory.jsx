import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useGetMyHistoryQuery } from './attendanceApi.js'
import AttendanceTable from './AttendanceTable.jsx'
import { formatDate } from '../../utils/date.js'

const MyHistory = () => {
  const { user } = useSelector((state) => state.auth)
  const [page, setPage] = useState(1)
  const [monthFilter, setMonthFilter] = useState('')

  const { data, isLoading, error } = useGetMyHistoryQuery({ page, limit: 30 }, {
    skip: !user || user.role !== 'employee',
  })

  const attendance = data?.data || []
  const totalPages = data?.pages || 1
  const currentPage = data?.page || 1

  let filteredAttendance = attendance
  if (monthFilter) {
    filteredAttendance = attendance.filter((record) => {
      const recordDate = new Date(record.date + 'T00:00:00')
      const filterDate = new Date(monthFilter + '-01')
      return (
        recordDate.getMonth() === filterDate.getMonth() &&
        recordDate.getFullYear() === filterDate.getFullYear()
      )
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Attendance History</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Month
          </label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.data?.message || 'Failed to load attendance history'}
        </div>
      )}

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : filteredAttendance.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">No attendance records found</p>
        </div>
      ) : (
        <>
          <AttendanceTable attendance={filteredAttendance} />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MyHistory

