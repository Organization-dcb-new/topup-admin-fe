import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import toast from 'react-hot-toast'

import { api } from '@/api/axios'
import { isUuid } from '@/components/Games/game-utils'
import i18n from '@/i18n'
import type {
  SupplierBrand,
  SupplierBrandDetail,
  SupplierBrandFilters,
  SupplierImportProductsResult,
  SupplierListResponse,
  SupplierMappingStatus,
  SupplierProduct,
  SupplierProductDetail,
  SupplierProductFilters,
  SupplierSyncRun,
} from '@/types/supplier-catalog'

export const supplierBrandsKey = ['supplier-brands'] as const
export const supplierProductsKey = ['supplier-products'] as const
const supplierBrandKey = (id: string | undefined) => ['supplier-brand', id] as const
const supplierProductKey = (id: string | undefined) => ['supplier-product', id] as const
export const providerSyncKey = (providerId: string | undefined) => ['provider-sync', providerId] as const

/** How often the sync panel asks again while a full sync runs. */
const SYNC_POLL_MS = 3000

function pickNonEmpty(params: Record<string, string | number | undefined>) {
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
}

/**
 * Stable backend messages mapped to copy; anything else gets the generic line. The backend
 * answers 409 for a sync already running and 502 when the supplier itself fails.
 */
export function catalogErrorKey(err: unknown): string {
  if (!isAxiosError(err)) return 'supplierCatalogPage.errors.generic'
  const status = err.response?.status
  const message: string = err.response?.data?.message ?? ''
  if (status === 403) return 'authErrors.forbidden'
  if (status === 409) return 'supplierCatalogPage.errors.syncRunning'
  if (status === 502) return 'supplierCatalogPage.errors.supplierUnavailable'
  if (message.startsWith('this game is already tied to')) return 'supplierCatalogPage.errors.gameTaken'
  if (message.includes('already exists for another supplier')) return 'supplierCatalogPage.errors.codeTakenOtherSupplier'
  if (message === 'this product belongs to another game than the supplier brand') return 'supplierCatalogPage.errors.productOtherGame'
  if (message === 'tie this brand to a game first, or import it') return 'supplierCatalogPage.errors.brandNotMapped'
  if (message === 'this brand is already tied to a game') return 'supplierCatalogPage.errors.brandAlreadyMapped'
  if (message === 'this provider has no catalog integration') return 'supplierCatalogPage.errors.noCatalog'
  if (status === 404) return 'supplierCatalogPage.errors.notFound'
  return 'supplierCatalogPage.errors.generic'
}

const toastCatalogError = (err: unknown) => toast.error(i18n.t(catalogErrorKey(err)))

/** Everything a catalog change can move: the lists, the open details and, after an import, the storefront. */
function invalidateCatalog(queryClient: QueryClient, { storefront = false } = {}) {
  void queryClient.invalidateQueries({ queryKey: supplierBrandsKey })
  void queryClient.invalidateQueries({ queryKey: supplierProductsKey })
  void queryClient.invalidateQueries({ queryKey: ['supplier-brand'] })
  void queryClient.invalidateQueries({ queryKey: ['supplier-product'] })
  if (storefront) {
    void queryClient.invalidateQueries({ queryKey: ['games'] })
    void queryClient.invalidateQueries({ queryKey: ['game-names'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    void queryClient.invalidateQueries({ queryKey: ['products-by-game'] })
  }
}

// --- Reading ---------------------------------------------------------------------------------------

export function useSupplierBrands(filters: SupplierBrandFilters, enabled = true) {
  const params = pickNonEmpty({
    provider_id: filters.providerId,
    game_id: filters.gameId,
    region: filters.region,
    search: filters.search?.trim(),
    mapping_status: filters.mappingStatus,
    page: filters.page,
    limit: filters.limit,
  })
  return useQuery({
    queryKey: [...supplierBrandsKey, params],
    queryFn: async () => {
      const { data } = await api.get<SupplierListResponse<SupplierBrand>>('/supplier-brands', { params })
      return { list: data.data ?? [], meta: data.meta }
    },
    enabled,
    // Keep the current page on screen while a new filter or page loads.
    placeholderData: keepPreviousData,
  })
}

export function useSupplierBrand(id: string | undefined) {
  return useQuery({
    queryKey: supplierBrandKey(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: SupplierBrandDetail }>(`/supplier-brands/${id}`)
      return data.data
    },
    enabled: !!id && isUuid(id),
  })
}

export function useSupplierProducts(filters: SupplierProductFilters, enabled = true) {
  const params = pickNonEmpty({
    provider_id: filters.providerId,
    supplier_brand_id: filters.supplierBrandId,
    product_id: filters.productId,
    search: filters.search?.trim(),
    status: filters.status,
    mapping_status: filters.mappingStatus,
    page: filters.page,
    limit: filters.limit,
  })
  return useQuery({
    queryKey: [...supplierProductsKey, params],
    queryFn: async () => {
      const { data } = await api.get<SupplierListResponse<SupplierProduct>>('/supplier-products', { params })
      return { list: data.data ?? [], meta: data.meta }
    },
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useSupplierProduct(id: string | undefined) {
  return useQuery({
    queryKey: supplierProductKey(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: SupplierProductDetail }>(`/supplier-products/${id}`)
      return data.data
    },
    enabled: !!id && isUuid(id),
  })
}

/** The provider's latest sync, asked again every few seconds while it runs. Null when it never synced. */
export function useProviderSync(providerId: string | undefined) {
  return useQuery({
    queryKey: providerSyncKey(providerId),
    queryFn: async () => {
      const { data } = await api.get<{ data: SupplierSyncRun | null }>(`/providers/${providerId}/sync`)
      return data.data ?? null
    },
    enabled: !!providerId && isUuid(providerId),
    refetchInterval: (query) => (query.state.data?.status === 'RUNNING' ? SYNC_POLL_MS : false),
    refetchIntervalInBackground: false,
  })
}

// --- Syncing ---------------------------------------------------------------------------------------

export function useStartProviderSync(providerId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: SupplierSyncRun }>(`/providers/${providerId}/sync`)
      return data.data
    },
    onSuccess: (run) => {
      // The run comes back RUNNING, which starts the panel's polling.
      queryClient.setQueryData(providerSyncKey(providerId), run)
      toast.success(i18n.t('supplierCatalogPage.toasts.syncStarted'))
    },
    onError: (err) => {
      toastCatalogError(err)
      void queryClient.invalidateQueries({ queryKey: providerSyncKey(providerId) })
    },
  })
}

export function useSyncBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (brandId: string) => {
      const { data } = await api.post<{ data: SupplierSyncRun }>(`/supplier-brands/${brandId}/sync`)
      return data.data
    },
    onSuccess: (run) => {
      toast.success(i18n.t('supplierCatalogPage.toasts.brandSynced', { count: run.products_seen }))
      invalidateCatalog(queryClient)
    },
    onError: toastCatalogError,
  })
}

// --- Tying to the storefront -----------------------------------------------------------------------

export function useMapBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, gameId }: { id: string; status: SupplierMappingStatus; gameId?: string }) => {
      const { data } = await api.patch<{ data: SupplierBrand }>(`/supplier-brands/${id}/mapping`, {
        status,
        game_id: gameId ?? null,
      })
      return data.data
    },
    onSuccess: (brand) => {
      toast.success(i18n.t(`supplierCatalogPage.toasts.brandMapping.${brand.mapping_status}`))
      invalidateCatalog(queryClient)
    },
    onError: toastCatalogError,
  })
}

export function useImportBrand() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ data: SupplierBrand }>(`/supplier-brands/${id}/import`)
      return data.data
    },
    onSuccess: (brand) => {
      toast.success(i18n.t('supplierCatalogPage.toasts.brandImported', { name: brand.game_name || brand.name }))
      invalidateCatalog(queryClient, { storefront: true })
    },
    onError: toastCatalogError,
  })
}

export function useImportBrandProducts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<{ data: SupplierImportProductsResult }>(`/supplier-brands/${id}/import-products`)
      return data.data
    },
    onSuccess: (result) => {
      toast.success(i18n.t('supplierCatalogPage.toasts.productsImported', { ...result }))
      invalidateCatalog(queryClient, { storefront: true })
    },
    onError: toastCatalogError,
  })
}

export function useMapSupplierProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status, productId }: { id: string; status: SupplierMappingStatus; productId?: string }) => {
      const { data } = await api.patch<{ data: SupplierProduct }>(`/supplier-products/${id}/mapping`, {
        status,
        product_id: productId ?? null,
      })
      return data.data
    },
    onSuccess: (product) => {
      toast.success(i18n.t(`supplierCatalogPage.toasts.productMapping.${product.mapping_status}`))
      invalidateCatalog(queryClient)
    },
    onError: toastCatalogError,
  })
}

export function useUpdateSupplierProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, isEnabled, priority }: { id: string; isEnabled?: boolean; priority?: number }) => {
      const { data } = await api.patch<{ data: SupplierProduct }>(`/supplier-products/${id}`, {
        ...(isEnabled !== undefined && { is_enabled: isEnabled }),
        ...(priority !== undefined && { priority }),
      })
      return data.data
    },
    onSuccess: () => {
      toast.success(i18n.t('supplierCatalogPage.toasts.productUpdated'))
      invalidateCatalog(queryClient)
    },
    onError: toastCatalogError,
  })
}
