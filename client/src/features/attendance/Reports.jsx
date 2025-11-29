import { useGetAttendanceSummaryQuery, useGetManagerDashboardQuery, useLazyExportCsvQuery } from './attendanceApi.js'
import { useDispatch } from 'react-redux'
import { downloadCsv } from '../../utils/download.js'

const Reports = () => {
  const dispatch = useDispatch()
  const { data: summaryData, isLoading: isLoadingSummary } = useGetAttendanceSummaryQuery()
  const { data: dashboardData, isLoading: isLoadingDashboard } = useGetManagerDashboardQuery()
  const [exportCsv, { isLoading: isExporting }] = useLazyExportCsvQuery()

  const handleExport = async () => {
    try {
      const result = await exportCsv({}).unwrap()
      downloadCsv(result.data, `attendance-report-${Date.now()}.csv`)
      dispatch({
        type: 'toast/show',
        payload: { message: 'Report exported successfully!', type: 'success' },
      })
    } catch (err) {
      dispatch({
        type: 'toast/show',
        payload: { message: err.data?.message || 'Failed to export report', type: 'error' },
      })
    }
  }

  if (isLoadingSummary || isLoadingDashboard) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const summary = summaryData?.data || {}
  const dashboard = dashboardData?.data || {}

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {isExporting ? 'Exporting...' : 'Export CSV Report'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Present:</span>
              <span className="font-semibold text-green-600">{summary.today?.present || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Absent:</span>
              <span className="font-semibold text-red-600">{summary.today?.absent || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Month's Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Check-ins:</span>
              <span className="font-semibold">{summary.month?.checkins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Hours:</span>
              <span className="font-semibold">{summary.month?.avgHours || 0} hrs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Average Hours
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboard.performers?.top?.length > 0 ? (
                dashboard.performers.top.map((performer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {performer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performer.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performer.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performer.totalHours} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {performer.avgHours} hrs
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No performance data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Reports

