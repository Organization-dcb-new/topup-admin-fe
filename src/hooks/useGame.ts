import { api } from '@/api/axios'
import type { FormValuesEditGame } from '@/components/Games/EditGameModal'
import type { FormValuesChangeImage } from '@/components/Games/UploadImageModal'
import type { GameByIDResponse, GamesResponse } from '@/types/game'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export interface GameNames {
  id: string
  name: string
}

export function useGetGames(
  search: string,
  page: number,
  limit: number,
  image: 'all' | 'no_image' = 'all'
) {
  return useQuery<GamesResponse>({
    queryKey: ['games', search, page, limit, image],
    queryFn: async () => {
      const { data } = await api.get('/games/pagination', {
        params: {
          search,
          page,
          limit,
          image,
        },
      })

      return data
    },

    staleTime: 5000,
  })
}

export function useGetGameById(gameId: string) {
  return useQuery<GameByIDResponse>({
    queryKey: ['game', gameId],
    queryFn: async () => {
      const { data } = await api.get(`/games/${gameId}`)
      return data
    },
    enabled: !!gameId,
    staleTime: 5000,
  })
}

export const useCreateGame = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.post('/games', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

export const useDeleteGame = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/games/${id}`)
      return res.data
    },
    onSuccess: () => {
      toast.success('Game berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: () => toast.error('Gagal menghapus game'),
  })
}

export function useUpdateImageGame(setOpen: (open: boolean) => void) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesChangeImage) => {
      const payload = {
        ...values,
      }

      const res = await api.patch(`/games/image`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Image updated')
      queryClient.invalidateQueries({ queryKey: ['games'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to update image Game'),
  })

  return mutation
}

export function useUpdateGame(setOpen: (open: boolean) => void, id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesEditGame) => {
      const payload = {
        ...values,
      }

      const res = await api.put(`/games/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Game berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['games'] })
      setOpen(false)
    },
    onError: () => toast.error('Gagal memperbarui game'),
  })

  return mutation
}

export function useGetGameNames() {
  return useQuery({
    queryKey: ['game-names'],
    queryFn: async () => {
      const res = await api.get('/games/names')
      return res.data.data
    },
  })
}

export function useGetGameNamesWithType() {
  return useQuery<GameNames[]>({
    queryKey: ['game-names'],
    queryFn: async () => {
      const res = await api.get('/games/names')
      return res.data.data
    },
  })
}

export function useToggleGameShow(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (is_show: boolean) => api.put(`/games/${id}`, { is_show }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
  })
}

export function useToggleGameStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (is_active: boolean) => api.patch(`/games/status/${id}`, { is_active }),
    onSuccess: () => {
      toast.success('Game status updated')
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: () => toast.error('Failed to update game status'),
  })
}

export function useBulkUpdateGameStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (is_active: boolean) => api.patch('/games/bulk-status', { is_active }),
    onSuccess: () => {
      toast.success('Status semua game berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: () => toast.error('Gagal memperbarui status semua game'),
  })
}
