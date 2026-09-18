import { Badge } from '@/components/ui/Badge'
import type { TestStep } from '@/contracts/test-plan'
import { describeExpectation, describeTarget, describeTestStep } from '@/lib/describe-test-step'

type PlanStepCardProps = {
  step: TestStep
  position: number
}

export function PlanStepCard({ step, position }: PlanStepCardProps) {
  const isAssertion = step.action === 'assertVisible' || step.action === 'assertText'

  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '13px 14px',
        borderRadius: 'var(--radius-card)',
        background: 'var(--neutral-white)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div
        style={{
          flex: 'none',
          width: 24,
          height: 24,
          borderRadius: 'var(--radius-pill)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          background: 'var(--brand-50)',
          color: 'var(--brand-700)'
        }}
      >
        {position}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--neutral-900)', lineHeight: 1.4 }}>
          {describeTestStep(step)}
        </div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Expect: {describeExpectation(step)}
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <Badge tone={isAssertion ? 'warning' : 'brand'} size='sm' variant='outline'>
            {isAssertion ? 'Assertion' : 'Action'}
          </Badge>
          <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            {describeTarget(step)}
          </span>
        </div>
      </div>
    </div>
  )
}
