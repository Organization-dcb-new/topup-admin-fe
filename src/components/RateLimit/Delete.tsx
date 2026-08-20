import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  nbAccent,
  nbCode,
  nbDialog,
  nbDialogButton,
  nbDialogHeader,
  nbDialogIcon,
  nbDialogTitle,
  nbHint,
  nbIconButton,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { Trash2, Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { api } from '@/api/axios'

export default function ModalDeleteRateLimit({
  settingKey,
}: {
  settingKey: string;
}) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => api.delete(`/rate-limit/${settingKey}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rate-limits'] })
      toast.success('Rate limit deleted successfully')
      setOpen(false)
    },
    onError: () => toast.error('Failed to delete rate limit'),
  })

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type='button'
          className={cn(nbIconButton, nbAccent.red)}
          disabled={mutation.isPending}
          aria-label={`Delete ${settingKey}`}
        >
          <Trash2 className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent className={nbDialog}>
        <div className={cn(nbDialogHeader, nbAccent.red)}>
          <AlertDialogHeader className='gap-2 text-left'>
            <div className='flex items-center gap-2.5'>
              <span className={nbDialogIcon}>
                <Trash2 className='h-4 w-4' strokeWidth={3} aria-hidden />
              </span>
              <AlertDialogTitle className={nbDialogTitle}>Delete Rate Limit</AlertDialogTitle>
            </div>
            <AlertDialogDescription className={cn(nbHint, 'text-left')}>
              Are you sure you want to delete <code className={nbCode}>{settingKey}</code>? This
              action cannot be undone and will reset all active limits in Redis.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className='gap-2 px-5 py-5'>
          <AlertDialogCancel
            className={cn(nbDialogButton, nbAccent.white)}
            disabled={mutation.isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={cn(nbDialogButton, nbAccent.red, 'text-[#111]')}
            onClick={(e) => {
              e.preventDefault()
              mutation.mutate()
            }}
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
