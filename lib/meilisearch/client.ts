import { MeiliSearch, Settings } from 'meilisearch'

export const meilisearch = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY!,
})

export const MEILI_INDEXES = {
  posts: 'posts',
  users: 'users',
}

// Search settings
export const MEILI_SETTINGS: Record<string, Settings> = {
  posts: {
    searchableAttributes: ['caption', 'username', 'tags'],
    filterableAttributes: ['user_id', 'created_at', 'tags'],
    sortableAttributes: ['created_at', 'likes_count'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
    },
  },
  users: {
    searchableAttributes: ['username', 'display_name', 'bio', 'course', 'university'],
    filterableAttributes: ['university_id', 'graduation_year', 'course', 'is_verified'],
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 3,
        twoTypos: 6,
      },
    },
  },
}
