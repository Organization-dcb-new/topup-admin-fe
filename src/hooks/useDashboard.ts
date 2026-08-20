import { api } from '@/api/axios'
import type {
  DashboardGranularity,
  DashboardOverviewResponse,
  DashboardRange,
  DashboardTimeseriesResponse,
} from '@/types/dashboard'
import { useQuery } from '@tanstack/react-query'

/**
 * Base path endpoint dashboard (relatif terhadap axios `baseURL` = `/api`, yang
 * di-rewrite proxy dengan membuang `/api`). Ubah di sini bila prefix berubah.
 */
const DASHBOARD_BASE = '/dashboard'

export interface DashboardRangeParams {
  range: DashboardRange
  /** `YYYY-MM-DD`, wajib bila range=custom */
  startDate?: string
  endDate?: string
}

/** True bila param range valid untuk memicu fetch (custom butuh kedua tanggal). */
function isRangeReady({ range, startDate, endDate }: DashboardRangeParams) {
  return range !== 'custom' || (!!startDate && !!endDate)
}

interface OverviewOptions {
  topLimit?: number
  pendingThresholdMinutes?: number
  refetchInterval?: number | false
}

export const useDashboardOverview = (
  params: DashboardRangeParams,
  { topLimit, pendingThresholdMinutes, refetchInterval }: OverviewOptions = {},
) =>
  useQuery<DashboardOverviewResponse>({
    queryKey: [
      'dashboard-overview',
      params.range,
      params.startDate,
      params.endDate,
      topLimit,
      pendingThresholdMinutes,
    ],
    queryFn: async () => {
      const res = await api.get(`${DASHBOARD_BASE}/overview`, {
        params: {
          range: params.range,
          ...(params.range === 'custom' && {
            start_date: params.startDate,
            end_date: params.endDate,
          }),
          ...(topLimit != null && { top_limit: topLimit }),
          ...(pendingThresholdMinutes != null && {
            pending_threshold_minutes: pendingThresholdMinutes,
          }),
        },
      })
      return res.data
    },
    enabled: isRangeReady(params),
    // overview relatif berat — dokumen menyarankan refresh >= 30 detik
    staleTime: 30_000,
    refetchInterval: refetchInterval !== undefined ? refetchInterval : 60_000,
    refetchIntervalInBackground: false,
  })

export const useDashboardTimeseries = (
  params: DashboardRangeParams,
  granularity: DashboardGranularity,
  /**
   * Disamakan dengan polling overview. Tanpa ini grafik membeku pada snapshot
   * pertama sementara kartu KPI di atasnya terus bergerak — dua angka berbeda
   * untuk rentang yang sama di layar yang sama.
   */
  refetchInterval?: number | false,
) =>
  useQuery<DashboardTimeseriesResponse>({
    queryKey: [
      'dashboard-timeseries',
      params.range,
      params.startDate,
      params.endDate,
      granularity,
    ],
    queryFn: async () => {
      const res = await api.get(`${DASHBOARD_BASE}/timeseries`, {
        params: {
          granularity,
          range: params.range,
          ...(params.range === 'custom' && {
            start_date: params.startDate,
            end_date: params.endDate,
          }),
        },
      })
      return res.data
    },
    enabled: isRangeReady(params),
    staleTime: 30_000,
    refetchInterval: refetchInterval !== undefined ? refetchInterval : 60_000,
    refetchIntervalInBackground: false,
  })
