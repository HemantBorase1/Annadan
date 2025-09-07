import { NextResponse } from 'next/server'
import { db, handleSupabaseError } from '../../../lib/supabase'
import { authenticateRequest } from '../../../lib/auth'

// GET /api/profile - Get user profile
export async function GET(request) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    // Get user profile using centralized database operations
    const { data: user, error } = await db.users.findById(auth.user.userId)

    if (error) {
      const errorResult = handleSupabaseError(error, 'Fetch profile')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user statistics using centralized database operations
    const { data: donations, error: donationsError } = await db.donations.findByUser(auth.user.userId)
    const { data: recipes, error: recipesError } = await db.recipes.findByUser(auth.user.userId)
    
    // For ratings, we need to use a direct query since it's not in the centralized db object
    const { data: ratings, error: ratingsError } = await db.supabase
      .from('user_ratings')
      .select('rating')
      .eq('rated_user_id', auth.user.userId)

    // Normalize to arrays and compute stats safely
    const donationsList = Array.isArray(donations) ? donations : (donations ? [donations] : [])
    const recipesList = Array.isArray(recipes) ? recipes : (recipes ? [recipes] : [])
    const ratingsList = Array.isArray(ratings) ? ratings : (ratings ? [ratings] : [])

    const stats = {
      totalDonations: donationsList.length,
      activeDonations: donationsList.filter(d => d.status === 'available').length,
      totalRecipes: recipesList.length,
      averageRating: ratingsList.length > 0
        ? (ratingsList.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / ratingsList.length).toFixed(1)
        : 0
    }

    // Return comprehensive user profile data
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        zip_code: user.zip_code,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      stats
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    let name, phone, address, city, state, zipCode, profileImage

    // Check content type to determine how to parse the request
    const contentType = request.headers.get('content-type')
    
    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (file uploads)
      const formData = await request.formData()
      name = formData.get('name')
      phone = formData.get('phone')
      address = formData.get('address')
      city = formData.get('city')
      state = formData.get('state')
      zipCode = formData.get('zipCode')
      profileImage = formData.get('profileImage')
    } else {
      // Handle JSON data
      const body = await request.json()
      name = body.name
      phone = body.phone
      address = body.address
      city = body.city
      state = body.state
      zipCode = body.zipCode
      profileImage = body.profileImage
    }

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Upload new profile image if provided
    let avatarUrl = null
    if (profileImage && profileImage.size > 0) {
      const filename = `${Date.now()}-${profileImage.name}`
      const uploadResult = await db.storage.uploadAvatar(profileImage, filename)

      if (!uploadResult.success) {
        console.error('Image upload error:', uploadResult.error)
        return NextResponse.json(
          { error: 'Failed to upload profile image' },
          { status: 500 }
        )
      } else {
        avatarUrl = uploadResult.url
        console.log('Profile image uploaded successfully:', avatarUrl)
      }
    }

    // Update user profile using centralized database operations
    const updateData = {
      name,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      updated_at: new Date().toISOString()
    }

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    const { data: user, error } = await db.users.update(auth.user.userId, updateData)

    if (error) {
      const errorResult = handleSupabaseError(error, 'Update profile')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user
    })

  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
