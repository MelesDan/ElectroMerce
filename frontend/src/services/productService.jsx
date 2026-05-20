import api from './api'

export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products/products/', { params })
    return response.data
  },

  getProduct: async (slug) => {
    const response = await api.get(`/products/products/${slug}/`)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/products/categories/')
    return response.data
  },

  getFeaturedProducts: async () => {
    const response = await api.get('/products/products/featured/')
    return response.data
  },

  getWishlist: async () => {
    const response = await api.get('/products/wishlist/')
    return response.data
  },

  addToWishlist: async (productId) => {
    const response = await api.post('/products/wishlist/', { product: productId })
    return response.data
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete('/products/wishlist/', { data: { product_id: productId } })
    return response.data
  },

  addReview: async (reviewData) => {
    const response = await api.post('/products/reviews/', reviewData)
    return response.data
  },

  getProductReviews: async (productSlug) => {
    const response = await api.get(`/products/products/${productSlug}/reviews/`)
    return response.data
  },
}