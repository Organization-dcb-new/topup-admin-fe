import { QueryClient } from '@tanstack/react-query'

/**
 * Satu instance dipakai bersama oleh React (lewat QueryClientProvider) dan oleh
 * kode di luar React seperti interceptor axios, supaya sesi yang mati bisa
 * ditandai tanpa harus memuat ulang dokumen.
 */
export const queryClient = new QueryClient()
