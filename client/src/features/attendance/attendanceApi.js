import { apiSlice } from '../../app/apiSlice.js'

export const attendanceApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkIn: builder.mutation({
      query: () => ({
        url: '/attendance/checkin',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),
    checkOut: builder.mutation({
      query: () => ({
        url: '/attendance/checkout',
        method: 'POST',
      }),
      invalidatesTags: ['Attendance', 'Dashboard'],
    }),
    getToday: builder.query({
      query: () => '/attendance/today',
      providesTags: ['Attendance'],
    }),
    getMyHistory: builder.query({
      query: ({ page = 1, limit = 30 }) => ({
        url: '/attendance/my-history',
        params: { page, limit },
      }),
      providesTags: ['Attendance'],
    }),
    getMySummary: builder.query({
      query: () => '/attendance/my-summary',
      providesTags: ['Attendance', 'Dashboard'],
    }),
    getAllAttendance: builder.query({
      query: ({ startDate, endDate, employeeId, status, page = 1, limit = 50 }) => ({
        url: '/attendance/all',
        params: { startDate, endDate, employeeId, status, page, limit },
      }),
      providesTags: ['Attendance'],
    }),
    getEmployeeAttendance: builder.query({
      query: (id) => `/attendance/employee/${id}`,
      providesTags: ['Attendance'],
    }),
    getAttendanceSummary: builder.query({
      query: () => '/attendance/summary',
      providesTags: ['Attendance', 'Dashboard'],
    }),
    getTodayStatus: builder.query({
      query: (department) => ({
        url: '/attendance/today-status',
        params: department ? { department } : {},
      }),
      providesTags: ['Attendance'],
    }),
    exportCsv: builder.query({
      query: ({ startDate, endDate, employeeId, status }) => ({
        url: '/attendance/export',
        params: { startDate, endDate, employeeId, status },
        responseHandler: async (response) => {
          const blob = await response.blob()
          return { data: blob, type: response.headers.get('content-type') }
        },
      }),
    }),
    getEmployeeDashboard: builder.query({
      query: () => '/dashboard/employee',
      providesTags: ['Dashboard'],
    }),
    getManagerDashboard: builder.query({
      query: () => '/dashboard/manager',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useCheckInMutation,
  useCheckOutMutation,
  useGetTodayQuery,
  useGetMyHistoryQuery,
  useGetMySummaryQuery,
  useGetAllAttendanceQuery,
  useGetEmployeeAttendanceQuery,
  useGetAttendanceSummaryQuery,
  useGetTodayStatusQuery,
  useLazyExportCsvQuery,
  useGetEmployeeDashboardQuery,
  useGetManagerDashboardQuery,
} = attendanceApi

