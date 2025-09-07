'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../components/ui/toaster'
import FeedbackForm from '../../components/FeedbackForm'
import { MessageSquare, Heart } from 'lucide-react'
import { useAuthContext } from '../../lib/auth-context'

export default function FeedbackPage() {
  const { addToast } = useToast()
  const { isAuthenticated, user } = useAuthContext()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    
    try {
      // The FeedbackForm component already handles the API call
      // This function is called after successful submission
      console.log('Feedback submitted successfully:', formData)
      
      // Show additional success toast
      addToast({
        title: "Feedback Submitted! 💝",
        description: "Thank you for sharing your thoughts with us. Your feedback helps us improve!",
        duration: 5000,
      })
      
    } catch (error) {
      console.error('Feedback submission error:', error)
      addToast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            We Value Your Feedback
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us improve AnnaDan by sharing your thoughts, suggestions, and experiences.
          </p>
          
          {/* User Status */}
          {isAuthenticated && user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Logged in as {user.name || user.email}
            </motion.div>
          )}
        </motion.div>

        {/* Feedback Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <MessageSquare className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Share Your Thoughts
              </CardTitle>
              <p className="text-gray-600">
                Your feedback helps us create a better experience for everyone
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <FeedbackForm 
                onSubmit={handleFormSubmit}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-center mb-3">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              <span className="text-lg font-medium text-gray-800">
                Why Your Feedback Matters
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Every piece of feedback helps us understand how to better serve our community. 
              Whether it's a suggestion for improvement, a bug report, or just sharing your experience, 
              we're listening and committed to making AnnaDan the best it can be.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
