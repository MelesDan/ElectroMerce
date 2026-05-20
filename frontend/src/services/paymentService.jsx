import api from './api'

export const paymentService = {
  initiatePayment: async (orderNumber) => {
    const response = await api.post(`/payments/initiate/${orderNumber}/`)
    return response.data
  },

  verifyPayment: async (txRef) => {
    const response = await api.get(`/payments/verify/${txRef}/`)
    return response.data
  },
}