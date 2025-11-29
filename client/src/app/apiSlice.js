import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  prepareHeaders: (headers, { getState }) => {
    // Try to get token from Redux state first
    let token = getState().auth.accessToken
    
    // Fallback to localStorage if not in Redux state
    if (!token) {
      token = localStorage.getItem('accessToken')
    }
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
  credentials: 'include', // Include cookies for refresh token
})

// Custom baseQuery with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Try to refresh token using refresh endpoint
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )
    
    if (refreshResult.data) {
      // Store new access token
      const { accessToken } = refreshResult.data.data
      if (accessToken) {
        // Update localStorage
        localStorage.setItem('accessToken', accessToken)
        // Retry original query with new token
        result = await baseQuery(args, api, extraOptions)
      }
    } else {
      // Refresh failed, logout user
      api.dispatch({ type: 'auth/logout' })
      window.location.href = '/login'
    }
  }
  
  return result
}

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Attendance', 'User', 'Dashboard'],
  endpoints: () => ({}),
})

