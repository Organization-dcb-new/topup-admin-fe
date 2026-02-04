'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/axios'
import toast from 'react-hot-toast'

type PriceType = 'fee' | 'percent'

interface FormValues {
  id: string
  type: PriceType
  additional_fee: number
  additional_percent: number
}

interface Props {
  productId: string
  basePrice: number
  productName: string
}

export default function UpdateProductPriceModal({ productId, basePrice, productName }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      id: productId,
      type: 'fee',
      additional_fee: 0,
      additional_percent: 0,
    },
  })

  const type = watch('type')
  const fee = watch('additional_fee') || 0
  const percent = watch('additional_percent') || 0

  const isFeeOverLimit = type === 'fee' && fee > 1_000_000
  const isPercentOverLimit = type === 'percent' && percent > 40
  const isOverLimit = isFeeOverLimit || isPercentOverLimit

  const mutation = useMutation({
    mutationFn: (data: FormValues) => api.patch('/products/price', data),
    onSuccess: () => {
      toast.success('success update price')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(false)
    },
    onError: () => {
      toast.error('error update price')
    },
  })

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  // reset field yg gak dipakai
  useEffect(() => {
    if (type === 'fee') setValue('additional_percent', 0)
    else setValue('additional_fee', 0)
  }, [type, setValue])

  const sellingPrice = type === 'fee' ? basePrice + fee : basePrice + basePrice * (percent / 100)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        setOpen(state)
        if (state) {
          reset({
            id: productId,
            type: 'fee',
            additional_fee: 0,
            additional_percent: 0,
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Price — {productName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* TYPE */}
          <div className="space-y-1">
            <Label>Type</Label>
            <select
              {...register('type', { required: true })}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="fee">Fee</option>
              <option value="percent">Percent</option>
            </select>
          </div>

          {/* FEE */}
          {type === 'fee' && (
            <div className="space-y-1">
              <Label>Additional Fee</Label>
              <Input
                type="number"
                {...register('additional_fee', {
                  required: true,
                  min: 0,
                  max: 1_000_000,
                  valueAsNumber: true,
                })}
              />
              {errors.additional_fee && <p className="text-xs text-red-500">Invalid fee</p>}
              {isFeeOverLimit && (
                <p className="text-xs text-amber-600">Maximum additional fee is Rp 1.000.000</p>
              )}
            </div>
          )}

          {/* PERCENT */}
          {type === 'percent' && (
            <div className="space-y-1">
              <Label>Additional Percent (%)</Label>
              <Input
                type="number"
                step="0.01"
                {...register('additional_percent', {
                  required: true,
                  min: 0,
                  max: 40,
                  valueAsNumber: true,
                })}
              />
              {errors.additional_percent && <p className="text-xs text-red-500">Invalid percent</p>}
              {isPercentOverLimit && (
                <p className="text-xs text-amber-600">Maximum markup is 40%</p>
              )}
            </div>
          )}

          {/* PRICE PREVIEW */}
          <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>Rp {basePrice?.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Selling Price</span>
              <span>Rp {sellingPrice?.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              disabled={mutation.isPending || isOverLimit}
              type="submit"
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
