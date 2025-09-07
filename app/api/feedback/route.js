import { NextResponse } from 'next/server'
import { db, handleSupabaseError } from '../../../lib/supabase'
import { authenticateRequest } from '../../../lib/auth'

// POST /api/feedback - Submit feedback
export async function POST(request) {
  try {
    const { name, email, subject, message, rating, category } = await request.json()

    // Validate required fields
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get user ID if authenticated
    let userId = null
    const auth = authenticateRequest(request)
    if (auth.authenticated) {
      userId = auth.user.userId
    }

    // Create feedback using centralized database operations
    const { data: feedback, error } = await db.feedback.create({
      user_id: userId,
      name: name || null,
      email: email || null,
      subject: subject || null,
      message,
      rating: rating || null,
      category: category || 'general',
      status: 'open'
    })

    if (error) {
      const errorResult = handleSupabaseError(error, 'Create feedback')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    // Send notification email to admin (optional)
    try {
      // This would integrate with your email service
      console.log('Feedback submitted:', {
        id: feedback.id,
        subject: feedback.subject,
        message: feedback.message.substring(0, 100) + '...'
      })
    } catch (emailError) {
      console.error('Email notification error:', emailError)
    }

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        status: feedback.status
      }
    })

  } catch (error) {
    console.error('Submit feedback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/feedback - Get feedback (admin only)
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

    // Check if user is admin
    const { data: user, error: userError } = await db.users.findById(auth.user.userId)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || 20)
    const offset = parseInt(searchParams.get('offset') || 0)

    // Use centralized database operations
    const { data: feedback, error } = await db.feedback.findAll({
      status,
      category,
      limit,
      offset
    })

    if (error) {
      const errorResult = handleSupabaseError(error, 'Fetch feedback')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      feedback,
      pagination: {
        limit,
        offset,
        hasMore: feedback.length === limit
      }
    })

  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
