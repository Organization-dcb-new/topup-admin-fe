import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import { makeLoginSchema, type LoginFormValues } from '@/schemas/login'
import type { LoginRequest, LoginResponse } from '@/types/login'
import { api } from '@/api/axios'

export function useLoginForm() {
  const { t } = useTranslation('common')
  const schema = useMemo(() => makeLoginSchema(t), [t])

  return useForm<LoginFormValues>({
    resolver: zodResolver(schema),
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

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: login,
  })
}
