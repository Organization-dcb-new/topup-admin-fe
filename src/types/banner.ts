export type Banner = {
  id: string
  /** Public URL of the uploaded image. */
  image: string
  /** Where a click on the banner goes; empty means it isn't clickable. */
  redirect_link: string
}

export interface BannerResponse {
  data: Banner[]
  message: string
}

export type BannerPayload = {
  image: string
  redirect_link: string
}
