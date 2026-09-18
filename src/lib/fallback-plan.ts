import { testPlanSchema } from '@/contracts/test-plan'

// Steps carry Playwright selectors, not logical target names — see
// src/contracts/test-plan.ts. These are the verified shell selectors from
// qa-knowledge/modules/shell.md for the post-sign-in landing page.
export const fallbackPlan = testPlanSchema.parse({
  name: 'Open the authenticated oboda dashboard',
  steps: [
    { action: 'navigate', path: '/' },
    { action: 'assertVisible', selector: "nav:not([aria-label='breadcrumb'])" },
    { action: 'assertText', selector: 'role=navigation[name="breadcrumb"]', value: 'Dashboard' }
  ]
})
