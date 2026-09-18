import { blockedResultSchema, plannedResultSchema, type PlanResult } from '../contracts/plan-request'
import { plannerAgent } from './agent'

type ToolEvent = {
  toolName?: string
  result?: unknown
  payload?: { toolName?: string; result?: unknown }
}

export type PlanAttempt = {
  result: PlanResult | null
  text: string
  toolNames: string[]
  finishReason: string | null
}

// Research plus validation plus emit runs well past Mastra's default of 5 steps.
export function getPlannerMaxSteps() {
  return Number(process.env.QA_PLANNER_MAX_STEPS ?? 40)
}

function readToolName(event: ToolEvent) {
  return event.payload?.toolName ?? event.toolName ?? null
}

function readResult(event: ToolEvent) {
  return event.payload?.result ?? event.result ?? null
}

export async function planTest(instruction: string): Promise<PlanAttempt> {
  const run = await plannerAgent.generate(instruction, { maxSteps: getPlannerMaxSteps() })
  const events = (run.toolResults ?? []) as ToolEvent[]
  const toolNames = events.map((event) => readToolName(event) ?? 'unknown')
  const text = run.text ?? ''
  const finishReason = (run as { finishReason?: string }).finishReason ?? null

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const name = readToolName(events[index])
    const raw = readResult(events[index])

    if (name === 'createPlanTool' || name === 'create_plan') {
      const planned = plannedResultSchema.safeParse((raw as { planned?: unknown })?.planned)

      if (planned.success) {
        return { result: planned.data, text, toolNames, finishReason }
      }
    }

    if (name === 'reportBlockedTool' || name === 'report_blocked') {
      const blocked = blockedResultSchema.safeParse((raw as { blocked?: unknown })?.blocked)

      if (blocked.success) {
        return { result: blocked.data, text, toolNames, finishReason }
      }
    }
  }

  return { result: null, text, toolNames, finishReason }
}
