import { z } from 'zod'
import { testPlanSchema } from './test-plan'

export const generateRequestSchema = z.object({
  description: z.string().min(1)
})

export const generateResponseSchema = z.object({
  plan: testPlanSchema,
  notes: z.array(z.string()).optional()
})

export type GenerateRequest = z.infer<typeof generateRequestSchema>
export type GenerateResponse = z.infer<typeof generateResponseSchema>
