import { Agent } from '@mastra/core/agent'
import { plannerInstructions } from './instructions'
import { plannerTools } from './tools'

export const defaultPlannerModel = 'openai/gpt-5.6-sol'

export function getPlannerModel() {
  return process.env.QA_PLANNER_MODEL ?? defaultPlannerModel
}

export const plannerAgent = new Agent({
  id: 'qa-planner',
  name: 'QA Planner',
  instructions: plannerInstructions,
  model: getPlannerModel(),
  tools: plannerTools
})
