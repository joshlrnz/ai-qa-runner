'use client'

import type { FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useQaCopilot } from './QaCopilotContext'

export function Composer() {
  const { draft, setDraft, submitDraft, isPlanning } = useQaCopilot()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitDraft(draft)
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder='Describe what you want to check...'
        aria-label='Describe what you want to check'
        style={{
          flex: 1,
          minWidth: 0,
          height: 40,
          padding: '0 12px',
          font: '400 14px var(--font-sans)',
          color: 'var(--neutral-900)',
          background: 'var(--neutral-white)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'inset 0 0 0 1px rgba(207,216,220,.7)',
          outline: 'none'
        }}
      />
      <Button type='submit' hierarchy='primary' disabled={isPlanning || draft.trim().length === 0}>
        Send
      </Button>
    </form>
  )
}
