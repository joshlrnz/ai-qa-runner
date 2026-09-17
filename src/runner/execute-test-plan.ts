import { expect, type Page } from '@playwright/test'
import applicationKnowledge from '@/knowledge/application.json'
import type { TestStep } from '@/contracts/test-plan'

type TargetName = keyof typeof applicationKnowledge.targets

function resolveTarget(target: string) {
  if (!(target in applicationKnowledge.targets)) {
    throw new Error(`Unknown target: ${target}`)
  }

  return applicationKnowledge.targets[target as TargetName].selector
}

function assertKnownPath(path: string) {
  const knownPaths = new Set(Object.values(applicationKnowledge.pages))

  if (!knownPaths.has(path)) {
    throw new Error(`Unknown application path: ${path}`)
  }
}

export async function executeTestStep(page: Page, step: TestStep) {
  switch (step.action) {
    case 'navigate':
      assertKnownPath(step.path)
      await page.goto(step.path)
      return
    case 'click':
      await page.locator(resolveTarget(step.target)).click()
      return
    case 'fill':
      await page.locator(resolveTarget(step.target)).fill(step.value)
      return
    case 'select':
      await page.locator(resolveTarget(step.target)).selectOption({ label: step.value })
      return
    case 'assertVisible':
      await expect(page.locator(resolveTarget(step.target))).toBeVisible()
      return
    case 'assertText':
      await expect(page.locator(resolveTarget(step.target))).toContainText(step.value)
  }
}

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
