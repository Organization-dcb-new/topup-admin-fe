import { api } from "@/api/axios";
import type { FormValuesProductImage } from "@/components/Product/Filter/ChangeImage";
import type { FormValuesChangeImageProductV2 } from "@/components/Product/Filter/UploadImage";
import type { ProductResponse } from "@/types/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

/** Query list produk admin — selaraskan nama field dengan DTO backend bila perlu. */
export type GetProductsParams = {
  /** Pencarian nama produk (query `search`) */
  search: string;
  sku: string;
  game_name: string;
  /** `true` = aktif, `false` = nonaktif, `undefined` = semua */
  is_active?: boolean;
  /** Query `provider_status` — umumnya `available` / `empty` (BE: TrimSpace). */
  provider_status?: string;
  additional_fee_above?: string;
  additional_fee_below?: string;
  additional_percent_above?: string;
  additional_percent_below?: string;
  base_price_above?: string;
  base_price_below?: string;
  /** Harga dasar tepat (=) */
  base_price?: string;
  selling_price_above?: string;
  selling_price_below?: string;
  /** Harga jual tepat (=) */
  selling_price?: string;
};

function pickNonEmpty(params: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );
}

export const useGetProducts = (
  page: number,
  limit: number,
  filters: GetProductsParams,
) => {
  const providerStatus = filters.provider_status?.trim() ?? "";

  const numeric = pickNonEmpty({
    additional_fee_above: filters.additional_fee_above,
    additional_fee_below: filters.additional_fee_below,
    additional_percent_above: filters.additional_percent_above,
    additional_percent_below: filters.additional_percent_below,
    base_price_above: filters.base_price_above,
    base_price_below: filters.base_price_below,
    base_price: filters.base_price,
    selling_price_above: filters.selling_price_above,
    selling_price_below: filters.selling_price_below,
    selling_price: filters.selling_price,
  });

  return useQuery({
    queryKey: [
      "products",
      page,
      limit,
      filters.search,
      filters.sku,
      filters.game_name,
      filters.is_active,
      providerStatus,
      numeric,
    ],
    queryFn: async (): Promise<ProductResponse> => {
      const res = await api.get("/products/admin", {
        params: {
          page,
          limit,
          search: filters.search || undefined,
          sku: filters.sku || undefined,
          game_name: filters.game_name || undefined,
          ...(filters.is_active !== undefined && { is_active: filters.is_active }),
          ...(providerStatus && { provider_status: providerStatus }),
          ...numeric,
        },
      });
      return res.data;
    },
  });
};

export function useUpdateImageProduct(setOpen: (open: boolean) => void) {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: FormValuesProductImage) => {
      const payload = {
        ...values,
      };

      const res = await api.patch(`/products/by-game`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t("productToasts.imageUpdateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: () => toast.error(t("productToasts.imageUpdateError")),
  });

  return mutation;
}

export function useUpdateImageProductV2(onClose: () => void) {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (values: FormValuesChangeImageProductV2) => {
      const payload = {
        ...values,
      };

      const res = await api.patch(`/products/by-game`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t("productToasts.imageUpdateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: () => toast.error(t("productToasts.imageUpdateError")),
  });

  return mutation;
}

export function useGetProductNames(id: string) {
  return useQuery({
    queryKey: ["product-names", id],
    queryFn: async () => {
      const res = await api.get(`/products/game/${id}`);
      return res.data.data;
    },
  });
}

export function useGetProductAnomaly(page: number, limit: number) {
  return useQuery({
    queryKey: ["product-anomaly", page, limit],
    queryFn: async () => {
      const res = await api.get("/products/anomaly", {
        params: {
          page,
          limit,
        },
      });
      return res.data;
    },
  });
}
