
import api from './api'

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register/', userData)
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
    }
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials)
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
    }
    return response.data
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken })
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/')
    return response.data
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile/', userData)
    return response.data
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password/', passwordData)
    return response.data
  },
}