import type { PlanParams } from '@/contracts/test-plan'

const parameterPattern = /\{(\w+)\}/g

export function substituteParams(value: string, params: PlanParams) {
  return value.replace(parameterPattern, (_match, name: string) => {
    const boundValue = params[name]

    if (boundValue === undefined) {
      throw new Error(`Unbound plan parameter: ${name}`)
    }

    return boundValue
  })
}

export function collectParamNames(value: string) {
  return [...value.matchAll(parameterPattern)].map((match) => match[1])
}
