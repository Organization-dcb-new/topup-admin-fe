export type Banner = {
  id: string
  title: string
  image: string
  alt_text: string
  redirect_link: string
  is_active: boolean
  sort_order: number
  start_at: string | null
  end_at: string | null
  created_at: string
  updated_at: string
}

export type BannerListResponse = {
  status?: string
  message: string
  data: Banner[]
}

/** Nilai mentah dari form. `start_at`/`end_at` kosong berarti tanpa batas
 *  jadwal; hook yang mengubahnya jadi `null` sebelum dikirim ke API. */
export type BannerFormValues = {
  title: string
  image: string
  alt_text: string
  redirect_link: string
  is_active: boolean
  start_at: string
  end_at: string
}

export type BannerReorderItem = {
  id: string
  sort_order: number
}
