import type { PaginationMeta } from '@/types/game'

export type BlogStatus = 'draft' | 'published'

/** An article as GET /blogs/admin/private returns it. */
export interface Blog {
  id: string
  title: string
  slug: string
  /** Name of the game the article is filed under. */
  category: string
  tags: string[]
  thumbnail: string
  excerpt?: string
  content_markdown?: string
  status: BlogStatus
  published_at?: string | null
  created_at: string
}

export interface BlogListResponse {
  data: Blog[]
  meta: PaginationMeta
  message: string
  status: 'success' | 'error'
}

/** Body of POST /blogs/admin and PATCH /blogs/admin/:id. */
export interface BlogPayload {
  title: string
  category: string
  content_markdown: string
  excerpt: string
  tags: string[]
  thumbnail: string
  status: BlogStatus
}
