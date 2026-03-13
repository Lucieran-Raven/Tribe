import { NextResponse } from 'next/server'
import { meilisearch, MEILI_INDEXES, isMeilisearchEnabled } from '@/lib/meilisearch/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'posts'
  const limit = parseInt(searchParams.get('limit') || '20')
  
  if (!query.trim()) {
    return NextResponse.json({ results: [] })
  }

  // Return empty if Meilisearch not configured
  if (!isMeilisearchEnabled) {
    return NextResponse.json({ 
      results: [],
      total: 0,
      query,
      message: 'Search not configured'
    })
  }

  try {
    const index = meilisearch.index(
      type === 'users' ? MEILI_INDEXES.users : MEILI_INDEXES.posts
    )
    
    const searchResults = await index.search(query, {
      limit,
      attributesToHighlight: ['caption', 'username', 'display_name'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    })
    
    return NextResponse.json({
      results: searchResults.hits,
      total: searchResults.estimatedTotalHits,
      query,
    })
  } catch (error) {
    console.error('Meilisearch error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
