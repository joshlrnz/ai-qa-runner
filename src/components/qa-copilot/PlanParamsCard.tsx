'use client'

import { useQaCopilot } from './QaCopilotContext'

export function PlanParamsCard() {
  const { plan, paramValues, setParamValue } = useQaCopilot()
  const requirements = plan ? Object.entries(plan.requiredParams) : []

  if (requirements.length === 0) {
    return null
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        borderRadius: 'var(--radius-card)',
        background: 'var(--neutral-white)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div style={{ font: '700 15px/1.2 var(--font-display)', color: 'var(--brand-oboda-blue)' }}>
        This test needs some details
      </div>
      {requirements.map(([name, { description, secret }]) => (
        <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label htmlFor={`param-${name}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-800)' }}>
            {name}
            {secret ? <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-tertiary)' }}>kept out of the report</span> : null}
          </label>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{description}</span>
          <input
            id={`param-${name}`}
            type={secret ? 'password' : 'text'}
            value={paramValues[name] ?? ''}
            onChange={(event) => setParamValue(name, event.target.value)}
            style={{
              height: 36,
              padding: '0 10px',
              font: '400 13.5px var(--font-sans)',
              background: 'var(--neutral-white)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'inset 0 0 0 1px var(--neutral-200)',
              outline: 'none'
            }}
          />
        </div>
      ))}
    </div>
  )
}
