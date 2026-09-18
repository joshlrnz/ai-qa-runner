import type { TestStep } from '@/contracts/test-plan'

const ROLE_PATTERN = /role=(\w+)\[name\*?=["']([^"']+)["']\]/
const TEST_ID_PATTERN = /\[data-(?:field|testid)=['"]([^'"]+)['"]\]/

export function humaniseSelector(selector: string) {
  const roleMatch = selector.match(ROLE_PATTERN)

  if (roleMatch) {
    return `the "${roleMatch[2]}" ${roleMatch[1]}`
  }

  const testIdMatch = selector.match(TEST_ID_PATTERN)

  if (testIdMatch) {
    return `the ${testIdMatch[1]} field`
  }

  return selector.length > 48 ? `${selector.slice(0, 45)}...` : selector
}

export function describeTestStep(step: TestStep) {
  switch (step.action) {
    case 'navigate':
      return `Go to ${step.path}`
    case 'click':
      return `Click ${humaniseSelector(step.selector)}`
    case 'fill':
      return `Type into ${humaniseSelector(step.selector)}`
    case 'assertVisible':
      return `Check ${humaniseSelector(step.selector)} is visible`
    case 'assertText':
      return `Check ${humaniseSelector(step.selector)} says "${step.value}"`
  }
}

export function describeExpectation(step: TestStep) {
  switch (step.action) {
    case 'navigate':
      return `${step.path} loads`
    case 'click':
      return `${humaniseSelector(step.selector)} responds`
    case 'fill':
      return `${humaniseSelector(step.selector)} holds the value`
    case 'assertVisible':
      return `${humaniseSelector(step.selector)} is on screen`
    case 'assertText':
      return `the text reads "${step.value}"`
  }
}

export function describeTarget(step: TestStep) {
  return step.action === 'navigate' ? step.path : step.selector
}
