'use client'

import { useMemo } from 'react'
import { PlayCircle } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Spinner } from '@/components/ui/Spinner'
import type { RunStatus } from '@/contracts/test-run'
import { countByStatus, deriveRunSteps } from '@/lib/derive-run-steps'
import { RunStepRow } from './RunStepRow'
import { EvidencePanel } from './EvidencePanel'
import { useQaCopilot } from './QaCopilotContext'

const STATUS_TONE: Record<RunStatus, BadgeTone> = {
  queued: 'neutral',
  running: 'info',
  passed: 'success',
  failed: 'error'
}

const STATUS_LABEL: Record<RunStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  passed: 'All steps passed',
  failed: 'Run failed'
}

export function RunsView({ environmentLabel }: { environmentLabel: string }) {
  const { run, plan, selectedStepIndex, selectStep } = useQaCopilot()

  const steps = useMemo(() => deriveRunSteps(plan, run), [plan, run])
  const totals = useMemo(() => countByStatus(steps), [steps])

  if (!run) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
        <div style={{ padding: '60px 0' }}>
          <EmptyState
            icon={<PlayCircle size={26} />}
            title='Nothing has run yet'
            description='Approve a test plan and run it against the release build. Step results and the Playwright trace land here.'
          />
        </div>
      </div>
    )
  }

  const isActive = run.status === 'queued' || run.status === 'running'
  const settled = steps.length - (totals.passed + totals.failed + totals.skipped)
  const progress = steps.length === 0 ? 0 : ((steps.length - settled) / steps.length) * 100
  const selectedStep = selectedStepIndex === null ? null : (steps[selectedStepIndex] ?? null)

  const stats = [
    { label: 'Passed', value: String(totals.passed), color: 'var(--success-600)' },
    { label: 'Failed', value: String(totals.failed), color: 'var(--error-500)' },
    { label: 'Skipped', value: String(totals.skipped), color: 'var(--neutral-500)' },
    { label: 'Steps', value: String(steps.length), color: 'var(--brand-oboda-blue)' }
  ]

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            padding: '16px 18px',
            borderRadius: 'var(--radius-card)',
            background: 'var(--neutral-white)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ font: '700 18px/1.2 var(--font-display)', color: 'var(--brand-oboda-blue)' }}>
                {run.planName}
              </span>
              <Badge tone={STATUS_TONE[run.status]}>{STATUS_LABEL[run.status]}</Badge>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              Chromium &middot; {environmentLabel} &middot; run {run.runId.slice(0, 8)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 22, flex: 'none' }}>
            {stats.map(({ label, value, color }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: '.04em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  {label}
                </div>
                <div style={{ marginTop: 2, font: `700 20px/1.1 var(--font-display)`, color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {isActive ? (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-card)',
              background: 'var(--neutral-white)',
              boxShadow: 'inset 0 0 0 1px #EAECF0'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
                fontSize: 13,
                color: 'var(--neutral-700)'
              }}
            >
              <Spinner />
              Driving Chromium against {environmentLabel}...
            </div>
            <ProgressBar value={progress} />
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,0.95fr)',
            gap: 16,
            alignItems: 'start'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map((step) => (
              <RunStepRow
                key={step.index}
                step={step}
                selected={selectedStepIndex === step.index}
                onSelect={() => selectStep(step.index)}
              />
            ))}
          </div>

          <EvidencePanel
            step={selectedStep}
            environmentLabel={environmentLabel}
            reportUrl={run.reportUrl}
            runError={run.error}
          />
        </div>
      </div>
    </div>
  )
}
