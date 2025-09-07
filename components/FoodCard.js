'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Heart, Clock, MapPin, Phone, Mail, Package } from 'lucide-react'

export default function FoodCard({ food, onAction, actionType = 'request', hideAction = false, showDonorDetails = true }) {
  const getTagColor = (type) => {
    switch (type) {
      case 'Veg':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Non-Veg':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Packaged':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Cooked':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActionText = () => {
    return actionType === 'request' ? 'Request Food' : 'Donate Food'
  }

  const getActionIcon = () => {
    return actionType === 'request' ? <Heart className="mr-2 h-4 w-4" /> : <Heart className="mr-2 h-4 w-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        {/* Food Image */}
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          {food.image && food.image !== '/placeholder-food.jpg' ? (
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          {/* Tag Badge */}
          <div className="absolute top-3 right-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTagColor(food.type)}`}>
              {food.type}
            </span>
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
            {food.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col h-full">
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {food.description}
          </p>

          {/* Food Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-2 h-4 w-4" />
              <span>Expires: {food.expiry}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{food.location}</span>
            </div>
            {food.quantity && (
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2 font-medium">Quantity:</span>
                <span>{food.quantity}</span>
              </div>
            )}
            {/* Donor Contact (optional) */}
            {showDonorDetails && (food.donor && (food.donor.phone || food.donor.email || food.donor.contactName)) && (
              <div className="mt-3 space-y-1 text-sm">
                {food.donor.contactName && (
                  <div className="text-gray-700">
                    Donor: <span className="font-medium">{food.donor.contactName}</span>
                  </div>
                )}
                {food.donor.phone && (
                  <div className="flex items-center text-gray-500">
                    <Phone className="mr-2 h-4 w-4" />
                    <span>{food.donor.phone}</span>
                  </div>
                )}
                {food.donor.email && (
                  <div className="flex items-center text-gray-500">
                    <Mail className="mr-2 h-4 w-4" />
                    <span className="truncate">{food.donor.email}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Privacy Notice (shown when donor details are hidden) */}
            {!showDonorDetails && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 text-center">
                  🔒 Donor contact details will be shared after your request is approved
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!hideAction && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-auto"
            >
              <Button 
                onClick={() => onAction && onAction(food)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
              >
                {getActionIcon()}
                {getActionText()}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
