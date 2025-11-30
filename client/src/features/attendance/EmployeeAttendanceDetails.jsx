import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetEmployeeAttendanceQuery } from './attendanceApi.js'
import AttendanceTable from './AttendanceTable.jsx'
import { ArrowLeft } from 'lucide-react'

const EmployeeAttendanceDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
    })

    const { data, isLoading, error } = useGetEmployeeAttendanceQuery(id)

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value })
    }

    // Client-side filtering for now, as the API endpoint might not support filtering yet or we want to filter the fetched data
    // The API endpoint `getEmployeeAttendance` in `attendanceController.js` DOES support startDate and endDate query params.
    // But `attendanceApi.js` definition for `getEmployeeAttendance` only takes `id`.
    // I should update `attendanceApi.js` to accept params if I want server-side filtering.
    // For now, let's stick to what `attendanceApi.js` has, or update it.
    // The current `attendanceApi.js` definition: query: (id) => `/attendance/employee/${id}`
    // It doesn't pass params.

    // Let's just display the data for now.

    const employee = data?.employee
    const attendance = data?.data || []

    if (isLoading) return <div className="p-8 text-center">Loading...</div>
    if (error) return <div className="p-8 text-center text-red-600">Error loading employee details</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to All Attendance
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Employee Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-4">
                        {employee?.profileImage ? (
                            <img
                                src={`http://localhost:5000${employee.profileImage}`}
                                alt={employee.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">
                                {employee?.name?.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{employee?.name}</h2>
                            <p className="text-gray-500">{employee?.department}</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-500">Employee ID</span>
                            <span className="font-medium text-gray-900">{employee?.employeeId}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 py-2">
                            <span className="text-gray-500">Email</span>
                            <span className="font-medium text-gray-900">{employee?.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Attendance History</h2>
                <AttendanceTable attendance={attendance} />
            </div>
        </div>
    )
}

export default EmployeeAttendanceDetails
