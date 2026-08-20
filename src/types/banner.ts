// types/banner.ts
export type Banner = {
  id: string // UUID dari backend
  image: string // URL banner
  redirect_link: string // Link redirect saat banner diklik
}

export interface BannerResponse {
  data: Banner[]
  message: string
}

/** Body untuk POST /banners dan PATCH /banners/:id — keduanya sama. */
export type BannerPayload = Omit<Banner, 'id'>

/** Field yang benar-benar dipegang react-hook-form. `image` diurus terpisah
 *  oleh `useBannerImage` karena berkasnya baru diunggah saat submit. */
export type BannerFormValues = Pick<Banner, 'redirect_link'>
