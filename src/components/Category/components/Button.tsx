import { Button } from "@/components/ui/button"
import type { Category } from "@/types/category"
import { Pencil } from "lucide-react"
import { useState } from "react"
import { EditCategoryModal } from "../ModalEditCategory"

export function EditCategoryButton({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="cursor-pointer">
        <Pencil className="h-4 w-4" />
      </Button>

      <EditCategoryModal open={open} onClose={() => setOpen(false)} category={category} />
    </>
  )
}
