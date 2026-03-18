import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminMutation } from "@/hooks/useAdmin";

export const UpdateAdminRole = ({
  id,
  currentRole,
}: {
  id: string;
  currentRole: string;
}) => {
  const { updateRole } = useAdminMutation();

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => updateRole.mutate({ id, role: value })}
      disabled={updateRole.isPending}
    >
      <SelectTrigger className="w-25 h-8 text-[10px] font-black uppercase ring-offset-0 focus:ring-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dev">DEV</SelectItem>
        <SelectItem value="admin">ADMIN</SelectItem>
        <SelectItem value="noc">NOC</SelectItem>
      </SelectContent>
    </Select>
  );
};
