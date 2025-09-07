import { NextResponse } from 'next/server'
import { db, handleSupabaseError } from '../../../lib/supabase'
import { generateToken, hashPassword, comparePassword } from '../../../lib/auth'

// POST /api/auth/signup
export async function POST(request) {
  try {
    console.log('=== AUTH SIGNUP REQUEST ===')
    const formData = await request.formData()
    const name = formData.get('name')
    const email = formData.get('email')
    const password = formData.get('password')
    const profileImage = formData.get('profileImage')
    
    console.log('Form data received:', {
      name,
      email,
      hasPassword: !!password,
      hasProfileImage: !!profileImage,
      profileImageName: profileImage?.name,
      profileImageSize: profileImage?.size
    })

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: existingError } = await db.users.findByEmail(email)
    
    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      const errorResult = handleSupabaseError(existingError, 'Check existing user')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Upload profile image if provided
    let avatarUrl = null
    if (profileImage) {
      const filename = `${Date.now()}-${profileImage.name}`
      const uploadResult = await db.storage.uploadAvatar(profileImage, filename)

      if (!uploadResult.success) {
        console.error('Image upload error:', uploadResult.error)
      } else {
        avatarUrl = uploadResult.url
        console.log('Avatar uploaded successfully:', avatarUrl)
      }
    }

    // Create user in database
    console.log('Creating user with avatar URL:', avatarUrl)
    const { data: user, error: createError } = await db.users.create({
      name,
      email,
      password_hash: hashedPassword,
      avatar_url: avatarUrl,
      is_verified: true // Set to true by default since email verification is not implemented yet
    })

    if (createError) {
      console.error('Database creation error:', createError)
      const errorResult = handleSupabaseError(createError, 'Create user')
      return NextResponse.json(
        { error: errorResult.error },
        { status: 500 }
      )
    }
    
    console.log('User created successfully:', {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    })

    // Generate JWT token
    const token = generateToken(user.id)

    // Send verification email (optional - can be implemented later)
    try {
      // This would integrate with your email service
      console.log('User created successfully:', {
        id: user.id,
        email: user.email,
        verificationRequired: true
      })
    } catch (emailError) {
      console.error('Email notification error:', emailError)
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      },
      token
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/signin
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const password = searchParams.get('password')

  try {
    console.log('=== AUTH SIGNIN REQUEST ===')
    console.log('Signin attempt for email:', email)
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const { data: user, error: findError } = await db.users.findByEmail(email)

    if (findError) {
      const errorResult = handleSupabaseError(findError, 'Find user')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is verified
    console.log('User verification status:', user.is_verified)
    if (!user.is_verified) {
      console.log('User not verified, blocking signin')
      return NextResponse.json(
        { error: 'Please verify your email before signing in' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = generateToken(user.id)

    // Update last login
    try {
      await db.users.update(user.id, { last_login: new Date().toISOString() })
    } catch (updateError) {
      console.error('Failed to update last login:', updateError)
      // Don't fail the login for this error
    }

    console.log('Signin successful for user:', {
      id: user.id,
      name: user.name,
      email: user.email,
      is_verified: user.is_verified
    })

    return NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url
      },
      token
    })

  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
