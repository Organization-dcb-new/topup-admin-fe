import type { GameInput } from '@/types/game-input'
import { useForm } from 'react-hook-form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

interface FormValuesGameInput {
  label: string
  placeholder: string
}

export function SingleInputForm({
  input,
  updateMutation,
}: {
  input: GameInput
  updateMutation: any
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValuesGameInput>({
    defaultValues: { label: input.label },
  })

  const onSubmit = (data: FormValuesGameInput) => {
    updateMutation.mutate({
      id: input.id,
      label: data.label,
      placeholder: data.placeholder,
    })
  }

  return (
    <form
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleSubmit(onSubmit)(e)
      }}
      className="border rounded-lg p-3 space-y-2"
    >
      <div className="space-y-1">
        <Label htmlFor={`label-${input.id}`}>Label</Label>
        <Input
          id={`label-${input.id}`}
          {...register('label', { required: 'Label is required' })}
          className={errors.label ? 'border-destructive' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              handleSubmit(onSubmit)()
            }
          }}
        />
        {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor={`placeholder-${input.id}`}>Placeholder</Label>
        <Input
          id={`placeholder-${input.id}`}
          {...register('placeholder')}
          placeholder={input.placeholder}
        />
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={!isDirty || updateMutation.isPending}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {updateMutation.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
