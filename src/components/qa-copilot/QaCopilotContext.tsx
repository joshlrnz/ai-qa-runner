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

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message])
  }, [])

  const submitDraft = useCallback(
    (text: string) => {
      const trimmed = text.trim()

      if (!trimmed || isGenerating) {
        return
      }

      setDraft('')
      setSuggestions([])
      setIsGenerating(true)
      appendMessage({ id: `user-${Date.now()}`, role: 'user', text: trimmed, details: [] })

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
    [appendMessage, isGenerating]
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

  const runPlan = useCallback(() => {
    if (!plan || isStartingRun) {
      return
    }

    setIsStartingRun(true)
    setRun(null)
    setSelectedStepIndex(null)
    setView('runs')

    startTestRun(plan)
      .then(({ runId: startedRunId }) => {
        setRunId(startedRunId)
      })
      .catch((error: unknown) => {
        setView('author')
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
  }, [appendMessage, isStartingRun, plan])

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
