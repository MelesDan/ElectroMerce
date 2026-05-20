import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import ProductCard from '@components/products/ProductCard'
import { fetchFeaturedProducts, fetchCategories } from '@store/slices/productSlice'

const HomePage = () => {
  const dispatch = useDispatch()
  const { featuredProducts, categories, isLoading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchFeaturedProducts())
    dispatch(fetchCategories())
  }, [dispatch])

  return (
    <>
      <Helmet>
        <title>ElectroStore - Best Electronics in Ethiopia</title>
        <meta name="description" content="Shop the latest electronics at the best prices in Ethiopia" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative container-custom h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Latest Electronics at Best Prices
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Discover the newest smartphones, laptops, and accessories with free shipping across Ethiopia
            </p>
            <Link to="/shop" className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="block"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  <div className="w-16 h-16 mx-auto bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-3 text-2xl">
                    {category.slug.includes('phone') ? '📱' : category.slug.includes('laptop') ? '💻' : category.slug.includes('audio') || category.slug.includes('head') ? '🎧' : category.slug.includes('watch') ? '⌚' : category.slug.includes('camera') ? '📷' : '🔌'}
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">{category.name}</h3>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16 bg-gradient-to-r from-secondary-600 to-secondary-800 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold mb-4">Summer Sale!</h2>
          <p className="text-xl mb-6">Get up to 30% off on selected items</p>
          <Link to="/shop" className="inline-block bg-white text-secondary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Shop Sale
          </Link>
        </div>
      </section>
    </>
  )
}

export default HomePage