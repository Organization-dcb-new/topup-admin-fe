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
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={() => setOpen(true)}
        className='h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground'
        aria-label='Ubah field input game'
      >
        <Pencil className='h-4 w-4' aria-hidden />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className='max-h-[min(80vh,36rem)] overflow-y-auto rounded-xl sm:max-w-lg'
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className='space-y-1 text-left'>
            <DialogTitle className='text-lg font-semibold tracking-tight'>Ubah input game</DialogTitle>
            <p className='text-sm text-muted-foreground'>
              Setiap blok di bawah adalah satu field. Simpan perubahan lewat tombol Simpan pada masing-masing
              form. Klik di luar dialog dinonaktifkan agar tidak kehilangan isian tanpa sengaja.
            </p>
          </DialogHeader>

          <div className='space-y-4 pt-1'>
            {inputs.length === 0 ? (
              <p className='rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground'>
                Game ini belum memiliki field input.
              </p>
            ) : (
              inputs.map((input) => <SingleInputFormWrapper key={input.id} input={input} />)
            )}
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
