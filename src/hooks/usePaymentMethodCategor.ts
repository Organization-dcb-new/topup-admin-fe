import { api } from "@/api/axios";
import type { PaymentCategoryPayload } from "@/components/PaymentMethodCategory/Create";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useCreatePaymentCategory = (
  reset: () => void,
  setPreview: (url: string | null) => void,
  setOpen: (open: boolean) => void,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: PaymentCategoryPayload) => {
      const res = await api.post("/payment-method-categories", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Payment Category created successfully");
      queryClient.invalidateQueries({
        queryKey: ["payment-methods-categories"],
      });
      reset();
      setPreview(null);
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to Create Payment Category ");
    },
  });

  return mutation;
};
