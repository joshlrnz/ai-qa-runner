'use client'

import type { FormEvent, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useQaCopilot } from './QaCopilotContext'

export function Composer() {
  const { draft, setDraft, submitDraft, isPlanning } = useQaCopilot()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitDraft(draft)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isPlanning && draft.trim().length > 0) {
        submitDraft(draft)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder='Describe what you want to check...'
        aria-label='Describe what you want to check'
        rows={1}
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 40,
          maxHeight: 160,
          padding: '10px 12px',
          font: '400 14px var(--font-sans)',
          color: 'var(--neutral-900)',
          background: 'var(--neutral-white)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'inset 0 0 0 1px rgba(207,216,220,.7)',
          outline: 'none',
          resize: 'none',
          overflowY: 'auto',
          lineHeight: '1.5',
          fieldSizing: 'content' as never,
        }}
      />
      <Button type='submit' hierarchy='primary' disabled={isPlanning || draft.trim().length === 0}>
        Send
      </Button>
    </form>
  )
}
