import api from './api'

const attendanceService = {
  // Employee endpoints
  checkIn: () => {
    return api.post('/attendance/checkin')
  },

  checkOut: () => {
    return api.post('/attendance/checkout')
  },

  getMyHistory: (page = 1, limit = 30) => {
    return api.get(`/attendance/my-history?page=${page}&limit=${limit}`)
  },

  getMySummary: () => {
    return api.get('/attendance/my-summary')
  },

  // Manager endpoints
  getAllAttendance: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.employeeId) params.append('employeeId', filters.employeeId)
    if (filters.status) params.append('status', filters.status)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    return api.get(`/attendance/all?${params.toString()}`)
  },

  getEmployeeAttendance: (employeeId, filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    return api.get(`/attendance/employee/${employeeId}?${params.toString()}`)
  },

  exportAttendance: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.employeeId) params.append('employeeId', filters.employeeId)
    if (filters.status) params.append('status', filters.status)

    return api.get(`/attendance/export?${params.toString()}`, {
      responseType: 'blob',
    })
  },
}

export default attendanceService

