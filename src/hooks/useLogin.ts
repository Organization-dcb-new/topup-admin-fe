// src/hooks/use-login.ts
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'

import { loginSchema, type LoginFormValues } from '@/schemas/login'
import type { LoginRequest, LoginResponse } from '@/types/login'
import { api } from '@/api/axios'

export function useLoginForm() {
  return useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email_or_username: '',
      password: '',
    },
  })
}

// Sesi diset lewat cookie httpOnly oleh BE; token di body respons tidak dipakai FE
export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/admin/login', payload)

  return data
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: login,
  })
}
