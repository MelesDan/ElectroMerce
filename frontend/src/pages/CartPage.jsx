import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { fetchCart, updateCartItem, removeCartItem, clearCart } from '@store/slices/cartSlice'

const CartPage = () => {
  const dispatch = useDispatch()
  const { items, subtotal, isLoading } = useSelector((state) => state.cart)
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart())
    }
  }, [dispatch, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Please log in</h2>
        <p className="text-gray-500 mb-6">You need to be logged in to view your shopping cart.</p>
        <Link to="/login" className="btn-primary py-3 px-8 text-sm">
          Login Now
        </Link>
      </div>
    )
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="container-custom py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <span className="text-6xl mb-4 block">🛒</span>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added any products to your cart yet.</p>
        <Link to="/shop" className="btn-primary py-3 px-8 text-sm">
          Start Shopping
        </Link>
      </div>
    )
  }

  const handleUpdateQty = (itemId, currentQty, amount) => {
    const newQty = currentQty + amount
    if (newQty < 1) return
    dispatch(updateCartItem({ itemId, quantity: newQty }))
  }

  const handleRemoveItem = (itemId) => {
    dispatch(removeCartItem(itemId))
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart())
    }
  }

  // Calculations (15% VAT for Ethiopia)
  const numericSubtotal = parseFloat(subtotal) || 0
  const tax = numericSubtotal * 0.15
  const shipping = 0 // Free shipping
  const total = numericSubtotal + tax + shipping

  return (
    <div className="container-custom py-10 text-left">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center">
                  {/* Product Details */}
                  <div className="col-span-1 md:col-span-6 flex gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                      <img
                        src={item.product?.main_image || '/api/placeholder/100/100'}
                        alt={item.product?.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                        <Link to={`/product/${item.product?.slug}`} className="hover:text-primary-600 transition-colors">
                          {item.product?.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 uppercase font-medium tracking-wide">
                        Brand: {item.product?.brand || 'Generic'}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 text-xs font-medium mt-2 flex items-center gap-1 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 md:col-span-2 text-left md:text-center">
                    <span className="text-xs text-gray-400 md:hidden font-semibold block uppercase">Price</span>
                    <span className="text-sm text-gray-700">
                      {parseInt(item.product?.price).toLocaleString()} ETB
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-1 md:col-span-2 flex flex-col items-start md:items-center">
                    <span className="text-xs text-gray-400 md:hidden font-semibold block uppercase mb-1">Quantity</span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                        className="px-2.5 py-1 hover:bg-gray-50 border-r border-gray-200 text-gray-500 font-semibold"
                      >
                        -
                      </button>
                      <span className="px-4 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                        className="px-2.5 py-1 hover:bg-gray-50 border-l border-gray-200 text-gray-500 font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total Subtotal */}
                  <div className="col-span-1 md:col-span-2 text-left md:text-right">
                    <span className="text-xs text-gray-400 md:hidden font-semibold block uppercase">Total</span>
                    <span className="font-bold text-primary-600">
                      {parseInt(item.subtotal).toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1.5 text-sm">
              <ArrowLeftIcon className="w-4 h-4" /> Continue Shopping
            </Link>
            <button
              onClick={handleClearCart}
              className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors"
            >
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 self-start space-y-6">
          <h3 className="font-bold text-gray-800 text-lg pb-4 border-b border-gray-100">Order Summary</h3>

          <div className="space-y-3.5 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">{numericSubtotal.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%)</span>
              <span className="font-semibold text-gray-800">{tax.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600 font-semibold">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-4 border-t border-gray-100">
              <span>Order Total</span>
              <span className="text-primary-600">{total.toLocaleString()} ETB</span>
            </div>
          </div>

          <Link to="/checkout" className="btn-primary w-full block text-center py-3 text-sm rounded-lg shadow-sm">
            Proceed to Checkout
          </Link>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
            📢 <strong>Notice:</strong> Payments are securely processed via the **Chapa** payment gateway, supporting CBE Birr, Telebirr, and all major cards in Ethiopia.
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
