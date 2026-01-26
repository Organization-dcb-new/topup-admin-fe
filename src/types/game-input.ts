import type { PaginationMeta } from "./game"

export interface GameInputOption {
  name: string
  value: string
}

export interface GameInput {
  id: string
  game_id: string
  key: string
  label: string
  input_type: 'text' | 'tel' | 'dropdown'
  required: boolean
  sort_order: number
  placeholder: string
  Options: GameInputOption[] | null
}

export interface GameWithInputs {
  id: string
  game_name: string
  image: string
  inputs: GameInput[]
}

export interface GameInputResponse {
  data: GameWithInputs[]
  message: string
  status: string
  meta: PaginationMeta
}
