import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { redis } from '@/lib/upstash/client'

interface RateLimitConfig {
  requests: number
  window: number // in seconds
}

const DEFAULT_LIMIT: RateLimitConfig = {
  requests: 100,
  window: 60, // 100 requests per minute
}

const STRICT_LIMIT: RateLimitConfig = {
  requests: 10,
  window: 60, // 10 requests per minute for sensitive endpoints
}

// Rate limit configurations by route pattern
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/auth': STRICT_LIMIT,
  '/api/follow': STRICT_LIMIT,
  '/api/upload': { requests: 5, window: 60 },
  default: DEFAULT_LIMIT,
}

export async function rateLimitMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const ip = (request as unknown as { ip?: string }).ip ?? 'anonymous'
  const path = request.nextUrl.pathname
  
  // Find matching rate limit config
  const config = Object.entries(RATE_LIMITS).find(([pattern]) => 
    path.startsWith(pattern)
  )?.[1] ?? RATE_LIMITS.default
  
  const key = `ratelimit:${ip}:${path}`
  
  // Get current count
  const current = await redis.get<number>(key) ?? 0
  
  if (current >= config.requests) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }
  
  // Increment counter
  await redis.incr(key)
  
  // Set expiry on first request
  if (current === 0) {
    await redis.expire(key, config.window)
  }
  
  return null
}

// Sliding window rate limit for stricter control
export async function slidingWindowRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const now = Date.now()
  const windowStart = now - windowSeconds * 1000
  
  const key = `sliding:${identifier}`
  
  // Remove old entries outside the window
  await redis.zremrangebyscore(key, 0, windowStart)
  
  // Count current requests in window
  const currentCount = await redis.zcard(key)
  
  if (currentCount >= limit) {
    // Get oldest request to calculate reset time
    const oldest = await redis.zrange(key, 0, 0, { withScores: true })
    const oldestEntry = oldest[0] as unknown as { score: string }
    const resetTime = oldest.length > 0 ? parseInt(oldestEntry.score) + windowSeconds * 1000 : now
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(resetTime / 1000),
    }
  }
  
  // Add current request
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` })
  await redis.expire(key, windowSeconds)
  
  return {
    success: true,
    limit,
    remaining: limit - currentCount - 1,
    reset: Math.ceil((now + windowSeconds * 1000) / 1000),
  }
}
