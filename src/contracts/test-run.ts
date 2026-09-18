import { z } from 'zod'

export const runStatusSchema = z.enum(['queued', 'running', 'passed', 'failed'])

export const stepStatusSchema = z.enum(['pending', 'running', 'passed', 'failed', 'skipped'])

export const stepResultSchema = z.object({
  index: z.number().int().nonnegative(),
  title: z.string().min(1),
  status: stepStatusSchema,
  durationMs: z.number().int().nonnegative().nullable(),
  error: z.string().nullable()
})

export const testRunSchema = z.object({
  runId: z.string().min(1),
  planName: z.string().min(1),
  status: runStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  error: z.string().nullable(),
  reportUrl: z.string().nullable(),
  steps: z.array(stepResultSchema).optional()
})

export const startRunResponseSchema = z.object({
  runId: z.string().min(1),
  status: runStatusSchema
})

export type RunStatus = z.infer<typeof runStatusSchema>
export type StepStatus = z.infer<typeof stepStatusSchema>
export type StepResult = z.infer<typeof stepResultSchema>
export type TestRun = z.infer<typeof testRunSchema>
