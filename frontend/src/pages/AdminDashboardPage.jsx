import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  ChartBarIcon,
  ShoppingBagIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import api from '@services/api'
import toast from 'react-hot-toast'

const AdminDashboardPage = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    const isAdmin = user?.role === 'admin' || user?.is_superuser
    if (!isAdmin) {
      navigate('/')
      toast.error('Access denied. Administrator privileges required.')
    }
  }, [user, isAuthenticated, navigate])

  // State Management
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // CRUD Form/Modal State
  const [showProductModal, setShowProductModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    stock_quantity: '',
    sku: '',
    brand: '',
    condition: 'new',
    warranty_months: 12,
    specifications: '{}',
    is_active: true,
    is_featured: false,
    category: '',
  })

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [currentCategory, setCurrentCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    parent: '',
  })

  // Load Initial Data
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.is_superuser)) {
      loadDashboardData()
    }
  }, [activeTab, isAuthenticated, user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      if (activeTab === 'overview') {
        const statsRes = await api.get('/admin/stats/')
        setStats(statsRes.data)
        const chartRes = await api.get('/admin/sales-chart/?days=7')
        setChartData(chartRes.data)
      } else if (activeTab === 'products') {
        const prodRes = await api.get('/admin/products/')
        setProducts(prodRes.data.results || prodRes.data)
        const catRes = await api.get('/admin/categories/')
        setCategories(catRes.data.results || catRes.data)
      } else if (activeTab === 'categories') {
        const catRes = await api.get('/admin/categories/')
        setCategories(catRes.data.results || catRes.data)
      } else if (activeTab === 'orders') {
        const ordRes = await api.get('/admin/orders/')
        setOrders(ordRes.data.results || ordRes.data)
      } else if (activeTab === 'users') {
        const usrRes = await api.get('/admin/users/')
        setUsers(usrRes.data.results || usrRes.data)
      }
    } catch (error) {
      console.error('Error loading admin dashboard data:', error)
      toast.error('Error fetching admin data')
    } finally {
      setLoading(false)
    }
  }

  // --- Product CRUD ---
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setCurrentProduct(product)
      setProductForm({
        name: product.name,
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price,
        compare_price: product.compare_price || '',
        stock_quantity: product.stock_quantity,
        sku: product.sku || '',
        brand: product.brand || '',
        condition: product.condition || 'new',
        warranty_months: product.warranty_months || 12,
        specifications: JSON.stringify(product.specifications || {}),
        is_active: product.is_active,
        is_featured: product.is_featured,
        category: product.category || '',
      })
    } else {
      setCurrentProduct(null)
      setProductForm({
        name: '',
        description: '',
        short_description: '',
        price: '',
        compare_price: '',
        stock_quantity: '',
        sku: '',
        brand: '',
        condition: 'new',
        warranty_months: 12,
        specifications: '{}',
        is_active: true,
        is_featured: false,
        category: categories[0]?.id || '',
      })
    }
    setShowProductModal(true)
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      let parsedSpecs = {}
      try {
        parsedSpecs = JSON.parse(productForm.specifications)
      } catch (err) {
        toast.error('Specifications must be valid JSON')
        return
      }

      const payload = {
        ...productForm,
        specifications: parsedSpecs,
        price: parseFloat(productForm.price),
        compare_price: productForm.compare_price ? parseFloat(productForm.compare_price) : null,
        stock_quantity: parseInt(productForm.stock_quantity),
        warranty_months: parseInt(productForm.warranty_months),
      }

      if (currentProduct) {
        await api.put(`/admin/products/${currentProduct.id}/`, payload)
        toast.success('Product updated successfully')
      } else {
        await api.post('/admin/products/', payload)
        toast.success('Product created successfully')
      }
      setShowProductModal(false)
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to save product')
    }
  }

  const handleProductDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/admin/products/${id}/`)
      toast.success('Product deleted')
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  // --- Category CRUD ---
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setCurrentCategory(cat)
      setCategoryForm({
        name: cat.name,
        description: cat.description || '',
        parent: cat.parent || '',
      })
    } else {
      setCurrentCategory(null)
      setCategoryForm({
        name: '',
        description: '',
        parent: '',
      })
    }
    setShowCategoryModal(true)
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...categoryForm,
        parent: categoryForm.parent ? parseInt(categoryForm.parent) : null,
      }
      if (currentCategory) {
        await api.put(`/admin/categories/${currentCategory.id}/`, payload)
        toast.success('Category updated')
      } else {
        await api.post('/admin/categories/', payload)
        toast.success('Category created')
      }
      setShowCategoryModal(false)
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to save category')
    }
  }

  const handleCategoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/admin/categories/${id}/`)
      toast.success('Category deleted')
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  // --- Order Status Change ---
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/`, { status: newStatus })
      toast.success('Order status updated')
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  // --- User Toggle is_active ---
  const handleUserToggleActive = async (userId, currentActive) => {
    try {
      await api.put(`/admin/users/${userId}/`, { is_active: !currentActive })
      toast.success('User access status updated')
      loadDashboardData()
    } catch (error) {
      toast.error('Failed to update user access')
    }
  }

  return (
    <div className="container-custom py-8 text-left">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Control Center</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Tabs (Sidebar Layout) */}
        <div className="w-full lg:w-1/5 flex flex-col gap-2">
          {[
            { id: 'overview', name: 'Overview', icon: ChartBarIcon },
            { id: 'products', name: 'Products', icon: ShoppingBagIcon },
            { id: 'categories', name: 'Categories', icon: TagIcon },
            { id: 'orders', name: 'Orders', icon: ClipboardDocumentListIcon },
            { id: 'users', name: 'Users', icon: UsersIcon },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            )
          })}
        </div>

        {/* Dashboard Panels */}
        <div className="w-full lg:w-4/5 flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          {loading && !showProductModal && !showCategoryModal ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `${(stats?.overview?.total_revenue || 0).toLocaleString()} ETB`, color: 'text-green-600' },
                  { label: 'Delivered / Total Orders', value: `${stats?.overview?.total_orders || 0}`, color: 'text-blue-600' },
                  { label: 'Low Stock Items', value: `${stats?.products?.low_stock || 0}`, color: stats?.products?.low_stock > 0 ? 'text-red-500 font-bold' : 'text-gray-800' },
                  { label: 'Total Users', value: `${stats?.users?.total || 0}`, color: 'text-purple-600' },
                ].map((card, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5 shadow-sm">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{card.label}</span>
                    <span className={`text-2xl font-extrabold ${card.color}`}>{card.value}</span>
                  </div>
                ))}
              </div>

              {/* Custom SVG/CSS Charts */}
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-4">Daily Sales Analytics</h3>
                <div className="h-60 flex items-end gap-3 border-b border-l border-gray-200 pb-4 pl-4 pt-4">
                  {chartData.length === 0 ? (
                    <div className="w-full text-center text-gray-400 self-center text-sm">No chart data available.</div>
                  ) : (
                    chartData.map((day, i) => {
                      const maxVal = Math.max(...chartData.map((d) => d.sales)) || 1
                      const heightPct = (day.sales / maxVal) * 80 + 10 // scale to fit
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none whitespace-nowrap">
                            {day.sales.toLocaleString()} ETB ({day.orders} ord)
                          </div>
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors"
                          ></div>
                          <span className="text-[10px] text-gray-400 mt-2 rotate-45 sm:rotate-0">{day.date.slice(5)}</span>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'products' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">Product Catalog</h3>
                <button
                  onClick={() => handleOpenProductModal()}
                  className="btn-primary flex items-center gap-1 py-2 px-4 text-sm"
                >
                  <PlusIcon className="w-4 h-4" /> Add Product
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-bold">SKU</th>
                      <th className="px-4 py-3 font-bold">Name</th>
                      <th className="px-4 py-3 font-bold">Price</th>
                      <th className="px-4 py-3 font-bold">Stock</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-gray-500">{prod.sku || 'N/A'}</td>
                        <td className="px-4 py-3 font-bold text-gray-800 line-clamp-1 max-w-[180px]">{prod.name}</td>
                        <td className="px-4 py-3 font-semibold">{parseInt(prod.price).toLocaleString()} ETB</td>
                        <td className="px-4 py-3">
                          <span className={prod.stock_quantity < 10 ? 'text-red-500 font-bold' : ''}>
                            {prod.stock_quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${prod.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {prod.is_active ? 'Active' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenProductModal(prod)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'categories' ? (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 text-lg">Categories Directory</h3>
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="btn-primary flex items-center gap-1 py-2 px-4 text-sm"
                >
                  <PlusIcon className="w-4 h-4" /> Add Category
                </button>
              </div>

              {/* Categories Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-bold">Category Name</th>
                      <th className="px-6 py-3 font-bold">Description</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-bold text-gray-800">{cat.name}</td>
                        <td className="px-6 py-3 text-gray-500 line-clamp-1 max-w-[300px]">{cat.description || 'No description'}</td>
                        <td className="px-6 py-3 text-right flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenCategoryModal(cat)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCategoryDelete(cat.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === 'orders' ? (
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-6">Customer Orders</h3>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-bold">Order Number</th>
                      <th className="px-4 py-3 font-bold">Date</th>
                      <th className="px-4 py-3 font-bold">Total</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Update Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-bold text-gray-800">{ord.order_number}</td>
                        <td className="px-4 py-3">{new Date(ord.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-semibold">{parseInt(ord.total_amount).toLocaleString()} ETB</td>
                        <td className="px-4 py-3">
                          <span className={`badge uppercase ${
                            ord.status === 'delivered' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <select
                            value={ord.status}
                            onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                            className="input-field py-1 text-xs w-32 bg-white inline-block border-gray-200"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-6">User Accounts Management</h3>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-bold">Username</th>
                      <th className="px-6 py-3 font-bold">Email</th>
                      <th className="px-6 py-3 font-bold">Role</th>
                      <th className="px-6 py-3 font-bold">Status</th>
                      <th className="px-6 py-3 font-bold text-right">Toggle Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3 font-bold text-gray-800">{usr.username}</td>
                        <td className="px-6 py-3">{usr.email}</td>
                        <td className="px-6 py-3 font-semibold capitalize text-xs">{usr.role}</td>
                        <td className="px-6 py-3">
                          <span className={`badge ${usr.is_active ? 'badge-success' : 'badge-danger'}`}>
                            {usr.is_active ? 'Enabled' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleUserToggleActive(usr.id, usr.is_active)}
                            className={`text-xs font-semibold py-1 px-3.5 rounded border transition-colors ${
                              usr.is_active
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {usr.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Product Form Modal --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-2xl p-6 md:p-8 relative">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {currentProduct ? 'Edit Product Details' : 'Create New Product'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-name" className="block text-xs font-semibold text-gray-600 mb-1">Product Name</label>
                  <input
                    id="prod-name"
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prod-sku" className="block text-xs font-semibold text-gray-600 mb-1">SKU Code</label>
                  <input
                    id="prod-sku"
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prod-price" className="block text-xs font-semibold text-gray-600 mb-1">Selling Price (ETB)</label>
                  <input
                    id="prod-price"
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prod-compare" className="block text-xs font-semibold text-gray-600 mb-1">Compare Price (ETB)</label>
                  <input
                    id="prod-compare"
                    type="number"
                    value={productForm.compare_price}
                    onChange={(e) => setProductForm({ ...productForm, compare_price: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prod-stock" className="block text-xs font-semibold text-gray-600 mb-1">Stock Quantity</label>
                  <input
                    id="prod-stock"
                    type="number"
                    required
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="prod-brand" className="block text-xs font-semibold text-gray-600 mb-1">Brand Name</label>
                  <input
                    id="prod-brand"
                    type="text"
                    required
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="prod-condition" className="block text-xs font-semibold text-gray-600 mb-1">Condition</label>
                  <select
                    id="prod-condition"
                    value={productForm.condition}
                    onChange={(e) => setProductForm({ ...productForm, condition: e.target.value })}
                    className="input-field py-1.5 text-sm bg-white"
                  >
                    <option value="new">New</option>
                    <option value="refurbished">Refurbished</option>
                    <option value="used">Used</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prod-warranty" className="block text-xs font-semibold text-gray-600 mb-1">Warranty (Months)</label>
                  <input
                    id="prod-warranty"
                    type="number"
                    value={productForm.warranty_months}
                    onChange={(e) => setProductForm({ ...productForm, warranty_months: e.target.value })}
                    className="input-field py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-cat" className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select
                    id="prod-cat"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="input-field py-1.5 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4 items-center pt-5">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.is_active}
                      onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                    />
                    <span className="ml-2 text-sm text-gray-600 font-semibold">Is Active</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                      className="rounded text-primary-600 focus:ring-primary-500 h-4.5 w-4.5"
                    />
                    <span className="ml-2 text-sm text-gray-600 font-semibold">Is Featured</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="prod-short" className="block text-xs font-semibold text-gray-600 mb-1">Short Summary Description</label>
                <input
                  id="prod-short"
                  type="text"
                  value={productForm.short_description}
                  onChange={(e) => setProductForm({ ...productForm, short_description: e.target.value })}
                  className="input-field py-1.5 text-sm"
                />
              </div>

              <div>
                <label htmlFor="prod-desc" className="block text-xs font-semibold text-gray-600 mb-1">Full Description</label>
                <textarea
                  id="prod-desc"
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="input-field py-1.5 text-sm"
                ></textarea>
              </div>

              <div>
                <label htmlFor="prod-spec" className="block text-xs font-semibold text-gray-600 mb-1">Specifications (JSON string)</label>
                <textarea
                  id="prod-spec"
                  rows="3"
                  value={productForm.specifications}
                  onChange={(e) => setProductForm({ ...productForm, specifications: e.target.value })}
                  className="input-field py-1.5 text-sm font-mono"
                  placeholder='{"Weight": "1.5 kg", "Color": "Space Grey"}'
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn-secondary py-2 px-5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Category Form Modal --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border w-full max-w-md p-6 relative">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {currentCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label htmlFor="cat-name" className="block text-xs font-semibold text-gray-600 mb-1">Category Name</label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="input-field py-2 text-sm"
                />
              </div>

              <div>
                <label htmlFor="cat-desc" className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                <textarea
                  id="cat-desc"
                  rows="3"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="input-field py-2 text-sm"
                ></textarea>
              </div>

              <div>
                <label htmlFor="cat-parent" className="block text-xs font-semibold text-gray-600 mb-1">Parent Category (Optional)</label>
                <select
                  id="cat-parent"
                  value={categoryForm.parent}
                  onChange={(e) => setCategoryForm({ ...categoryForm, parent: e.target.value })}
                  className="input-field py-2 text-sm bg-white"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="btn-secondary py-2 px-5 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-sm"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
