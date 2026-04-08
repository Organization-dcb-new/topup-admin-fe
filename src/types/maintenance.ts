export type Maintenance = {
  id: string
  name: string
  is_maintenance: boolean
  /** RFC3339 WIB, mis. `2026-04-08T04:52:00+07:00` */
  start_time: string | null
  /** RFC3339 WIB, mis. `2026-04-08T06:52:00+07:00` */
  end_time: string | null
  created_by: string
  updated_by: string
  /** RFC3339 WIB, mis. `2026-04-08T11:42:02.996372+07:00` */
  created_at: string
  /** RFC3339 WIB */
  updated_at: string
}

export type MaintenanceListResponse = {
  data: Maintenance[]
  message?: string
}

/** Selaras CreateMaintenanceDTO */
export type CreateMaintenancePayload = {
  name: string
  is_maintenance: boolean
  start_time?: string | null
  end_time?: string | null
}

/** Selaras UpdateMaintenanceDTO */
export type UpdateMaintenancePayload = {
  name?: string
  is_maintenance?: boolean
  start_time?: string | null
  end_time?: string | null
}
