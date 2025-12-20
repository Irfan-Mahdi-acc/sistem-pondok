import { NextRequest } from 'next/server'

// Simple in-memory rate limiting (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface AuthResult {
  isValid: boolean
  error?: string
}

/**
 * Validate API Key from request headers
 * Checks X-API-Key header against environment variable
 */
export async function validateApiKey(request: NextRequest): Promise<AuthResult> {
  try {
    const apiKey = request.headers.get('X-API-Key')
    
    if (!apiKey) {
      return {
        isValid: false,
        error: 'API Key is required. Please provide X-API-Key header.'
      }
    }

    const validApiKey = process.env.API_SECRET_KEY
    
    if (!validApiKey) {
      console.error('API_SECRET_KEY not configured in environment variables')
      return {
        isValid: false,
        error: 'API authentication not configured'
      }
    }

    if (apiKey !== validApiKey) {
      return {
        isValid: false,
        error: 'Invalid API Key'
      }
    }

    // Check rate limiting
    const rateLimitResult = checkRateLimit(apiKey)
    if (!rateLimitResult.allowed) {
      return {
        isValid: false,
        error: `Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`
      }
    }

    return { isValid: true }
  } catch (error) {
    console.error('API Key validation error:', error)
    return {
      isValid: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Simple rate limiting: max requests per minute
 */
function checkRateLimit(apiKey: string): { allowed: boolean; retryAfter?: number } {
  const limit = parseInt(process.env.API_RATE_LIMIT || '100')
  const windowMs = 60 * 1000 // 1 minute
  const now = Date.now()

  const record = rateLimitMap.get(apiKey)

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(apiKey, {
      count: 1,
      resetTime: now + windowMs
    })
    return { allowed: true }
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Increment count
  record.count++
  return { allowed: true }
}

/**
 * Generate API response with consistent format
 */
export function apiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  meta?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
) {
  if (success) {
    return {
      success: true,
      data,
      ...(meta && { meta })
    }
  } else {
    return {
      success: false,
      error: error || 'An error occurred'
    }
  }
}
