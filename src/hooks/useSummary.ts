import { api } from '@/api/axios'
import type { SummaryReportResponse } from '@/types/summary'
import { useQuery } from '@tanstack/react-query'

export const useGetSummary = (
  page: number,
  limit: number,
  startDate?: string,
  endDate?: string,
  groupBy: string = 'hour',
) =>
  useQuery<SummaryReportResponse>({
    queryKey: ['summary', page, limit, startDate, endDate, groupBy],
    queryFn: async () => {
      const res = await api.get('/summary/report', {
        params: {
          page,
          limit,
          start_date: startDate,
          end_date: endDate,
          group_by: groupBy,
        },
      })
      return res.data
    },
  })
