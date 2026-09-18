import path from 'node:path'

const testIdPattern = /^[a-zA-Z0-9-]+$/

export function getSavedTestsDirectory() {
  return path.join(process.cwd(), 'saved-tests')
}

export function isValidTestId(testId: string) {
  return testIdPattern.test(testId)
}

export function getSavedTestPath(testId: string) {
  if (!isValidTestId(testId)) {
    throw new Error('Invalid test ID')
  }

  return path.join(getSavedTestsDirectory(), `${testId}.json`)
}
