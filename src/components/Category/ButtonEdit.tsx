import type { Category } from "@/types/category"
import { useState } from "react"
import { Button } from "../ui/button"
import { Pencil } from "lucide-react"
import { EditCategoryModal } from "./ModalEditCategory"

export function EditCategoryButton({ category }: { category: Category }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
      </Button>

      <EditCategoryModal open={open} onClose={() => setOpen(false)} category={category} />
    </>
  )
}
