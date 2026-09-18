import { z } from 'zod'

const selectorStepSchema = z.object({
  selector: z.string().min(1)
})

const valueStepSchema = selectorStepSchema.extend({
  value: z.string()
})

export const testStepSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('navigate'),
    path: z.string().startsWith('/')
  }),
  selectorStepSchema.extend({
    action: z.literal('click')
  }),
  valueStepSchema.extend({
    action: z.literal('fill')
  }),
  selectorStepSchema.extend({
    action: z.literal('assertVisible')
  }),
  valueStepSchema.extend({
    action: z.literal('assertText')
  })
])

export const requiredParamSchema = z.object({
  description: z.string().min(1),
  secret: z.boolean()
})

export const testPlanSchema = z.object({
  name: z.string().min(1),
  requiredParams: z.record(z.string(), requiredParamSchema).default({}),
  steps: z.array(testStepSchema).min(1)
})

export type TestStep = z.infer<typeof testStepSchema>
export type TestPlan = z.infer<typeof testPlanSchema>
export type RequiredParam = z.infer<typeof requiredParamSchema>
export type PlanParams = Record<string, string>
