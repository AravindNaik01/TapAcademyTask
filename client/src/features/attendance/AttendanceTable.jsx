import { useState } from 'react'
import { formatDate, formatDateTime, formatDuration } from '../../utils/date.js'

const AttendanceTable = ({ attendance = [], showEmployeeColumn = false, onEmployeeClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedAttendance = [...attendance].sort((a, b) => {
    if (!sortConfig.key) return 0
    let aVal = a[sortConfig.key]
    let bVal = b[sortConfig.key]

    if (sortConfig.key === 'date') {
      aVal = new Date(a.date + 'T00:00:00')
      bVal = new Date(b.date + 'T00:00:00')
    } else if (sortConfig.key === 'totalHours') {
      aVal = a.totalHours || 0
      bVal = b.totalHours || 0
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile Card View */}
      <div className="md:hidden">
        {sortedAttendance.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {sortedAttendance.map((record) => (
              <div
                key={record._id}
                className={`p-4 ${onEmployeeClick && record.userId ? 'cursor-pointer active:bg-gray-50' : ''}`}
                onClick={() => onEmployeeClick && record.userId && onEmployeeClick(record.userId.employeeId || record.userId._id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{formatDate(record.date)}</p>
                    {showEmployeeColumn && (
                      <p className="text-xs text-gray-500">{record.userId?.name || 'N/A'}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'present'
                      ? 'bg-green-100 text-green-800'
                      : record.status === 'half-day'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {record.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Check In</p>
                    <p>{record.checkInTime ? formatDateTime(record.checkInTime) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Check Out</p>
                    <p>{record.checkOutTime ? formatDateTime(record.checkOutTime) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Total Hours</p>
                    <p>{record.totalHours ? formatDuration(record.totalHours) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-gray-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {showEmployeeColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
              )}
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Date <SortIcon columnKey="date" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check In
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Check Out
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalHours')}
              >
                Total Hours <SortIcon columnKey="totalHours" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedAttendance.length > 0 ? (
              sortedAttendance.map((record) => (
                <tr
                  key={record._id}
                  className={onEmployeeClick && record.userId ? 'cursor-pointer hover:bg-gray-50' : ''}
                  onClick={() => onEmployeeClick && record.userId && onEmployeeClick(record.userId.employeeId || record.userId._id)}
                >
                  {showEmployeeColumn && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.userId?.name || 'N/A'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkInTime ? formatDateTime(record.checkInTime) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkOutTime ? formatDateTime(record.checkOutTime) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.totalHours ? formatDuration(record.totalHours) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'present'
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
                <td colSpan={showEmployeeColumn ? 6 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No attendance records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceTable
