import { api } from '@/api/axios'
import type { FormValuesChangeImageProduct } from '@/components/Product/UploadImage'
import type { ProductResponse } from '@/types/product'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export const useGetProducts = (page: number, limit: number, search: string, isActive: boolean) => {
  return useQuery({
    queryKey: ['products', page, limit, search, isActive],
    queryFn: async (): Promise<ProductResponse> => {
      const res = await api.get('/products', {
        params: {
          page: page,
          limit: limit,
          search: search,
          is_active: isActive ? true : undefined,
        },
      })
      return res.data
    },
  })
}

export function useUpdateImageProduct(setOpen: (open: boolean) => void) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: FormValuesChangeImageProduct) => {
      const payload = {
        ...values,
      }

      const res = await api.patch(`/products/image`, payload)
      return res.data
    },
    onSuccess: () => {
      toast.success('Product updated')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed to update image Products'),
  })

  return mutation
}
