import { useState } from 'react'
import { useGetAllAttendanceQuery, useGetTodayStatusQuery } from './attendanceApi.js'
import { formatDate, getMonthStartEnd } from '../../utils/date.js'

const TeamCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const { startDate, endDate } = getMonthStartEnd(currentMonth)
  const { data: attendanceData } = useGetAllAttendanceQuery({
    startDate,
    endDate,
    limit: 1000,
  })
  const { data: todayStatusData } = useGetTodayStatusQuery()

  const attendance = attendanceData?.data || []

  const daysInMonth = new Date(
    parseInt(currentMonth.split('-')[0]),
    parseInt(currentMonth.split('-')[1]),
    0
  ).getDate()
  const firstDayOfMonth = new Date(
    parseInt(currentMonth.split('-')[0]),
    parseInt(currentMonth.split('-')[1]) - 1,
    1
  ).getDay()

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowModal(true)
  }

  const getDateAttendance = (date) => {
    const dateStr = date
    const dayAttendance = attendance.filter((record) => record.date === dateStr)
    const present = dayAttendance.filter((r) => ['present', 'late', 'half-day'].includes(r.status)).length
    const absent = dayAttendance.filter((r) => r.status === 'absent').length
    return { present, absent, total: dayAttendance.length }
  }

  const renderCalendar = () => {
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`
      const stats = getDateAttendance(dateStr)
      days.push(
        <div
          key={day}
          className="p-2 border border-gray-200 hover:bg-gray-50 cursor-pointer min-h-[100px]"
          onClick={() => handleDateClick(dateStr)}
        >
          <div className="font-semibold">{day}</div>
          {stats.total > 0 && (
            <div className="text-xs mt-1">
              <div className="text-green-600">P: {stats.present}</div>
              <div className="text-red-600">A: {stats.absent}</div>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200">
        {dayNames.map((day) => (
          <div key={day} className="p-2 font-semibold bg-gray-100 text-center">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  const getSelectedDateAttendance = () => {
    if (!selectedDate) return []
    return attendance.filter((record) => record.date === selectedDate)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Calendar</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
          <input
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">{renderCalendar()}</div>

      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Attendance for {formatDate(selectedDate)}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
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
                  {getSelectedDateAttendance().length > 0 ? (
                    getSelectedDateAttendance().map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.userId?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkInTime
                            ? new Date(record.checkInTime).toLocaleTimeString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.checkOutTime
                            ? new Date(record.checkOutTime).toLocaleTimeString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.totalHours || 0} hrs
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
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No attendance records for this date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamCalendar

