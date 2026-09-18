'use client'

import { Circle, CircleCheck, CircleMinus, CircleX } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import type { StepResult, StepStatus } from '@/contracts/test-run'

type RunStepRowProps = {
  step: StepResult
  selected: boolean
  onSelect: () => void
}

const STATUS_LABEL: Record<StepStatus, string> = {
  pending: 'Waiting',
  running: 'Running',
  passed: 'Passed',
  failed: 'Failed',
  skipped: 'Skipped'
}

const STATUS_TONE: Record<StepStatus, BadgeTone> = {
  pending: 'neutral',
  running: 'info',
  passed: 'success',
  failed: 'error',
  skipped: 'neutral'
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === 'running') {
    return <Spinner size={18} />
  }

  if (status === 'passed') {
    return <CircleCheck size={18} color='var(--success-500)' />
  }

  if (status === 'failed') {
    return <CircleX size={18} color='var(--error-500)' />
  }

  if (status === 'skipped') {
    return <CircleMinus size={18} color='var(--neutral-400)' />
  }

  return <Circle size={18} color='var(--neutral-300)' />
}

export function RunStepRow({ step, selected, onSelect }: RunStepRowProps) {
  const { index, title, status, durationMs, error } = step

  return (
    <button
      type='button'
      onClick={onSelect}
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        width: '100%',
        textAlign: 'left',
        padding: '12px 14px',
        borderRadius: 10,
        cursor: 'pointer',
        border: 'none',
        background: selected ? 'var(--brand-50)' : 'var(--neutral-white)',
        boxShadow: `inset 0 0 0 1px ${selected ? 'var(--brand-400)' : '#EAECF0'}`
      }}
    >
      <span style={{ flex: 'none', display: 'flex', marginTop: 1 }}>
        <StatusIcon status={status} />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span
          style={{
            display: 'block',
            fontSize: 13.5,
            fontWeight: 600,
            color: 'var(--neutral-900)',
            lineHeight: 1.4
          }}
        >
          {index + 1}. {title}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 2,
            fontSize: 12.5,
            color: 'var(--text-secondary)',
            lineHeight: 1.4
          }}
        >
          {error ?? STATUS_LABEL[status]}
        </span>
      </span>
      <span style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
        {durationMs === null ? null : (
          <span style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
            {(durationMs / 1000).toFixed(1)}s
          </span>
        )}
        <Badge tone={STATUS_TONE[status]} size='sm'>
          {STATUS_LABEL[status]}
        </Badge>
      </span>
    </button>
  )
}
