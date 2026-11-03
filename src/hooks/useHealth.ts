import { api } from '@/api/axios'
import { useQuery } from '@tanstack/react-query'

export interface HealthCheckResponse {
  status: string
  services: Record<string, string>
}

export const HEALTH_REFRESH_MINUTES = 10

export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get('/health')
      return data
    },
    refetchInterval: HEALTH_REFRESH_MINUTES * 60 * 1000,
    refetchIntervalInBackground: true,
    staleTime: 4 * 60 * 1000, // 4 minutes
    retry: 1,
  })
}

export type ServerStatus = 'checking' | 'operational' | 'degraded' | 'unreachable'

/** The health check reduced to a single status, shared by the sidebar and the login footer. */
export function useServerStatus() {
  const query = useHealthCheck()
  const { data, isLoading, isError } = query
  const services = data?.services ?? {}
  const allUp = Object.values(services).every((status) => status === 'up')

  const status: ServerStatus = isLoading
    ? 'checking'
    : isError || !data
      ? 'unreachable'
      : data.status === 'healthy' && allUp
        ? 'operational'
        : 'degraded'

  return { ...query, status, services }
}
