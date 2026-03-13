/**
 * Extract hashtags from a caption
 * @param caption - The caption text to extract hashtags from
 * @returns Array of hashtags (with # prefix)
 */
export function extractHashtags(caption: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_\u00C0-\u017F]+/g
  const matches = caption.match(hashtagRegex) || []
  return [...new Set(matches)] // Remove duplicates
}

/**
 * Format caption with clickable hashtags
 * @param caption - The caption text
 * @returns Array of caption parts (text and hashtags)
 */
export function formatCaptionWithHashtags(caption: string): Array<{ type: 'text' | 'hashtag'; content: string }> {
  const parts: Array<{ type: 'text' | 'hashtag'; content: string }> = []
  let lastIndex = 0

  const hashtagRegex = /#[a-zA-Z0-9_\u00C0-\u017F]+/g
  let match

  while ((match = hashtagRegex.exec(caption)) !== null) {
    // Add text before hashtag
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: caption.slice(lastIndex, match.index),
      })
    }

    // Add hashtag
    parts.push({
      type: 'hashtag',
      content: match[0],
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < caption.length) {
    parts.push({
      type: 'text',
      content: caption.slice(lastIndex),
    })
  }

  return parts
}

/**
 * Clean hashtag for display (remove # and lowercase)
 * @param hashtag - Hashtag with # prefix
 * @returns Clean hashtag without #
 */
export function cleanHashtag(hashtag: string): string {
  return hashtag.replace(/^#/, '').toLowerCase()
}
