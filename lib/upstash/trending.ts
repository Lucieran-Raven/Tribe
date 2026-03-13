import { redis } from './client'

const TRENDING_KEY = 'trending:posts'
const TRENDING_TTL = 3600 // 1 hour

interface TrendingPost {
  post_id: string
  score: number
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: string
}

export async function incrementPostScore(postId: string, action: 'like' | 'comment' | 'share') {
  const scores = {
    like: 1,
    comment: 3,
    share: 5,
  }
  
  const now = Date.now()
  // Use exponential decay: score * exp(-decay_rate * time_hours)
  const decayRate = 0.001 // Adjust based on desired trend speed
  const timeComponent = Math.exp(-decayRate * (now / 1000 / 3600))
  
  await redis.zincrby(TRENDING_KEY, scores[action] * timeComponent, postId)
  await redis.expire(TRENDING_KEY, TRENDING_TTL)
}

export async function getTrendingPosts(limit: number = 10): Promise<string[]> {
  // Get top trending post IDs using zrange with rev option
  const postIds = await redis.zrange(TRENDING_KEY, 0, limit - 1, { rev: true })
  return postIds as string[]
}

export async function getTrendingWithScores(): Promise<TrendingPost[]> {
  const results = await redis.zrange(TRENDING_KEY, 0, 9, { rev: true, withScores: true })
  
  const typedResults = results as unknown as (string | number)[]
  const trendingPosts: TrendingPost[] = []
  
  for (let i = 0; i < typedResults.length; i += 2) {
    const postId = String(typedResults[i])
    const score = Number(typedResults[i + 1])
    
    trendingPosts.push({
      post_id: postId,
      score,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
    })
  }
  
  return trendingPosts
}

export async function resetTrending() {
  await redis.del(TRENDING_KEY)
}
