import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { fetchProducts, fetchCategories } from '@store/slices/productSlice'
import ProductCard from '@components/products/ProductCard'

const ShopPage = () => {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || ''
  
  const { products, categories, isLoading, totalPages } = useSelector((state) => state.products)

  // Filters State
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])
  const [brand, setBrand] = useState('')
  const [condition, setCondition] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStock, setInStock] = useState(false)
  const [ordering, setOrdering] = useState('')
  const [page, setPage] = useState(1)

  // Brands list (hardcoded for the catalog brand filter)
  const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'Asus', 'Xiaomi']

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page,
      search: search || undefined,
      category: selectedCategory || undefined,
      brand: brand || undefined,
      condition: condition || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      in_stock: inStock ? 'true' : undefined,
      ordering: ordering || undefined,
    }
    dispatch(fetchProducts(params))
  }, [dispatch, page, selectedCategory, brand, condition, minPrice, maxPrice, inStock, ordering])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    const params = {
      page: 1,
      search: search || undefined,
      category: selectedCategory || undefined,
      brand: brand || undefined,
      condition: condition || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      in_stock: inStock ? 'true' : undefined,
      ordering: ordering || undefined,
    }
    dispatch(fetchProducts(params))
  }

  const handleResetFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setBrand('')
    setCondition('')
    setMinPrice('')
    setMaxPrice('')
    setInStock(false)
    setOrdering('')
    setPage(1)
  }

  return (
    <div className="container-custom py-8 text-left">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 self-start">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <label htmlFor="search-field" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search</label>
            <div className="flex gap-2">
              <input
                id="search-field"
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field py-1.5 text-sm"
              />
              <button type="submit" className="btn-primary py-1.5 px-3 text-xs">Go</button>
            </div>
          </form>

          {/* Categories Filter */}
          <div className="mb-6">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Categories</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`block w-full text-left text-sm py-1 px-2 rounded ${
                  selectedCategory === '' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={`block w-full text-left text-sm py-1 px-2 rounded ${
                    selectedCategory === cat.slug ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="mb-6">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Brands</span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
              <button
                onClick={() => { setBrand(''); setPage(1); }}
                className={`block w-full text-left text-sm py-1 px-2 rounded ${
                  brand === '' ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Brands
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  onClick={() => { setBrand(b); setPage(1); }}
                  className={`block w-full text-left text-sm py-1 px-2 rounded ${
                    brand === b ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="mb-6">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Condition</span>
            <select
              value={condition}
              onChange={(e) => { setCondition(e.target.value); setPage(1); }}
              className="input-field py-1.5 text-sm"
            >
              <option value="">All Conditions</option>
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
              <option value="used">Used</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price Range (ETB)</span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                className="input-field py-1.5 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                className="input-field py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Stock Availability */}
          <div className="flex items-center">
            <input
              id="stock-only"
              type="checkbox"
              checked={inStock}
              onChange={(e) => { setInStock(e.target.checked); setPage(1); }}
              className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
            />
            <label htmlFor="stock-only" className="ml-2 text-sm text-gray-600 font-medium">
              In Stock Only
            </label>
          </div>
        </div>

        {/* Product Grid & Sorting */}
        <div className="w-full lg:w-3/4 flex-1">
          {/* Sorting & Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-gray-500 text-sm">
              Showing <span className="font-semibold text-gray-800">{products.length}</span> products
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-500 whitespace-nowrap">Sort By:</label>
              <select
                id="sort-select"
                value={ordering}
                onChange={(e) => { setOrdering(e.target.value); setPage(1); }}
                className="input-field py-1.5 text-sm w-44 bg-white"
              >
                <option value="">Default Sorting</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-rating">Top Rated</option>
                <option value="-created_at">Newest</option>
                <option value="-views_count">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-gray-100 h-72 rounded-xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-16 text-center">
              <span className="text-5xl mb-4 block">🔍</span>
              <h4 className="text-lg font-bold text-gray-800 mb-1">No products found</h4>
              <p className="text-gray-500 text-sm">Try broadening your search or resetting filters.</p>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn-secondary py-1.5 px-4 text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopPage
