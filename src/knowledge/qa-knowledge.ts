import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

export type TargetConfidence = 'high' | 'medium' | 'low'

export type SelectorCandidate = {
  name: string
  selector: string
  module: string
  confidence: TargetConfidence
  group: string | null
  note: string | null
  params: string[]
}

export type UnresolvedTarget = {
  name: string
  module: string
  selector: string
  reason: string
}

export type PageEntry = {
  name: string
  path: string
  module: string
  params: string[]
}

export type FlowEntry = {
  name: string
  superseded: boolean
}

export type ParamEntry = {
  name: string
  description: string
  scope: string
}

export type ModuleVerification = {
  targets: number
  verified: number
  ambiguous: number
  zeroMatch: number
  notProbed: number
}

export type ModuleSummary = {
  name: string
  routes: number
  targets: number
  flows: number
  status: string
  lastUpdated: string
  depth: string | null
  verification: ModuleVerification | null
}

export type ModuleSection = {
  level: number
  title: string
  content: string
}

export type SearchHit = {
  module: string
  heading: string
  excerpt: string
  score: number
}

type CompiledTarget = {
  selector: string
  module: string
  confidence: TargetConfidence
  note?: string
  fallbacks?: string[]
}

type CompiledKnowledge = {
  pages: Record<string, string>
  targets: Record<string, CompiledTarget>
  params: Record<string, { description: string; scope: string }>
  unresolvedTargets: Record<string, { module: string; selector: string; reason: string }>
}

const parameterPattern = /\{(\w+)\}/g
const confidenceRank: Record<TargetConfidence, number> = { high: 0, medium: 1, low: 2 }

export function getKnowledgeDirectory() {
  return process.env.QA_KNOWLEDGE_DIR ?? path.join(process.cwd(), 'qa-knowledge')
}

function readParams(value: string) {
  return [...value.matchAll(parameterPattern)].map((match) => match[1])
}

function moduleOfKey(key: string) {
  const [prefix] = key.split('.')
  return prefix ?? key
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function tokenise(value: string) {
  return normalise(value).split(' ').filter((token) => token.length > 1)
}

function scoreText(tokens: string[], text: string, weight: number) {
  const haystack = normalise(text)
  return tokens.reduce((total, token) => (haystack.includes(token) ? total + weight : total), 0)
}

function splitSections(markdown: string): ModuleSection[] {
  const lines = markdown.split('\n')
  const headings: { level: number; title: string; line: number }[] = []
  let insideFence = false

  lines.forEach((line, index) => {
    if (line.trimStart().startsWith('```')) {
      insideFence = !insideFence
      return
    }

    if (insideFence) {
      return
    }

    const match = /^(#{2,4})\s+(.+)$/.exec(line)

    if (match) {
      headings.push({ level: match[1].length, title: match[2].trim(), line: index })
    }
  })

  return headings.map((heading, index) => {
    const next = headings.slice(index + 1).find((candidate) => candidate.level <= heading.level)
    const end = next ? next.line : lines.length

    return {
      level: heading.level,
      title: heading.title,
      content: lines.slice(heading.line + 1, end).join('\n').trim()
    }
  })
}

function parseTableRows(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => line.trimStart().startsWith('|'))
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim())
    )
    .filter((cells) => cells.length > 1 && !cells.every((cell) => /^-+$/.test(cell)))
}

function stripCode(value: string) {
  return value.replace(/[`*]/g, '').trim()
}

function isSeparatorRow(cells: string[]) {
  return cells.every((cell) => /^:?-+:?$/.test(cell))
}

function findTable(markdown: string, expectedHeaders: string[]) {
  const rows = parseTableRows(markdown)
  const headerIndex = rows.findIndex((cells) =>
    expectedHeaders.every((header, column) =>
      normalise(cells[column] ?? '').startsWith(normalise(header))
    )
  )

  if (headerIndex < 0) {
    return []
  }

  const table: string[][] = []

  for (const cells of rows.slice(headerIndex + 1)) {
    if (isSeparatorRow(cells)) {
      continue
    }

    if (cells.length !== rows[headerIndex].length) {
      break
    }

    table.push(cells)
  }

  return table
}

type LoadedKnowledge = {
  compiled: CompiledKnowledge
  modules: ModuleSummary[]
  sectionsByModule: Map<string, ModuleSection[]>
  groupByTarget: Map<string, string>
}

let cache: LoadedKnowledge | null = null

function load(): LoadedKnowledge {
  if (cache) {
    return cache
  }

  const directory = getKnowledgeDirectory()
  const compiled = JSON.parse(
    readFileSync(path.join(directory, 'application.json'), 'utf8')
  ) as CompiledKnowledge

  const indexMarkdown = readFileSync(path.join(directory, 'index.md'), 'utf8')
  const indexSections = splitSections(indexMarkdown)
  const depthSection = indexSections.find((section) => section.title.startsWith('Depth'))
  const depthByModule = new Map<string, string>()

  if (depthSection) {
    for (const cells of parseTableRows(depthSection.content)) {
      const name = stripCode(cells[0])

      if (name && name !== 'module' && name !== '—') {
        depthByModule.set(name, cells[1] ?? '')
      }
    }
  }

  const verificationByModule = new Map<string, ModuleVerification>()

  for (const cells of findTable(indexMarkdown, ['module', 'targets', 'verified'])) {
    const name = stripCode(cells[0])

    if (name.toLowerCase() === 'total') {
      continue
    }

    verificationByModule.set(name, {
      targets: Number(cells[1]),
      verified: Number(cells[2]),
      ambiguous: Number(cells[3]),
      zeroMatch: Number(cells[4]),
      notProbed: Number(cells[5])
    })
  }

  const modules: ModuleSummary[] = findTable(indexMarkdown, [
    'module',
    'routes',
    'targets',
    'named flows'
  ]).map((cells) => {
    const name = stripCode(cells[0])

    return {
      name,
      routes: Number(cells[1]),
      targets: Number(cells[2]),
      flows: Number(cells[3]),
      status: cells[4],
      lastUpdated: cells[5],
      depth: depthByModule.get(name) ?? null,
      verification: verificationByModule.get(name) ?? null
    }
  })

  const sectionsByModule = new Map<string, ModuleSection[]>()
  const groupByTarget = new Map<string, string>()
  const moduleDirectory = path.join(directory, 'modules')

  for (const file of readdirSync(moduleDirectory).filter((name) => name.endsWith('.md'))) {
    const moduleName = file.replace(/\.md$/, '')
    const markdown = readFileSync(path.join(moduleDirectory, file), 'utf8')
    const sections = splitSections(markdown)
    sectionsByModule.set(moduleName, sections)

    for (const section of sections) {
      if (section.level < 3) {
        continue
      }

      for (const cells of parseTableRows(section.content)) {
        const name = stripCode(cells[0])

        if (name.includes('.')) {
          groupByTarget.set(name, section.title)
        }
      }
    }
  }

  cache = { compiled, modules, sectionsByModule, groupByTarget }
  return cache
}

export function listModules() {
  return load().modules
}

export function getModuleSections(module: string) {
  return load().sectionsByModule.get(module) ?? null
}

export function getModuleSection(module: string, heading: string) {
  const sections = getModuleSections(module)

  if (!sections) {
    return null
  }

  const wanted = normalise(heading)
  return sections.find((section) => normalise(section.title) === wanted) ?? null
}

export function searchKnowledge(query: string, module?: string, limit = 8) {
  const tokens = tokenise(query)

  if (tokens.length === 0) {
    return []
  }

  const { sectionsByModule } = load()
  const hits: SearchHit[] = []

  for (const [moduleName, sections] of sectionsByModule) {
    if (module && moduleName !== module) {
      continue
    }

    for (const section of sections) {
      const score = scoreText(tokens, section.title, 3) + scoreText(tokens, section.content, 1)

      if (score > 0) {
        hits.push({
          module: moduleName,
          heading: section.title,
          excerpt: section.content.slice(0, 600),
          score
        })
      }
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function findPages(query: string, limit = 10) {
  const tokens = tokenise(query)
  const { compiled } = load()

  const entries: (PageEntry & { score: number })[] = Object.entries(compiled.pages).map(
    ([name, pagePath]) => ({
      name,
      path: pagePath,
      module: moduleOfKey(name),
      params: readParams(pagePath),
      score: scoreText(tokens, name, 2) + scoreText(tokens, pagePath, 2)
    })
  )

  return entries
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.path.length - b.path.length)
    .slice(0, limit)
    .map((entry) => ({
      name: entry.name,
      path: entry.path,
      module: entry.module,
      params: entry.params
    }))
}

export function findSelectors(query: string, limit = 12) {
  const tokens = tokenise(query)
  const { compiled, groupByTarget } = load()
  const unresolved = new Set(Object.keys(compiled.unresolvedTargets))

  const candidates: (SelectorCandidate & { score: number })[] = Object.entries(compiled.targets)
    .filter(([name]) => !unresolved.has(name))
    .map(([name, target]) => {
      const group = groupByTarget.get(name) ?? null

      return {
        name,
        selector: target.selector,
        module: target.module,
        confidence: target.confidence,
        group,
        note: target.note ?? null,
        params: readParams(target.selector),
        score:
          scoreText(tokens, name, 3) +
          scoreText(tokens, group ?? '', 3) +
          scoreText(tokens, target.selector, 1) +
          scoreText(tokens, target.note ?? '', 1)
      }
    })

  return candidates
    .filter((candidate) => candidate.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || confidenceRank[a.confidence] - confidenceRank[b.confidence]
    )
    .slice(0, limit)
    .map((candidate) => ({
      name: candidate.name,
      selector: candidate.selector,
      module: candidate.module,
      confidence: candidate.confidence,
      group: candidate.group,
      note: candidate.note,
      params: candidate.params
    }))
}

function normaliseSelector(selector: string) {
  return selector.replace(/\s+/g, ' ').replace(/["\u2018\u2019\u201c\u201d]/g, "'").trim()
}

// A selector can belong to several targets: the same DETAILS tab exists on ten
// record pages, scoped by which page the plan is on. Returning one arbitrarily
// reports another page's confidence, so callers get all of them.
export function lookupSelectors(selector: string): SelectorCandidate[] {
  const { compiled, groupByTarget } = load()
  const unresolved = new Set(Object.keys(compiled.unresolvedTargets))
  const wanted = normaliseSelector(selector)
  const matches: SelectorCandidate[] = []

  for (const [name, target] of Object.entries(compiled.targets)) {
    if (normaliseSelector(target.selector) !== wanted || unresolved.has(name)) {
      continue
    }

    matches.push({
      name,
      selector: target.selector,
      module: target.module,
      confidence: target.confidence,
      group: groupByTarget.get(name) ?? null,
      note: target.note ?? null,
      params: readParams(target.selector)
    })
  }

  return matches.sort((a, b) => confidenceRank[a.confidence] - confidenceRank[b.confidence])
}

// Excluding the known-ambiguous targets by name does not stop a selector being
// rebuilt from parts, so plans are checked against their selectors too.
export function findAmbiguousMatch(selector: string): UnresolvedTarget | null {
  const { compiled } = load()
  const wanted = normaliseSelector(selector)

  for (const [name, entry] of Object.entries(compiled.unresolvedTargets)) {
    if (normaliseSelector(entry.selector) === wanted) {
      return { name, module: entry.module, selector: entry.selector, reason: entry.reason }
    }
  }

  return null
}

export function listFlowEntries(module: string): FlowEntry[] {
  const section = getModuleSection(module, 'Flows')

  if (!section) {
    return []
  }

  return section.content
    .split(/^###\s+/m)
    .slice(1)
    .map((part) => {
      const lineBreak = part.indexOf('\n')
      const name = (lineBreak < 0 ? part : part.slice(0, lineBreak)).trim()
      const body = lineBreak < 0 ? '' : part.slice(lineBreak + 1)

      return { name, superseded: /\*\*superseded\*\*/i.test(body) }
    })
}

// A flow kept for history is still a heading in the markdown. Prose alone does not
// stop it being cited, so retired flows are filtered out here.
export function listFlows(module: string): string[] {
  return listFlowEntries(module)
    .filter((flow) => !flow.superseded)
    .map((flow) => flow.name)
}

export function lookupPath(pagePath: string): PageEntry | null {
  const { compiled } = load()

  for (const [name, knownPath] of Object.entries(compiled.pages)) {
    if (knownPath === pagePath) {
      return { name, path: knownPath, module: moduleOfKey(name), params: readParams(knownPath) }
    }
  }

  return null
}

export function listUnresolvedTargets(): UnresolvedTarget[] {
  const { compiled } = load()

  return Object.entries(compiled.unresolvedTargets).map(([name, entry]) => ({
    name,
    module: entry.module,
    selector: entry.selector,
    reason: entry.reason
  }))
}

export function listParams(names?: string[]): ParamEntry[] {
  const { compiled } = load()

  return Object.entries(compiled.params)
    .filter(([name]) => !names || names.includes(name))
    .map(([name, entry]) => ({
      name,
      description: entry.description,
      scope: entry.scope
    }))
}
