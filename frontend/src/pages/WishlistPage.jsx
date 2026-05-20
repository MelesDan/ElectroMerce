import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { TrashIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'
import { productService } from '@services/productService'
import { addToCart } from '@store/slices/cartSlice'
import toast from 'react-hot-toast'

const WishlistPage = () => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const data = await productService.getWishlist()
      setWishlistItems(data.results || data)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      toast.error('Could not fetch wishlist items')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      await productService.removeFromWishlist(productId)
      toast.success('Removed from wishlist')
      // Update local state
      setWishlistItems((prev) => prev.filter((item) => item.product.id !== productId))
    } catch (error) {
      toast.error('Failed to remove item')
    }
  }

  const handleAddToCart = (product) => {
    if (!product.is_in_stock) {
      toast.error('Product is out of stock')
      return
    }
    dispatch(addToCart({ productId: product.id, quantity: 1 }))
    toast.success('Added to cart')
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Please log in</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your wishlist.</p>
        <Link to="/login" className="btn-primary py-3 px-8 text-sm">
          Login Now
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container-custom py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 text-left">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>

      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
          <span className="text-5xl mb-4 block font-bold text-gray-300">❤️</span>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Your Wishlist is Empty</h2>
          <p className="text-gray-500 mb-6 text-sm">Save your favorite electronics here to check back later.</p>
          <Link to="/shop" className="btn-primary py-2 px-6 text-sm">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product
            if (!product) return null
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
              >
                {/* Image & details */}
                <div>
                  <div className="w-full h-44 bg-gray-50 flex items-center justify-center p-4 relative">
                    <img
                      src={product.main_image || '/api/placeholder/200/200'}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    {product.discount_percentage > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        -{product.discount_percentage}%
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-xs text-gray-400 block mb-1 uppercase tracking-wide">
                      {product.brand || 'Electronics'}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-primary-600">
                      <Link to={`/product/${product.slug}`}>{product.name}</Link>
                    </h3>
                    
                    <div className="mt-2.5">
                      {product.compare_price && product.compare_price > product.price ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-primary-600">
                            {parseInt(product.price).toLocaleString()} ETB
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            {parseInt(product.compare_price).toLocaleString()} ETB
                          </span>
                        </div>
                      ) : (
                        <span className="text-base font-bold text-primary-600">
                          {parseInt(product.price).toLocaleString()} ETB
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 border-t border-gray-100">
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="flex items-center justify-center gap-1.5 py-3 hover:bg-red-50/50 text-gray-500 hover:text-red-500 border-r border-gray-100 text-xs font-semibold transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" /> Remove
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.is_in_stock}
                    className={`flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors ${
                      product.is_in_stock
                        ? 'hover:bg-primary-50/50 text-primary-600 hover:text-primary-700'
                        : 'text-gray-400 bg-gray-50/50 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCartIcon className="w-4 h-4" /> {product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WishlistPage
