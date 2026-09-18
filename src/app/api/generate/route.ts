import { NextResponse } from 'next/server'
import { z } from 'zod'
import applicationKnowledge from '@/knowledge/application.json'
import { testPlanSchema, type TestPlan } from '@/contracts/test-plan'
import { collectParamNames } from '@/runner/substitute-params'
import { generateRequestSchema } from '@/contracts/test-generation'

export const runtime = 'nodejs'

const completionSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().min(1) }) }))
    .min(1)
})

const rawPlanSchema = z.object({
  name: z.string().min(1),
  steps: z.array(z.record(z.string(), z.unknown())).min(1),
  params: z.record(z.string(), z.string()).optional()
})

const secretParams = new Set(['email', 'password'])

// Same model the grounded planner uses (QA_PLANNER_MODEL is "openai/<model>"),
// unless OPENAI_MODEL overrides it.
function plannerModelName() {
  const configured = process.env.QA_PLANNER_MODEL ?? 'openai/gpt-5.6-sol'
  return configured.replace(/^openai\//, '')
}

// qa-knowledge/modules/shell.md, flow "Sign in with email" — all selectors verified 2026-09-18.
const signInSteps: Record<string, unknown>[] = [
  { action: 'navigate', path: '/sign-in' },
  { action: 'assertVisible', selector: 'role=heading[name="Sign in to oboda"]' },
  { action: 'click', selector: 'role=button[name="Sign in with email"]' },
  { action: 'fill', selector: "input[name='email']", value: '{email}' },
  { action: 'fill', selector: "input[name='password']", value: '{password}' },
  { action: 'click', selector: 'role=button[name="Sign in"]' },
  { action: 'assertVisible', selector: "nav:not([aria-label='breadcrumb']) >> role=link[name=\"Home\"]" }
]

// Placeholders the model could not fill stay in the plan and are declared, so
// /api/runs reports them as missing instead of the runner crashing mid-test.
function declareRemainingParams(steps: TestPlan['steps']) {
  const requiredParams: TestPlan['requiredParams'] = {}

  for (const step of steps) {
    const texts = step.action === 'navigate' ? [step.path] : [step.selector, 'value' in step ? step.value : '']

    for (const name of texts.flatMap((text) => collectParamNames(text))) {
      requiredParams[name] ??= {
        description: `Value for {${name}} used by this plan.`,
        secret: secretParams.has(name)
      }
    }
  }

  return requiredParams
}

const knownPages: Record<string, string> = applicationKnowledge.pages
const knownPaths = new Set(Object.values(knownPages))
const knownTargets: Record<string, { selector: string }> = applicationKnowledge.targets
const knownSelectors = new Set(Object.values(knownTargets).map((target) => target.selector))

function buildSystemPrompt() {
  const pathList = Array.from(knownPaths).map((path) => `"${path}"`).join(', ')
  // Targets whose selector needs a value are labelled, so the model can see
  // which ones commit it to a parameter the request may not supply.
  const targetList = Object.entries(knownTargets)
    .map(([target, definition]) => {
      const needs = [...definition.selector.matchAll(/\{(\w+)\}/g)].map((match) => match[1])
      return needs.length > 0 ? `"${target}" (needs ${needs.map((name) => `{${name}}`).join(', ')})` : `"${target}"`
    })
    .join(', ')

  return [
    'You turn a QA engineer\'s plain-English request into a structured test plan for the Oboda web application.',
    'Reply with JSON only, shaped as { "name": string, "steps": TestStep[] }.',
    '',
    'A TestStep is exactly one of:',
    '{ "action": "navigate", "path": string }',
    '{ "action": "click", "target": string }',
    '{ "action": "fill", "target": string, "value": string }',
    '{ "action": "assertVisible", "target": string }',
    '{ "action": "assertText", "target": string, "value": string }',
    '',
    'There is no "select" action: dropdowns are driven by clicking the field, then clicking the option.',
    '',
    `The "path" field must be copied verbatim from this list, always starting with a slash: ${pathList}`,
    `The "target" field must be copied verbatim from this list: ${targetList}`,
    '',
    'Some targets and paths contain {placeholders} such as {companyId}, {recordCode} or {orderId}.',
    'When you use one, add a top-level "params" object with the concrete value taken from the request, e.g. { "recordCode": "DHIN-OR-00395" }.',
    'If the request does not give a value, leave that placeholder out of "params"; the runner will ask for it. Never invent a value.',
    'A target labelled "(needs {recordCode})" or similar may ONLY be used when the request itself supplies that value; put the value in "params". If the request does not supply it, you must not use that target.',
    'When the request is about any record in a state ("observe the rejected quotations", "open a pending order"), use the shell list primitives "shell.table-first-row-with-text", "shell.table-first-row-with-text-checkbox" or "shell.table-first-row-with-text-link" and put the status word from the request in "params" as rowText, e.g. { "rowText": "rejected" }. They need no record code.',
    'Prefer /companies/{companyId}/v2/... paths over /lite/... ones unless the request says Lite; the test tenant is a Prime tenant.',
    'Never invent a path or a target, and never use a page name in place of a path.',
    'Never emit CSS selectors or Playwright code.',
    'If the request cannot be expressed with the values above, build the closest plan you can using only those values.'
  ].join('\n')
}

// The model speaks in knowledge-base names (page names, target names); the
// TestPlan contract carries concrete paths and Playwright selectors. Resolve
// here so the schema check and the runner see the final shape.
function normaliseStep(step: Record<string, unknown>) {
  const { action, path, target } = step

  if (action === 'navigate') {
    if (typeof path !== 'string' || path.startsWith('/')) {
      return step
    }

    const mappedPath = knownPages[path]

    return mappedPath ? { ...step, path: mappedPath } : step
  }

  if (typeof target !== 'string') {
    return step
  }

  const rest: Record<string, unknown> = { ...step }
  delete rest.target
  const known = knownTargets[target]

  // An unknown name is kept as the selector so findUnknownReferences can report it.
  return { ...rest, selector: known?.selector ?? target }
}

// A selector whose {placeholders} were filled with literal values no longer
// equals its template string; match it against the templates as patterns.
function toTemplatePattern(template: string) {
  return new RegExp(
    '^' + template.split(/\{\w+\}/).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^/]+') + '$'
  )
}

const selectorPatterns = Array.from(knownSelectors).filter((selector) => /\{\w+\}/.test(selector)).map(toTemplatePattern)
const pathPatterns = Array.from(knownPaths).filter((routePath) => /\{\w+\}/.test(routePath)).map(toTemplatePattern)

function matchesTemplate(selector: string) {
  return selectorPatterns.some((pattern) => pattern.test(selector))
}

function matchesPathTemplate(routePath: string) {
  return pathPatterns.some((pattern) => pattern.test(routePath))
}

function findUnknownReferences(plan: TestPlan) {
  const unknown: string[] = []

  for (const step of plan.steps) {
    if (step.action === 'navigate') {
      if (!knownPaths.has(step.path) && !matchesPathTemplate(step.path)) {
        unknown.push(`path ${step.path}`)
      }
    } else if (!knownSelectors.has(step.selector) && !matchesTemplate(step.selector)) {
      unknown.push(`target ${step.selector}`)
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

  const model = process.env.OPENAI_MODEL ?? plannerModelName()
  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      // Reasoning models reject a non-default temperature; 4o-class models accept 0.
      ...(/gpt-4o/.test(model) ? { temperature: 0 } : {}),
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

  // Empty strings are the model saying "unknown"; keep the placeholder so it is
  // declared as a parameter and bound at run time instead of producing "//".
  const literalParams = Object.fromEntries(
    Object.entries(parsedRawPlan.data.params ?? {}).filter(([, value]) => value.trim() !== '')
  )
  const fill = (text: string) =>
    text.replace(/\{(\w+)\}/g, (match, name: string) => literalParams[name] ?? match)
  const filledSteps = normalisedSteps.map((step) => {
    const filled: Record<string, unknown> = { ...step }
    for (const key of ['path', 'selector', 'value'] as const) {
      if (typeof filled[key] === 'string') {
        filled[key] = fill(filled[key] as string)
      }
    }
    return filled
  })

  // The runner starts unauthenticated unless a saved session exists, so every
  // plan begins with the shell module's verified "Sign in with email" flow.
  // {email} and {password} are declared secret below and bound at run time.
  const first = filledSteps[0]
  const alreadySignsIn = first?.action === 'navigate' && first.path === '/sign-in'
  const stepsWithSignIn = alreadySignsIn ? filledSteps : [...signInSteps, ...filledSteps]

  const parsedSteps = testPlanSchema.shape.steps.safeParse(stepsWithSignIn)

  const parsedPlan = testPlanSchema.safeParse({
    name: parsedRawPlan.data.name,
    requiredParams: parsedSteps.success ? declareRemainingParams(parsedSteps.data) : {},
    steps: stepsWithSignIn
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
