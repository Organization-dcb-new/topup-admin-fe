import { api } from '@/api/axios'
import type { CategoriesNameResponse, CategoryResponse } from '@/types/category'
import { useQuery } from '@tanstack/react-query'

/*
 * Game categories. The backend does not register the /categories routes right now
 * (CategoryRoutes is missing from InitRoutes), so these calls return 404 until it does.
 */

export const useGetCategories = (page?: number, limit?: number, search?: string) =>
  useQuery<CategoryResponse>({
    queryKey: ['categories', page, limit, search],
    queryFn: async () => {
      const res = await api.get('/categories', {
        params: {
          page,
          limit,
          search,
        },
      })
      return res.data
    },
  })

export const useGetCategoriesName = () =>
  useQuery<CategoriesNameResponse>({
    queryKey: ['categories-names'],
    queryFn: async () => {
      const res = await api.get('/categories/names')
      return res.data
    },
  })

export interface CategoryOption {
  id: string
  name: string
}

export interface GameCategoryOptions {
  options: CategoryOption[]
  /** `games` means /categories is unavailable and the list only has categories games already use. */
  source: 'categories' | 'games'
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000'

/**
 * Category choices for the game forms. Uses /categories/names when the backend serves it, and
 * otherwise rebuilds the list from the categories of existing games (GET /games preloads them).
 */
export const useGameCategoryOptions = (enabled = true) =>
  useQuery<GameCategoryOptions>({
    queryKey: ['game-category-options'],
    queryFn: async () => {
      try {
        const res = await api.get<CategoriesNameResponse>('/categories/names')
        return { options: res.data.data ?? [], source: 'categories' }
      } catch {
        const res = await api.get<{ data: { category?: { id?: string; name?: string } | null }[] }>('/games')
        const byId = new Map<string, string>()
        for (const game of res.data.data ?? []) {
          const id = game.category?.id
          if (id && id !== NIL_UUID) byId.set(id, game.category?.name || id)
        }
        const options = [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
        return { options, source: 'games' }
      }
    },
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  })
