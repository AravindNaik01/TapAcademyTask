import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: JSON.parse(sessionStorage.getItem('user')) || null,
  accessToken: sessionStorage.getItem('accessToken') || null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.accessToken = accessToken
      sessionStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('accessToken', accessToken)
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('accessToken')
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer

