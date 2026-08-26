/**
 * Bentuk data artikel persis seperti yang dikirim backend
 * (`BlogResponse` / `BlogListResponse` di `internal/dto/blog_dto.go`).
 * Berkas ini adalah satu-satunya sumber kebenaran tipe Blog; `@/tables/table-blog`
 * hanya me-re-ekspor `Blog` demi impor lama yang sudah tersebar.
 */

export type BlogStatus = 'draft' | 'published'

export interface BlogPaginationMeta {
  current_page: number
  limit: number
  total_data: number
  total_page: number
  has_next: boolean
  has_prev: boolean
}

/** Baris daftar admin — tanpa `content_markdown` agar payload daftar tetap ringan. */
export interface Blog {
  id: string
  title: string
  slug: string
  category: string
  excerpt: string
  tags: string[]
  thumbnail: string
  status: BlogStatus
  author_id: string
  published_at: string | null
  created_at: string
  updated_at: string
}

/** Detail admin (`GET /blogs/admin/:id`) dan hasil create/update. */
export interface BlogDetail extends Blog {
  content_markdown: string
}

export interface BlogFormValues {
  title: string
  category: string
  content_markdown: string
  excerpt: string
  tags: string[]
  thumbnail: string
  status: BlogStatus
}

export interface BlogTaxonomyItem {
  value: string
  count: number
}

export interface BlogTaxonomy {
  categories: BlogTaxonomyItem[]
  tags: BlogTaxonomyItem[]
}
