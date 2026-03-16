import { api } from "@/api/axios";
import type { RateLimit, RateLimitResponse } from "@/types/rate_limit";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useRateLimitData = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["rate-limits", page, limit],
    queryFn: async () => {
      const { data } = await api.get<RateLimitResponse>("/rate-limit", {
        params: { page, limit },
      });

      return {
        items: Array.isArray(data.data) ? data.data : [],
        meta: data.meta,
      };
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
};

export const useRateLimitSubmit = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RateLimit) => api.post("/rate-limit", payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["rate-limits"] });
      setOpen(false);
      toast.success(res.data.message || "Rate limit updated successfully!");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Something went wrong";
      toast.error(errorMsg);
    },
  });
};
