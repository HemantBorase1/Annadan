'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Heart, Utensils, Package, ChefHat, User, Phone, Mail, Loader2, X } from 'lucide-react'
import FoodCard from '../components/FoodCard'
import { donationsAPI } from '../lib/api'
import { useDataFetch } from '../lib/hooks'
import { useAuthContext } from '../lib/auth-context'



export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [pickupModal, setPickupModal] = useState({ isOpen: false, food: null })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pickupForm, setPickupForm] = useState({ message: '', pickupTime: '' })
  const { isLoading, error, data: donations, fetchData } = useDataFetch(donationsAPI.getDonations)
  const { isAuthenticated } = useAuthContext()

  const filters = ['All', 'Veg', 'Non-Veg', 'Packaged', 'Cooked']

  // Transform API data to match FoodCard component props
  const transformDonationToFood = (donation) => {
    if (!donation) return null
    
    return {
      id: donation.id,
      name: donation.title,
      type: donation.food_type,
      description: donation.description,
      expiry: donation.expiry_date,
      location: donation.pickup_location,
      image: donation.image_url || '/placeholder-food.jpg',
      donor: {
        name: donation.donor?.name || 'Anonymous',
        phone: donation.donor_contact?.phone || donation.contact_phone || 'N/A',
        email: donation.donor_contact?.email || donation.contact_email || 'N/A',
        contactName: donation.donor_contact?.name || donation.contact_name || donation.donor?.name || 'Anonymous',
        rating: 4.5, // Default rating
        totalDonations: 1 // Default count
      }
    }
  }

  // Filter foods based on active filter
  const filteredFoods = useMemo(() => {
    // If we have an error or no data, return empty array
    if (error || !Array.isArray(donations)) {
      return []
    }
    
    const transformedDonations = donations.map(transformDonationToFood).filter(Boolean)
    
    if (activeFilter === 'All') {
      return transformedDonations
    }
    
    return transformedDonations.filter(food => food.type === activeFilter)
  }, [donations, activeFilter, error])

  // Fetch data on component mount
  useEffect(() => {
    console.log('Fetching donations data...')
    fetchData().then(result => {
      console.log('Fetch result:', result)
    }).catch(err => {
      console.error('Fetch error:', err)
    })
  }, [fetchData])

  // Debug logging
  useEffect(() => {
    console.log('=== Debug Info ===')
    console.log('Donations data:', donations)
    console.log('Donations type:', typeof donations)
    console.log('Is array:', Array.isArray(donations))
    console.log('Error state:', error)
    console.log('Loading state:', isLoading)
    console.log('Filtered foods count:', filteredFoods.length)
    console.log('==================')
  }, [donations, error, isLoading, filteredFoods.length])

  const handlePickupRequest = (food) => {
    if (!isAuthenticated) {
      alert('Please log in to request food pickup')
      return
    }
    setPickupModal({ isOpen: true, food })
    setPickupForm({ message: '', pickupTime: '' })
  }

  const closePickupModal = () => {
    setPickupModal({ isOpen: false, food: null })
    setPickupForm({ message: '', pickupTime: '' })
  }

  const handlePickupSubmit = async (e) => {
    e.preventDefault()
    if (!pickupModal.food) return

    setIsSubmitting(true)
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        alert('Please log in to request food pickup')
        closePickupModal()
        return
      }

      const response = await fetch('/api/pickup-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          donationId: pickupModal.food.id,
          message: pickupForm.message,
          pickupTime: pickupForm.pickupTime || null,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        alert('Pickup request submitted successfully!')
        closePickupModal()
        // Optionally refresh the donations data
        fetchData()
      } else {
        alert(`Error: ${result.error || 'Failed to submit pickup request'}`)
      }
    } catch (error) {
      console.error('Pickup request error:', error)
      alert('Failed to submit pickup request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 px-4 bg-gradient-to-br from-emerald-50 to-blue-50"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
        >
          Share Food, Spread Happiness
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
        >
          Connect with your community through food sharing. Donate surplus food or discover delicious recipes with AI assistance.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/donate">
              <Heart className="mr-2 h-5 w-5" />
              Donate Food
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/ai-recipe">
              <Utensils className="mr-2 h-5 w-5" />
              Get AI Recipe
            </Link>
          </Button>
        </motion.div>
      </motion.section>

      {/* Filter Bar */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="py-8 px-4 bg-white border-b"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'Veg' && <span className="mr-2">🥬</span>}
                {filter === 'Non-Veg' && <span className="mr-2">🍗</span>}
                {filter === 'Packaged' && <span className="mr-2">📦</span>}
                {filter === 'Cooked' && <span className="mr-2">👨‍🍳</span>}
                {filter}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Food Cards Grid */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8 }}
        className="py-12 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            Available Food Donations
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
            Browse through available food donations from generous community members. Each card shows the food details, donor information, and pickup request button.
          </p>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
              <span className="text-lg text-gray-600">Loading donations...</span>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4">Failed to load donations</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <div className="space-y-2">
                  <Button onClick={fetchData} variant="outline" size="sm">
                    Try Again
                  </Button>
                  <div className="text-xs text-gray-500">
                    <p>Check browser console for detailed error info</p>
                    <p>Make sure your API routes are working</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && filteredFoods.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No donations available</p>
                <p className="text-gray-500 text-sm">Check back later or be the first to donate!</p>
              </div>
            </div>
          )}
          
          {/* Initial State - Show when no data has been fetched yet */}
          {!isLoading && !error && !donations && (
            <div className="text-center py-12">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <Package className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <p className="text-blue-600 mb-2">Ready to load donations</p>
                <p className="text-blue-500 text-sm">Click the refresh button to load available donations</p>
                <Button onClick={fetchData} variant="outline" size="sm" className="mt-3">
                  Load Donations
                </Button>
              </div>
            </div>
          )}
          
          {/* Food Cards Grid */}
          {!isLoading && !error && filteredFoods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFoods.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <div className="relative">
                  <FoodCard 
                    food={food}
                    actionType="request"
                    onAction={handlePickupRequest}
                  />
                  
                  {/* Donor Information Overlay */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 hover:bg-white/98 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-gray-800">{food.donor.name}</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-emerald-600" />
                        {food.donor.phone}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-emerald-600" />
                        {food.donor.email}
                      </div>

                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </motion.section>

      {/* CTA Card */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Join as a Donor
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Make a difference in your community by sharing surplus food. Every donation counts!
            </p>
            <Button size="lg" asChild className="bg-emerald-600 hover:bg-emerald-700">
              <Link href="/donate">
                <Heart className="mr-2 h-5 w-5" />
                Start Donating Today
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Pickup Request Modal */}
      {pickupModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Request Food Pickup
                </h3>
                <button
                  onClick={closePickupModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {pickupModal.food && (
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-3">
                    {pickupModal.food.image ? (
                      <img
                        src={pickupModal.food.image}
                        alt={pickupModal.food.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">{pickupModal.food.name}</h4>
                      <p className="text-sm text-gray-600">{pickupModal.food.type}</p>
                      <p className="text-sm text-gray-600">{pickupModal.food.location}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handlePickupSubmit} className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Donor (Optional)
                  </label>
                  <textarea
                    id="message"
                    value={pickupForm.message}
                    onChange={(e) => setPickupForm({ ...pickupForm, message: e.target.value })}
                    placeholder="Add a message for the donor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows="3"
                  />
                </div>

                <div>
                  <label htmlFor="pickupTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Pickup Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    id="pickupTime"
                    value={pickupForm.pickupTime}
                    onChange={(e) => setPickupForm({ ...pickupForm, pickupTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closePickupModal}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
