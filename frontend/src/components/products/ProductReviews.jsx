import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaStar, FaRegStar, FaCheckCircle } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { productService } from '@services/productService'

const ProductReviews = ({ productId, productSlug }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [productSlug])

  const fetchReviews = async () => {
    try {
      const data = await productService.getProductReviews(productSlug)
      setReviews(data.results || data)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment || !title) {
      toast.error('Please enter review title and comment')
      return
    }

    setSubmitting(true)
    try {
      await productService.addReview({
        product: productId,
        rating,
        title,
        comment,
      })
      toast.success('Review submitted successfully!')
      setTitle('')
      setComment('')
      setRating(5)
      fetchReviews() // Refresh review list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (count, interactive = false) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (interactive) {
        stars.push(
          <button
            key={i}
            type="button"
            onClick={() => setRating(i)}
            className="text-2xl text-yellow-400 hover:scale-110 transition-transform focus:outline-none"
          >
            {i <= rating ? <FaStar /> : <FaRegStar />}
          </button>
        )
      } else {
        stars.push(
          <span key={i} className="text-yellow-400 text-sm">
            {i <= count ? <FaStar /> : <FaRegStar />}
          </span>
        )
      }
    }
    return stars
  }

  if (loading) {
    return <div className="mt-8 py-4 text-center text-gray-500">Loading reviews...</div>
  }

  return (
    <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Review Summary */}
        <div className="lg:border-r lg:pr-8 border-gray-100">
          <div className="text-center md:text-left">
            <div className="text-5xl font-extrabold text-gray-800 mb-2">
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </div>
            <div className="flex justify-center md:justify-start gap-1 mb-2">
              {renderStars(
                reviews.length > 0
                  ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
                  : 0
              )}
            </div>
            <p className="text-sm text-gray-500">Based on {reviews.length} reviews</p>
          </div>
        </div>

        {/* Right Columns: Review List & Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Review Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Rating</label>
                <div className="flex gap-1.5">{renderStars(rating, true)}</div>
              </div>

              <div className="mb-4">
                <label htmlFor="review-title" className="block text-sm font-medium text-gray-600 mb-1">Review Title</label>
                <input
                  id="review-title"
                  type="text"
                  placeholder="Summarize your experience"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field py-2 text-sm bg-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="review-comment" className="block text-sm font-medium text-gray-600 mb-1">Comments</label>
                <textarea
                  id="review-comment"
                  rows="4"
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input-field py-2 text-sm bg-white"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-primary-50 text-primary-800 rounded-xl p-4 text-center text-sm border border-primary-100">
              Please <a href="/login" className="font-semibold underline">login</a> to write a review.
            </div>
          )}

          {/* List of Reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm">{review.user_name}</span>
                      {review.is_verified && (
                        <span className="flex items-center text-xs text-green-600 font-medium gap-0.5">
                          <FaCheckCircle className="w-3.5 h-3.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-1 mb-2">
                    {renderStars(review.rating)}
                  </div>

                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{review.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductReviews
