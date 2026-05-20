import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaStar, FaStarHalfAlt, FaRegStar, FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { addToCart } from '@store/slices/cartSlice'
import { productService } from '@services/productService'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!product.is_in_stock) {
      toast.error('Product is out of stock')
      return
    }
    dispatch(addToCart({ productId: product.id, quantity: 1 }))
  }

  const handleWishlistToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please login to use wishlist')
      return
    }

    setIsWishlistLoading(true)
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
      toast.error(error.response?.data?.message || 'Error updating wishlist')
    } finally {
      setIsWishlistLoading(false)
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

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-primary-100 transition-all duration-300 overflow-hidden relative"
    >
      {/* Badges & Wishlist */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.discount_percentage > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            -{product.discount_percentage}%
          </span>
        )}
        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
          product.condition === 'new'
            ? 'bg-blue-100 text-blue-800'
            : product.condition === 'refurbished'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-orange-100 text-orange-800'
        }`}>
          {product.condition}
        </span>
      </div>

      <button
        onClick={handleWishlistToggle}
        disabled={isWishlistLoading}
        className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-500 hover:text-red-500 p-2 rounded-full shadow-sm transition-colors duration-200"
      >
        {isWishlisted ? (
          <FaHeart className="text-red-500 w-4 h-4" />
        ) : (
          <FaRegHeart className="w-4 h-4" />
        )}
      </button>

      {/* Product Image */}
      <div className="w-full h-48 bg-gray-50 flex items-center justify-center overflow-hidden p-4">
        <img
          src={product.main_image || '/api/placeholder/300/300'}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col justify-between h-44">
        <div>
          <span className="text-xs text-gray-400 block mb-1 uppercase font-medium tracking-wider">
            {product.category_name || product.brand || 'Electronics'}
          </span>
          <h3 className="font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors duration-200">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mt-2 gap-1">
            <div className="flex text-xs">{renderStars(product.rating)}</div>
            <span className="text-[11px] text-gray-400">({product.total_reviews})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
          <div>
            {product.compare_price && product.compare_price > product.price ? (
              <div className="flex flex-col">
                <span className="text-sm text-gray-400 line-through leading-none">
                  {parseInt(product.compare_price).toLocaleString()} ETB
                </span>
                <span className="text-base font-bold text-primary-600">
                  {parseInt(product.price).toLocaleString()} ETB
                </span>
              </div>
            ) : (
              <span className="text-base font-bold text-primary-600">
                {parseInt(product.price).toLocaleString()} ETB
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.is_in_stock}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              product.is_in_stock
                ? 'bg-primary-50 text-primary-600 hover:bg-primary-600 hover:text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={product.is_in_stock ? 'Add to Cart' : 'Out of stock'}
          >
            <FaShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
