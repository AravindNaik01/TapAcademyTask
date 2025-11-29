import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../services/authService'

// Load user from localStorage
const userFromStorage = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null

const tokenFromStorage = localStorage.getItem('token') || null

const initialState = {
  user: userFromStorage,
  token: tokenFromStorage,
  isAuthenticated: !!tokenFromStorage,
  loading: false,
  error: null,
}

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      )
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser()
      return response.data
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      )
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loadUser: (state) => {
      const user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user'))
        : null
      const token = localStorage.getItem('token') || null

      if (user && token) {
        state.user = user
        state.token = token
        state.isAuthenticated = true
      }
    },
    logout: (state) => {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.data
        state.token = action.payload.data.accessToken
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.data.accessToken)
        localStorage.setItem('user', JSON.stringify(action.payload.data))
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.data
        state.token = action.payload.data.accessToken
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.data.accessToken)
        localStorage.setItem('user', JSON.stringify(action.payload.data))
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get current user
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data
        localStorage.setItem('user', JSON.stringify(action.payload.data))
      })
  },
})

export const { logout, loadUser, clearError } = authSlice.actions
export default authSlice.reducer

