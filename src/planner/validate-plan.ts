import { testPlanSchema, type TestStep } from '../contracts/test-plan'
import {
  findAmbiguousMatch,
  listFlowEntries,
  lookupPath,
  lookupSelectors
} from '../knowledge/qa-knowledge'
import { collectParamNames } from '../runner/substitute-params'

export type SourceFlow = {
  module: string
  flow: string
}

export type PlanValidation = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

function stepTexts(step: TestStep) {
  if (step.action === 'navigate') {
    return [step.path]
  }

  if (step.action === 'fill' || step.action === 'assertText') {
    return [step.selector, step.value]
  }

  return [step.selector]
}

function summariseReason(reason: string) {
  const plain = reason.replace(/[*`]/g, '').trim()
  const sentence = plain.split(/(?<=[.!])\s/)[0] ?? plain
  return sentence.replace(/\.$/, '')
}

function stripPickers(selector: string) {
  let current = selector.trim()
  let previous = ''

  while (current !== previous) {
    previous = current
    current = current.replace(/\s*>>\s*(visible=true|nth=-?\d+)\s*$/, '').trim()
  }

  return current
}

// A held-out target's reason may name the page it was ambiguous on, as a path
// template in backticks (e.g. `/companies/{companyId}/v2/sales-orders/{orderId}/update`).
// With that, the error is confined to that page; without it, to the module.
function ambiguousPagePaths(reason: string) {
  return [...reason.matchAll(/`(\/[^`\s]+)`/g)].map((match) => match[1])
}

function isOnAmbiguousPage(
  ambiguous: { module: string; reason: string },
  currentModule: string | null,
  currentPagePath: string | null
) {
  if (currentModule === null) {
    return true
  }

  const pages = ambiguousPagePaths(ambiguous.reason)

  if (pages.length > 0) {
    return currentPagePath !== null && pages.includes(currentPagePath)
  }

  return ambiguous.module === currentModule
}

function describeCandidates(names: string[]) {
  const shown = names.slice(0, 4).join(', ')
  return names.length > 4 ? `${shown}, and ${names.length - 4} more` : shown
}

export function validatePlan(
  candidate: unknown,
  context: { sourceFlows?: SourceFlow[] } = {}
): PlanValidation {
  const parsed = testPlanSchema.safeParse(candidate)

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || 'plan'}: ${issue.message}`
      ),
      warnings: []
    }
  }

  const plan = parsed.data
  const errors: string[] = []
  const warnings: string[] = []

  const declared = new Set(Object.keys(plan.requiredParams))
  const referenced = new Set<string>()

  for (const step of plan.steps) {
    for (const text of stepTexts(step)) {
      for (const name of collectParamNames(text)) {
        referenced.add(name)
      }
    }
  }

  for (const name of referenced) {
    if (!declared.has(name)) {
      errors.push(
        `A step references {${name}} but requiredParams does not declare it. Add it, or stop using it.`
      )
    }
  }

  for (const name of declared) {
    if (!referenced.has(name)) {
      warnings.push(`requiredParams declares ${name} but no step uses it.`)
    }
  }

  // The page of the most recent navigate step: ambiguity is per page, so where a
  // step runs decides whether a held-out selector is an error or a warning.
  let currentModule: string | null = null
  let currentPagePath: string | null = null

  plan.steps.forEach((step, index) => {
    const position = `step ${index + 1} (${step.action})`

    if (step.action === 'navigate') {
      const page = lookupPath(step.path)
      currentModule = page?.module ?? null
      currentPagePath = page?.path ?? null

      if (!page) {
        warnings.push(
          `${position}: path ${step.path} is not in the knowledge base. Confirm it exists.`
        )
      }

      return
    }

    // `>> visible=true` and `>> nth=N` do not make an ambiguous selector
    // unambiguous, they pick one of the matches blindly, so the check runs
    // against the selector with those suffixes removed.
    const coreSelector = stripPickers(step.selector)
    const ambiguous = findAmbiguousMatch(coreSelector)
    const matches = lookupSelectors(step.selector)
    const onAmbiguousPage = ambiguous !== null && isOnAmbiguousPage(ambiguous, currentModule, currentPagePath)

    if (ambiguous && (matches.length === 0 || onAmbiguousPage)) {
      const suffixNote =
        coreSelector === step.selector
          ? ''
          : ' Appending visible=true or nth= does not resolve it; it picks one match blindly.'
      errors.push(
        `${position}: ${step.selector} is the selector recorded as ${ambiguous.name}, which was verified ambiguous on this page and is unusable. ${summariseReason(ambiguous.reason)}.${suffixNote} Use a container-scoped target, or report_blocked.`
      )
      return
    }

    if (ambiguous) {
      // The same selector string is verified on other pages (every list page's
      // Create button, every list's row pattern), and this step runs on one of
      // those, not on the page where it is ambiguous.
      warnings.push(
        `${position}: ${step.selector} is verified on ${describeCandidates(matches.map((match) => match.name))} but ambiguous on the page of ${ambiguous.name} (${summariseReason(ambiguous.reason)}). Do not use it there.`
      )
    }

    if (matches.length === 0) {
      warnings.push(
        `${position}: selector ${step.selector} was not taken from the knowledge base. Say why you derived it.`
      )
      return
    }

    const names = matches.map((match) => match.name)
    const best = matches[0].confidence
    const worst = matches[matches.length - 1].confidence

    if (matches.length > 1) {
      const spread =
        best === worst
          ? `all ${best} confidence`
          : `confidence ranges ${best} to ${worst} depending on which page the step is on`
      warnings.push(
        `${position}: ${step.selector} is shared by ${matches.length} knowledge base targets (${describeCandidates(names)}); ${spread}.`
      )
      return
    }

    if (best === 'low') {
      warnings.push(
        `${position}: ${names[0]} is confidence low. It may not resolve against the running application.`
      )
    }
  })

  const hasAssertion = plan.steps.some(
    (step) => step.action === 'assertVisible' || step.action === 'assertText'
  )

  if (!hasAssertion) {
    warnings.push('The plan has no assertion step, so it cannot fail for the reason it was written.')
  }

  const sourceFlows = context.sourceFlows ?? []

  for (const source of sourceFlows) {
    const known = listFlowEntries(source.module)

    if (known.length === 0) {
      errors.push(`sourceFlows names module ${source.module}, which has no Flows section.`)
      continue
    }

    const match = known.find((flow) => flow.name === source.flow)

    if (!match) {
      errors.push(
        `sourceFlows names "${source.flow}" in ${source.module}, which is not a flow there. Cite a heading from that module's Flows section, or declare no source flow.`
      )
      continue
    }

    if (match.superseded) {
      errors.push(
        `sourceFlows names "${source.flow}" in ${source.module}, which the knowledge base marks superseded. Cite the flow that replaced it, or declare no source flow.`
      )
    }
  }

  const interactiveSteps = plan.steps.filter(
    (step) => step.action === 'click' || step.action === 'fill'
  )

  if (interactiveSteps.length > 0) {
    // Citing one flow used to silence this for the whole plan, so a plan that
    // reproduced sign-in and composed everything after it passed unremarked.
    // Attribution is per module the plan actually navigates into.
    const citedModules = new Set(sourceFlows.map((source) => source.module))
    const touchedModules = new Set<string>()

    for (const step of plan.steps) {
      if (step.action !== 'navigate') {
        continue
      }

      const page = lookupPath(step.path)

      if (page) {
        touchedModules.add(page.module)
      }
    }

    const uncited = [...touchedModules].filter((module) => !citedModules.has(module))

    if (uncited.length > 0) {
      warnings.push(
        `The plan navigates into ${uncited.join(', ')} but cites no documented flow there, so its ordering and preconditions in ${uncited.length === 1 ? 'that module' : 'those modules'} are inferred rather than recorded. Nothing here checks that the sequence is possible.`
      )
    } else if (sourceFlows.length === 0) {
      const count = interactiveSteps.length
      warnings.push(
        `The plan drives ${count} interactive ${count === 1 ? 'step' : 'steps'} but reproduces no documented flow, so its ordering and preconditions are inferred rather than recorded.`
      )
    }
  }

  return { valid: errors.length === 0, errors, warnings }
}
