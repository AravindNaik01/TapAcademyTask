import { Link } from 'react-router-dom'
import { useGetManagerDashboardQuery } from './attendanceApi.js'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts'
import { Users, UserCheck, UserX, Clock, AlertCircle } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const dateObj = new Date(data.fullDate)
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="font-semibold text-gray-900 mb-2">{`${label}, ${formattedDate}`}</p>
        {payload.map((entry, index) => {
          if (['Holiday', 'No Data', 'holidayLabel'].includes(entry.name)) return null
          return (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 capitalize">{entry.name}:</span>
              <span className="font-medium text-gray-900">{entry.value}</span>
            </div>
          )
        })}
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total:</span>
            <span className="font-medium text-gray-900">{data.total}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-green-600">Present:</span>
            <span className="font-medium text-gray-900">{data.present}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-red-600">Absent:</span>
            <span className="font-medium text-gray-900">{data.absent}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const ManagerDashboard = () => {
  const { data, isLoading, error } = useGetManagerDashboardQuery()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error.data?.message || 'Failed to load dashboard data'}
        </div>
      </div>
    )
  }

  const { stats, charts, absentEmployees } = data?.data || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
        <div className="text-sm text-gray-500">
          Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Employees</span>
          </div>
          <div className="flex items-baseline">
            <h2 className="text-3xl font-bold text-gray-900">{stats?.totalEmployees || 0}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Present Today</span>
          </div>
          <div className="flex items-baseline">
            <h2 className="text-3xl font-bold text-gray-900">{stats?.present || 0}</h2>
            <span className="ml-2 text-sm text-gray-500">
              {stats?.totalEmployees ? Math.round((stats.present / stats.totalEmployees) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <UserX className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Absent Today</span>
          </div>
          <div className="flex items-baseline">
            <h2 className="text-3xl font-bold text-gray-900">{stats?.absent || 0}</h2>
            <span className="ml-2 text-sm text-gray-500">
              {stats?.totalEmployees ? Math.round((stats.absent / stats.totalEmployees) * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Late Arrivals</span>
          </div>
          <div className="flex items-baseline">
            <h2 className="text-3xl font-bold text-gray-900">{stats?.late || 0}</h2>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Weekly Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Attendance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(charts?.weeklyTrend || []).map(d => {
                  const isHoliday = d.status === 'Holiday';
                  const isNoData = d.status === 'No Data';
                  const hasData = (d.present || 0) > 0;
                  const maxVal = 6;
                  return {
                    ...d,
                    onTime: (d.present || 0) - (d.late || 0),
                    holiday: (isHoliday && !hasData) ? maxVal : 0,
                    noData: isNoData ? maxVal : 0,
                    // Helper bar for holiday label when data exists
                    holidayLabel: (isHoliday && hasData) ? 0.1 : 0
                  };
                })}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="onTime" name="On Time" stackId="a" fill="#10B981" barSize={32} />
                <Bar dataKey="late" name="Late" stackId="a" fill="#F59E0B" barSize={32} />
                <Bar dataKey="absent" name="Absent" stackId="a" fill="#EF4444" barSize={32} radius={[4, 4, 0, 0]} />

                {/* Status Bars */}
                <Bar dataKey="holiday" name="Holiday" stackId="a" fill="#FEF3C7" barSize={32} radius={[4, 4, 0, 0]} />
                <Bar dataKey="noData" name="No Data" stackId="a" fill="#F3F4F6" barSize={32} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="status" position="center" fill="#9CA3AF" fontSize={10} fontWeight="bold" formatter={(val) => val === 'No Data' ? 'No Data' : ''} />
                </Bar>

                {/* Transparent bar for Holiday Label when data exists */}
                <Bar dataKey="holidayLabel" stackId="a" fill="transparent" barSize={32} legendType="none" isAnimationActive={false}>
                  <LabelList
                    dataKey="status"
                    position="center"
                    fill="#FFFFFF"
                    fontSize={12}
                    fontWeight="bold"
                    angle={-90}
                    dy={40}
                    formatter={(val) => val === 'Holiday' ? 'Holiday' : ''}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Department-wise Attendance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.department || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts?.department || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Absent List & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Absent Employees List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Absent Employees Today</h3>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
              {absentEmployees?.length || 0} Absent
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {absentEmployees?.length > 0 ? (
                  absentEmployees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                              {employee.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.employeeId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Absent
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <UserCheck className="w-12 h-12 text-green-200 mb-2" />
                        <p>Everyone is present today!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <Link
              to="/manager/attendance"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-indigo-700">All Attendance</p>
                  <p className="text-sm text-gray-500 mt-1">View full records</p>
                </div>
                <Users className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>

            <Link
              to="/manager/calendar"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-indigo-700">Calendar View</p>
                  <p className="text-sm text-gray-500 mt-1">Monthly overview</p>
                </div>
                <Clock className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>

            <Link
              to="/manager/reports"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-indigo-700">Reports</p>
                  <p className="text-sm text-gray-500 mt-1">Export data</p>
                </div>
                <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
