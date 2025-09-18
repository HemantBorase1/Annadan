// API Service Layer - Centralized API calls for frontend
const API_BASE_URL = '/api'

// Generic API request function with error handling
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const headers = {
    ...options.headers
  }
  
  // Only set Content-Type for JSON requests (not FormData)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  
  // Add authentication token if available
  const token = localStorage.getItem('authToken')
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
    console.log('📤 Request Headers:', headers)
    if (options.body) {
      console.log('📤 Request Body:', options.body instanceof FormData ? '[FormData]' : options.body)
    }
    
    const response = await fetch(url, { ...options, headers })
    let data
    
    try {
      data = await response.json()
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError)
      throw new Error('Invalid JSON response from server')
    }
    
    console.log(`📥 API Response: ${response.status} ${response.statusText}`)
    console.log('📥 Response Data:', data)
    
    if (!response.ok) {
      const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`
      console.error('❌ API Error:', errorMessage)
      // Auto-logout on auth errors
      if (response.status === 401) {
        const msg = String(errorMessage).toLowerCase()
        if (msg.includes('token expired') || msg.includes('invalid token') || msg.includes('authentication required')) {
          try { localStorage.removeItem('authToken') } catch {}
        }
      }
      return { success: false, error: errorMessage, status: response.status }
    }
    
    console.log('✅ API Request Successful')
    return { success: true, data, status: response.status }
  } catch (error) {
    console.error(`❌ API Request failed for ${endpoint}:`, error)
    return { 
      success: false, 
      error: error.message || 'Network error occurred', 
      status: 0 
    }
  }
}

// Profile API
export const profileAPI = {
  // Get user profile with statistics
  getProfile: async () => {
    return apiRequest('/profile')
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    // Check if there's a file to upload
    if (profileData.profileImage) {
      // Use FormData for file uploads
      const formData = new FormData()
      formData.append('name', profileData.name)
      if (profileData.phone) formData.append('phone', profileData.phone)
      if (profileData.address) formData.append('address', profileData.address)
      if (profileData.city) formData.append('city', profileData.city)
      if (profileData.state) formData.append('state', profileData.state)
      if (profileData.zipCode) formData.append('zipCode', profileData.zipCode)
      formData.append('profileImage', profileData.profileImage)
      
      return apiRequest('/profile', {
        method: 'PUT',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      })
    } else {
      // Use JSON for regular data
      return apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
    }
  },
  
  // Get user's donations
  getUserDonations: async () => {
    return apiRequest('/donations?donor=me')
  },
  
  // Get user's pickup requests (received)
  getReceivedPickupRequests: async () => {
    return apiRequest('/pickup-requests?type=received')
  },
  
  // Get user's pickup requests (sent)
  getSentPickupRequests: async () => {
    return apiRequest('/pickup-requests?type=sent')
  },
  
  // Update pickup request status
  updatePickupRequest: async (requestId, status) => {
    return apiRequest(`/pickup-requests/${requestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },
  
  // Cancel pickup request
  cancelPickupRequest: async (requestId) => {
    return apiRequest(`/pickup-requests/${requestId}`, {
      method: 'DELETE'
    })
  }
}

// Donations API
export const donationsAPI = {
  // Get all available donations
  getDonations: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await apiRequest(`/donations?${params}`)
    
    // Extract donations array from response
    if (response.success && response.data && response.data.donations) {
      return {
        ...response,
        data: response.data.donations
      }
    }
    
    return response
  },
  
  // Create new donation
  createDonation: async (donationData) => {
    // Check if there's a file to upload
    if (donationData.foodImage) {
      // Use FormData for file uploads
      const formData = new FormData()
      formData.append('foodName', donationData.title)
      formData.append('foodType', donationData.food_type)
      formData.append('quantity', donationData.quantity)
      formData.append('description', donationData.description || '')
      formData.append('expiryDate', donationData.expiry_date)
      formData.append('pickupLocation', donationData.pickup_location)
      formData.append('contactName', donationData.contact_name)
      formData.append('contactPhone', donationData.contact_phone)
      formData.append('contactEmail', donationData.contact_email)
      formData.append('additionalNotes', donationData.additional_notes || '')
      formData.append('foodImage', donationData.foodImage)
      
      return apiRequest('/donations', {
        method: 'POST',
        body: formData,
        headers: {} // Remove Content-Type header to let browser set it with boundary
      })
    } else {
      // Use JSON for regular data
      return apiRequest('/donations', {
        method: 'POST',
        body: JSON.stringify(donationData)
      })
    }
  },
  
  // Get donation by ID
  getDonation: async (id) => {
    return apiRequest(`/donations/${id}`)
  },
  
  // Update donation
  updateDonation: async (id, updates) => {
    return apiRequest(`/donations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  },
  
  // Delete donation
  deleteDonation: async (id) => {
    return apiRequest(`/donations/${id}`, {
      method: 'DELETE'
    })
  }
}

// Pickup Requests API
export const pickupAPI = {
  // Get user's pickup requests
  getRequests: async (type = 'sent') => {
    return apiRequest(`/pickup-requests?type=${type}`)
  },
  
  // Create pickup request
  createRequest: async (requestData) => {
    return apiRequest('/pickup-requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  },
  
  // Update pickup request status
  updateRequest: async (id, updates) => {
    return apiRequest(`/pickup-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }
}

// Feedback API
export const feedbackAPI = {
  // Submit feedback
  submitFeedback: async (feedbackData) => {
    return apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    })
  },
  
  // Get all feedback
  getFeedback: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    return apiRequest(`/feedback?${params}`)
  }
}

// Recipes API
export const recipesAPI = {
  // Generate AI recipe
  generateRecipe: async (recipeData) => {
    return apiRequest('/recipes', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    })
  },
  
  // Get user's recipes
  getUserRecipes: async (limit = 10, offset = 0) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() })
    return apiRequest(`/recipes?${params}`)
  }
}

// API Utilities
export const apiUtils = {
  // Save authentication token
  saveToken: (token) => {
    localStorage.setItem('authToken', token)
  },
  
  // Get authentication token
  getToken: () => {
    return localStorage.getItem('authToken')
  },
  
  // Remove authentication token
  removeToken: () => {
    localStorage.removeItem('authToken')
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken')
  }
}

export default {
  authAPI,
  profileAPI,
  donationsAPI,
  pickupAPI,
  feedbackAPI,
  recipesAPI,
  apiUtils
}
