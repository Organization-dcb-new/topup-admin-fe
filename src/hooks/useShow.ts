import { useEffect } from 'react'
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

export const useGetShows = () => {
  const query = useQuery<ShowResponse>({
    queryKey: ['shows'],
    queryFn: async () => {
      const res = await api.get('/shows')
      return res.data
    },
  })

  useEffect(() => {
    if (!query.isPending) return
    const id = toast.loading('Sedang memuat…')
    return () => {
      toast.dismiss(id)
    }
  }, [query.isPending])

  useEffect(() => {
    if (!query.isFetchedAfterMount) return
    if (query.isSuccess) {
      toast.success('Berhasil memuat data show')
    }
    if (query.isError) {
      toast.error('Gagal memuat data show')
    }
  }, [query.isSuccess, query.isError, query.isFetchedAfterMount])

  return query
}

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
      toast.success('Show berhasil dibuat')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      reset()
      setPreview(null)
      setOpen(false)
    },
    onError: () => {
      toast.error('Gagal membuat show')
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
      toast.success('Show berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: () => {
      toast.error('Gagal menghapus show')
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
      toast.success('Daftar game pada show berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
    },
    onError: () => {
      toast.error('Gagal memperbarui game pada show')
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
      toast.success('Show berhasil diperbarui')
      queryClient.invalidateQueries({ queryKey: ['shows'] })
      setOpen?.(false)
    },
    onError: () => {
      toast.error('Gagal memperbarui show')
    },
  })
}
