// Exercises the planning agent from the command line.
// Run with: npm run planner:ask -- "your question"
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

process.loadEnvFile('.env')

const here = path.dirname(fileURLToPath(import.meta.url))
const agentPath = path.join(here, '..', '.planner-tmp', 'planner', 'agent.js')
const agentModule = await import(pathToFileURL(agentPath).href)
const { plannerAgent, getPlannerModel } = agentModule.default ?? agentModule

const question = process.argv[2] ?? 'What do I need in order to sign in to this application?'

console.log(`model: ${getPlannerModel()}`)
console.log(`question: ${question}\n`)

const startedAt = Date.now()
const result = await plannerAgent.generate(question)
const toolCalls = result.toolCalls ?? []

console.log(`--- tool calls (${toolCalls.length}) ---`)
for (const call of toolCalls) {
  const name = call.payload?.toolName ?? call.toolName ?? 'unknown'
  const args = JSON.stringify(call.payload?.args ?? call.args ?? {})
  console.log(`  ${name} ${args.slice(0, 110)}`)
}

console.log('\n--- answer ---')
console.log(result.text ?? '')
console.log(`\n(${((Date.now() - startedAt) / 1000).toFixed(1)}s)`)
