import { NextResponse } from 'next/server'
import { db, handleSupabaseError } from '../../../../lib/supabase'
import { authenticateRequest } from '../../../../lib/auth'

// DELETE /api/pickup-requests/[id] - Cancel pickup request
export async function DELETE(request, { params }) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const requestId = params?.id
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get the pickup request to verify ownership
    const { data: pickupRequest, error: fetchError } = await db.pickupRequests.findById(requestId)
    
    if (fetchError || !pickupRequest) {
      return NextResponse.json(
        { error: 'Pickup request not found' },
        { status: 404 }
      )
    }

    // Check if user owns this request
    if (pickupRequest.requester_id !== auth.user.userId) {
      return NextResponse.json(
        { error: 'You can only cancel your own requests' },
        { status: 403 }
      )
    }

    // Check if request can be cancelled (only pending requests)
    if (pickupRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending requests can be cancelled' },
        { status: 400 }
      )
    }

    // Delete the pickup request
    const { error: deleteError } = await db.pickupRequests.delete(requestId)
    
    if (deleteError) {
      const errorResult = handleSupabaseError(deleteError, 'Delete pickup request')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Pickup request cancelled successfully'
    })

  } catch (error) {
    console.error('Delete pickup request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/pickup-requests/[id] - Update pickup request status
export async function PUT(request, { params }) {
  try {
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    const requestId = params?.id
    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    const { status } = await request.json()

    // Map frontend status to database status
    const statusMapping = {
      'confirmed': 'approved',
      'declined': 'rejected'
    }
    
    const dbStatus = statusMapping[status] || status

    // Validate status
    if (!['approved', 'rejected', 'completed'].includes(dbStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved, rejected, or completed' },
        { status: 400 }
      )
    }

    // Get the pickup request with donation details to verify ownership
    const { data: pickupRequest, error: fetchError } = await db.pickupRequests.findById(requestId)
    
    if (fetchError || !pickupRequest) {
      return NextResponse.json(
        { error: 'Pickup request not found' },
        { status: 404 }
      )
    }

    // Check if user owns the donation (for donor actions)
    if (pickupRequest.donation.donor_id !== auth.user.userId) {
      return NextResponse.json(
        { error: 'You can only update requests for your own donations' },
        { status: 403 }
      )
    }

    // Update the pickup request status
    const { data: updatedRequest, error: updateError } = await db.pickupRequests.update(requestId, { status: dbStatus })
    
    if (updateError) {
      const errorResult = handleSupabaseError(updateError, 'Update pickup request')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    // If the request is approved, update the donation status to 'reserved'
    if (dbStatus === 'approved') {
      const { error: donationUpdateError } = await db.donations.update(pickupRequest.donation_id, { 
        status: 'reserved' 
      })
      
      if (donationUpdateError) {
        console.error('Failed to update donation status:', donationUpdateError)
        // Don't fail the request, just log the error
        // The pickup request was updated successfully
      } else {
        console.log(`Donation ${pickupRequest.donation_id} status updated to 'reserved'`)
      }
    }

    // If the request is rejected, update the donation status back to 'available'
    if (dbStatus === 'rejected') {
      const { error: donationUpdateError } = await db.donations.update(pickupRequest.donation_id, { 
        status: 'available' 
      })
      
      if (donationUpdateError) {
        console.error('Failed to update donation status:', donationUpdateError)
        // Don't fail the request, just log the error
      } else {
        console.log(`Donation ${pickupRequest.donation_id} status updated to 'available'`)
      }
    }

    // If the request is completed (picked up), update the donation status to 'picked_up'
    if (dbStatus === 'completed') {
      const { error: donationUpdateError } = await db.donations.update(pickupRequest.donation_id, { 
        status: 'picked_up' 
      })
      
      if (donationUpdateError) {
        console.error('Failed to update donation status:', donationUpdateError)
        // Don't fail the request, just log the error
      } else {
        console.log(`Donation ${pickupRequest.donation_id} status updated to 'picked_up'`)
      }
    }

    return NextResponse.json({
      message: 'Pickup request updated successfully',
      pickupRequest: updatedRequest
    })

  } catch (error) {
    console.error('Update pickup request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/pickup-requests/[id] - Get pickup request details
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    // Authenticate request
    const auth = authenticateRequest(request)
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      )
    }

    // Get pickup request with related data
    const { data: pickupRequest, error } = await db.supabase
      .from('pickup_requests')
      .select(`
        *,
        donation:donations(*),
        requester:users!pickup_requests_requester_id_fkey(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      const errorResult = handleSupabaseError(error, 'Fetch pickup request')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    if (!pickupRequest) {
      return NextResponse.json(
        { error: 'Pickup request not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this request
    const isDonor = pickupRequest.donation.donor_id === auth.user.userId
    const isRequester = pickupRequest.requester_id === auth.user.userId
    
    if (!isDonor && !isRequester) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      pickupRequest
    })

  } catch (error) {
    console.error('Get pickup request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
