import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { GameInputResponse } from '@/types/game-input'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useGetGameInputs = (search: string, page: number, limit: number, image: 'all' | 'no_image' = 'all') =>
  useQuery<GameInputResponse>({
    queryKey: ['game-inputs', search, page, limit, image],
    queryFn: async () => {
      const res = await api.get('/game-inputs', {
        params: { page, limit, search, image },
      })
      return res.data
    },
    placeholderData: keepPreviousData,
  })

export interface GameInputLabelChange {
  id: string
  label: string
  /** The backend overwrites the placeholder too, so always send the value to keep. */
  placeholder: string
}

const patchLabel = (payload: GameInputLabelChange) => api.patch('/game-inputs/label', payload)

export const useUpdateGameInput = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: patchLabel,
    onSuccess: () => {
      toast.success(i18n.t('inputPage.toasts.saved'))
      void queryClient.invalidateQueries({ queryKey: ['game-inputs'] })
      void queryClient.invalidateQueries({ queryKey: ['game'] })
    },
    onError: () => toast.error(i18n.t('inputPage.toasts.saveError')),
  })
}

/** Saves several fields of one game at once; the endpoint takes one field per request. */
export const useSaveGameInputs = (onDone?: () => void) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (changes: GameInputLabelChange[]) => Promise.all(changes.map(patchLabel)),
    onSuccess: (_res, changes) => {
      toast.success(i18n.t('inputPage.toasts.savedMany', { count: changes.length }))
      onDone?.()
    },
    onError: () => toast.error(i18n.t('inputPage.toasts.saveError')),
    // Some requests may have landed even when one failed, so refresh either way.
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['game-inputs'] })
      void queryClient.invalidateQueries({ queryKey: ['game'] })
    },
  })
}
