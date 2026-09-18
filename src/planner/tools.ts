import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import {
  findPages,
  findSelectors,
  getModuleSection,
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

export const readOnlyPlannerTools = {
  listModulesTool,
  searchKnowledgeTool,
  getModuleSectionTool,
  findPagesTool,
  findSelectorsTool,
  listParamsTool,
  listUnresolvedTargetsTool
}
