import type { PlanParams, TestPlan } from '@/contracts/test-plan'

export const paramEnvPrefix = 'QA_PARAM_'

export function findMissingParams(plan: TestPlan, params: PlanParams) {
  return Object.keys(plan.requiredParams).filter((name) => params[name] === undefined)
}

export function pickNonSecretParams(plan: TestPlan, params: PlanParams) {
  const nonSecretParams: PlanParams = {}

  for (const [name, requirement] of Object.entries(plan.requiredParams)) {
    const value = params[name]

    if (!requirement.secret && value !== undefined) {
      nonSecretParams[name] = value
    }
  }

  return nonSecretParams
}

export function toParamEnv(params: PlanParams) {
  const env: Record<string, string> = {}

  for (const [name, value] of Object.entries(params)) {
    env[`${paramEnvPrefix}${name}`] = value
  }

  return env
}

export function readParamsFromEnv(env: NodeJS.ProcessEnv) {
  const params: PlanParams = {}

  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith(paramEnvPrefix) && value !== undefined) {
      params[key.slice(paramEnvPrefix.length)] = value
    }
  }

  return params
}
