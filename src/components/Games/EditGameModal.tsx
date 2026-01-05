import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useCreateGame } from '@/hooks/useGame'
import toast from 'react-hot-toast'
import { useGetProvider } from '@/hooks/useProvider'
import { useGetCategories } from '@/hooks/useCategory'
import type { CreateGamePayload, GameInputPayload } from '@/types/game'
import { GameInput, GameInputForm } from './GameInput'

export function EditGameModal() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, reset } = useForm<CreateGamePayload>()
  const [inputs, setInputs] = useState<GameInputPayload[]>([])
  const { data: categories } = useGetCategories()
  const { data: providers } = useGetProvider()
  const { mutateAsync, isPending } = useCreateGame()

  const addInput = () => {
    setInputs((prev) => [
      ...prev,
      {
        key: '',
        label: '',
        input_type: 'text',
        required: false,
        sort_order: prev.length + 1,
        placeholder: '',
      },
    ])
  }

  const updateInput = <K extends keyof GameInputPayload>(
    index: number,
    field: K,
    value: GameInputPayload[K]
  ) => {
    const next = [...inputs]
    next[index][field] = value
    setInputs(next)
  }

  const removeInput = (index: number) => {
    const next = inputs.filter((_, i) => i !== index)
    setInputs(
      next.map((item, i) => ({
        ...item,
        sort_order: i + 1,
      }))
    )
  }

  const onSubmit = async (data: CreateGamePayload) => {
    const payload = {
      ...data,
      inputs,
    }

    console.log(payload)

    await mutateAsync(payload as any, {
      onSuccess: () => {
        toast.success('Game success added')
        reset()
        setOpen(false)
      },
    })
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)} className="cursor-pointer">
        + Create Game
      </Button>
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false)
        }}
      >
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Game</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
            <div className="flex flex-row gap-4">
              <div className="flex gap-4 flex-col w-full">
                <GameInput
                  categories={categories!}
                  providers={providers!}
                  register={register}
                  setValue={setValue}
                />
              </div>
              <div className="w-full">
                <GameInputForm
                  addInput={addInput}
                  inputs={inputs}
                  removeInput={removeInput}
                  updateInput={updateInput}
                />
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-end gap-2">
              <Button
                className="cursor-pointer"
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="cursor-pointer">
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
