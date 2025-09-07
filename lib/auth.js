import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// JWT token configuration
const JWT_CONFIG = {
  expiresIn: '7d',
  issuer: 'annadan',
  audience: 'annadan-users'
}

// Helper function to generate JWT token
export const generateToken = (userId, additionalData = {}) => {
  try {
    const payload = {
      userId,
      ...additionalData,
      iat: Math.floor(Date.now() / 1000)
      // Note: exp is automatically set by JWT_CONFIG.expiresIn
    }
    
    return jwt.sign(payload, JWT_SECRET, JWT_CONFIG)
  } catch (error) {
    console.error('Token generation error:', error)
    throw new Error('Failed to generate token')
  }
}

// Helper function to verify JWT token
export const verifyToken = (token) => {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' }
    }

    const decoded = jwt.verify(token, JWT_SECRET, JWT_CONFIG)
    return { valid: true, decoded }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { valid: false, error: 'Token expired' }
    } else if (error.name === 'JsonWebTokenError') {
      return { valid: false, error: 'Invalid token' }
    } else {
      return { valid: false, error: 'Token verification failed' }
    }
  }
}

// Helper function to extract token from request headers
export const extractToken = (request) => {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.split(' ')[1]
}

// Helper function to authenticate request
export const authenticateRequest = (request) => {
  const token = extractToken(request)
  
  if (!token) {
    return { authenticated: false, error: 'Authentication required' }
  }
  
  const verification = verifyToken(token)
  
  if (!verification.valid) {
    return { authenticated: false, error: verification.error }
  }
  
  return { authenticated: true, user: verification.decoded }
}

// Password hashing utilities
export const hashPassword = async (password, rounds = 12) => {
  try {
    return await bcrypt.hash(password, rounds)
  } catch (error) {
    console.error('Password hashing error:', error)
    throw new Error('Failed to hash password')
  }
}

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password comparison error:', error)
    throw new Error('Failed to compare passwords')
  }
}

// Refresh token utilities
export const generateRefreshToken = (userId) => {
  try {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    }
    
    return jwt.sign(payload, JWT_SECRET, { ...JWT_CONFIG, expiresIn: '30d' })
  } catch (error) {
    console.error('Refresh token generation error:', error)
    throw new Error('Failed to generate refresh token')
  }
}

// Token validation middleware for API routes
export const requireAuth = (handler) => {
  return async (request) => {
    const auth = authenticateRequest(request)
    
    if (!auth.authenticated) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Add user info to request context
    request.user = auth.user
    
    return handler(request)
  }
}

// Role-based access control
export const requireRole = (requiredRole) => {
  return (handler) => {
    return requireAuth(async (request) => {
      if (request.user.role !== requiredRole) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      return handler(request)
    })
  }
}

// Export common authentication patterns
export const auth = {
  generateToken,
  verifyToken,
  extractToken,
  authenticateRequest,
  hashPassword,
  comparePassword,
  generateRefreshToken,
  requireAuth,
  requireRole
}

export default auth
