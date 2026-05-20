import api from './api'

export const recommendationService = {
  getPersonalizedRecommendations: async (limit = 10) => {
    const response = await api.get('/recommendations/personalized/', { params: { limit } })
    return response.data
  },

  getRelatedProducts: async (productId, limit = 8) => {
    const response = await api.get(`/recommendations/related/${productId}/`, { params: { limit } })
    return response.data
  },

  getTrendingProducts: async (limit = 10) => {
    const response = await api.get('/recommendations/trending/', { params: { limit } })
    return response.data
  },

  getSimilarProducts: async (productId, limit = 8) => {
    const response = await api.get(`/recommendations/similar/${productId}/`, { params: { limit } })
    return response.data
  },

  trackInteraction: async (productId, action) => {
    const response = await api.post('/recommendations/track/', { product_id: productId, action })
    return response.data
  },
}