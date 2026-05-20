import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import { setCartDrawerOpen } from '@store/slices/uiSlice'
import { fetchCart, updateCartItem, removeCartItem } from '@store/slices/cartSlice'

const CartDrawer = () => {
  const dispatch = useDispatch()
  const { cartDrawerOpen } = useSelector((state) => state.ui)
  const { items, subtotal, isLoading } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (cartDrawerOpen && isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [cartDrawerOpen, isAuthenticated, dispatch])

  if (!cartDrawerOpen) return null

  const handleClose = () => {
    dispatch(setCartDrawerOpen(false))
  }

  const handleUpdateQty = (itemId, currentQty, amount) => {
    const newQty = currentQty + amount
    if (newQty < 1) return
    dispatch(updateCartItem({ itemId, quantity: newQty }))
  }

  const handleRemove = (itemId) => {
    dispatch(removeCartItem(itemId))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
        {/* Sliding Panel */}
        <div className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!isAuthenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-gray-500 mb-4">Please login to view your cart</p>
                <Link
                  to="/login"
                  onClick={handleClose}
                  className="btn-primary py-2 px-6 text-sm"
                >
                  Login Now
                </Link>
              </div>
            ) : isLoading && items.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <span className="text-5xl mb-3">🛒</span>
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Link
                  to="/shop"
                  onClick={handleClose}
                  className="btn-primary py-2 px-6 text-sm"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 border-b border-gray-100 last:border-b-0"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                      <img
                        src={item.product?.main_image || '/api/placeholder/100/100'}
                        alt={item.product?.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                          {item.product?.name}
                        </h4>
                        <span className="text-xs text-gray-400">
                          {item.product?.brand || 'Electronics'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                            className="px-2 py-0.5 hover:bg-gray-100 border-r"
                          >
                            -
                          </button>
                          <span className="px-3 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 border-l"
                          >
                            +
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary-600 text-sm">
                            {parseInt(item.subtotal).toLocaleString()} ETB
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {isAuthenticated && items.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-xl font-bold text-gray-800">
                  {parseInt(subtotal).toLocaleString()} ETB
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Shipping and taxes calculated at checkout.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/cart"
                  onClick={handleClose}
                  className="btn-secondary text-center py-2.5 text-sm"
                >
                  View Cart
                </Link>
                <Link
                  to="/checkout"
                  onClick={handleClose}
                  className="btn-primary text-center py-2.5 text-sm"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartDrawer
