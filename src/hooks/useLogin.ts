// src/hooks/use-login.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { loginSchema, type LoginFormValues } from '@/schemas/login'
import type { LoginRequest, LoginResponse } from '@/types/login'
import { api } from '@/api/axios'
import { authStorage } from '@/lib/auth'

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

  authStorage.setToken(data.token)

  return data
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: login,
  })
}
