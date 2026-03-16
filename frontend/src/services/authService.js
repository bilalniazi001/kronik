import api from './api'

const authService = {
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('userType', 'user')
        localStorage.setItem('role', response.data.user.role_type || 'employee')
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  adminLogin: async (credentials) => {
    try {
      const response = await api.post('/auth/admin/login', credentials)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.admin))
        localStorage.setItem('userType', 'admin')
      }
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: () => !!localStorage.getItem('token'),
  isAdmin: () => localStorage.getItem('userType') === 'admin',
}

export default authService