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

export const clarificationQuestionSchema = z.object({
  id: z.string().min(1).describe('Short stable id, used to return the answer.'),
  question: z.string().min(1),
  why: z.string().describe('Why the answer changes the plan.')
})

export const inferredParamSchema = z.object({
  name: z.string(),
  description: z.string(),
  secret: z.boolean()
})

export const clarificationRequestSchema = z.object({
  questions: z.array(clarificationQuestionSchema),
  inferredParams: z.array(inferredParamSchema)
})

export const clarificationAnswerSchema = z.object({
  id: z.string().min(1),
  answer: z.string()
})

export const clarificationAnswersSchema = z.object({
  answers: z.array(clarificationAnswerSchema)
})

export const needsInputResultSchema = z.object({
  status: z.literal('needs_input'),
  runId: z.string().min(1),
  questions: z.array(clarificationQuestionSchema),
  inferredParams: z.array(inferredParamSchema)
})

export const planResultSchema = z.discriminatedUnion('status', [
  needsInputResultSchema,
  plannedResultSchema,
  blockedResultSchema
])

export type ClarificationQuestion = z.infer<typeof clarificationQuestionSchema>
export type ClarificationAnswers = z.infer<typeof clarificationAnswersSchema>
export type NeedsInputResult = z.infer<typeof needsInputResultSchema>
export type PlannedResult = z.infer<typeof plannedResultSchema>
export type BlockedResult = z.infer<typeof blockedResultSchema>
export type PlanResult = z.infer<typeof planResultSchema>
