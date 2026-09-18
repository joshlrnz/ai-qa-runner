// Turns a free-text instruction into a TestPlan using the planning agent.
// Run with: npm run planner:plan -- "open the sales orders list"
import path from 'node:path'
import { writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

process.loadEnvFile('.env')

const here = path.dirname(fileURLToPath(import.meta.url))
const modulePath = path.join(here, '..', '.planner-tmp', 'planner', 'plan-test.js')
const { planTest } = await import(pathToFileURL(modulePath).href)

const instruction = process.argv[2]

if (!instruction) {
  console.error('Usage: npm run planner:plan -- "<instruction>"')
  process.exit(1)
}

const outputPath = process.argv[3] ?? null
const startedAt = Date.now()
const attempt = await planTest(instruction)

console.log(`instruction: ${instruction}`)
console.log(`tools used: ${attempt.toolNames.join(', ') || 'none'}\n`)

if (!attempt.result) {
  console.log('NO RESULT - the agent finished without calling create_plan or report_blocked.')
  console.log(`finishReason: ${attempt.finishReason}`)
  console.log(attempt.text)
  process.exit(1)
}

if (attempt.result.status === 'blocked') {
  console.log('STATUS: blocked')
  console.log(`reason: ${attempt.result.reason}`)
  console.log(`missing capabilities: ${attempt.result.missingCapabilities.join(', ')}`)
} else {
  console.log('STATUS: planned')
  console.log(JSON.stringify(attempt.result.plan, null, 2))
  console.log(`\nassumptions:\n${attempt.result.assumptions.map((a) => `  - ${a}`).join('\n') || '  (none)'}`)
  console.log(`\nwarnings:\n${attempt.result.warnings.map((w) => `  - ${w}`).join('\n') || '  (none)'}`)
  console.log(`\nsource modules: ${attempt.result.sourceModules.join(', ')}`)

  if (outputPath) {
    writeFileSync(outputPath, `${JSON.stringify(attempt.result.plan, null, 2)}\n`, 'utf8')
    console.log(`\nplan written to ${outputPath}`)
  }
}

console.log(`\n(${((Date.now() - startedAt) / 1000).toFixed(1)}s)`)
