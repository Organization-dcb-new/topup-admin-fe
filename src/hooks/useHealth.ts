import { api } from '@/api/axios'
import { useQuery } from '@tanstack/react-query'

export interface HealthCheckResponse {
  status: string
  services: Record<string, string>
}

export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await api.get('/health')
      return data
    },
    refetchInterval: 10 * 60 * 1000, // 5 minutes
    refetchIntervalInBackground: true,
    staleTime: 4 * 60 * 1000, // 4 minutes
    retry: 1,
  })
}
