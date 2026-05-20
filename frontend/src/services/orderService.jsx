import api from './api'

export const orderService = {
  getOrders: async () => {
    const response = await api.get('/orders/')
    return response.data
  },

  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/`)
    return response.data
  },

  createOrder: async (orderData) => {
    const response = await api.post('/orders/create/', orderData)
    return response.data
  },

  cancelOrder: async (orderId) => {
    const response = await api.post(`/orders/${orderId}/cancel/`)
    return response.data
  },
}