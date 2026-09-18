import { readFileSync } from 'node:fs'
import path from 'node:path'
import { test } from '@playwright/test'
import { testPlanSchema } from '@/contracts/test-plan'
import { describeTestStep, executeTestStep } from '@/runner/execute-test-plan'

const planPath = path.resolve(process.env.TEST_PLAN_PATH ?? path.join('plans', 'smoke.json'))
const plan = testPlanSchema.parse(JSON.parse(readFileSync(planPath, 'utf8')))
const params = {}

test(plan.name, async ({ page }) => {
  for (const step of plan.steps) {
    await test.step(describeTestStep(step), async () => {
      await executeTestStep(page, step, params)
    })
  }
})
