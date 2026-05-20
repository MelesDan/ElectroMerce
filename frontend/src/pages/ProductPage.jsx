import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa'
import { productService } from '@services/productService'
import { addToCart } from '@store/slices/cartSlice'
import RelatedProducts from '@components/recommendations/RelatedProducts'
import ProductReviews from '@components/products/ProductReviews'

const ProductPage = () => {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (product && isAuthenticated) {
      checkWishlistStatus()
    }
  }, [product, isAuthenticated])

  const fetchProduct = async () => {
    try {
      const data = await productService.getProduct(slug)
      setProduct(data)
    } catch (error) {
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    try {
      const wishlist = await productService.getWishlist()
      const list = wishlist.results || wishlist
      const found = list.some((item) => item.product.id === product.id)
      setIsWishlisted(found)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }
    dispatch(addToCart({ productId: product.id, quantity }))
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }

    try {
      if (isWishlisted) {
        await productService.removeFromWishlist(product.id)
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await productService.addToWishlist(product.id)
        setIsWishlisted(true)
        toast.success('Added to wishlist')
      }
    } catch (error) {
      toast.error('Failed to update wishlist')
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />)
    }
    while (stars.length < 5) {
      stars.push(<FaRegStar key={stars.length} className="text-yellow-400" />)
    }
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{product.name} | ElectroStore</title>
        <meta name="description" content={product.short_description} />
      </Helmet>

      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <a href="/" className="hover:text-primary-600">Home</a> / 
          <a href="/shop" className="hover:text-primary-600"> Shop</a> / 
          <span className="text-gray-800">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={product.main_image || '/api/placeholder/500/500'}
                alt={product.name}
                className="w-full h-[500px] object-contain"
              />
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex mr-2">
                {renderStars(product.rating)}
              </div>
              <span className="text-gray-500">({product.total_reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-4">
              {product.compare_price && product.compare_price > product.price ? (
                <>
                  <span className="text-3xl font-bold text-primary-600">
                    {product.price.toLocaleString()} ETB
                  </span>
                  <span className="text-lg text-gray-400 line-through ml-2">
                    {product.compare_price.toLocaleString()} ETB
                  </span>
                  <span className="ml-2 bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                    Save {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary-600">
                  {product.price.toLocaleString()} ETB
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.is_in_stock ? (
                <span className="badge badge-success">In Stock</span>
              ) : (
                <span className="badge badge-danger">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600 mb-6">{product.short_description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 border-r hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-1">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 border-l hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_in_stock}
                className="flex-1 btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className="px-6 py-3 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {isWishlisted ? <FaHeart className="text-primary-600" size={24} /> : <FaRegHeart size={24} />}
              </button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                <li><strong>Condition:</strong> {product.condition}</li>
                <li><strong>Warranty:</strong> {product.warranty_months} months</li>
                <li><strong>SKU:</strong> {product.sku}</li>
              </ul>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold mb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Description Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Description</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} productSlug={slug} />

        {/* Related Products */}
        <RelatedProducts productId={product.id} />
      </div>
    </>
  )
}

export default ProductPage