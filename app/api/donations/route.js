import { NextResponse } from 'next/server'
import { db, handleSupabaseError } from '../../../lib/supabase'
import { authenticateRequest } from '../../../lib/auth'

// GET /api/donations - Get all donations with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const foodType = searchParams.get('foodType')
    const location = searchParams.get('location')
    const donor = searchParams.get('donor') // 'me' to get user's own donations
    const limit = parseInt(searchParams.get('limit') || 20)
    const offset = parseInt(searchParams.get('offset') || 0)

    // If requesting user's own donations, authenticate the request
    if (donor === 'me') {
      const auth = authenticateRequest(request)
      if (!auth.authenticated) {
        return NextResponse.json(
          { error: auth.error },
          { status: 401 }
        )
      }
      
      // Get user's donations
      const { data: donations, error } = await db.donations.findByUser(auth.user.userId)
      
      if (error) {
        const errorResult = handleSupabaseError(error, 'Fetch user donations')
        return NextResponse.json(
          { error: errorResult.error },
          { status: 500 }
        )
      }

      return NextResponse.json({
        donations: donations || [],
        pagination: {
          limit,
          offset,
          hasMore: false
        }
      })
    }

    // Use centralized database operations for public donations
    const { data: donations, error } = await db.donations.findAvailable({
      foodType,
      location,
      limit,
      offset
    })

    if (error) {
      const errorResult = handleSupabaseError(error, 'Fetch donations')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      donations,
      pagination: {
        limit,
        offset,
        hasMore: donations.length === limit
      }
    })

  } catch (error) {
    console.error('Get donations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/donations - Create new donation
export async function POST(request) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const foodName = formData.get('foodName')
    const foodType = formData.get('foodType')
    const quantity = formData.get('quantity')
    const description = formData.get('description')
    const expiryDate = formData.get('expiryDate')
    const pickupLocation = formData.get('pickupLocation')
    const contactName = formData.get('contactName')
    const contactPhone = formData.get('contactPhone')
    const contactEmail = formData.get('contactEmail')
    const additionalNotes = formData.get('additionalNotes')
    const foodImage = formData.get('foodImage')

    // Validate required fields
    if (!foodName || !foodType || !quantity || !expiryDate || !pickupLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return NextResponse.json(
        { error: 'Expiry date must be in the future' },
        { status: 400 }
      )
    }

    // Upload food image if provided
    let imageUrl = null
    if (foodImage && foodImage.size > 0) {
      const filename = `${Date.now()}-${foodImage.name}`
      const uploadResult = await db.storage.uploadFoodImage(foodImage, filename)

      if (!uploadResult.success) {
        console.error('Image upload error:', uploadResult.error)
      } else {
        imageUrl = uploadResult.url
        console.log('Food image uploaded successfully:', imageUrl)
      }
    }

    // Create donation using centralized database operations
    console.log('Creating donation with image URL:', imageUrl)
    const { data: donation, error: createError } = await db.donations.create({
      donor_id: auth.user.userId,
      title: foodName,
      description: description || '',
      food_type: foodType,
      quantity,
      expiry_date: expiryDate,
      pickup_location: pickupLocation,
      image_url: imageUrl,
      status: 'available',
      donor_contact: {
        name: contactName,
        phone: contactPhone,
        email: contactEmail
      },
      additional_notes: additionalNotes || ''
    })

    if (createError) {
      const errorResult = handleSupabaseError(createError, 'Create donation')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    // Fetch the created donation with donor information
    const { data: fullDonation, error: fetchError } = await db.donations.findById(donation.id)
    
    if (fetchError) {
      console.error('Failed to fetch created donation:', fetchError)
      // Return the basic donation data if fetch fails
      return NextResponse.json({
        message: 'Donation created successfully',
        donation
      })
    }

    return NextResponse.json({
      message: 'Donation created successfully',
      donation: fullDonation
    })

  } catch (error) {
    console.error('Create donation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
