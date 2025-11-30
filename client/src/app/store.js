import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from './apiSlice.js'
import authReducer from '../features/auth/authSlice.js'

const toastReducer = (state = { message: null, type: null }, action) => {
  switch (action.type) {
    case 'toast/show':
      return { message: action.payload.message, type: action.payload.type }
    case 'toast/clear':
      return { message: null, type: null }
    default:
      return state
  }
}

// Load initial auth state from sessionStorage
const loadInitialAuthState = () => {
  try {
    const user = sessionStorage.getItem('user')
    const accessToken = sessionStorage.getItem('accessToken')

    return {
      user: user ? JSON.parse(user) : null,
      accessToken: accessToken || null,
    }
  } catch (error) {
    return {
      user: null,
      accessToken: null,
    }
  }
}

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    toast: toastReducer,
  },
  preloadedState: {
    auth: loadInitialAuthState(),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['api/executeQuery/fulfilled', 'api/executeQuery/rejected'],
        ignoredPaths: ['api.queries', 'api.mutations'],
      },
    }).concat(apiSlice.middleware),
})
