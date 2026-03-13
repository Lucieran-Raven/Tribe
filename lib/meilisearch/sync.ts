import { meilisearch, MEILI_INDEXES, MEILI_SETTINGS } from './client'

// Sync a post to Meilisearch index
export async function indexPost(post: {
  id: string
  caption: string
  user_id: string
  username: string
  created_at: string
  likes_count: number
  comments_count: number
  media_urls: string[]
}) {
  const index = meilisearch.index(MEILI_INDEXES.posts)
  
  await index.addDocuments([{
    id: post.id,
    caption: post.caption,
    user_id: post.user_id,
    username: post.username,
    created_at: post.created_at,
    likes_count: post.likes_count,
    comments_count: post.comments_count,
    media_url: post.media_urls[0] || null,
  }])
}

// Sync a user to Meilisearch index
export async function indexUser(user: {
  id: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  university_id?: string
  graduation_year?: number
  course?: string
}) {
  const index = meilisearch.index(MEILI_INDEXES.users)
  
  await index.addDocuments([{
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    bio: user.bio || '',
    avatar_url: user.avatar_url || null,
    university_id: user.university_id || null,
    graduation_year: user.graduation_year || null,
    course: user.course || null,
  }])
}

// Delete post from index
export async function deletePostFromIndex(postId: string) {
  const index = meilisearch.index(MEILI_INDEXES.posts)
  await index.deleteDocument(postId)
}

// Setup index settings (run once on deployment)
export async function setupMeilisearchIndexes() {
  // Posts index
  const postsIndex = meilisearch.index(MEILI_INDEXES.posts)
  await postsIndex.updateSettings(MEILI_SETTINGS.posts)
  
  // Users index
  const usersIndex = meilisearch.index(MEILI_INDEXES.users)
  await usersIndex.updateSettings(MEILI_SETTINGS.users)
}
