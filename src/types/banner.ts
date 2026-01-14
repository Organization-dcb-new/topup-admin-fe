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

export type FormValuesBanner = {
  image: string
  redirect_link: string
}

export type BannerPayload = {
  image: string
  redirect_link: string
}


