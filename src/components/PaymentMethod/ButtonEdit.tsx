import type { PaymentMethod } from '@/types/payment-method'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Pencil } from 'lucide-react'
import { EditPaymentMethodModal } from './ModalEditPaymentMethod'

export function EditPaymentMethodButton({ paymentMethod }: { paymentMethod: PaymentMethod }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      <EditPaymentMethodModal
        open={open}
        onClose={() => setOpen(false)}
        paymentMethod={paymentMethod}
      />
    </>
  )
}
