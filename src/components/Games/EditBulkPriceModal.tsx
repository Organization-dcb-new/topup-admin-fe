'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { DollarSign } from 'lucide-react'
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

interface FormValues {
  game_id: string
  additional_percent: number
}

interface Props {
  gameId: string
}

export default function UpdateBulkProductPriceModal({ gameId }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      game_id: gameId,
      additional_percent: 0,
    },
  })

  const percent = watch('additional_percent') || 0
  const isOverLimit = percent > 40

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      api.patch('/products/price/bulk', {
        ...data,
        type: 'percent',
      }),
    onSuccess: () => {
      toast.success('Success update prices')
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setOpen(false)
    },
    onError: () => toast.error('Failed update prices'),
  })

  const onSubmit = (data: FormValues) => mutation.mutate(data)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        setOpen(state)
        if (state) {
          reset({
            game_id: gameId,
            additional_percent: 0,
          })
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          className="cursor-pointer"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <DollarSign className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Update Price</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {isOverLimit && <p className="text-xs text-amber-600 mt-1">Maximum markup is 40%</p>}
          </div>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={mutation.isPending || isOverLimit}
            >
              {mutation.isPending ? 'Updating...' : 'Update All'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
