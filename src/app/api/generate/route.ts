import { NextResponse } from 'next/server'
import { z } from 'zod'
import applicationKnowledge from '@/knowledge/application.json'
import { testPlanSchema, type TestPlan } from '@/contracts/test-plan'
import { generateRequestSchema } from '@/contracts/test-generation'

export const runtime = 'nodejs'

const completionSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().min(1) }) }))
    .min(1)
})

const rawPlanSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.record(z.string(), z.unknown())).min(1)
})

const knownPages: Record<string, string> = applicationKnowledge.pages
const knownPaths = new Set(Object.values(knownPages))
const knownTargets = new Set(Object.keys(applicationKnowledge.targets))

function buildSystemPrompt() {
  const pathList = Array.from(knownPaths).map((path) => `"${path}"`).join(', ')
  const targetList = Array.from(knownTargets).map((target) => `"${target}"`).join(', ')

  return [
    'You turn a QA engineer\'s plain-English request into a structured test plan for the Oboda web application.',
    'Reply with JSON only, shaped as { "name": string, "steps": TestStep[] }.',
    '',
    'A TestStep is exactly one of:',
    '{ "action": "navigate", "path": string }',
    '{ "action": "click", "target": string }',
    '{ "action": "fill", "target": string, "value": string }',
    '{ "action": "select", "target": string, "value": string }',
    '{ "action": "assertVisible", "target": string }',
    '{ "action": "assertText", "target": string, "value": string }',
    '',
    `The "path" field must be copied verbatim from this list, always starting with a slash: ${pathList}`,
    `The "target" field must be copied verbatim from this list: ${targetList}`,
    '',
    'Never invent a path or a target, and never use a page name in place of a path.',
    'Never emit CSS selectors or Playwright code.',
    'If the request cannot be expressed with the values above, build the closest plan you can using only those values.'
  ].join('\n')
}

function normaliseStep(step: Record<string, unknown>) {
  const { action, path } = step

  if (action !== 'navigate' || typeof path !== 'string' || path.startsWith('/')) {
    return step
  }

  const mappedPath = knownPages[path]

  return mappedPath ? { ...step, path: mappedPath } : step
}

function findUnknownReferences(plan: TestPlan) {
  const unknown: string[] = []

  for (const step of plan.steps) {
    if (step.action === 'navigate') {
      if (!knownPaths.has(step.path)) {
        unknown.push(`path ${step.path}`)
      }
    } else if (!knownTargets.has(step.target)) {
      unknown.push(`target ${step.target}`)
    }
  }

  return unknown
}

export async function POST(request: Request) {
  const parsedRequest = generateRequestSchema.safeParse(await request.json())

  if (!parsedRequest.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: z.treeifyError(parsedRequest.error) },
      { status: 400 }
    )
  }

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Plan generation is not configured. Set OPENAI_API_KEY to enable it.' },
      { status: 503 }
    )
  }

  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: parsedRequest.data.description }
      ]
    })
  })

  if (!completion.ok) {
    return NextResponse.json(
      { error: `The model provider returned ${completion.status}.` },
      { status: 502 }
    )
  }

  const parsedCompletion = completionSchema.safeParse(await completion.json())

  if (!parsedCompletion.success) {
    return NextResponse.json({ error: 'The model returned an unreadable response.' }, { status: 502 })
  }

  const parsedRawPlan = rawPlanSchema.safeParse(
    JSON.parse(parsedCompletion.data.choices[0].message.content)
  )

  if (!parsedRawPlan.success) {
    return NextResponse.json({ error: 'The model did not return a test plan.' }, { status: 422 })
  }

  const normalisedSteps = []

  for (const step of parsedRawPlan.data.steps) {
    normalisedSteps.push(normaliseStep(step))
  }

  const parsedPlan = testPlanSchema.safeParse({
    name: parsedRawPlan.data.name,
    steps: normalisedSteps
  })

  if (!parsedPlan.success) {
    return NextResponse.json(
      {
        error: 'The model returned a plan that does not match the allowed step shapes.',
        details: z.treeifyError(parsedPlan.error)
      },
      { status: 422 }
    )
  }

  const unknownReferences = findUnknownReferences(parsedPlan.data)

  if (unknownReferences.length > 0) {
    return NextResponse.json(
      {
        error: `The plan referenced things that are not in the knowledge base: ${unknownReferences.join(', ')}.`
      },
      { status: 422 }
    )
  }

  return NextResponse.json({ plan: parsedPlan.data })
}
