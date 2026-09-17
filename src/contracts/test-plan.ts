import { z } from 'zod'

const targetStepSchema = z.object({
  target: z.string().min(1)
})

const valueStepSchema = targetStepSchema.extend({
  value: z.string()
})

export const testStepSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('navigate'),
    path: z.string().startsWith('/')
  }),
  targetStepSchema.extend({
    action: z.literal('click')
  }),
  valueStepSchema.extend({
    action: z.literal('fill')
  }),
  valueStepSchema.extend({
    action: z.literal('select')
  }),
  targetStepSchema.extend({
    action: z.literal('assertVisible')
  }),
  valueStepSchema.extend({
    action: z.literal('assertText')
  })
])

export const testPlanSchema = z.object({
  name: z.string().min(1),
  steps: z.array(testStepSchema).min(1)
})

export type TestStep = z.infer<typeof testStepSchema>
export type TestPlan = z.infer<typeof testPlanSchema>
