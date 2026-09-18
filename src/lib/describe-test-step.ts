import type { TestStep } from '@/contracts/test-plan'

export function describeTestStep(step: TestStep) {
  switch (step.action) {
    case 'navigate':
      return `Navigate to ${step.path}`
    case 'click':
      return `Click ${step.selector}`
    case 'fill':
      return `Fill ${step.selector}`
    case 'assertVisible':
      return `Verify ${step.selector} is visible`
    case 'assertText':
      return `Verify ${step.selector} contains expected text`
  }
}

export function describeExpectation(step: TestStep) {
  switch (step.action) {
    case 'navigate':
      return `The page at ${step.path} loads`
    case 'click':
      return `${step.selector} responds to the click`
    case 'fill':
      return `${step.selector} holds "${step.value}"`
    case 'assertVisible':
      return `${step.selector} is on screen`
    case 'assertText':
      return `${step.selector} contains "${step.value}"`
  }
}

export function describeTarget(step: TestStep) {
  return step.action === 'navigate' ? step.path : step.selector
}
