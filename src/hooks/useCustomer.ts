import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import { isUuid } from '@/components/Games/game-utils'
import i18n from '@/i18n'
import type {
  CustomerDetail,
  CustomerDetailResponse,
  CustomerListParams,
  CustomerListResponse,
  UpdateCustomerPayload,
} from '@/types/customer'

export const customersQueryKey = ['customers'] as const
export const customerDetailKey = (id: string | undefined) => ['customer-detail', id] as const

/** Matches a reset email's Retry-After when the header is missing. */
const DEFAULT_RETRY_AFTER = 60

export function isCustomerId(id: string | undefined): id is string {
  return !!id && isUuid(id)
}

export function useGetCustomers({ page, limit, search, status, method }: CustomerListParams) {
  const params = {
    page,
    limit,
    ...(search?.trim() && { search: search.trim() }),
    ...(status && { status }),
    ...(method && { method }),
  }
  return useQuery({
    queryKey: [...customersQueryKey, params],
    queryFn: async () => {
      const { data } = await api.get<CustomerListResponse>('/customers', { params })
      return data
    },
    // Keep the current page on screen while a new filter or page loads.
    placeholderData: keepPreviousData,
  })
}

export function useCustomerDetail(id: string | undefined) {
  return useQuery({
    queryKey: customerDetailKey(id),
    queryFn: async () => {
      const { data } = await api.get<CustomerDetailResponse>(`/customers/${id}`)
      return data.data
    },
    // Malformed ids never reach the backend; the page shows "not found" for them.
    enabled: isCustomerId(id),
    // A missing account or a refused permission won't change by asking again.
    retry: (count, err) => {
      const status = isAxiosError(err) ? err.response?.status : undefined
      return status !== 400 && status !== 403 && status !== 404 && count < 2
    },
  })
}

/** Every mutation answers with the updated detail: show it right away and refresh the list behind it. */
function storeCustomer(queryClient: QueryClient, customer: CustomerDetail) {
  queryClient.setQueryData(customerDetailKey(customer.id), customer)
  void queryClient.invalidateQueries({ queryKey: customersQueryKey })
}

/** Errors are left to the form, which maps them onto the fields they belong to. */
export function useUpdateCustomer(onSaved?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) => {
      const { data } = await api.patch<CustomerDetailResponse>(`/customers/${id}`, payload)
      return data.data
    },
    onSuccess: (customer) => {
      storeCustomer(queryClient, customer)
      toast.success(i18n.t('customerPage.toasts.updated'))
      onSaved?.()
    },
  })
}

export function useSetCustomerStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data } = await api.patch<CustomerDetailResponse>(`/customers/${id}/status`, { is_active: isActive })
      return data.data
    },
    onSuccess: (customer) => {
      storeCustomer(queryClient, customer)
      const key = customer.is_active ? 'customerPage.toasts.activated' : 'customerPage.toasts.deactivated'
      toast.success(i18n.t(key, { name: customer.name || customer.email }))
    },
    onError: (err, { id }) => {
      notifyCustomerError(err)
      // The account may have changed or gone meanwhile; show what is there now.
      void queryClient.invalidateQueries({ queryKey: customerDetailKey(id) })
    },
  })
}

/** Toasts the outcome; the caller starts its cooldown from the result. */
export function useSendCustomerPasswordReset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; email: string }) => {
      await api.post(`/customers/${id}/reset-password`)
    },
    onSuccess: (_, { email }) => {
      toast.success(i18n.t('customerPage.toasts.resetSent', { email }))
    },
    onError: (err, { id }) => {
      const error = notifyCustomerError(err)
      // 409 means the account was deactivated in the meantime.
      if (error.status === 409 || error.status === 404) {
        void queryClient.invalidateQueries({ queryKey: customerDetailKey(id) })
      }
    },
  })
}

/** The backend's stable English messages, mapped to translated copy. */
const CUSTOMER_ERRORS: Record<string, string> = {
  'customer not found': 'customerPage.errors.notFound',
  'invalid customer id': 'customerPage.errors.notFound',
  'name is required': 'customerPage.errors.nameRequired',
  // The validator's message for a name over 100 characters.
  'Name is not valid': 'customerPage.errors.nameTooLong',
  'send name or email to update': 'customerPage.errors.nothingToUpdate',
  'email already registered': 'customerPage.errors.emailTaken',
  'Email format is invalid': 'customerPage.errors.emailInvalid',
  // The validator's message for an email over 254 characters.
  'Email is not valid': 'customerPage.errors.emailInvalid',
  'account is inactive': 'customerPage.errors.inactive',
  'a reset email was sent less than a minute ago': 'customerPage.errors.resetTooSoon',
  'status must be active or inactive': 'customerPage.errors.badFilter',
  'method must be password or google': 'customerPage.errors.badFilter',
}

function knownErrorKey(message: string) {
  return Object.hasOwn(CUSTOMER_ERRORS, message) ? CUSTOMER_ERRORS[message] : undefined
}

/** What the API client already toasts for an RBAC refusal. */
const RBAC_DENIED = 'access denied: insufficient permissions'

export interface CustomerError {
  /** i18n key; unknown errors get the generic one. */
  key: string
  status?: number
  /** Seconds until the server accepts another attempt (429). */
  retryAfter?: number
  /** Already announced by the API client's 403 toast. */
  announced?: boolean
}

export function toCustomerError(err: unknown): CustomerError {
  if (!isAxiosError(err)) return { key: 'customerPage.errors.generic' }
  if (!err.response) return { key: 'customerPage.errors.network' }

  const { status, data, headers } = err.response
  const message = typeof data?.message === 'string' ? data.message : ''
  if (status === 429) {
    const retryAfter = Number(headers['retry-after'])
    return {
      key: knownErrorKey(message) ?? 'customerPage.errors.tooManyRequests',
      status,
      retryAfter: retryAfter > 0 ? Math.ceil(retryAfter) : DEFAULT_RETRY_AFTER,
    }
  }
  const known = knownErrorKey(message)
  if (known) return { key: known, status }
  if (status === 403) return { key: 'customerPage.errors.forbidden', status, announced: message === RBAC_DENIED }
  return { key: 'customerPage.errors.generic', status }
}

export function customerErrorText(error: CustomerError) {
  return i18n.t(error.key, { seconds: error.retryAfter ?? DEFAULT_RETRY_AFTER })
}

/** Toasts the mapped message, unless the API client already said the action isn't allowed. */
export function notifyCustomerError(err: unknown): CustomerError {
  const error = toCustomerError(err)
  if (!error.announced) toast.error(customerErrorText(error), { id: `customer-${error.key}` })
  return error
}
