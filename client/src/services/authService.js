import api from './api'

const authService = {
  register: (userData) => {
    return api.post('/auth/register', userData)
  },

  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },

  getCurrentUser: () => {
    return api.get('/auth/me')
  },
}

export default authService

