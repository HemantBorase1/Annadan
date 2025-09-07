import { createClient } from '@supabase/supabase-js'
import { v2 as cloudinary } from 'cloudinary'

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  throw new Error('Missing Cloudinary environment variables')
}

// Create and export Supabase client
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Export a function to get a new client instance if needed
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error, operation = 'database operation') => {
  console.error(`${operation} error:`, error)
  
  // Return a standardized error response
  return {
    success: false,
    error: error.message || 'Database operation failed',
    details: error.details || null,
    hint: error.hint || null
  }
}

// Helper function to validate database connection
export const validateConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      throw error
    }
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Cloudinary upload utilities
export const cloudinaryUpload = {
  // Upload avatar image
  uploadAvatar: async (file, folder = 'annadan/avatars') => {
    try {
      console.log('=== CLOUDINARY AVATAR UPLOAD ===')
      console.log('File received:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      if (!file) {
        throw new Error('No file provided for upload')
      }
      
      // Convert file to base64 for Cloudinary
      console.log('Converting file to base64...')
      const base64String = await fileToBase64(file)
      console.log('Base64 conversion successful, length:', base64String.length)
      
      const result = await cloudinary.uploader.upload(base64String, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }
        ]
      })
      
      console.log('Cloudinary avatar upload successful:', {
        url: result.secure_url,
        publicId: result.public_id,
        folder: folder
      })
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    } catch (error) {
      console.error('Cloudinary avatar upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload avatar'
      }
    }
  },

  // Upload food image
  uploadFoodImage: async (file, folder = 'annadan/food-images') => {
    try {
      if (!file) {
        throw new Error('No file provided for upload')
      }
      
      // Convert file to base64 for Cloudinary
      const base64String = await fileToBase64(file)
      
      const result = await cloudinary.uploader.upload(base64String, {
        folder: folder,
        resource_type: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto:good' }
        ]
      })
      
      console.log('Cloudinary food image upload successful:', {
        url: result.secure_url,
        publicId: result.public_id,
        folder: folder
      })
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height
      }
    } catch (error) {
      console.error('Cloudinary food image upload error:', error)
      return {
        success: false,
        error: error.message || 'Failed to upload food image'
      }
    }
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId) => {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return {
        success: true,
        result: result
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      }
    }
  },

  // Get optimized URL with transformations
  getOptimizedUrl: (url, transformations = {}) => {
    if (!url || !url.includes('cloudinary.com')) {
      return url
    }
    
    // Apply transformations if URL is from Cloudinary
    const cloudinaryUrl = cloudinary.url(url, {
      transformation: [
        { quality: 'auto:good' },
        ...Object.entries(transformations).map(([key, value]) => ({ [key]: value }))
      ]
    })
    
    return cloudinaryUrl
  }
}

// Helper function to convert file to base64 (server-side compatible)
const fileToBase64 = async (file) => {
  try {
    console.log('fileToBase64: Processing file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      isServerSide: typeof window === 'undefined'
    })
    
    // For server-side (Node.js), use Buffer
    if (typeof window === 'undefined') {
      console.log('Using server-side Buffer conversion')
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      const mimeType = file.type || 'application/octet-stream'
      const result = `data:${mimeType};base64,${base64}`
      console.log('Server-side conversion complete, result length:', result.length)
      return result
    } else {
      console.log('Using client-side FileReader conversion')
      // For client-side, use FileReader
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          console.log('Client-side conversion complete, result length:', reader.result.length)
          resolve(reader.result)
        }
        reader.onerror = error => reject(error)
      })
    }
  } catch (error) {
    console.error('File to base64 conversion error:', error)
    throw new Error('Failed to convert file to base64')
  }
}

// Export common database operations
export const db = {
  // expose raw client for special queries
  supabase,
  // User operations
  users: {
    findById: (id) => supabase.from('users').select('*').eq('id', id).single(),
    findByEmail: (email) => supabase.from('users').select('*').eq('email', email).single(),
    create: (userData) => supabase.from('users').insert([userData]).select().single(),
    update: (id, updates) => supabase.from('users').update(updates).eq('id', id).select().single(),
    delete: (id) => supabase.from('users').delete().eq('id', id)
  },

  // Food donations operations
  donations: {
    findById: (id) => supabase.from('food_donations').select('*').eq('id', id).single(),
    findByUser: (userId) => supabase
      .from('food_donations')
      .select('*')
      .eq('donor_id', userId)
      .order('created_at', { ascending: false }),
    findAvailable: (filters = {}) => {
      let query = supabase
        .from('food_donations')
        .select(`
          *,
          donor:users!donor_id (
            id,
            name,
            email,
            phone,
            avatar_url
          )
        `)
        .eq('status', 'available')
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false })

      if (filters.foodType && filters.foodType !== 'All') {
        query = query.eq('food_type', filters.foodType)
      }

      if (filters.location) {
        query = query.ilike('pickup_location', `%${filters.location}%`)
      }

      if (filters.limit && filters.offset) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1)
      }

      return query
    },
    create: (donationData) => supabase.from('food_donations').insert([donationData]).select().single(),
    update: (id, updates) => supabase.from('food_donations').update(updates).eq('id', id).select().single(),
    delete: (id) => supabase.from('food_donations').delete().eq('id', id)
  },

  // Pickup requests operations
  pickupRequests: {
    findById: (id) => supabase
      .from('pickup_requests')
      .select(`
        *,
        donation:food_donations!donation_id (
          id,
          donor_id,
          title,
          status
        )
      `)
      .eq('id', id)
      .single(),
    findByUser: (userId, type = 'sent') => {
      if (type === 'received') {
        return supabase
          .from('pickup_requests')
          .select(`
            *,
            donation:food_donations!donation_id (
              id,
              donor_id,
              title,
              description,
              food_type,
              quantity,
              expiry_date,
              pickup_location,
              image_url
            ),
            requester:users!requester_id (
              id,
              name,
              email,
              phone,
              avatar_url
            )
          `)
          .eq('donation.donor_id', userId)
      } else {
        return supabase
          .from('pickup_requests')
          .select(`
            *,
            donation:food_donations!donation_id (
              id,
              title,
              description,
              food_type,
              quantity,
              expiry_date,
              pickup_location,
              image_url,
              donor:users!donor_id (
                id,
                name,
                email,
                phone,
                avatar_url
              )
            )
          `)
          .eq('requester_id', userId)
      }
    },
    create: (requestData) => supabase.from('pickup_requests').insert([requestData]).select().single(),
    update: (id, updates) => supabase.from('pickup_requests').update(updates).eq('id', id).select().single(),
    delete: (id) => supabase.from('pickup_requests').delete().eq('id', id)
  },

  // AI recipes operations
  recipes: {
    findById: (id) => supabase.from('ai_recipes').select('*').eq('id', id).single(),
    findByUser: (userId, limit = 10, offset = 0) => {
      return supabase
        .from('ai_recipes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
    },
    create: (recipeData) => supabase.from('ai_recipes').insert([recipeData]).select().single(),
    update: (id, updates) => supabase.from('ai_recipes').update(updates).eq('id', id).select().single(),
    delete: (id) => supabase.from('ai_recipes').delete().eq('id', id)
  },

  // Feedback operations
  feedback: {
    findById: (id) => supabase.from('feedback').select('*').eq('id', id).single(),
    findAll: (filters = {}) => {
      let query = supabase
        .from('feedback')
        .select(`
          *,
          user:users!user_id (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.category) {
        query = query.eq('category', filters.category)
      }

      if (filters.limit && filters.offset) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1)
      }

      return query
    },
    create: (feedbackData) => supabase.from('feedback').insert([feedbackData]).select().single(),
    update: (id, updates) => supabase.from('feedback').update(updates).eq('id', id).select().single(),
    delete: (id) => supabase.from('feedback').delete().eq('id', id)
  },

  // Storage operations (now using Cloudinary)
  storage: {
    uploadAvatar: async (file, filename) => {
      return await cloudinaryUpload.uploadAvatar(file)
    },
    uploadFoodImage: async (file, filename) => {
      return await cloudinaryUpload.uploadFoodImage(file)
    },
    deleteImage: async (publicId) => {
      return await cloudinaryUpload.deleteImage(publicId)
    },
    getOptimizedUrl: (url, transformations) => {
      return cloudinaryUpload.getOptimizedUrl(url, transformations)
    }
  }
}

export default supabase
