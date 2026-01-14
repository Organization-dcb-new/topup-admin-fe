export type GameV2 = {
  ID: string
  CategoryID: string
  ProviderID: string

  Name: string
  Slug: string
  Code: string

  ThumbnailURL: string
  BannerURL: string

  Description: string
  Instruction: string
  Developer: string
  Publisher: string

  IsFeatured: boolean
  IsActive: boolean
  IsCheckId: boolean
  IsShow: boolean

  PopularityScore: number

  CreatedAt: string
  UpdatedAt: string

  Inputs: any[] | null

  Category: any | null
  Provider: any | null

  ShowID: string | null
  Show: Show
}

export type Show = {
  ID: string
  Name: string
  Alias: string
  Image: string

  IsHot: boolean
  IsNew: boolean
  IsPopular: boolean
  IsShow: boolean

  Games: GameV2[]
}

export interface ShowResponse {
  data: Show[]
  message: string
}
