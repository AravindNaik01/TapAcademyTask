import { useState } from 'react'
import { useGetAllAttendanceQuery } from './attendanceApi.js'
import { formatDate, getMonthStartEnd } from '../../utils/date.js'
import { ChevronLeft, ChevronRight, Users, CheckCircle, XCircle, Calendar as CalendarIcon, Star, Info } from 'lucide-react'

const TeamCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showModal, setShowModal] = useState(false)

  // Hardcoded holidays for demonstration - in a real app, fetch from API
  const holidays = {
    '01-01': 'New Year',
    '01-14': 'Pongal',
    '01-26': 'Republic Day',
    '05-01': 'Labor Day',
    '08-15': 'Independence Day',
    '10-02': 'Gandhi Jayanti',
    '11-01': 'Kannada Rajyotsava',
    '11-14': 'Children\'s Day',
    '12-25': 'Christmas'
  }

  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const { startDate, endDate } = getMonthStartEnd(currentMonthStr)

  const { data: attendanceData, isLoading } = useGetAllAttendanceQuery({
    startDate,
    endDate,
    limit: 1000,
  })

  const attendance = attendanceData?.data || []

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (day) => {
    const dateStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setShowModal(true)
  }

  const getDateAttendance = (day) => {
    const dateStr = `${currentMonthStr}-${String(day).padStart(2, '0')}`
    const dayAttendance = attendance.filter((record) => record.date === dateStr)
    const present = dayAttendance.filter((r) => ['present', 'late', 'half-day'].includes(r.status)).length
    const absent = dayAttendance.filter((r) => r.status === 'absent').length
    return { present, absent, total: dayAttendance.length }
  }

  const getSelectedDateAttendance = () => {
    if (!selectedDate) return []
    return attendance.filter((record) => record.date === selectedDate)
  }

  const getHolidayName = (day) => {
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    return holidays[`${month}-${dayStr}`]
  }

  const renderCalendarDays = () => {
    const days = []
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    // Empty cells for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 bg-gray-50/50 border-b border-r border-gray-100"></div>)
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const stats = getDateAttendance(day)
      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = new Date().toDateString() === dateObj.toDateString()
      const isWeekend = dateObj.getDay() === 0 // Sunday
      const holiday = getHolidayName(day)

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-20 border-b border-r border-gray-100 p-1 cursor-pointer transition-all hover:shadow-md group relative flex flex-col justify-between
            ${isToday ? 'bg-indigo-50/60 ring-1 ring-inset ring-indigo-200' :
              isWeekend ? 'bg-red-50/30' :
                holiday ? 'bg-amber-50/40' : 'bg-white hover:bg-gray-50'
            }`}
        >
          <div className="flex justify-between items-start">
            <div className={`
              w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium
              ${isToday ? 'bg-indigo-600 text-white shadow-sm' :
                isWeekend ? 'text-red-500' : 'text-gray-700'}
            `}>
              {day}
            </div>
            {holiday && (
              <div className="text-[9px] font-medium text-amber-600 bg-amber-100 px-1 py-0.5 rounded-full truncate max-w-[60px]" title={holiday}>
                {holiday}
              </div>
            )}
          </div>

          {/* Content Area */}
          <div className="mt-1 flex-1 flex flex-col justify-end gap-0.5">
            {stats.total > 0 ? (
              <>
                <div className="flex items-center justify-between text-[10px] bg-green-50/80 px-1 py-0.5 rounded border border-green-100">
                  <span className="text-green-700 font-medium flex items-center gap-0.5">
                    <CheckCircle size={8} /> P
                  </span>
                  <span className="font-bold text-green-800">{stats.present}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] bg-red-50/80 px-1 py-0.5 rounded border border-red-100">
                  <span className="text-red-700 font-medium flex items-center gap-0.5">
                    <XCircle size={8} /> A
                  </span>
                  <span className="font-bold text-red-800">{stats.absent}</span>
                </div>
              </>
            ) : (
              (isWeekend || holiday) ? (
                <div className="flex items-center justify-center h-full opacity-60">
                  <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider">
                    {holiday ? 'Holiday' : 'Off'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[9px] text-gray-300 italic">No Data</span>
                </div>
              )
            )}
          </div>
        </div>
      )
    }

    // Fill remaining grid cells
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7
    const remainingCells = totalCells - (firstDayOfMonth + daysInMonth)
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`remaining-${i}`} className="h-20 bg-gray-50/50 border-b border-r border-gray-100"></div>)
    }

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {dayNames.map((day, index) => (
            <div key={day} className={`py-2 text-center text-[10px] font-bold uppercase tracking-wider ${index === 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            Team Attendance
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
            title="Previous Month"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex flex-col items-center min-w-[140px]">
            <span className="font-bold text-gray-800 text-base">
              {currentDate.toLocaleString('default', { month: 'long' })}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              {currentDate.getFullYear()}
            </span>
          </div>

          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors"
            title="Next Month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      {renderCalendarDays()}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-red-50 border border-red-200 rounded"></div>
          <span>Weekend</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-amber-50 border border-amber-200 rounded"></div>
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle size={12} className="text-green-600" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle size={12} className="text-red-600" />
          <span>Absent</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Attendance Details
                </h2>
                <p className="text-gray-500 text-sm mt-1">{formatDate(selectedDate)}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getSelectedDateAttendance().length > 0 ? (
                      getSelectedDateAttendance().map((record) => (
                        <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                                {record.userId?.name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{record.userId?.name || 'N/A'}</div>
                                <div className="text-xs text-gray-500">{record.userId?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.totalHours ? <span className="font-medium">{record.totalHours} hrs</span> : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${record.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                              record.status === 'half-day' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                              <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-900">No attendance records found</p>
                            <p className="text-sm text-gray-500 mt-1">No employees checked in on this date.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamCalendar
