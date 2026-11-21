import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import i18n from '@/i18n'
import type { TransactionStop, TransactionStopResponse, UpdateTransactionStopPayload } from '@/types/transaction-stop'

/** Shared by the page and the navbar indicator, so a change on the page shows in the navbar at once. */
export const transactionStopQueryKey = ['transaction-stop'] as const

/** How often the state is re-read, on top of window focus. */
export const TRANSACTION_STOP_REFRESH_MS = 60_000

/** setTimeout's ceiling (~24.8 days); a reopen further out is caught by the polling instead. */
const MAX_TIMEOUT_MS = 2_147_483_647

/** Already toasted by the API client. */
const RBAC_DENIED = 'access denied: insufficient permissions'

export function useGetTransactionStop({ enabled = true }: { enabled?: boolean } = {}) {
  const query = useQuery({
    queryKey: transactionStopQueryKey,
    queryFn: async (): Promise<TransactionStop> => {
      const res = await api.get<TransactionStopResponse>('/transaction-stop/admin')
      return res.data.data
    },
    enabled,
    refetchInterval: TRANSACTION_STOP_REFRESH_MS,
    refetchOnWindowFocus: true,
    retry: 1,
  })

  // The stop lifts by itself at resume_at: re-read right then instead of up to a minute later.
  const { data, refetch } = query
  const resumeAt = data?.is_stopped ? data.resume_at : null
  useEffect(() => {
    if (!enabled || !resumeAt) return
    const delay = Date.parse(resumeAt) - Date.now() + 1_000
    if (!Number.isFinite(delay) || delay > MAX_TIMEOUT_MS) return
    const id = setTimeout(() => void refetch(), Math.max(delay, 0))
    return () => clearTimeout(id)
  }, [enabled, resumeAt, refetch])

  return query
}

/** Which button sent the change; only picks the success toast. */
export type TransactionStopAction = 'stop' | 'resume' | 'save'

const SUCCESS_KEYS: Record<TransactionStopAction, string> = {
  stop: 'transactionStopPage.toasts.stopped',
  resume: 'transactionStopPage.toasts.resumed',
  save: 'transactionStopPage.toasts.saved',
}

const ERROR_KEYS: Record<TransactionStopAction, string> = {
  stop: 'transactionStopPage.toasts.stopError',
  resume: 'transactionStopPage.toasts.resumeError',
  save: 'transactionStopPage.toasts.saveError',
}

export function useUpdateTransactionStop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ payload }: { action: TransactionStopAction; payload: UpdateTransactionStopPayload }) => {
      const res = await api.put<TransactionStopResponse>('/transaction-stop', payload)
      return res.data.data
    },
    onSuccess: (state, { action }) => {
      toast.success(i18n.t(SUCCESS_KEYS[action]))
      // The answer is the new state: show it everywhere now, then re-read to be sure.
      if (state) queryClient.setQueryData(transactionStopQueryKey, state)
      void queryClient.invalidateQueries({ queryKey: transactionStopQueryKey })
    },
    onError: (err, { action }) => {
      const res = isAxiosError(err) ? err.response : undefined
      const message = typeof res?.data?.message === 'string' ? res.data.message.trim() : ''
      if (res?.status === 403 && message === RBAC_DENIED) return
      // The server's reason (e.g. resume_at in the past, message too long) says more than ours.
      toast.error(message || i18n.t(ERROR_KEYS[action]))
    },
  })
}
