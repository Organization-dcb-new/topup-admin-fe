import { api } from '@/api/axios'
import type { GameInputResponse } from '@/types/game-input'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useGetGameInputs = (
  search: string,
  page: number,
  limit: number,
  image: 'all' | 'no_image' = 'all'
) =>
  useQuery<GameInputResponse>({
    queryKey: ['game-inputs', search, page, limit, image],
    queryFn: async ({ signal }) => {
      const res = await api.get('/game-inputs', {
        signal,
        params: { page, limit, search, image },
      })
      return res.data
    },
  })

  
export const useUpdateGameInput = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { id: string; label: string, placeholder : string}) => api.patch(`/game-inputs/label`, payload),

    onSuccess: () => {
      toast.success('Input berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['game-inputs'] })
      queryClient.invalidateQueries({ queryKey: ['game'] })
    },

    onError: () => toast.error('Gagal memperbarui input'),
  })
}
