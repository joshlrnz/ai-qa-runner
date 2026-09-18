import { testPlanSchema } from '@/contracts/test-plan'

export const fallbackPlan = testPlanSchema.parse({
  name: 'Open the authenticated oboda dashboard',
  steps: [
    { action: 'navigate', path: '/' },
    { action: 'assertVisible', target: 'welcome-heading' },
    { action: 'assertText', target: 'inventory-alerts-heading', value: 'Inventory Alerts' }
  ]
})
