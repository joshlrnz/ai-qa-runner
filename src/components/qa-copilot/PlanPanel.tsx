'use client'

import { ClipboardList, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { PlanStepCard } from './PlanStepCard'
import { PlanParamsCard } from './PlanParamsCard'
import { useQaCopilot } from './QaCopilotContext'

export function PlanPanel({ environmentLabel }: { environmentLabel: string }) {
  const { plan, planMeta, planApproved, approvePlan, runPlan, isStartingRun, missingParamNames } =
    useQaCopilot()

  if (!plan) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: 'var(--surface-sunken)' }}>
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

  const blockedReason =
    missingParamNames.length > 0 ? `Fill in ${missingParamNames.join(', ')} first` : null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: 'var(--surface-sunken)'
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            padding: '18px 20px 14px',
            background: 'var(--neutral-white)',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
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
              {plan.steps.length} steps &middot; {environmentLabel} &middot; nothing runs until you say so
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flex: 'none' }}>
            {!planApproved ? (
              <Button hierarchy='secondary' size='sm' onClick={approvePlan}>
                Approve &amp; save
              </Button>
            ) : null}
            <Button
              hierarchy='primary'
              size='sm'
              onClick={runPlan}
              disabled={isStartingRun || missingParamNames.length > 0}
              title={blockedReason ?? undefined}
            >
              {isStartingRun ? 'Starting...' : 'Run now'}
            </Button>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}
        >
          {planMeta && planMeta.sourceModules.length > 0 ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {planMeta.sourceModules.map((module) => (
                <Badge key={module} tone='brand' size='sm' variant='outline'>
                  {module}
                </Badge>
              ))}
            </div>
          ) : null}

          {planMeta && planMeta.warnings.length > 0 ? (
            <CollapsibleSection
              title='Warnings'
              count={planMeta.warnings.length}
              tone='warning'
              defaultOpen={planMeta.warnings.length <= 2}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'var(--warning-50)'
                }}
              >
                {planMeta.warnings.map((warning) => (
                  <div
                    key={warning}
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                      fontSize: 12.5,
                      lineHeight: 1.45,
                      color: 'var(--warning-700)'
                    }}
                  >
                    <TriangleAlert size={15} style={{ flex: 'none', marginTop: 1 }} />
                    {warning}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          ) : null}

          {blockedReason ? (
            <div style={{ fontSize: 12.5, color: 'var(--error-700)' }}>{blockedReason}</div>
          ) : null}

          <PlanParamsCard />

          <CollapsibleSection title='Steps' count={plan.steps.length} defaultOpen={plan.steps.length <= 12}>
            {plan.steps.map((step, index) => (
              <PlanStepCard key={`${step.action}-${index}`} step={step} position={index + 1} />
            ))}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  )
}
