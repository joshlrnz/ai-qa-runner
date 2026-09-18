'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react'
import type { PlanParams, TestPlan } from '@/contracts/test-plan'
import type { ClarificationQuestion, PlanResult } from '@/contracts/plan-request'
import type { TestRun } from '@/contracts/test-run'
import type { SavedTest } from '@/contracts/saved-test'
import type { ChatMessage, WorkspaceView } from '@/contracts/qa-copilot'
import {
  answerPlanQuestions,
  createPlan,
  fetchTestRun,
  listSavedTests,
  recordSavedTestRun,
  repairPlan,
  saveTest,
  startTestRun
} from '@/lib/qa-client'

const POLL_INTERVAL_MS = 900

const OPENING_MESSAGE: ChatMessage = {
  id: 'agent-0',
  role: 'agent',
  text: 'Tell me what you want to check on this release in plain English and I will draft the test for you. Nothing runs until you approve it.',
  details: []
}

const STARTER_SUGGESTIONS = [
  'Check that the sign in page loads',
  'Verify the companies list after signing in',
  'Check the products list on inventory'
]

export type PlanMeta = {
  assumptions: string[]
  warnings: string[]
  sourceModules: string[]
}

type QaCopilotState = {
  view: WorkspaceView
  messages: ChatMessage[]
  suggestions: string[]
  draft: string
  isPlanning: boolean
  plan: TestPlan | null
  planMeta: PlanMeta | null
  planApproved: boolean
  questions: ClarificationQuestion[]
  paramValues: PlanParams
  environmentParams: string[]
  missingParamNames: string[]
  isStartingRun: boolean
  isRepairing: boolean
  canSuggestFix: boolean
  run: TestRun | null
  selectedStepIndex: number | null
  savedTests: SavedTest[]
  isSavingTest: boolean
  isLoadingSavedTests: boolean
  savedTestsError: string | null
  setView: (view: WorkspaceView) => void
  setDraft: (draft: string) => void
  submitDraft: (text: string) => void
  submitAnswers: (answers: Record<string, string>) => void
  setParamValue: (name: string, value: string) => void
  suggestFix: () => void
  approvePlan: () => void
  runPlan: () => void
  selectStep: (index: number) => void
  refreshSavedTests: () => void
  openSavedTest: (savedTest: SavedTest) => void
}

const QaCopilotContext = createContext<QaCopilotState | null>(null)

function agentMessage(text: string, details: ChatMessage['details'] = []): ChatMessage {
  return { id: `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role: 'agent', text, details }
}

export function QaCopilotProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<WorkspaceView>('author')
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_MESSAGE])
  const [suggestions, setSuggestions] = useState<string[]>(STARTER_SUGGESTIONS)
  const [draft, setDraft] = useState('')
  const [isPlanning, setIsPlanning] = useState(false)
  const [plan, setPlan] = useState<TestPlan | null>(null)
  const [planMeta, setPlanMeta] = useState<PlanMeta | null>(null)
  const [planApproved, setPlanApproved] = useState(false)
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([])
  const [planRunId, setPlanRunId] = useState<string | null>(null)
  const [paramValues, setParamValues] = useState<PlanParams>({})
  const [environmentParams, setEnvironmentParams] = useState<string[]>([])
  // The instruction the current plan was drafted from, kept so a failed run
  // can be sent back to the planner together with the failing step.
  const [instruction, setInstruction] = useState<string | null>(null)
  const [isRepairing, setIsRepairing] = useState(false)
  const [isStartingRun, setIsStartingRun] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [run, setRun] = useState<TestRun | null>(null)
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null)
  const [savedTests, setSavedTests] = useState<SavedTest[]>([])
  const [savedTestId, setSavedTestId] = useState<string | null>(null)
  const [isSavingTest, setIsSavingTest] = useState(false)
  const [isLoadingSavedTests, setIsLoadingSavedTests] = useState(false)
  const [savedTestsError, setSavedTestsError] = useState<string | null>(null)
  const recordedRunIdRef = useRef<string | null>(null)

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => [...current, message])
  }, [])

  const applyPlanResult = useCallback(
    (result: PlanResult) => {
      if (result.status === 'needs_input') {
        setQuestions(result.questions)
        setPlanRunId(result.runId)
        setEnvironmentParams(result.environmentParams)
        appendMessage(
          agentMessage(
            'I need a couple of details before I can draft this properly.',
            result.inferredParams.map(({ name, description }) => ({ label: `${name}:`, value: description }))
          )
        )
        setSuggestions([])
        return
      }

      if (result.status === 'blocked') {
        setQuestions([])
        appendMessage(
          agentMessage(
            result.reason,
            result.missingCapabilities.map((capability) => ({ label: 'Missing:', value: capability }))
          )
        )
        setSuggestions([])
        return
      }

      setQuestions([])
      setPlan(result.plan)
      setEnvironmentParams(result.environmentParams)
      setPlanApproved(false)
      setSavedTestId(null)
      setPlanMeta({
        assumptions: result.assumptions,
        warnings: result.warnings,
        sourceModules: result.sourceModules
      })

      const seeded: PlanParams = {}

      for (const name of Object.keys(result.plan.requiredParams)) {
        seeded[name] = ''
      }

      setParamValues(seeded)
      appendMessage(
        agentMessage(
          `Drafted "${result.plan.name}" with ${result.plan.steps.length} steps. Read it on the right before anything runs.`,
          result.assumptions.map((assumption) => ({ label: 'Assumed:', value: assumption }))
        )
      )
      setSuggestions(['Approve and save it'])
    },
    [appendMessage]
  )

  const handleFailure = useCallback(
    (error: unknown) => {
      appendMessage(
        agentMessage(error instanceof Error ? error.message : 'Something went wrong while drafting the plan.')
      )
    },
    [appendMessage]
  )

  const submitDraft = useCallback(
    (text: string) => {
      const trimmed = text.trim()

      if (!trimmed || isPlanning) {
        return
      }

      setDraft('')
      setSuggestions([])
      setIsPlanning(true)
      appendMessage({ id: `user-${Date.now()}`, role: 'user', text: trimmed, details: [] })

      setInstruction(trimmed)

      createPlan(trimmed)
        .then(applyPlanResult)
        .catch(handleFailure)
        .finally(() => setIsPlanning(false))
    },
    [appendMessage, applyPlanResult, handleFailure, isPlanning]
  )

  const submitAnswers = useCallback(
    (answers: Record<string, string>) => {
      if (!planRunId || isPlanning) {
        return
      }

      const entries = Object.entries(answers)
      const summary: string[] = []

      for (const [, answer] of entries) {
        summary.push(answer)
      }

      setIsPlanning(true)
      setQuestions([])
      appendMessage({ id: `user-${Date.now()}`, role: 'user', text: summary.join(' · '), details: [] })

      answerPlanQuestions(planRunId, {
        answers: entries.map(([id, answer]) => ({ id, answer }))
      })
        .then(applyPlanResult)
        .catch(handleFailure)
        .finally(() => setIsPlanning(false))
    },
    [appendMessage, applyPlanResult, handleFailure, isPlanning, planRunId]
  )

  const setParamValue = useCallback((name: string, value: string) => {
    setParamValues((current) => ({ ...current, [name]: value }))
  }, [])

  const missingParamNames = useMemo(() => {
    if (!plan) {
      return []
    }

    const missing: string[] = []

    for (const name of Object.keys(plan.requiredParams)) {
      if (!paramValues[name] && !environmentParams.includes(name)) {
        missing.push(name)
      }
    }

    return missing
  }, [environmentParams, paramValues, plan])

  const upsertSavedTest = useCallback((savedTest: SavedTest) => {
    setSavedTests((current) => [savedTest, ...current.filter((candidate) => candidate.id !== savedTest.id)])
  }, [])

  const approvePlan = useCallback(() => {
    if (!plan || isSavingTest || savedTestId) {
      return
    }

    setIsSavingTest(true)

    saveTest(plan, paramValues)
      .then((savedTest) => {
        setPlanApproved(true)
        setSavedTestId(savedTest.id)
        upsertSavedTest(savedTest)
        appendMessage(
          agentMessage(`Saved "${savedTest.name}" to your library. You can run it again from there any time.`)
        )
      })
      .catch(handleFailure)
      .finally(() => setIsSavingTest(false))
  }, [appendMessage, handleFailure, isSavingTest, paramValues, plan, savedTestId, upsertSavedTest])

  const refreshSavedTests = useCallback(() => {
    setIsLoadingSavedTests(true)
    setSavedTestsError(null)

    listSavedTests()
      .then(setSavedTests)
      .catch((error: unknown) => {
        setSavedTestsError(error instanceof Error ? error.message : 'Could not load your saved tests.')
      })
      .finally(() => setIsLoadingSavedTests(false))
  }, [])

  const changeView = useCallback(
    (nextView: WorkspaceView) => {
      setView(nextView)

      if (nextView === 'library') {
        refreshSavedTests()
      }
    },
    [refreshSavedTests]
  )

  const openSavedTest = useCallback(
    (savedTest: SavedTest) => {
      const seeded: PlanParams = {}

      for (const name of Object.keys(savedTest.plan.requiredParams)) {
        seeded[name] = savedTest.defaultParams[name] ?? ''
      }

      recordedRunIdRef.current = null
      setPlan(savedTest.plan)
      setPlanMeta(null)
      setPlanApproved(true)
      setSavedTestId(savedTest.id)
      setParamValues(seeded)
      setQuestions([])
      setRun(null)
      setRunId(null)
      setSelectedStepIndex(null)
      setSuggestions([])
      setView('author')
      appendMessage(
        agentMessage(
          `Loaded "${savedTest.name}" from your library. Check the steps, fill in anything it needs, then run it.`
        )
      )
    },
    [appendMessage]
  )

  const runPlan = useCallback(() => {
    if (!plan || isStartingRun || missingParamNames.length > 0) {
      return
    }

    setIsStartingRun(true)
    setRun(null)
    setSelectedStepIndex(null)
    setView('runs')

    startTestRun(plan, paramValues)
      .then(({ runId: startedRunId }) => setRunId(startedRunId))
      .catch((error: unknown) => {
        setView('author')
        handleFailure(error)
      })
      .finally(() => setIsStartingRun(false))
  }, [handleFailure, isStartingRun, missingParamNames, paramValues, plan])

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
          active = false
          window.clearInterval(timer)
        })
    }

    const timer = window.setInterval(poll, POLL_INTERVAL_MS)
    poll()

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [runId])

  useEffect(() => {
    if (!run || !savedTestId) {
      return
    }

    if (run.status !== 'passed' && run.status !== 'failed') {
      return
    }

    if (recordedRunIdRef.current === run.runId) {
      return
    }

    recordedRunIdRef.current = run.runId

    recordSavedTestRun(savedTestId, {
      lastRunId: run.runId,
      lastRunStatus: run.status,
      lastRunAt: run.updatedAt
    })
      .then(upsertSavedTest)
      .catch(() => {
        recordedRunIdRef.current = null
      })
  }, [run, savedTestId, upsertSavedTest])

  const selectStep = useCallback((index: number) => setSelectedStepIndex(index), [])

  const failedStep = useMemo(() => run?.steps?.find((step) => step.status === 'failed') ?? null, [run])
  const canSuggestFix = Boolean(
    run && run.status === 'failed' && plan && instruction && !isRepairing && !isPlanning
  )

  // Sends the failing step and its error back to the planner, which re-plans
  // against the knowledge base. The result lands as a new draft in the plan
  // panel; nothing runs until it is approved again.
  const suggestFix = useCallback(() => {
    if (!run || !plan || !instruction || isRepairing || isPlanning) {
      return
    }

    const failure = failedStep
      ? { stepIndex: failedStep.index, title: failedStep.title, error: failedStep.error }
      : { stepIndex: Math.max(0, plan.steps.length - 1), title: 'the run', error: run.error }

    setIsRepairing(true)
    setView('author')
    appendMessage(
      agentMessage(
        `The run failed at ${failure.title}${failure.error ? `: ${failure.error}` : ''}. Re-planning against the knowledge base.`
      )
    )

    repairPlan(instruction, plan, failure)
      .then(applyPlanResult)
      .catch(handleFailure)
      .finally(() => setIsRepairing(false))
  }, [appendMessage, applyPlanResult, failedStep, handleFailure, instruction, isPlanning, isRepairing, plan, run])

  const value = useMemo<QaCopilotState>(
    () => ({
      view,
      messages,
      suggestions,
      draft,
      isPlanning,
      plan,
      planMeta,
      planApproved,
      questions,
      paramValues,
      environmentParams,
      missingParamNames,
      isStartingRun,
      isRepairing,
      canSuggestFix,
      run,
      selectedStepIndex,
      savedTests,
      isSavingTest,
      isLoadingSavedTests,
      savedTestsError,
      setView: changeView,
      setDraft,
      submitDraft,
      submitAnswers,
      setParamValue,
      suggestFix,
      approvePlan,
      runPlan,
      selectStep,
      refreshSavedTests,
      openSavedTest
    }),
    [
      approvePlan,
      canSuggestFix,
      changeView,
      isRepairing,
      suggestFix,
      draft,
      isLoadingSavedTests,
      isPlanning,
      isSavingTest,
      isStartingRun,
      openSavedTest,
      messages,
      missingParamNames,
      environmentParams,
      paramValues,
      plan,
      planApproved,
      planMeta,
      questions,
      refreshSavedTests,
      run,
      runPlan,
      savedTests,
      savedTestsError,
      selectStep,
      selectedStepIndex,
      setParamValue,
      submitAnswers,
      submitDraft,
      suggestions,
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
