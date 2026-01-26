import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useUpdateGameInput } from '@/hooks/useGameInput'
import { SingleInputForm } from './SingleInputForm'
import type { GameInput } from '@/types/game-input'

interface EditGameInputModalProps {
  inputs: GameInput[]
}

export default function EditGameInputModalForm({ inputs }: EditGameInputModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-lg max-h-[80vh] overflow-y-auto"
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Game Inputs</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {inputs.map((input) => (
              <SingleInputFormWrapper key={input.id} input={input} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SingleInputFormWrapper({ input }: { input: GameInput }) {
  const updateMutation = useUpdateGameInput()

  return <SingleInputForm input={input} updateMutation={updateMutation} />
}
