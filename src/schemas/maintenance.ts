import { z } from 'zod'

import { isMaintenanceWindowOrderInvalid } from '@/helpers/maintenance-datetime'

export const maintenanceSchema = z
  .object({
    name: z.string().trim().min(1, 'maintenancePage.form.errors.nameRequired'),
    start_time: z.string().min(1, 'maintenancePage.form.errors.startRequired'),
    end_time: z.string().min(1, 'maintenancePage.form.errors.endRequired'),
    is_maintenance: z.boolean(),
  })
  .refine((v) => !isMaintenanceWindowOrderInvalid(v.start_time, v.end_time), {
    path: ['end_time'],
    message: 'maintenancePage.form.errors.orderInvalid',
  })

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>
