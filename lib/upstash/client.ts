import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache keys
export const CACHE_KEYS = {
  feed: (userId: string) => `feed:${userId}`,
  user: (userId: string) => `user:${userId}`,
  post: (postId: string) => `post:${postId}`,
  trending: 'trending:posts',
  search: (query: string) => `search:${query}`,
} as const

// Cache TTL in seconds
export const CACHE_TTL = {
  feed: 300, // 5 minutes
  user: 600, // 10 minutes
  post: 300, // 5 minutes
  trending: 600, // 10 minutes
  search: 60, // 1 minute
} as const
