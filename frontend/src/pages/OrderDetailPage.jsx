import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { orderService } from '@services/orderService'
import toast from 'react-hot-toast'

const OrderDetailPage = () => {
  const { id: orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrder(orderId)
      setOrder(data)
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return

    setCancelling(true)
    try {
      await orderService.cancelOrder(orderId)
      toast.success('Order cancelled successfully!')
      fetchOrder()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimelineStep = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered']
    if (status === 'cancelled') return -1
    return steps.indexOf(status)
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
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <Link to="/orders" className="btn-primary py-2 px-6">
          Back to Orders
        </Link>
      </div>
    )
  }

  const activeStep = getTimelineStep(order.status)

  return (
    <div className="container-custom py-10 max-w-4xl text-left">
      <div className="mb-6">
        <Link to="/orders" className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm font-semibold">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order #{order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        
        <div className="flex gap-3">
          <span className={`badge uppercase py-1.5 px-4 text-xs font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
          {['pending', 'processing'].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 py-1.5 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Timeline */}
      {order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center relative gap-6 sm:gap-2">
            {/* Timeline connector bar */}
            <div className="hidden sm:block absolute left-1/10 right-1/10 top-1/2 h-0.5 bg-gray-200 -z-10"></div>
            
            {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => (
              <div key={step} className="flex sm:flex-col items-center gap-3 sm:gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  idx <= activeStep
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {idx + 1}
                </div>
                <span className={`text-xs font-bold ${
                  idx <= activeStep ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Invoice Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
            <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-3">Items Ordered</h3>
            
            <div className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{item.product_name}</h4>
                    <span className="text-xs text-gray-400">
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
        </div>

        {/* Right Column: Order Details */}
        <div className="space-y-6">
          {/* Shipping & Payment Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-lg pb-3 border-b border-gray-100">Shipping Details</h3>
            
            <div className="text-sm space-y-2 text-gray-600">
              <p className="font-semibold text-gray-800">{order.shipping_name}</p>
              <p>{order.shipping_address}</p>
              <p>{order.shipping_city}, Ethiopia</p>
              <p className="pt-1.5 font-medium">Phone: {order.shipping_phone}</p>
            </div>

            <h3 className="font-bold text-gray-800 text-lg pt-4 pb-3 border-b border-gray-100">Payment</h3>
            
            <div className="text-sm space-y-2.5 text-gray-600">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-bold uppercase text-gray-800">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-bold uppercase text-gray-800">{order.payment_status}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{parseInt(order.subtotal).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (15%)</span>
                <span>{parseInt(order.tax).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 pt-2.5 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-primary-600">{parseInt(order.total_amount).toLocaleString()} ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
