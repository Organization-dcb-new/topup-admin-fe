import { api } from '@/api/axios'
import type { ShowPayload } from '@/components/Show/CreateShowModal'
import type { ShowResponse } from '@/types/show'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

type UpdateShowPayload = {
  name: string
  alias: string
  image: string
  is_hot: boolean
  is_new: boolean
  is_popular: boolean
  is_show: boolean
}

export const useGetShows = () =>
  useQuery<ShowResponse>({
    queryKey: ['shows'],
    queryFn: async () => {
      const res = await api.get('/shows')
      return res.data
    },
  })

export const useCreateShow = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void
) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (payload: ShowPayload) => {
      const res = await api.post('/shows', payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Show created successfully')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to Show category')
    },
  })

  return mutation
}

export function useDeleteShow(id: string) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const res = api.delete(`/shows/${id}`)
      return res
    },
    onSuccess: () => {
      toast.success('Show deleted')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: () => {
      toast.error('Failed to delete show')
    },
  })

  return mutation
}

export function useAddGamesToShow(showId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (gameIds: string[]) =>
      api.put(`/shows/${showId}/games`, {
        game_ids: gameIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
  })
}

interface UpdateShowProps {
  id: string
  setOpen?: (val: boolean) => void
}

export function useUpdateShow({ id, setOpen }: UpdateShowProps) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateShowPayload) => api.put(`/shows/${id}`, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      setOpen?.(false) // auto close modal
    },
  })
}
