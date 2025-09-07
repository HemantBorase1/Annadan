'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from './ui/toaster'
import { Package, MapPin, Phone, User, Calendar, Upload, X } from 'lucide-react'
import { donationsAPI } from '../lib/api'

export default function DonationForm({ onSubmit, isSubmitting = false }) {
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    foodName: '',
    foodType: '',
    quantity: '',
    description: '',
    expiryDate: '',
    pickupLocation: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    additionalNotes: ''
  })
  const [errors, setErrors] = useState({})
  const [foodImage, setFoodImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const foodTypes = [
    { value: 'veg', label: 'Vegetarian' },
    { value: 'non-veg', label: 'Non-Vegetarian' },
    { value: 'packaged', label: 'Packaged Food' },
    { value: 'cooked', label: 'Cooked Food' },
    { value: 'fruits', label: 'Fruits & Vegetables' },
    { value: 'dairy', label: 'Dairy Products' },
    { value: 'beverages', label: 'Beverages' },
    { value: 'other', label: 'Other' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      
      if (!file.type.startsWith('image/')) {
        addToast({
          title: "Invalid File Type",
          description: "Please select an image file (JPEG, PNG, etc.).",
          variant: "destructive",
        })
        return
      }

      setFoodImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }



  const removeImage = () => {
    setFoodImage(null)
    setImagePreview('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.foodName.trim()) {
      newErrors.foodName = 'Food name is required'
    }
    if (!formData.foodType) {
      newErrors.foodType = 'Please select a food type'
    }
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required'
    }
    if (!formData.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required'
    }
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required'
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone is required'
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address'
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
      // Prepare donation data for API
      const donationData = {
        title: formData.foodName,
        description: formData.description,
        food_type: formData.foodType,
        quantity: formData.quantity,
        expiry_date: formData.expiryDate,
        pickup_location: formData.pickupLocation,
        contact_name: formData.contactName,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        additional_notes: formData.additionalNotes
      }
      
      // Add image if exists
      if (foodImage) {
        donationData.foodImage = foodImage
      }
      
      // Call the donations API
      const response = await donationsAPI.createDonation(donationData)
      
      if (response.success) {
        // Show success toast
        addToast({
          title: "Donation Created! 🎉",
          description: "Your food donation has been posted successfully.",
          duration: 3000,
        })
        
        // Reset form after successful submission
        setFormData({
          foodName: '',
          foodType: '',
          quantity: '',
          description: '',
          expiryDate: '',
          pickupLocation: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          additionalNotes: ''
        })
        setErrors({})
        setFoodImage(null)
        setImagePreview('')
        
        // Call the onSubmit callback if provided
        if (onSubmit) {
          onSubmit(response.data)
        }
      } else {
        throw new Error(response.error)
      }
      
    } catch (error) {
      addToast({
        title: "Donation Failed",
        description: error.message || "There was an error creating your donation. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Food Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Package className="mr-2 h-5 w-5 text-emerald-600" />
          Food Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="foodName">Food Name *</Label>
            <Input
              id="foodName"
              placeholder="e.g., Fresh Vegetables, Homemade Curry"
              value={formData.foodName}
              onChange={(e) => handleInputChange('foodName', e.target.value)}
              className={errors.foodName ? 'border-red-500' : ''}
            />
            {errors.foodName && (
              <p className="text-red-500 text-sm">{errors.foodName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="foodType">Food Type *</Label>
            <Select
              value={formData.foodType}
              onValueChange={(value) => handleInputChange('foodType', value)}
            >
              <SelectTrigger className={errors.foodType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select food type" />
              </SelectTrigger>
              <SelectContent>
                {foodTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.foodType && (
              <p className="text-red-500 text-sm">{errors.foodType}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              placeholder="e.g., 2 kg, 5 pieces, 1 box"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              className={errors.quantity ? 'border-red-500' : ''}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the food item, ingredients, cooking method, etc."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>
      </div>

             {/* Food Image Section */}
       <div className="space-y-4">
         <h3 className="text-lg font-semibold text-gray-800 flex items-center">
           <Upload className="mr-2 h-5 w-5 text-emerald-600" />
           Food Image
         </h3>
         
         <div className="space-y-4">
           {/* Image Preview */}
           {imagePreview && (
             <div className="relative">
               <img
                 src={imagePreview}
                 alt="Food preview"
                 className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
               />
               <button
                 type="button"
                 onClick={removeImage}
                 className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
               >
                 <X className="h-4 w-4" />
               </button>
             </div>
           )}

           {/* Image Upload Button */}
           {!imagePreview && (
             <div className="w-full">
               <Label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                 Upload Food Image
               </Label>
               <input
                 id="image-upload"
                 type="file"
                 accept="image/*"
                 onChange={handleImageUpload}
                 className="hidden"
               />
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => document.getElementById('image-upload').click()}
                 className="w-full border-dashed border-2 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors py-8"
               >
                 <Upload className="mr-2 h-6 w-6 text-emerald-600" />
                 Choose Image
               </Button>
             </div>
           )}

           {/* Image Upload Info */}
           <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
             <p>• Supported formats: JPEG, PNG, GIF</p>
             <p>• Maximum file size: 5MB</p>
             <p>• Clear, well-lit photos help recipients make informed decisions</p>
           </div>
         </div>
       </div>

      {/* Pickup Details Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-emerald-600" />
          Pickup Details
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="pickupLocation">Pickup Location *</Label>
          <Input
            id="pickupLocation"
            placeholder="e.g., Downtown, Westside, Central Park"
            value={formData.pickupLocation}
            onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
            className={errors.pickupLocation ? 'border-red-500' : ''}
          />
          {errors.pickupLocation && (
            <p className="text-red-500 text-sm">{errors.pickupLocation}</p>
          )}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <User className="mr-2 h-5 w-5 text-emerald-600" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name *</Label>
            <Input
              id="contactName"
              placeholder="Your full name"
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              className={errors.contactName ? 'border-red-500' : ''}
            />
            {errors.contactName && (
              <p className="text-red-500 text-sm">{errors.contactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone *</Label>
            <Input
              id="contactPhone"
              placeholder="Your phone number"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className={errors.contactPhone ? 'border-red-500' : ''}
            />
            {errors.contactPhone && (
              <p className="text-red-500 text-sm">{errors.contactPhone}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">Contact Email *</Label>
          <Input
            id="contactEmail"
            type="email"
            placeholder="your.email@example.com"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className={errors.contactEmail ? 'border-red-500' : ''}
          />
          {errors.contactEmail && (
            <p className="text-red-500 text-sm">{errors.contactEmail}</p>
          )}
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <Label htmlFor="additionalNotes">Additional Notes</Label>
        <Textarea
          id="additionalNotes"
          placeholder="Any special instructions, dietary restrictions, or additional information"
          value={formData.additionalNotes}
          onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
          rows={3}
        />
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
              <Package className="mr-2 h-5 w-5" />
              Submit Donation
            </>
          )}
        </Button>
      </motion.div>

      
    </form>
  )
}
