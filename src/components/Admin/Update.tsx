import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdminMutation } from '@/hooks/useAdmin'

export const UpdateAdminRole = ({
  id,
  currentRole,
}: {
  id: string
  currentRole: string
}) => {
  const { updateRole } = useAdminMutation()

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => updateRole.mutate({ id, role: value })}
      disabled={updateRole.isPending}
    >
      <SelectTrigger className="h-8 w-[6.25rem] min-w-[6.25rem] rounded-lg border-border text-[10px] font-semibold uppercase tracking-wide ring-offset-0 focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dev">Dev</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="noc">NOC</SelectItem>
      </SelectContent>
    </Select>
  )
}
