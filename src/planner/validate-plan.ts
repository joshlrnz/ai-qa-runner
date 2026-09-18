import { testPlanSchema, type TestStep } from '../contracts/test-plan'
import { lookupPath, lookupSelector } from '../knowledge/qa-knowledge'
import { collectParamNames } from '../runner/substitute-params'

export type PlanValidation = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

function stepTexts(step: TestStep) {
  if (step.action === 'navigate') {
    return [step.path]
  }

  if (step.action === 'fill' || step.action === 'assertText') {
    return [step.selector, step.value]
  }

  return [step.selector]
}

export function validatePlan(candidate: unknown): PlanValidation {
  const parsed = testPlanSchema.safeParse(candidate)

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || 'plan'}: ${issue.message}`
      ),
      warnings: []
    }
  }

  const plan = parsed.data
  const errors: string[] = []
  const warnings: string[] = []

  const declared = new Set(Object.keys(plan.requiredParams))
  const referenced = new Set<string>()

  for (const step of plan.steps) {
    for (const text of stepTexts(step)) {
      for (const name of collectParamNames(text)) {
        referenced.add(name)
      }
    }
  }

  for (const name of referenced) {
    if (!declared.has(name)) {
      errors.push(
        `A step references {${name}} but requiredParams does not declare it. Add it, or stop using it.`
      )
    }
  }

  for (const name of declared) {
    if (!referenced.has(name)) {
      warnings.push(`requiredParams declares ${name} but no step uses it.`)
    }
  }

  plan.steps.forEach((step, index) => {
    const position = `step ${index + 1} (${step.action})`

    if (step.action === 'navigate') {
      if (!lookupPath(step.path)) {
        warnings.push(
          `${position}: path ${step.path} is not in the knowledge base. Confirm it exists.`
        )
      }

      return
    }

    const known = lookupSelector(step.selector)

    if (!known) {
      warnings.push(
        `${position}: selector ${step.selector} was not taken from the knowledge base. Say why you derived it.`
      )
      return
    }

    if (known.confidence === 'low') {
      warnings.push(
        `${position}: ${known.name} is confidence low. It may not resolve against the running application.`
      )
    }
  })

  const hasAssertion = plan.steps.some(
    (step) => step.action === 'assertVisible' || step.action === 'assertText'
  )

  if (!hasAssertion) {
    warnings.push('The plan has no assertion step, so it cannot fail for the reason it was written.')
  }

  return { valid: errors.length === 0, errors, warnings }
}
