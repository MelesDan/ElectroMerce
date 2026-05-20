import React, { useEffect, useState } from 'react'
import { recommendationService } from '@services/recommendationService'
import ProductCard from '@components/products/ProductCard'

const RelatedProducts = ({ productId }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productId) {
      fetchRelated()
    }
  }, [productId])

  const fetchRelated = async () => {
    try {
      setLoading(true)
      const data = await recommendationService.getRelatedProducts(productId)
      setProducts(data.results || data)
    } catch (error) {
      console.error('Error fetching related products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-gray-100 h-72 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <div className="mt-16">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default RelatedProducts
