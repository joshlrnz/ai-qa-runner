import { z } from 'zod'
import { testPlanSchema } from './test-plan'

export const plannedResultSchema = z.object({
  status: z.literal('planned'),
  plan: testPlanSchema,
  assumptions: z.array(z.string()),
  sourceModules: z.array(z.string()),
  warnings: z.array(z.string())
})

export const blockedResultSchema = z.object({
  status: z.literal('blocked'),
  reason: z.string().min(1),
  missingCapabilities: z.array(z.string())
})

export const planResultSchema = z.discriminatedUnion('status', [
  plannedResultSchema,
  blockedResultSchema
])

export type PlannedResult = z.infer<typeof plannedResultSchema>
export type BlockedResult = z.infer<typeof blockedResultSchema>
export type PlanResult = z.infer<typeof planResultSchema>
