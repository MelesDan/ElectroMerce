import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { CheckCircleIcon, ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline'
import { orderService } from '@services/orderService'
import toast from 'react-hot-toast'

const OrderSuccessPage = () => {
  const { orderNumber } = useParams()
  const [searchParams] = useSearchParams()
  const txRef = searchParams.get('tx_ref')

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        // 1. Fetch user's orders list to locate the one matching orderNumber
        const ordersData = await orderService.getOrders()
        const ordersList = ordersData.results || ordersData

        const matched = ordersList.find((o) => o.order_number === orderNumber)
        if (!matched) {
          throw new Error('Order not found in history')
        }

        // 2. Fetch full detail of the matched order using its database primary key ID
        const fullDetail = await orderService.getOrder(matched.id)
        setOrder(fullDetail)
      } catch (error) {
        console.error('Error fetching order success details:', error)
        toast.error('Could not load order details')
      } finally {
        setLoading(false)
      }
    }

    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container-custom py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Details Not Found</h2>
        <Link to="/shop" className="btn-primary py-2 px-6">
          Return to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-10 max-w-3xl text-left">
      {/* Success Badge */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center mb-8">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thank You for Your Order!</h1>
        <p className="text-gray-500 mt-2">
          Your order has been placed successfully. Order Number: <span className="font-semibold text-gray-800">{order.order_number}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          A confirmation email has been sent to your registered address.
        </p>

        {txRef && (
          <div className="mt-4 bg-green-50 text-green-700 text-xs font-semibold py-2 px-4 rounded-lg inline-block border border-green-100">
            Payment Transaction Reference: {txRef}
          </div>
        )}
      </div>

      {/* Invoice Details */}
      <div id="invoice" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Invoice</h2>
            <p className="text-xs text-gray-400 mt-1">Date: {new Date(order.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <span className={`badge ${
              order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'
            }`}>
              {order.payment_status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Shipping details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-2">Shipping Information</h3>
            <p className="font-semibold text-gray-800">{order.shipping_name}</p>
            <p className="text-gray-600 mt-1">{order.shipping_address}</p>
            <p className="text-gray-600">{order.shipping_city}, Ethiopia</p>
            <p className="text-gray-600 mt-1">Phone: {order.shipping_phone}</p>
          </div>

          <div>
            <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-2">Payment Details</h3>
            <p className="text-gray-600">Method: <span className="font-semibold text-gray-800 uppercase">{order.payment_method}</span></p>
            <p className="text-gray-600 mt-1">Status: <span className="font-semibold text-gray-800 uppercase">{order.status}</span></p>
            {order.notes && (
              <div className="mt-3 bg-gray-50 p-2.5 rounded-lg text-xs text-gray-500 italic">
                Notes: "{order.notes}"
              </div>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="border-t border-b border-gray-100 py-4">
          <h3 className="font-bold text-gray-500 uppercase tracking-wider text-xs mb-3">Items Ordered</h3>
          <div className="space-y-3.5">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="font-semibold text-gray-800">{item.product_name}</span>
                  <span className="text-xs text-gray-400 block">
                    {parseInt(item.product_price).toLocaleString()} ETB x {item.quantity}
                  </span>
                </div>
                <span className="font-bold text-gray-800">
                  {parseInt(item.subtotal).toLocaleString()} ETB
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Calculations */}
        <div className="flex justify-end text-sm">
          <div className="w-full md:w-1/2 space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">{parseInt(order.subtotal).toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (15%)</span>
              <span className="font-semibold text-gray-800">{parseInt(order.tax).toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-800 pt-3 border-t border-gray-100">
              <span>Total Paid</span>
              <span className="text-primary-600">{parseInt(order.total_amount).toLocaleString()} ETB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 no-print">
        <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
          ← Continue Shopping
        </Link>
        
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="btn-secondary py-2 px-5 text-sm flex items-center gap-1.5"
          >
            <PrinterIcon className="w-4 h-4" /> Print Invoice
          </button>
          <Link
            to="/orders"
            className="btn-primary py-2 px-5 text-sm"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
