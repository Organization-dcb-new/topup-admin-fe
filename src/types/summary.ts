export interface SummaryItem {
  time_key: string; 
  total_amount_pg: number;
  total_amount_provider: number;
  gross_profit: number;
}

export interface PaginationMeta {
  total_data: number;
  total_pages: number;
  current_page: number;
}

export interface OverallStats {
  total_amount_pg: number;
  total_amount_provider: number;
  total_gross_profit: number;
}

export interface SummaryReportData {
  data: SummaryItem[];
  meta: PaginationMeta;
  overall_stats: OverallStats;
}

export interface SummaryReportResponse {
  data: SummaryReportData;
  status: "success" | "error";
  message?: string; 
}
