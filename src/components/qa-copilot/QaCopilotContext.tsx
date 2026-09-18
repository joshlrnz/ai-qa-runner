'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react'
import type { TestPlan } from '@/contracts/test-plan'
import type { TestRun } from '@/contracts/test-run'
import type { ChatMessage, SavedCase, WorkspaceView } from '@/contracts/qa-copilot'
import { QaRequestError, fetchTestRun, generateTestPlan, startTestRun } from '@/lib/qa-client'
import { fallbackPlan } from '@/lib/fallback-plan'
import { describeTestStep } from '@/lib/describe-test-step'

const POLL_INTERVAL_MS = 900

const OPENING_MESSAGE: ChatMessage = {
  id: 'agent-0',
  role: 'agent',
  text: 'Tell me what you want to check on this release in plain English and I will draft the test for you. Nothing runs until you approve it.',
  details: []
}

const STARTER_SUGGESTIONS = [
  'Check that the dashboard loads after sign in',
  'Verify the Inventory Alerts panel is visible',
  'Test signing in with the ops account'
]

type QaCopilotState = {
  view: WorkspaceView
  messages: ChatMessage[]
  suggestions: string[]
  draft: string
  isGenerating: boolean
  plan: TestPlan | null
  planApproved: boolean
  isStartingRun: boolean
  run: TestRun | null
  selectedStepIndex: number | null
  savedCases: SavedCase[]
  suiteFilter: string
  setView: (view: WorkspaceView) => void
  setDraft: (draft: string) => void
  submitDraft: (text: string) => void
  approvePlan: () => void
  runPlan: () => void
  selectStep: (index: number) => void
  setSuiteFilter: (suite: string) => void
}

const QaCopilotContext = createContext<QaCopilotState | null>(null)

function summarisePlan(plan: TestPlan) {
  const paths: string[] = []

  for (const step of plan.steps) {
    if (step.action === 'navigate' && !paths.includes(step.path)) {
      paths.push(step.path)
    }
  }

  return [
    { label: 'Steps drafted:', value: String(plan.steps.length) },
    { label: 'Pages touched:', value: paths.length > 0 ? paths.join(', ') : 'the current page' },
    { label: 'First step:', value: describeTestStep(plan.steps[0]) }
  ]
}

export function QaCopilotProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<WorkspaceView>('author')
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_MESSAGE])
  const [suggestions, setSuggestions] = useState<string[]>(STARTER_SUGGESTIONS)
  const [draft, setDraft] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [plan, setPlan] = useState<TestPlan | null>(null)
  const [planApproved, setPlanApproved] = useState(false)
  const [isStartingRun, setIsStartingRun] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [run, setRun] = useState<TestRun | null>(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null)
  const [savedCases, setSavedCases] = useState<SavedCase[]>([])
  const [suiteFilter, setSuiteFilter] = useState('All suites')
  // Parameters the runner reported missing; while set, the next user message
  // answers them (name=value per line, or a bare value when only one is asked).
  const [pendingParams, setPendingParams] = useState<string[]>([])
  const [boundParams, setBoundParams] = useState<Record<string, string>>({})

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message])
  }, [])

  const startRunWith = useCallback(
    (params: Record<string, string>) => {
      if (!plan || isStartingRun) {
        return
      }

      const merged = { ...boundParams, ...params }
      setBoundParams(merged)
      setIsStartingRun(true)
      setRun(null)
      setSelectedStepIndex(null)
      setView('runs')

      startTestRun(plan, merged)
        .then(({ runId: startedRunId }) => {
          setPendingParams([])
          setRunId(startedRunId)
        })
        .catch((error: unknown) => {
          setView('author')

          if (error instanceof QaRequestError && error.missingParams.length > 0) {
            setPendingParams(error.missingParams)
            const single = error.missingParams.length === 1
            appendMessage({
              id: `agent-${Date.now()}`,
              role: 'agent',
              text: single
                ? `Before I can run this I need a value for ${error.missingParams[0]}. Reply with the value.`
                : `Before I can run this I need values for ${error.missingParams.join(', ')}. Reply with one per line as name=value.`,
              details: error.missingParams.map((name) => ({
                label: `${name}:`,
                value: plan.requiredParams[name]?.description ?? 'no description recorded'
              }))
            })
            setSuggestions([])
            return
          }

          appendMessage({
            id: `agent-${Date.now()}`,
            role: 'agent',
            text: error instanceof Error ? error.message : 'The run could not be started.',
            details: []
          })
        })
        .finally(() => {
          setIsStartingRun(false)
        })
    },
    [appendMessage, boundParams, isStartingRun, plan]
  )

  const runPlan = useCallback(() => {
    startRunWith({})
  }, [startRunWith])

  const submitDraft = useCallback(
    (text: string) => {
      const trimmed = text.trim()

      if (!trimmed || isGenerating) {
        return
      }

      setDraft('')
      setSuggestions([])
      appendMessage({ id: `user-${Date.now()}`, role: 'user', text: trimmed, details: [] })

      if (pendingParams.length > 0) {
        const answered: Record<string, string> = {}
        const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean)

        if (pendingParams.length === 1 && lines.length === 1 && !lines[0].includes('=')) {
          answered[pendingParams[0]] = lines[0]
        } else {
          for (const line of lines) {
            const separator = line.indexOf('=')
            if (separator > 0) {
              answered[line.slice(0, separator).trim()] = line.slice(separator + 1).trim()
            }
          }
        }

        const stillMissing = pendingParams.filter((name) => !(name in answered))

        if (stillMissing.length > 0) {
          appendMessage({
            id: `agent-${Date.now()}`,
            role: 'agent',
            text: `I still need ${stillMissing.join(', ')}. Reply as name=value, one per line.`,
            details: []
          })
          return
        }

        startRunWith(answered)
        return
      }

      setIsGenerating(true)

      generateTestPlan(trimmed)
        .then(({ plan: generated }) => {
          setPlan(generated)
          setPlanApproved(false)
          appendMessage({
            id: `agent-${Date.now()}`,
            role: 'agent',
            text: `Drafted "${generated.name}". Read it on the right and change anything you disagree with. Nothing runs until you approve it.`,
            details: summarisePlan(generated)
          })
          setSuggestions(['Approve and save it', 'Run it now'])
        })
        .catch((error: unknown) => {
          const isNotConfigured = error instanceof QaRequestError && error.status === 503

          if (isNotConfigured) {
            setPlan(fallbackPlan)
            setPlanApproved(false)
            appendMessage({
              id: `agent-${Date.now()}`,
              role: 'agent',
              text: 'Plan generation is not connected yet, so I loaded the saved example plan instead. Everything after this point is real.',
              details: summarisePlan(fallbackPlan)
            })
            setSuggestions(['Run it now'])
            return
          }

          appendMessage({
            id: `agent-${Date.now()}`,
            role: 'agent',
            text: error instanceof Error ? error.message : 'Something went wrong while drafting the plan.',
            details: []
          })
        })
        .finally(() => {
          setIsGenerating(false)
        })
    },
    [appendMessage, isGenerating, pendingParams, startRunWith]
  )

  const approvePlan = useCallback(() => {
    if (!plan) {
      return
    }

    setPlanApproved(true)
    setSavedCases((current) => [
      {
        id: `QA-${String(current.length + 1).padStart(3, '0')}`,
        name: plan.name,
        area: 'Release',
        suite: 'Release Regression',
        lastRun: 'Not run yet',
        result: 'Approved'
      },
      ...current
    ])
  }, [plan])

  useEffect(() => {
    if (!runId) {
      return
    }

    let active = true

    const poll = () => {
      fetchTestRun(runId)
        .then((latest) => {
          if (!active) {
            return
          }

          setRun(latest)

          if (latest.status === 'passed' || latest.status === 'failed') {
            active = false
            window.clearInterval(timer)
          }
        })
        .catch(() => {
          if (active) {
            active = false
            window.clearInterval(timer)
          }
        })
    }

    const timer = window.setInterval(poll, POLL_INTERVAL_MS)
    poll()

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [runId])

  const selectStep = useCallback((index: number) => {
    setSelectedStepIndex(index)
  }, [])

  const value = useMemo<QaCopilotState>(
    () => ({
      view,
      messages,
      suggestions,
      draft,
      isGenerating,
      plan,
      planApproved,
      isStartingRun,
      run,
      selectedStepIndex,
      savedCases,
      suiteFilter,
      setView,
      setDraft,
      submitDraft,
      approvePlan,
      runPlan,
      selectStep,
      setSuiteFilter
    }),
    [
      approvePlan,
      draft,
      isGenerating,
      isStartingRun,
      messages,
      plan,
      planApproved,
      run,
      runPlan,
      savedCases,
      selectStep,
      selectedStepIndex,
      submitDraft,
      suggestions,
      suiteFilter,
      view
    ]
  )

  return <QaCopilotContext.Provider value={value}>{children}</QaCopilotContext.Provider>
}

export function useQaCopilot() {
  const context = useContext(QaCopilotContext)

  if (!context) {
    throw new Error('useQaCopilot must be used inside a QaCopilotProvider')
  }

  return context
}
