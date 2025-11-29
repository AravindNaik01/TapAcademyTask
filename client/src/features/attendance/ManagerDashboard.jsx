import { Link } from 'react-router-dom'
import { useGetManagerDashboardQuery } from './attendanceApi.js'

const ManagerDashboard = () => {
  const { data, isLoading, error } = useGetManagerDashboardQuery()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error.data?.message || 'Failed to load dashboard data'}
        </div>
      </div>
    )
  }

  const dashboard = data?.data || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-2">Present Today</p>
          <p className="text-3xl font-bold text-green-600">
            {dashboard.today?.present || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-2">Absent Today</p>
          <p className="text-3xl font-bold text-red-600">
            {dashboard.today?.absent || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-2">Total Employees</p>
          <p className="text-3xl font-bold text-blue-600">
            {dashboard.month?.totalEmployees || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 mb-2">Month Check-ins</p>
          <p className="text-3xl font-bold text-purple-600">
            {dashboard.month?.totalCheckins || 0}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/manager/attendance"
            className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
          >
            <p className="font-semibold text-blue-600">All Attendance</p>
            <p className="text-sm text-gray-600 mt-1">View all employee attendance records</p>
          </Link>
          <Link
            to="/manager/calendar"
            className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
          >
            <p className="font-semibold text-blue-600">Calendar View</p>
            <p className="text-sm text-gray-600 mt-1">Monthly attendance calendar</p>
          </Link>
          <Link
            to="/manager/reports"
            className="block p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-center"
          >
            <p className="font-semibold text-blue-600">Reports</p>
            <p className="text-sm text-gray-600 mt-1">Generate attendance reports</p>
          </Link>
        </div>
      </div>

      {dashboard.performers && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
            <div className="space-y-2">
              {dashboard.performers.top?.length > 0 ? (
                dashboard.performers.top.map((performer, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{performer.name}</span>
                    <span className="text-sm text-gray-600">{performer.totalHours} hrs</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Needs Attention</h3>
            <div className="space-y-2">
              {dashboard.performers.bottom?.length > 0 ? (
                dashboard.performers.bottom.map((performer, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{performer.name}</span>
                    <span className="text-sm text-gray-600">{performer.totalHours} hrs</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard

