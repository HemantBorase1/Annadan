'use client'


import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'
import { Badge } from '../../components/ui/badge'
import FoodCard from '../../components/FoodCard'

import { User, Edit, Package, Calendar, MapPin, Clock, Phone, Mail, Truck, Loader2, AlertCircle, Heart } from 'lucide-react'
import { useProfile } from '../../lib/hooks'
import { useAuthContext } from '../../lib/auth-context'
import { useToast } from '../../components/ui/toaster'

export default function ProfilePage() {

	const { addToast } = useToast()
	const { isAuthenticated, logout } = useAuthContext()
	const {
		profile,
		userDonations,
		receivedRequests,
		isLoading,
		error,
		fetchProfile,
		updateProfile,
		updatePickupRequest,
		refresh,
		sentRequests, // Added sentRequests to the hook
		cancelRequest // Added cancelRequest to the hook
	} = useProfile()

	const [isEditingProfile, setIsEditingProfile] = useState(false)
	const [editFormData, setEditFormData] = useState({
		name: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		zipCode: ''
	})

	// Initialize edit form when profile data loads
	useEffect(() => {
		if (profile) {
			setEditFormData({
				name: profile.name || '',
				phone: profile.phone || '',
				address: profile.address || '',
				city: profile.city || '',
				state: profile.state || '',
				zipCode: profile.zip_code || ''
			})
		}
	}, [profile])

	// If backend says user not found or auth required, clear token/state so navbar shows Sign In/Sign Up
	useEffect(() => {
		if (!isLoading && error) {
			const message = String(error).toLowerCase()
			if (message.includes('authentication required') || message.includes('user not found')) {
				logout()
			}
		}
	}, [error, isLoading, logout])

	const handleEditProfile = () => {
		setIsEditingProfile(true)
	}

	const handleCancelEdit = () => {
		setIsEditingProfile(false)
		setEditFormData({
			name: profile?.name || '',
			phone: profile?.phone || '',
			address: profile?.address || '',
			city: profile?.city || '',
			state: profile?.state || '',
			zipCode: profile?.zip_code || ''
		})
	}

	const handleSaveProfile = async () => {
		try {
			const result = await updateProfile(editFormData)
			if (result.success) {
				addToast({
					title: "Profile Updated",
					description: "Your profile has been updated successfully.",
					variant: "default"
				})
				setIsEditingProfile(false)
				refresh()
			} else {
				addToast({
					title: "Update Failed",
					description: result.error || "Failed to update profile.",
					variant: "destructive"
				})
			}
		} catch (error) {
			addToast({
				title: "Update Failed",
				description: "An unexpected error occurred.",
				variant: "destructive"
			})
		}
	}

	const handlePickupRequestAction = async (requestId, action) => {
		try {
			const normalizedStatus = action === 'confirm' ? 'confirmed' : action === 'decline' ? 'declined' : action
			const result = await updatePickupRequest(requestId, normalizedStatus)
			if (result.success) {
				addToast({
					title: `Request ${normalizedStatus === 'confirmed' ? 'Confirmed' : normalizedStatus === 'declined' ? 'Declined' : normalizedStatus}`,
					description: `Pickup request has been ${normalizedStatus} successfully.`,
					variant: "default"
				})
			} else {
				addToast({
					title: "Action Failed",
					description: result.error || "Failed to update pickup request.",
					variant: "destructive"
				})
			}
		} catch (error) {
			addToast({
				title: "Action Failed",
				description: "An unexpected error occurred.",
				variant: "destructive"
			})
		}
	}

	const handleCancelRequest = async (requestId) => {
		try {
			const result = await cancelRequest(requestId)
			if (result.success) {
				addToast({
					title: "Request Cancelled",
					description: "Your food request has been cancelled.",
					variant: "default"
				})
				refresh()
			} else {
				addToast({
					title: "Cancellation Failed",
					description: result.error || "Failed to cancel request.",
					variant: "destructive"
				})
			}
		} catch (error) {
			addToast({
				title: "Cancellation Failed",
				description: "An unexpected error occurred.",
				variant: "destructive"
			})
		}
	}

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { color: 'bg-green-100 text-green-800', text: 'Available' },

			reserved: { color: 'bg-blue-100 text-blue-800', text: 'Reserved' },
			picked_up: { color: 'bg-gray-100 text-gray-800', text: 'Picked Up' },
			expired: { color: 'bg-red-100 text-red-800', text: 'Expired' },
			cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    }
    
    const config = statusConfig[status] || statusConfig.available
    return <Badge className={config.color}>{config.text}</Badge>
  }



	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
					<p className="text-gray-600">Loading profile...</p>
				</div>
			</div>
		)
	}

	// Show error state
	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
					<p className="text-red-600 mb-4">Failed to load profile</p>
					<p className="text-gray-600 mb-4">{error}</p>
					<Button onClick={fetchProfile} className="bg-emerald-600 hover:bg-emerald-700">
						Try Again
					</Button>
				</div>
			</div>
		)
	}

	// Show empty state if no profile data
	if (!profile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center">
				<div className="text-center">
					<User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
					<p className="text-gray-600">No profile data available</p>
					<p className="text-sm text-gray-500 mb-4">Please sign in to view your profile</p>
					<Button onClick={() => window.location.href = '/auth/signin'} className="bg-emerald-600 hover:bg-emerald-700">
						Sign In
					</Button>
				</div>
			</div>
		)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-0">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar Section */}
                <div className="text-center md:text-left">
                  <Avatar className="h-24 w-24 mx-auto md:mx-0 mb-4">

										<AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-800">

											{profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>

									{!isEditingProfile ? (
                  <Button
                    onClick={handleEditProfile}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>

									) : (
										<div className="flex gap-2 mt-2">
											<Button
												onClick={handleSaveProfile}
												size="sm"
												className="bg-emerald-600 hover:bg-emerald-700"
												disabled={isLoading}
											>
												{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
												Save
											</Button>
											<Button
												onClick={handleCancelEdit}
												variant="outline"
												size="sm"
											>
												Cancel
											</Button>
										</div>
									)}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">

									{isEditingProfile ? (
										<div className="space-y-4">
											<input
												type="text"
												value={editFormData.name}
												onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
												className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-emerald-300 focus:border-emerald-600 outline-none"
												placeholder="Enter your name"
											/>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<input
													type="tel"
													value={editFormData.phone}
													onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
													className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Phone number"
												/>
												<input
													type="text"
													value={editFormData.address}
													onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
													className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="Address"
												/>
												<input
													type="text"
													value={editFormData.city}
													onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
													className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="City"
												/>
												<input
													type="text"
													value={editFormData.state}
													onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
													className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="State"
												/>
												<input
													type="text"
													value={editFormData.zipCode}
													onChange={(e) => setEditFormData({...editFormData, zipCode: e.target.value})}
													className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
													placeholder="ZIP Code"
												/>
											</div>
										</div>
									) : (
										<>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">

												{profile.name || 'User'}
                  </h1>
                  <p className="text-gray-600 mb-4 flex items-center justify-center md:justify-start">
                    <User className="mr-2 h-4 w-4" />

												{profile.email || 'No email'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">

												{profile.phone && (
													<div className="flex items-center text-sm text-gray-600">
														<Phone className="mr-2 h-4 w-4" />
														{profile.phone}
													</div>
												)}
												{profile.address && (
													<div className="flex items-center text-sm text-gray-600">
														<MapPin className="mr-2 h-4 w-4" />
														{profile.address}
													</div>
												)}
												{profile.city && profile.state && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />

														{profile.city}, {profile.state}
                    </div>

												)}
                    </div>

										</>
									)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* My Donations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Package className="mr-3 h-6 w-6 text-emerald-600" />
              My Donations
            </h2>
            <Badge variant="secondary" className="text-sm">

							{userDonations?.length || 0} items
            </Badge>
          </div>
          

					{userDonations && userDonations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

							{userDonations.map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="relative">
                  <FoodCard 

											food={{
												name: donation.title,
												type: donation.food_type,
												description: donation.description,
												expiry: donation.expiry_date,
												location: donation.pickup_location,
												image: donation.image_url,
												quantity: donation.quantity
											}}
                    actionType="donate"
                    onAction={() => console.log('Donation action:', donation)}
											hideAction
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(donation.status)}
										</div>
										{/* Donation Details */}
										<div className="mt-3 text-sm text-gray-700 space-y-1">
											<div><span className="font-medium">Title:</span> {donation.title}</div>
											<div><span className="font-medium">Type:</span> {donation.food_type}</div>
											{donation.quantity && (<div><span className="font-medium">Quantity:</span> {donation.quantity}</div>)}
											<div><span className="font-medium">Expiry:</span> {donation.expiry_date}</div>
											<div><span className="font-medium">Location:</span> {donation.pickup_location}</div>
											<div><span className="font-medium">Status:</span> {donation.status}</div>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					) : (
						<div className="text-center py-12">
							<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-600">No donations yet</p>
							<p className="text-sm text-gray-500">Start sharing food with your community!</p>
						</div>
					)}
				</motion.div>

				{/* Donated (Approved/Completed) Section */}
				{Array.isArray(userDonations) && userDonations.some(d => d.status === 'reserved' || d.status === 'picked_up') && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.6 }}
						className="mb-12"
					>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-2xl font-bold text-gray-900 flex items-center">
								<Package className="mr-3 h-6 w-6 text-emerald-600" />
								Donated
							</h2>
							<Badge variant="secondary" className="text-sm">
								{userDonations.filter(d => d.status === 'reserved' || d.status === 'picked_up').length} items
							</Badge>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{userDonations.filter(d => d.status === 'reserved' || d.status === 'picked_up').map((donation, index) => (
								<motion.div
									key={`donated-${donation.id}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.1 }}
								>
									<div className="relative">
										<FoodCard 
											food={{
												name: donation.title,
												type: donation.food_type,
												description: donation.description,
												expiry: donation.expiry_date,
												location: donation.pickup_location,
												image: donation.image_url,
												quantity: donation.quantity
											}}
                    actionType="donate"
                    onAction={() => console.log('Donation action:', donation)}

											hideAction
                  />
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(donation.status)}

                  </div>
										{/* Donation Details */}
										<div className="mt-3 text-sm text-gray-700 space-y-1">
											<div><span className="font-medium">Title:</span> {donation.title}</div>
											<div><span className="font-medium">Type:</span> {donation.food_type}</div>
											{donation.quantity && (<div><span className="font-medium">Quantity:</span> {donation.quantity}</div>)}
											<div><span className="font-medium">Expiry:</span> {donation.expiry_date}</div>
											<div><span className="font-medium">Location:</span> {donation.pickup_location}</div>
											<div><span className="font-medium">Status:</span> {donation.status}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

				)}

        {/* My Requests Section - Shows requests user has submitted */}
        {sentRequests && sentRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Heart className="mr-3 h-6 w-6 text-emerald-600" />
                My Requests
              </h2>
              <Badge variant="secondary" className="text-sm">
                {sentRequests?.length || 0} requests
              </Badge>
            </div>
            
            <div className="space-y-6">
              {sentRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Food Card */}
                        <div className="lg:col-span-1">
                          <FoodCard 
                            food={{
                              name: request.donation?.title || 'Unknown Food',
                              type: request.donation?.food_type || 'Unknown',
                              description: request.donation?.description || '',
                              expiry: request.donation?.expiry_date || '',
                              location: request.donation?.pickup_location || '',
                              image: request.donation?.image_url,
                              quantity: request.donation?.quantity,
                              donor: {
                                contactName: request.donation?.donor?.name || 'Anonymous',
                                phone: request.donation?.donor?.phone || 'N/A',
                                email: request.donation?.donor?.email || 'N/A'
                              }
                            }}
                            actionType="request"
                            onAction={() => console.log('Food details:', request.donation)}
                            hideAction
                            showDonorDetails={true}
                          />
                        </div>
                        
                        {/* Request Details */}
                        <div className="lg:col-span-2 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Your Request Status
                            </h3>
                            <Badge 
                              className={request.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : request.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {request.status === 'approved' ? 'Approved' : 
                               request.status === 'rejected' ? 'Rejected' : 
                               request.status === 'completed' ? 'Completed' : 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="mr-2 h-4 w-4 text-emerald-600" />
                                <span className="font-medium">Requested:</span>
                                <span className="ml-2">
                                  {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Unknown'}
                                </span>
                              </div>
                              {request.pickup_time && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="mr-2 h-4 w-4 text-emerald-600" />
                                  <span className="font-medium">Pickup Time:</span>
                                  <span className="ml-2">{request.pickup_time}</span>
                                </div>
                              )}
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="mr-2 h-4 w-4 text-emerald-600" />
                                <span className="font-medium">Location:</span>
                                <span className="ml-2">
                                  {request.donation?.pickup_location || 'Unknown'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="mr-2 h-4 w-4 text-emerald-600" />
                                <span className="font-medium">Donor:</span>
                                <span className="ml-2">{request.donation?.donor?.name || 'Anonymous'}</span>
                              </div>
                              {request.donation?.donor?.phone && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="mr-2 h-4 w-4 text-emerald-600" />
                                  <span className="font-medium">Phone:</span>
                                  <span className="ml-2">{request.donation.donor.phone}</span>
                                </div>
                              )}
                              {request.donation?.donor?.email && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Mail className="mr-2 h-4 w-4 text-emerald-600" />
                                  <span className="ml-2">{request.donation.donor.email}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>Your Message:</strong> {request.message}
                              </p>
                            </div>
                          )}
                          
                          {/* Action Buttons for Pending Requests */}
                          {request.status === 'pending' && (
                            <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={() => handleCancelRequest(request.id)}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Cancel Request
                              </Button>
                            </div>
                          )}
                          
                          {/* Approved Request Status */}
                          {request.status === 'approved' && (
                            <div className="bg-green-50 p-4 rounded-md border border-green-200">
                              <div className="text-center">
                                <div className="text-green-700 font-semibold mb-2">
                                  ✅ Request Approved!
                                </div>
                                <p className="text-sm text-green-600 mb-3">
                                  Your pickup request has been approved by the donor.
                                </p>
                                <div className="bg-white p-3 rounded border border-green-200">
                                  <p className="text-sm text-gray-700">
                                    <strong>Next Steps:</strong> Contact the donor using the information above to arrange pickup.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Completed Request Status */}
                          {request.status === 'completed' && (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                              <div className="text-center">
                                <div className="text-blue-700 font-semibold mb-2">
                                  🎉 Pickup Completed!
                                </div>
                                <p className="text-sm text-blue-600">
                                  Thank you for using AnnaDan. Your food pickup has been completed successfully.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Rejected Request Info */}
                          {request.status === 'rejected' && (
                            <div className="bg-red-50 p-4 rounded-md border border-red-200">
                              <div className="text-center">
                                <div className="text-red-700 font-semibold mb-2">
                                  ❌ Request Not Approved
                                </div>
                                <p className="text-sm text-red-600">
                                  Your request was not approved by the donor. You can try requesting other available food items.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Incoming Pickup Requests Section - Show to all users, but action buttons only for donors */}
        {receivedRequests && receivedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Truck className="mr-3 h-6 w-6 text-emerald-600" />
              Incoming Pickup Requests
            </h2>
            <Badge variant="secondary" className="text-sm">
                {receivedRequests?.length || 0} requests
            </Badge>
          </div>
          
          <div className="space-y-6">
              {receivedRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Food Card */}
                      <div className="lg:col-span-1">
                        <FoodCard 
                            food={{
                              name: request.donation?.food_name || 'Unknown Food',
                              type: request.donation?.food_type || 'Unknown',
                              description: request.donation?.description || '',
                              expiry: request.donation?.expiry_date || '',
                              location: request.donation?.pickup_location || '',
                              image: request.donation?.image_url,
                              quantity: request.donation?.quantity
                            }}
                          actionType="donate"
                            onAction={() => console.log('Food details:', request.donation)}
                            hideAction
                            showDonorDetails={false}
                        />
                      </div>
                      
                      {/* Request Details */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">
                              Pickup Request from {request.requester?.name || 'Unknown User'}
                          </h3>
                          <Badge 
                              className={request.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                                : request.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }
                          >
                              {request.status === 'approved' ? 'Approved' : 
                               request.status === 'rejected' ? 'Rejected' : 'Pending'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Requested:</span>
                                <span className="ml-2">
                                  {request.created_at ? new Date(request.created_at).toLocaleDateString() : 'Unknown'}
                                </span>
                            </div>
                              {request.pickup_time && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Pickup Time:</span>
                                  <span className="ml-2">{request.pickup_time}</span>
                            </div>
                              )}
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Location:</span>
                                <span className="ml-2">
                                  {request.donation?.pickup_location || 'Unknown'}
                                </span>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Name:</span>
                                <span className="ml-2">{request.requester?.name || 'Unknown'}</span>
                            </div>
                              {request.requester?.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Phone:</span>
                                  <span className="ml-2">{request.requester.phone}</span>
                            </div>
                              )}
                              {request.requester?.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="mr-2 h-4 w-4 text-emerald-600" />
                              <span className="font-medium">Email:</span>
                                  <span className="ml-2">{request.requester.email}</span>
                            </div>
                              )}
                          </div>
                        </div>
                          
                          {request.message && (
                            <div className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>Message:</strong> {request.message}
                              </p>
                            </div>
                          )}
                        
                        {/* Action Buttons - Only for Donors */}
                          {request.status === 'pending' && profile && request.donation && request.donation.donor_id === profile.id && (
                        <div className="flex gap-3 pt-4">
                              <Button 
                                onClick={() => handlePickupRequestAction(request.id, 'confirm')}
                                className="bg-emerald-600 hover:bg-emerald-700"
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Confirm Pickup
                              </Button>
                              <Button 
                                onClick={() => handlePickupRequestAction(request.id, 'decline')}
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                disabled={isLoading}
                              >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Decline Request
                              </Button>
                            </div>
                          )}
                          
                          {/* Status Message for Non-Donors (should not show in incoming requests section) */}
                          {request.status === 'pending' && profile && request.donation && request.donation.donor_id !== profile.id && (
                            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 pt-4">
                              <p className="text-sm text-yellow-700 text-center">
                                ⏳ This request is pending approval from the donor.
                              </p>
                            </div>
                          )}
                          
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
        )}

        {/* Show message when user has no requests or donations */}
        {(!sentRequests || sentRequests.length === 0) && (!receivedRequests || receivedRequests.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mb-12"
          >
            <div className="text-center py-12">
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No food requests yet</p>
                  <p className="text-sm text-gray-500">Browse available food and submit requests!</p>
                </div>
                <div className="text-center">
                  <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No incoming requests</p>
                  <p className="text-sm text-gray-500">Donate food to receive pickup requests!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

