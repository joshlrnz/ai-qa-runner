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
// Each step is one HTTP call carrying the whole history, so fewer steps means fewer
// chances of a dropped connection. Raise QA_PLANNER_MAX_STEPS if plans come back thin.
export function getPlannerMaxSteps() {
  return Number(process.env.QA_PLANNER_MAX_STEPS ?? 20)
}

function getPlannerAttempts() {
  return Number(process.env.QA_PLANNER_ATTEMPTS ?? 3)
}

// The upstream call returns 200 and then dies mid-body, which the AI SDK marks
// isRetryable: false. It is a dropped socket, not a rejected request, so it is worth retrying.
function isDroppedConnection(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  if (error.message.includes('Failed to process successful response')) {
    return true
  }

  let cause: unknown = error.cause

  while (cause instanceof Error) {
    const code = (cause as Error & { code?: string }).code

    if (code === 'ETIMEDOUT' || code === 'ECONNRESET' || cause.message === 'terminated') {
      return true
    }

    cause = cause.cause
  }

  return false
}

async function withRetry<T>(operation: () => Promise<T>): Promise<T> {
  const attempts = getPlannerAttempts()
  let lastError: unknown = null

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (!isDroppedConnection(error) || attempt === attempts) {
        throw error
      }
    }
  }

  throw lastError
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

export async function planTest(instruction: string): Promise<PlanAttempt> {
  const run = await withRetry(() =>
    getPlannerAgent().generate(instruction, { maxSteps: getPlannerMaxSteps() })
  )
  return toAttempt(run as AgentRun)
}

export async function resumePlanTest(
  runId: string,
  answers: ClarificationAnswers
): Promise<PlanAttempt> {
  try {
    const run = await withRetry(() =>
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
