'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../components/ui/toaster'
import DonationForm from '../../components/DonationForm'

export default function DonatePage() {
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    
    try {
      // Show success toast
      addToast({
        title: "Donation Submitted! 🎉",
        description: "Thank you for your generous food donation. We'll notify recipients soon.",
        duration: 5000,
      })
      
      // Reset form or redirect
      console.log('Form submitted:', formData)
      
      // Redirect to profile page to see the donation
      window.location.href = '/profile'
      
    } catch (error) {
      addToast({
        title: "Submission Failed",
        description: "There was an error submitting your donation. Please try again.",
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
            Donate Your Food
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your surplus food with those in need. Every donation makes a difference in someone's life.
          </p>
        </motion.div>

        {/* Donation Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Food Donation Details
              </CardTitle>
              <p className="text-gray-600">
                Please provide details about the food you'd like to donate
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <DonationForm 
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
          <p className="text-gray-500 text-sm">
            Your donation will be reviewed and made available to community members in need.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
