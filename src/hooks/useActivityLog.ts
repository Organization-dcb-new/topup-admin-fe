import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { api } from '@/api/axios'
import type { ActivityLogDetail, ActivityLogFilters, ActivityLogListResponse } from '@/types/activity-log'

/** A page of the activity log, newest first (GET /activity-logs). */
export const useActivityLogs = (filters: ActivityLogFilters) =>
  useQuery({
    queryKey: ['activity-logs', filters],
    queryFn: async (): Promise<ActivityLogListResponse> => {
      const res = await api.get('/activity-logs', {
        params: {
          page: filters.page,
          limit: filters.limit,
          search: filters.search || undefined,
          actor_type: filters.actorType || undefined,
          method: filters.method || undefined,
          outcome: filters.outcome || undefined,
          start_date: filters.startDate || undefined,
          end_date: filters.endDate || undefined,
        },
      })
      return res.data
    },
    // Keep the current page on screen while a new filter loads.
    placeholderData: keepPreviousData,
  })

/** One entry with its redacted request body. */
export const useActivityLog = (id: string) =>
  useQuery({
    queryKey: ['activity-log', id],
    queryFn: async (): Promise<ActivityLogDetail> => {
      const res = await api.get(`/activity-logs/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
