import { redis, CACHE_KEYS, CACHE_TTL } from './client'

export async function getCachedFeed(userId: string) {
  const key = CACHE_KEYS.feed(userId)
  const cached = await redis.get<string>(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedFeed(userId: string, feed: unknown[]) {
  const key = CACHE_KEYS.feed(userId)
  await redis.setex(key, CACHE_TTL.feed, JSON.stringify(feed))
}

export async function invalidateFeedCache(userId: string) {
  const key = CACHE_KEYS.feed(userId)
  await redis.del(key)
}

export async function getCachedUser(userId: string) {
  const key = CACHE_KEYS.user(userId)
  const cached = await redis.get<string>(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedUser(userId: string, user: unknown) {
  const key = CACHE_KEYS.user(userId)
  await redis.setex(key, CACHE_TTL.user, JSON.stringify(user))
}

export async function invalidateUserCache(userId: string) {
  const key = CACHE_KEYS.user(userId)
  await redis.del(key)
}

export async function getCachedPost(postId: string) {
  const key = CACHE_KEYS.post(postId)
  const cached = await redis.get<string>(key)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedPost(postId: string, post: unknown) {
  const key = CACHE_KEYS.post(postId)
  await redis.setex(key, CACHE_TTL.post, JSON.stringify(post))
}

export async function invalidatePostCache(postId: string) {
  const key = CACHE_KEYS.post(postId)
  await redis.del(key)
}
