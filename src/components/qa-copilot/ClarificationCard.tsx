'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useQaCopilot } from './QaCopilotContext'

export function ClarificationCard() {
  const { questions, submitAnswers, isPlanning } = useQaCopilot()
  const [answers, setAnswers] = useState<Record<string, string>>({})

  if (questions.length === 0) {
    return null
  }

  const unanswered = questions.some(({ id }) => !answers[id]?.trim())

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 16,
        borderRadius: 'var(--radius-card)',
        background: 'var(--brand-50)',
        boxShadow: 'inset 0 0 0 1px var(--brand-200)'
      }}
    >
      {questions.map(({ id, question, why }) => (
        <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor={`q-${id}`} style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--brand-800)' }}>
            {question}
          </label>
          {why ? <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{why}</span> : null}
          <input
            id={`q-${id}`}
            value={answers[id] ?? ''}
            onChange={(event) => setAnswers((current) => ({ ...current, [id]: event.target.value }))}
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
      <Button size='sm' onClick={() => submitAnswers(answers)} disabled={unanswered || isPlanning}>
        Send answers
      </Button>
    </div>
  )
}
