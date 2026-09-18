import {
  blockedResultSchema,
  clarificationRequestSchema,
  plannedResultSchema,
  type ClarificationAnswers,
  type PlanResult
} from '../contracts/plan-request'
import { mastra } from '../mastra'

type ToolEvent = {
  toolName?: string
  result?: unknown
  payload?: { toolName?: string; result?: unknown }
}

type AgentRun = {
  text?: string
  runId?: string
  finishReason?: string
  toolResults?: ToolEvent[]
  suspendPayload?: { toolName?: string; toolCallId?: string; suspendPayload?: unknown }
}

export type PlanAttempt = {
  result: PlanResult | null
  text: string
  toolNames: string[]
  finishReason: string | null
  runId: string | null
}

export class UnknownPlanRunError extends Error {
  constructor(runId: string) {
    super(`No suspended plan run with id ${runId}`)
    this.name = 'UnknownPlanRunError'
  }
}

// Research, clarification and validation run well past Mastra's default of 5 steps.
export function getPlannerMaxSteps() {
  return Number(process.env.QA_PLANNER_MAX_STEPS ?? 40)
}

function getPlannerAgent() {
  return mastra.getAgentById('qa-planner')
}

function readToolName(event: ToolEvent) {
  return event.payload?.toolName ?? event.toolName ?? null
}

function readResult(event: ToolEvent) {
  return event.payload?.result ?? event.result ?? null
}

function toAttempt(run: AgentRun): PlanAttempt {
  const events = run.toolResults ?? []
  const attempt: PlanAttempt = {
    result: null,
    text: run.text ?? '',
    toolNames: events.map((event) => readToolName(event) ?? 'unknown'),
    finishReason: run.finishReason ?? null,
    runId: run.runId ?? null
  }

  if (run.finishReason === 'suspended') {
    const clarification = clarificationRequestSchema.safeParse(run.suspendPayload?.suspendPayload)

    if (clarification.success && run.runId) {
      return {
        ...attempt,
        result: {
          status: 'needs_input',
          runId: run.runId,
          questions: clarification.data.questions,
          inferredParams: clarification.data.inferredParams,
          environmentParams: []
        }
      }
    }

    return attempt
  }

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const name = readToolName(events[index])
    const raw = readResult(events[index])

    if (name === 'createPlanTool' || name === 'create_plan') {
      const planned = plannedResultSchema.safeParse((raw as { planned?: unknown })?.planned)

      if (planned.success) {
        return { ...attempt, result: planned.data }
      }
    }

    if (name === 'reportBlockedTool' || name === 'report_blocked') {
      const blocked = blockedResultSchema.safeParse((raw as { blocked?: unknown })?.blocked)

      if (blocked.success) {
        return { ...attempt, result: blocked.data }
      }
    }
  }

  return attempt
}

// Model calls fail at the network layer now and then: a stalled read while the
// response body streams (read ETIMEDOUT), a reset, a dropped keep-alive. The
// provider has already done the work, so a short retry is cheap and usually
// enough. Anything that is not a transport error is rethrown as is.
const transportErrorPattern = /ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|terminated|socket hang up|fetch failed|Cannot connect to API/i

function isTransportError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return transportErrorPattern.test(error.message) || isTransportError(error.cause)
}

export function getPlannerTransportRetries() {
  return Number(process.env.QA_PLANNER_TRANSPORT_RETRIES ?? 2)
}

async function withTransportRetry<T>(label: string, call: () => Promise<T>): Promise<T> {
  const retries = getPlannerTransportRetries()

  for (let attempt = 0; ; attempt += 1) {
    try {
      return await call()
    } catch (error) {
      if (!isTransportError(error) || attempt >= retries) {
        throw error
      }

      const delayMs = 2000 * (attempt + 1)
      console.warn(`[planner] ${label}: transport error, retrying in ${delayMs}ms (${attempt + 1}/${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }
}

export async function planTest(instruction: string): Promise<PlanAttempt> {
  const run = await withTransportRetry('generate', () =>
    getPlannerAgent().generate(instruction, { maxSteps: getPlannerMaxSteps() })
  )
  return toAttempt(run as AgentRun)
}

export async function resumePlanTest(
  runId: string,
  answers: ClarificationAnswers
): Promise<PlanAttempt> {
  try {
    const run = await withTransportRetry('resume', () =>
      getPlannerAgent().resumeGenerate(answers, {
        runId,
        maxSteps: getPlannerMaxSteps()
      })
    )

    return toAttempt(run as AgentRun)
  } catch (error) {
    // Mastra tags this case, which is steadier than matching the message text.
    if ((error as { id?: string })?.id === 'AGENT_RESUME_NO_SNAPSHOT_FOUND') {
      throw new UnknownPlanRunError(runId)
    }

    throw error
  }
}
