import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { Mastra } from '@mastra/core'
import { LibSQLStore } from '@mastra/libsql'
import { plannerAgent } from '../planner/agent'

const filePrefix = 'file:'
const databaseUrl = process.env.QA_PLANNER_DB_URL ?? 'file:./.mastra/planner.db'

// libsql will not create the directory itself; an absent one surfaces as
// ConnectionFailed(... 14) on the first run.
if (databaseUrl.startsWith(filePrefix)) {
  mkdirSync(path.dirname(databaseUrl.slice(filePrefix.length)), { recursive: true })
}

export const mastra = new Mastra({
  agents: { plannerAgent },
  storage: new LibSQLStore({ id: 'qa-planner', url: databaseUrl })
})
