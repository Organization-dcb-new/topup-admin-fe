import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { api } from "@/api/axios";

export default function ModalDeleteRateLimit({
  settingKey,
}: {
  settingKey: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.delete(`/rate-limit/${settingKey}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rate-limits"] });
      toast.success("Rate limit deleted successfully");
      setOpen(false);
    },
    onError: () => toast.error("Failed to delete rate limit"),
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="cursor-pointer h-8 w-8 text-destructive hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Delete Rate Limit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <b className="text-red-600">{settingKey}</b>? This action cannot
              be undone and will reset all active limits in Redis.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => mutation.mutate()}
              className="cursor-pointer"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
