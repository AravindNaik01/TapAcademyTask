import { useState } from 'react'
import { useGetAllAttendanceQuery, useLazyExportCsvQuery } from './attendanceApi.js'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AttendanceTable from './AttendanceTable.jsx'
import { downloadCsv } from '../../utils/download.js'

const AllAttendance = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    status: '',
    page: 1,
    limit: 50,
  })

  const { data, isLoading, error } = useGetAllAttendanceQuery(filters)
  const [exportCsv, { isLoading: isExporting }] = useLazyExportCsvQuery()

  const attendance = data?.data || []
  const totalPages = data?.pages || 1
  const currentPage = data?.page || 1

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 })
  }

  const handleApplyFilters = () => {
    // Filters are applied automatically via query params
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      employeeId: '',
      status: '',
      page: 1,
      limit: 50,
    })
  }

  const handleEmployeeClick = (employeeId) => {
    navigate(`/manager/attendance/${employeeId}`)
  }

  const handleExport = async () => {
    try {
      const result = await exportCsv(filters).unwrap()
      downloadCsv(result.data, `attendance-export-${Date.now()}.csv`)
      dispatch({
        type: 'toast/show',
        payload: { message: 'CSV exported successfully!', type: 'success' },
      })
    } catch (err) {
      dispatch({
        type: 'toast/show',
        payload: { message: err.data?.message || 'Failed to export CSV', type: 'error' },
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">All Employees Attendance</h1>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              name="employeeId"
              value={filters.employeeId}
              onChange={handleFilterChange}
              placeholder="e.g., EMP001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="half-day">Half Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleApplyFilters}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.data?.message || 'Failed to load attendance'}
        </div>
      )}

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">Total Records: {data?.total || 0}</p>
          </div>
          <AttendanceTable
            attendance={attendance}
            onEmployeeClick={handleEmployeeClick}
            showEmployeeColumn={true}
          />
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
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

export default AllAttendance

