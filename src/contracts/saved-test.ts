import { z } from 'zod'
import { planParamsSchema, testPlanSchema } from './test-plan'
import { runStatusSchema } from './test-run'

export const savedTestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  plan: testPlanSchema,
  defaultParams: planParamsSchema.default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastRunId: z.string().nullable().default(null),
  lastRunStatus: runStatusSchema.nullable().default(null),
  lastRunAt: z.string().datetime().nullable().default(null)
})

export const saveTestRequestSchema = z.object({
  plan: testPlanSchema,
  params: planParamsSchema.default({})
})

export const savedTestListSchema = z.object({
  tests: z.array(savedTestSchema)
})

export const recordTestRunRequestSchema = z.object({
  lastRunId: z.string().min(1),
  lastRunStatus: runStatusSchema,
  lastRunAt: z.string().datetime()
})

export type SavedTest = z.infer<typeof savedTestSchema>
export type SaveTestRequest = z.infer<typeof saveTestRequestSchema>
export type RecordTestRunRequest = z.infer<typeof recordTestRunRequestSchema>
