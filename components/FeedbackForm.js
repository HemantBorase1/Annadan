'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from './ui/toaster'
import { Star, Send, User, Mail } from 'lucide-react'
import { feedbackAPI } from '../lib/api'
import { useAuthContext } from '../lib/auth-context'

export default function FeedbackForm({ onSubmit, isSubmitting = false }) {
  const { addToast } = useToast()
  const { isAuthenticated, user } = useAuthContext()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    feedback: ''
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [errors, setErrors] = useState({})

  // Pre-fill form with user data if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [isAuthenticated, user])

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // For non-authenticated users, name and email are required
    if (!isAuthenticated) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required'
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    } else {
      // For authenticated users, validate email format if provided
      if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    
    if (!formData.rating) {
      newErrors.rating = 'Please select a rating'
    }
    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Please provide your feedback'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    try {
      // Prepare feedback data for API
      const feedbackData = {
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        message: formData.feedback,
        category: 'general' // You can add a category field to the form if needed
      }
      
      // Call the feedback API
      const response = await feedbackAPI.submitFeedback(feedbackData)
      
      if (response.success) {
        // Show success toast
        addToast({
          title: "Feedback Submitted! 🎉",
          description: "Thank you for your feedback. We appreciate your input!",
          duration: 3000,
        })
        
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          rating: 0,
          feedback: ''
        })
        setErrors({})
        
        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit(response.data)
        }
      } else {
        throw new Error(response.error)
      }
      
    } catch (error) {
      addToast({
        title: "Feedback Failed",
        description: error.message || "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <motion.button
        key={star}
        type="button"
        onClick={() => handleRatingChange(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`p-2 transition-all duration-200 ${
          star <= (hoveredRating || formData.rating)
            ? 'text-yellow-400'
            : 'text-gray-300'
        } ${errors.rating ? 'border-2 border-red-300 rounded-lg' : ''}`}
      >
        <Star 
          className={`h-8 w-8 ${
            star <= (hoveredRating || formData.rating)
              ? 'fill-current'
              : ''
          }`}
        />
      </motion.button>
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <User className="mr-2 h-5 w-5 text-emerald-600" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name {!isAuthenticated && '*'}
              {isAuthenticated && <span className="text-gray-500 text-sm ml-1">(pre-filled from your account)</span>}
            </Label>
            <Input
              id="name"
              placeholder="Your full name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
              disabled={isAuthenticated && user?.name}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email {!isAuthenticated && '*'}
              {isAuthenticated && <span className="text-gray-500 text-sm ml-1">(pre-filled from your account)</span>}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'border-red-500' : ''}
              disabled={isAuthenticated && user?.email}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="space-y-3">
        <Label className="text-lg font-medium text-gray-800">
          How would you rate your experience? *
        </Label>
        <div className="flex items-center justify-center space-x-2">
          {renderStars()}
        </div>
        {formData.rating > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-gray-600"
          >
            {formData.rating === 1 && "Poor"}
            {formData.rating === 2 && "Fair"}
            {formData.rating === 3 && "Good"}
            {formData.rating === 4 && "Very Good"}
            {formData.rating === 5 && "Excellent"}
          </motion.p>
        )}
        {errors.rating && (
          <p className="text-red-500 text-sm text-center">{errors.rating}</p>
        )}
      </div>



      {/* Feedback Textarea */}
      <div className="space-y-3">
        <Label htmlFor="feedback" className="text-lg font-medium text-gray-800">
          Tell us more about your experience *
        </Label>
        <Textarea
          id="feedback"
          placeholder="Share your thoughts, suggestions, or report any issues you encountered..."
          value={formData.feedback}
          onChange={(e) => handleInputChange('feedback', e.target.value)}
          rows={6}
          className={`resize-none text-base ${
            errors.feedback ? 'border-red-500' : ''
          }`}
        />
        {errors.feedback && (
          <p className="text-red-500 text-sm">{errors.feedback}</p>
        )}
        <p className="text-sm text-gray-500">
          Your feedback helps us improve and provide better service to our community.
        </p>
      </div>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="pt-4"
      >
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 text-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Submit Feedback
            </>
          )}
        </Button>
      </motion.div>
    </form>
  )
}
