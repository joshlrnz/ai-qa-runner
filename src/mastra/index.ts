import { Mastra } from '@mastra/core'
import { LibSQLStore } from '@mastra/libsql'
import { plannerAgent } from '../planner/agent'

export const mastra = new Mastra({
  agents: { plannerAgent },
  storage: new LibSQLStore({
    id: 'qa-planner',
    url: process.env.QA_PLANNER_DB_URL ?? 'file:./.mastra/planner.db'
  })
})
