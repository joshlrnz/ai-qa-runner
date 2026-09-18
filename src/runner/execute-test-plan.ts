import { expect, type Page } from '@playwright/test'
import type { PlanParams, TestStep } from '@/contracts/test-plan'
import { substituteParams } from './substitute-params'

export async function executeTestStep(page: Page, step: TestStep, params: PlanParams) {
  switch (step.action) {
    case 'navigate':
      await page.goto(substituteParams(step.path, params))
      return
    case 'click':
      await page.locator(substituteParams(step.selector, params)).click()
      return
    case 'fill':
      await page
        .locator(substituteParams(step.selector, params))
        .fill(substituteParams(step.value, params))
      return
    case 'assertVisible':
      await expect(page.locator(substituteParams(step.selector, params))).toBeVisible()
      return
    case 'assertText':
      await expect(page.locator(substituteParams(step.selector, params))).toContainText(
        substituteParams(step.value, params)
      )
  }
}

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
