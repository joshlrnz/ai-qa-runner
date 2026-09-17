import { z } from 'zod'

export const runStatusSchema = z.enum(['queued', 'running', 'passed', 'failed'])

export const testRunSchema = z.object({
  runId: z.string().min(1),
  planName: z.string().min(1),
  status: runStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  error: z.string().nullable(),
  reportUrl: z.string().nullable()
})

export type RunStatus = z.infer<typeof runStatusSchema>
export type TestRun = z.infer<typeof testRunSchema>
