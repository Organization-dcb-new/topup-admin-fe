export interface BlogFormValues {
  title: string
  category: string
  content_markdown: string
  excerpt: string
  tags: string[]
  thumbnail: string
  status: 'draft' | 'published'
}

export interface GameName {
  id: string
  name: string
}
