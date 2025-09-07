import { NextResponse } from 'next/server'
import { db, handleSupabaseError } from '../../../lib/supabase'
import { authenticateRequest } from '../../../lib/auth'

// POST /api/pickup-requests - Create pickup request
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

    const { donationId, message, pickupTime } = await request.json()

    // Validate input
    if (!donationId) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    // Check if donation exists and is available using centralized database operations
    const { data: donation, error: donationError } = await db.donations.findById(donationId)

    if (donationError || !donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    if (donation.status !== 'available') {
      return NextResponse.json(
        { error: 'Donation is not available' },
        { status: 400 }
      )
    }

    // Check if user is not requesting their own donation
    if (donation.donor_id === auth.user.userId) {
      return NextResponse.json(
        { error: 'Cannot request your own donation' },
        { status: 400 }
      )
    }

    // Check if user already has a pending request for this donation
    const { data: existingRequest } = await db.supabase
      .from('pickup_requests')
      .select('id')
      .eq('donation_id', donationId)
      .eq('requester_id', auth.user.userId)
      .eq('status', 'pending')
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending request for this donation' },
        { status: 409 }
      )
    }

    // Create pickup request using centralized database operations
    const { data: pickupRequest, error } = await db.pickupRequests.create({
      donation_id: donationId,
      requester_id: auth.user.userId,
      message: message || null,
      pickup_time: pickupTime || null,
      status: 'pending'
    })

    if (error) {
      const errorResult = handleSupabaseError(error, 'Create pickup request')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    // Send notification to donor (optional)
    try {
      // This would integrate with your notification service
      console.log('Pickup request created:', {
        id: pickupRequest.id,
        donationId: donationId,
        requesterId: auth.user.userId
      })
    } catch (notificationError) {
      console.error('Notification error:', notificationError)
    }

    return NextResponse.json({
      message: 'Pickup request created successfully',
      pickupRequest
    })

  } catch (error) {
    console.error('Create pickup request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/pickup-requests - Get user's pickup requests
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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'sent' or 'received'
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || 10)
    const offset = parseInt(searchParams.get('offset') || 0)

    // Use centralized database operations
    const { data: requests, error } = await db.pickupRequests.findByUser(auth.user.userId, type)

    if (error) {
      const errorResult = handleSupabaseError(error, 'Fetch pickup requests')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    // Apply status filter if provided
    let filteredRequests = requests || []
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status)
    }

    // Apply pagination
    const paginatedRequests = filteredRequests.slice(offset, offset + limit)

    return NextResponse.json({
      requests: paginatedRequests,
      pagination: {
        limit,
        offset,
        hasMore: paginatedRequests.length === limit
      }
    })

  } catch (error) {
    console.error('Get pickup requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


