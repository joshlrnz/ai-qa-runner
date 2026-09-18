import type { PlanResult } from '@/contracts/plan-request'
import { readParamsFromEnv } from './plan-params'

// Parameter names the server can bind from QA_PARAM_* in its own environment
// (typically companyId, email, password from .env). A plan still declares them;
// the UI just does not have to ask for them.
export function listEnvironmentParamNames() {
  return Object.keys(readParamsFromEnv(process.env))
}

export function withEnvironmentParams(result: PlanResult): PlanResult {
  const bound = new Set(listEnvironmentParamNames())

  if (result.status === 'planned') {
    return {
      ...result,
      environmentParams: Object.keys(result.plan.requiredParams).filter((name) => bound.has(name))
    }
  }

  if (result.status === 'needs_input') {
    return {
      ...result,
      inferredParams: result.inferredParams.filter((param) => !bound.has(param.name)),
      environmentParams: result.inferredParams
        .map((param) => param.name)
        .filter((name) => bound.has(name))
    }
  }

  return result
}
