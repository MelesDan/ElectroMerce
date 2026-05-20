import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCart } from '@store/slices/cartSlice'
import { orderService } from '@services/orderService'
import api from '@services/api'
import toast from 'react-hot-toast'

const CheckoutPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, subtotal } = useSelector((state) => state.cart)
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // Billing/Shipping fields
  const [shippingName, setShippingName] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [shippingCity, setShippingCity] = useState('Addis Ababa')
  const [shippingPhone, setShippingPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('chapa')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    dispatch(fetchCart())
  }, [dispatch, isAuthenticated, navigate])

  useEffect(() => {
    if (user) {
      setShippingName(user.username || '')
      setShippingPhone(user.phone_number || '')
      setShippingAddress(user.address || '')
    }
  }, [user])

  if (items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Add products to your cart before checking out.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary py-3 px-8 text-sm">
          Go to Shop
        </button>
      </div>
    )
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!shippingName || !shippingAddress || !shippingPhone || !shippingCity) {
      toast.error('Please fill in all shipping fields')
      return
    }

    setSubmitting(true)
    try {
      // 1. Create order on backend
      const orderData = {
        shipping_name: shippingName,
        shipping_address: shippingAddress,
        shipping_city: shippingCity,
        shipping_phone: shippingPhone,
        payment_method: paymentMethod,
        notes,
      }
      const response = await orderService.createOrder(orderData)
      const { order, payment_url } = response

      // 2. Process based on payment method
      if (paymentMethod === 'chapa') {
        toast.loading('Redirecting to secure payment page...')
        // Call the initiation URL returned by the backend
        const initResponse = await api.post(payment_url)
        if (initResponse.data?.checkout_url) {
          window.location.href = initResponse.data.checkout_url
        } else {
          throw new Error('Could not retrieve payment checkout URL')
        }
      } else {
        // Cash on delivery or other methods: go straight to order success
        toast.success('Order placed successfully!')
        navigate(`/order-success/${order.order_number}`)
      }
    } catch (error) {
      toast.dismiss()
      toast.error(error.response?.data?.error || error.message || 'Failed to place order')
    } finally {
      setSubmitting(false)
    }
  }

  const numericSubtotal = parseFloat(subtotal) || 0
  const tax = numericSubtotal * 0.15
  const shipping = 0
  const total = numericSubtotal + tax + shipping

  return (
    <div className="container-custom py-10 text-left">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping Info & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 pb-3 border-b border-gray-100">Shipping Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="shipping-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  id="shipping-name"
                  type="text"
                  required
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="Recipient Name"
                />
              </div>

              <div>
                <label htmlFor="shipping-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  id="shipping-phone"
                  type="tel"
                  required
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="e.g. +251 9..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  id="shipping-address"
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="input-field py-2 text-sm"
                  placeholder="e.g. Kebele 02, House 104, Bole"
                />
              </div>

              <div>
                <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <select
                  id="shipping-city"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="input-field py-2 text-sm bg-white"
                >
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Gondar">Gondar</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Hawassa">Hawassa</option>
                  <option value="Adama">Adama</option>
                  <option value="Mekelle">Mekelle</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="order-notes" className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
              <textarea
                id="order-notes"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field py-2 text-sm"
                placeholder="Additional instructions for shipping/delivery..."
              ></textarea>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-800 pb-3 border-b border-gray-100">Payment Method</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === 'chapa'
                  ? 'border-primary-500 bg-primary-50/30'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="chapa"
                  checked={paymentMethod === 'chapa'}
                  onChange={() => setPaymentMethod('chapa')}
                  className="mt-1 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <div className="ml-3">
                  <span className="block font-bold text-sm text-gray-800">Chapa Gateway</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    Pay securely using Telebirr, CBE Birr, cards or mobile wallets.
                  </span>
                </div>
              </label>

              <label className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                paymentMethod === 'cod'
                  ? 'border-primary-500 bg-primary-50/30'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <div className="ml-3">
                  <span className="block font-bold text-sm text-gray-800">Cash on Delivery</span>
                  <span className="block text-xs text-gray-400 mt-1">
                    Pay in cash when order is delivered to your address.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Button */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg pb-3 border-b border-gray-100">Your Order</h3>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between py-3 text-sm">
                  <div className="pr-4">
                    <span className="font-medium text-gray-800 line-clamp-1">{item.product?.name}</span>
                    <span className="text-xs text-gray-400">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-right flex-shrink-0">
                    {parseInt(item.subtotal).toLocaleString()} ETB
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 text-sm text-gray-600 pt-4 border-t border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{numericSubtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%)</span>
                <span>{tax.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-primary-600">{total.toLocaleString()} ETB</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 text-sm rounded-lg shadow-sm disabled:opacity-50 mt-4"
            >
              {submitting ? 'Processing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CheckoutPage
