'use client'

import { ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PlanStepCard } from './PlanStepCard'
import { useQaCopilot } from './QaCopilotContext'

export function PlanPanel({ environmentLabel }: { environmentLabel: string }) {
  const { plan, planApproved, approvePlan, runPlan, isStartingRun } = useQaCopilot()

  if (!plan) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          background: 'var(--surface-sunken)'
        }}
      >
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <EmptyState
            icon={<ClipboardList size={26} />}
            title='No test plan yet'
            description='Say what you want checked in plain English. The plan builds itself here, step by step, so you can read it before anything runs.'
          />
        </div>
      </div>
    )
  }

  const meta = [
    { label: 'Environment', value: environmentLabel },
    { label: 'Steps', value: String(plan.steps.length) },
    { label: 'Approval', value: planApproved ? 'Approved by you' : 'Waiting on you' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--surface-sunken)' }}>
      <div
        style={{
          flex: 'none',
          padding: '18px 20px 14px',
          background: 'var(--neutral-white)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ font: '700 18px/1.2 var(--font-display)', color: 'var(--brand-oboda-blue)' }}>
                {plan.name}
              </span>
              <Badge tone={planApproved ? 'success' : 'warning'} size='sm'>
                {planApproved ? 'Approved' : 'Awaiting your approval'}
              </Badge>
            </div>
            <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
              {plan.steps.length} steps &middot; nothing runs until you say so
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flex: 'none' }}>
            {!planApproved ? (
              <Button hierarchy='secondary' size='sm' onClick={approvePlan}>
                Approve &amp; save
              </Button>
            ) : null}
            <Button hierarchy='primary' size='sm' onClick={runPlan} disabled={isStartingRun}>
              {isStartingRun ? 'Starting...' : 'Run now'}
            </Button>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
            gap: 10
          }}
        >
          {meta.map(({ label, value }) => (
            <div key={label} style={{ padding: '9px 11px', borderRadius: 10, background: 'var(--surface-sunken)' }}>
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
              <div
                style={{
                  marginTop: 3,
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--neutral-800)',
                  wordBreak: 'break-word'
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        {plan.steps.map((step, index) => (
          <PlanStepCard key={`${step.action}-${index}`} step={step} position={index + 1} />
        ))}
      </div>
    </div>
  )
}
