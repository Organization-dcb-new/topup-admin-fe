import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { loginSchema, type LoginFormValues } from '@/schemas/login'
import type { LoginRequest, LoginResponse } from '@/types/login'
import { api } from '@/api/axios'
import { refreshAuthSession, type AuthSession } from '@/lib/auth'

export function useLoginForm() {
  return useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email_or_username: '',
      password: '',
    },
  })
}

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/admin/login', payload)
  return data
}

/** Logs in, then resolves with the fresh session so the caller knows whether 2FA is still pending. */
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation<AuthSession, Error, LoginFormValues>({
    mutationFn: async (values) => {
      await login(values)
      return refreshAuthSession(queryClient)
    },
  })
}
