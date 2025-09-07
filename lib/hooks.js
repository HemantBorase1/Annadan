// Custom React Hooks for API Management
import { useState, useCallback, useEffect } from 'react'

// Hook for managing API call state
export const useApiCall = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(async (apiFunction, ...args) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiFunction(...args)
      if (response.success) {
        setData(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setData(null)
  }, [])

  return { isLoading, error, data, execute, reset }
}

// Hook for form submission with API calls
export const useFormSubmit = (apiFunction) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const submit = useCallback(async (formData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await apiFunction(formData)
      if (response.success) {
        setSuccess(true)
        return { success: true, data: response.data }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  }, [apiFunction])

  const reset = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return { isSubmitting, error, success, submit, reset }
}

// Hook for data fetching with refresh capability
export const useDataFetch = (apiFunction, dependencies = []) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const fetchData = useCallback(async (...args) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiFunction(...args)
      if (response.success) {
        setData(response.data)
        return { success: true, data: response.data }
      } else {
        setError(response.error)
        return { success: false, error: response.error }
      }
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction, ...dependencies])

  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  const reset = useCallback(() => {
    setError(null)
    setData(null)
  }, [])

  return { isLoading, error, data, fetchData, refresh, reset }
}

// Hook for profile management
export const useProfile = () => {
  const [profile, setProfile] = useState(null)
  const [userDonations, setUserDonations] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { profileAPI } = await import('./api')
      
      // Fetch profile data
      const profileResponse = await profileAPI.getProfile()
      if (profileResponse.success) {
        // Extract user data from the response
        setProfile(profileResponse.data.user)
      } else {
        throw new Error(profileResponse.error)
      }
      
      // Fetch user donations
      const donationsResponse = await profileAPI.getUserDonations()
      if (donationsResponse.success) {
        setUserDonations(donationsResponse.data || [])
      }
      
      // Fetch received pickup requests
      const receivedResponse = await profileAPI.getReceivedPickupRequests()
      if (receivedResponse.success) {
        setReceivedRequests(receivedResponse.data?.requests || [])
      }
      
      // Fetch sent pickup requests
      const sentResponse = await profileAPI.getSentPickupRequests()
      if (sentResponse.success) {
        setSentRequests(sentResponse.data?.requests || [])
      }
      
    } catch (err) {
      setError(err.message || 'Failed to fetch profile data')
      console.error('Profile fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (profileData) => {
    try {
      const { profileAPI } = await import('./api')
      const response = await profileAPI.updateProfile(profileData)
      
      if (response.success) {
        setProfile(response.data.user)
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  const updatePickupRequest = useCallback(async (requestId, status) => {
    try {
      const { profileAPI } = await import('./api')
      const response = await profileAPI.updatePickupRequest(requestId, status)
      
      if (response.success) {
        // Refresh pickup requests
        fetchProfile()
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update pickup request'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchProfile])

  const cancelRequest = useCallback(async (requestId) => {
    try {
      const { profileAPI } = await import('./api')
      const response = await profileAPI.cancelPickupRequest(requestId)
      
      if (response.success) {
        // Refresh pickup requests
        fetchProfile()
        return { success: true, data: response.data }
      } else {
        throw new Error(response.error)
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to cancel pickup request'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchProfile])

  const refresh = useCallback(() => {
    fetchProfile()
  }, [fetchProfile])

  const reset = useCallback(() => {
    setError(null)
    setProfile(null)
    setUserDonations([])
    setReceivedRequests([])
    setSentRequests([])
  }, [])

  // Auto-fetch profile data on mount
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    userDonations,
    receivedRequests,
    sentRequests,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updatePickupRequest,
    cancelRequest,
    refresh,
    reset
  }
}

// Hook for authentication state
export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      setIsLoading(false)
      return
    }

    try {
      // You can add a token validation API call here
      // For now, we'll just check if token exists
      setIsAuthenticated(true)
      // You can decode the token to get user info or make an API call
      setIsLoading(false)
    } catch (error) {
      localStorage.removeItem('authToken')
      setIsAuthenticated(false)
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((userData, token) => {
    localStorage.setItem('authToken', token)
    setUser(userData)
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    login,
    logout
  }
}
