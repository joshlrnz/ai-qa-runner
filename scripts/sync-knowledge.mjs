import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const sourcePath = path.resolve('qa-knowledge', 'application.json')
const destinationPath = path.resolve('src', 'knowledge', 'application.json')

const source = JSON.parse(readFileSync(sourcePath, 'utf8'))

const pages = {}
const skippedPages = []

for (const [name, routePath] of Object.entries(source.pages)) {
  if (typeof routePath !== 'string' || !routePath.startsWith('/')) {
    continue
  }

  if (routePath.includes('{')) {
    skippedPages.push(name)
    continue
  }

  pages[name] = routePath
}

const targets = {}

for (const [name, definition] of Object.entries(source.targets)) {
  if (definition && typeof definition.selector === 'string' && definition.selector.length > 0) {
    targets[name] = { selector: definition.selector }
  }
}

writeFileSync(destinationPath, `${JSON.stringify({ pages, targets }, null, 2)}\n`)

console.log(`pages:   ${Object.keys(pages).length} copied, ${skippedPages.length} skipped (they need a {param})`)
console.log(`targets: ${Object.keys(targets).length} copied`)
