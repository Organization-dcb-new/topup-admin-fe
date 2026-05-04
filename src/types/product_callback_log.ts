export interface ProductCallbackLogResponse {
  id: string;
  product_code: string;
  product_name: string;
  provider_code: string;
  price: number;
  status: string;
  meta_level: string;
  meta_timestamp: number;
  original_payload: Record<string, any>;
  created_at: string;
  previous_price: number;
}

export interface MetaResponse {
  page: number;
  limit: number;
  total_data: number;
  total_page: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ProductCallbackLogListResponse {
  message: string;
  data: ProductCallbackLogResponse[];
  meta: MetaResponse;
}
