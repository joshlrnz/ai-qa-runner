import type { TestStep } from '@/contracts/test-plan'

export function describeTestStep(step: TestStep) {
  switch (step.action) {
    case 'navigate':
      return `Navigate to ${step.path}`
    case 'click':
      return `Click ${step.target}`
    case 'fill':
      return `Fill ${step.target}`
    case 'select':
      return `Select ${step.value} in ${step.target}`
    case 'assertVisible':
      return `Verify ${step.target} is visible`
    case 'assertText':
      return `Verify ${step.target} contains expected text`
  }
}

export function describeExpectation(step: TestStep) {
  switch (step.action) {
    case 'navigate':
      return `The page at ${step.path} loads`
    case 'click':
      return `${step.target} responds to the click`
    case 'fill':
      return `${step.target} holds "${step.value}"`
    case 'select':
      return `${step.target} is set to "${step.value}"`
    case 'assertVisible':
      return `${step.target} is on screen`
    case 'assertText':
      return `${step.target} contains "${step.value}"`
  }
}

export function describeTarget(step: TestStep) {
  return step.action === 'navigate' ? step.path : step.target
}
