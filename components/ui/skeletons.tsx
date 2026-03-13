'use client'

export function PostCardSkeleton() {
  return (
    <div className="bg-white border rounded-lg mb-4 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center p-3 gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>

      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200" />

      {/* Actions skeleton */}
      <div className="p-3 space-y-3">
        <div className="flex gap-4">
          <div className="w-6 h-6 rounded bg-gray-200" />
          <div className="w-6 h-6 rounded bg-gray-200" />
          <div className="w-6 h-6 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-2/3 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Cover */}
      <div className="h-48 md:h-64 bg-gray-200" />
      
      {/* Profile info */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end -mt-16 mb-4">
          <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white" />
          <div className="mt-4 md:mt-0 md:ml-6 flex-1 space-y-2">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-6 py-4 border-t">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
