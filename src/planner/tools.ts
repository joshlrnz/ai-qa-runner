import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import {
  blockedResultSchema,
  clarificationAnswersSchema,
  clarificationRequestSchema,
  plannedResultSchema,
  sourceFlowSchema
} from '../contracts/plan-request'
import { testPlanSchema } from '../contracts/test-plan'
import { validatePlan } from './validate-plan'
import {
  findPages,
  findSelectors,
  getModuleSection,
  listFlows,
  listModules,
  listParams,
  listUnresolvedTargets,
  searchKnowledge
} from '../knowledge/qa-knowledge'

const moduleSummarySchema = z.object({
  name: z.string(),
  routes: z.number(),
  targets: z.number(),
  flows: z.number(),
  status: z.string(),
  lastUpdated: z.string(),
  depth: z.string().nullable(),
  verification: z
    .object({
      targets: z.number(),
      verified: z.number(),
      ambiguous: z.number(),
      zeroMatch: z.number(),
      notProbed: z.number()
    })
    .nullable()
})

export const listModulesTool = createTool({
  id: 'list_modules',
  description:
    'List every module in the knowledge base with its route, target and flow counts, how deeply it was mapped, and how many of its selectors were verified against a running application. Start here.',
  inputSchema: z.object({}),
  outputSchema: z.object({ modules: z.array(moduleSummarySchema) }),
  execute: async () => ({ modules: listModules() })
})

export const searchKnowledgeTool = createTool({
  id: 'search_knowledge',
  description:
    'Full-text search across every module document. Returns matching sections with the module and heading they came from. Use it to locate the surface an instruction refers to.',
  inputSchema: z.object({
    query: z.string().describe('Words describing the feature, flow or screen.'),
    module: z.string().optional().describe('Restrict the search to one module.')
  }),
  outputSchema: z.object({
    hits: z.array(
      z.object({
        module: z.string(),
        heading: z.string(),
        excerpt: z.string(),
        score: z.number()
      })
    )
  }),
  execute: async ({ query, module }) => ({ hits: searchKnowledge(query, module) })
})

export const getModuleSectionTool = createTool({
  id: 'get_module_section',
  description:
    'Read one section of a module document in full, including its subsections. Useful headings: Purpose, Routes, Preconditions, Targets, Flows, Contract gaps, Open questions.',
  inputSchema: z.object({
    module: z.string().describe('Module name, for example shell or v2-sales.'),
    heading: z.string().describe('Section heading, for example Flows.')
  }),
  outputSchema: z.object({
    found: z.boolean(),
    title: z.string().nullable(),
    content: z.string().nullable()
  }),
  execute: async ({ module, heading }) => {
    const section = getModuleSection(module, heading)

    if (!section) {
      return { found: false, title: null, content: null }
    }

    return { found: true, title: section.title, content: section.content }
  }
})

export const findPagesTool = createTool({
  id: 'find_pages',
  description:
    'Find application paths by description. Returns the path template and the parameters that template needs bound.',
  inputSchema: z.object({ query: z.string().describe('Words describing the page.') }),
  outputSchema: z.object({
    pages: z.array(
      z.object({ name: z.string(), path: z.string(), params: z.array(z.string()) })
    )
  }),
  execute: async ({ query }) => ({ pages: findPages(query) })
})

export const findSelectorsTool = createTool({
  id: 'find_selectors',
  description:
    'Find candidate Playwright selectors by description. Results are ranked, carry a confidence value and the note recorded when the selector was probed, and never include selectors known to be ambiguous.',
  inputSchema: z.object({ query: z.string().describe('Words describing the element.') }),
  outputSchema: z.object({
    candidates: z.array(
      z.object({
        name: z.string(),
        selector: z.string(),
        module: z.string(),
        confidence: z.enum(['high', 'medium', 'low']),
        group: z.string().nullable(),
        note: z.string().nullable(),
        params: z.array(z.string())
      })
    )
  }),
  execute: async ({ query }) => ({ candidates: findSelectors(query) })
})

export const listParamsTool = createTool({
  id: 'list_params',
  description:
    'Describe the documented plan parameters. Call with no names to list all of them, or with names to describe specific ones.',
  inputSchema: z.object({ names: z.array(z.string()).optional() }),
  outputSchema: z.object({
    params: z.array(
      z.object({ name: z.string(), description: z.string(), scope: z.string() })
    )
  }),
  execute: async ({ names }) => ({ params: listParams(names) })
})

export const listUnresolvedTargetsTool = createTool({
  id: 'list_unresolved_targets',
  description:
    'List the targets that were verified as ambiguous and are therefore unusable. Read this when an element you expected is missing from find_selectors.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    targets: z.array(
      z.object({
        name: z.string(),
        module: z.string(),
        selector: z.string(),
        reason: z.string()
      })
    )
  }),
  execute: async () => ({ targets: listUnresolvedTargets() })
})

export const listFlowsTool = createTool({
  id: 'list_flows',
  description:
    'List the documented flow names in a module. Cite the ones you reproduce in create_plan, so a reader can tell a recorded sequence from one you composed.',
  inputSchema: z.object({ module: z.string() }),
  outputSchema: z.object({ flows: z.array(z.string()) }),
  execute: async ({ module }) => ({ flows: listFlows(module) })
})

export const validatePlanTool = createTool({
  id: 'validate_plan',
  description:
    'Check a candidate plan before committing to it. Returns errors that must be fixed and warnings you should explain. Call this whenever you are unsure, as often as you like.',
  inputSchema: z.object({
    plan: testPlanSchema,
    sourceFlows: z.array(sourceFlowSchema).optional()
  }),
  outputSchema: z.object({
    valid: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string())
  }),
  execute: async ({ plan, sourceFlows }) => validatePlan(plan, { sourceFlows })
})

export const createPlanTool = createTool({
  id: 'create_plan',
  description:
    'Emit the finished plan. The plan is validated again here; if it does not pass, you receive the errors and must revise and call this tool again. Call it exactly once with a plan that passes.',
  inputSchema: z.object({
    plan: testPlanSchema,
    assumptions: z
      .array(z.string())
      .describe('Anything you assumed that the instruction did not state.'),
    sourceModules: z
      .array(z.string())
      .describe('Knowledge base modules this plan was built from.'),
    sourceFlows: z
      .array(sourceFlowSchema)
      .describe(
        'Documented flows this plan reproduces, by module and exact flow heading. Empty when you composed the steps yourself from targets.'
      ),
    warnings: z
      .array(z.string())
      .describe('Anything the reader should distrust, including selectors you derived yourself.')
  }),
  outputSchema: z.object({
    accepted: z.boolean(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
    planned: plannedResultSchema.nullable()
  }),
  execute: async ({ plan, assumptions, sourceModules, sourceFlows, warnings }) => {
    const validation = validatePlan(plan, { sourceFlows })
    const allWarnings = [...warnings, ...validation.warnings]

    if (!validation.valid) {
      return {
        accepted: false,
        errors: validation.errors,
        warnings: allWarnings,
        planned: null
      }
    }

    return {
      accepted: true,
      errors: [],
      warnings: allWarnings,
      planned: {
        status: 'planned' as const,
        plan: testPlanSchema.parse(plan),
        assumptions,
        sourceModules,
        sourceFlows,
        warnings: allWarnings
      }
    }
  }
})

export const requestClarificationTool = createTool({
  id: 'request_clarification',
  description:
    'Pause and ask the user. Call this exactly once, after your research and before create_plan, to confirm the parameters you inferred and to resolve anything ambiguous about which module, page or flow was meant. The run pauses until the user answers.',
  inputSchema: clarificationRequestSchema,
  outputSchema: z.object({ answers: z.array(z.object({ id: z.string(), answer: z.string() })) }),
  suspendSchema: clarificationRequestSchema,
  resumeSchema: clarificationAnswersSchema,
  execute: async ({ questions, inferredParams }, context) => {
    const resumeData = context?.agent?.resumeData

    if (!resumeData) {
      await context?.agent?.suspend({ questions, inferredParams })
      return { answers: [] }
    }

    return { answers: resumeData.answers }
  }
})

export const reportBlockedTool = createTool({
  id: 'report_blocked',
  description:
    'Report that the instruction cannot be expressed as a plan. Use this when it needs an action the vocabulary does not have, or a target the knowledge base does not cover. Do not emit a plan that pretends to do something else.',
  inputSchema: z.object({
    reason: z.string().describe('Plainly, what cannot be done and why.'),
    missingCapabilities: z
      .array(z.string())
      .describe('The specific capabilities required, for example hover or assertUrl.')
  }),
  outputSchema: z.object({ blocked: blockedResultSchema }),
  execute: async ({ reason, missingCapabilities }) => ({
    blocked: { status: 'blocked' as const, reason, missingCapabilities }
  })
})

export const readOnlyPlannerTools = {
  listModulesTool,
  searchKnowledgeTool,
  getModuleSectionTool,
  findPagesTool,
  findSelectorsTool,
  listParamsTool,
  listUnresolvedTargetsTool,
  listFlowsTool
}

export const plannerTools = {
  ...readOnlyPlannerTools,
  validatePlanTool,
  createPlanTool,
  reportBlockedTool,
  requestClarificationTool
}
