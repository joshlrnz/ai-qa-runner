'use client'

import { useEffect } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { ChatBubble } from './ChatBubble'
import { SuggestionChips } from './SuggestionChips'
import { Composer } from './Composer'
import { ClarificationCard } from './ClarificationCard'
import { useQaCopilot } from './QaCopilotContext'

const SCROLL_ANCHOR_ID = 'qa-conversation-anchor'

export function ConversationPanel() {
  const { messages, suggestions, isPlanning, submitDraft } = useQaCopilot()

  useEffect(() => {
    document.getElementById(SCROLL_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isPlanning])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderRight: '1px solid var(--border-subtle)'
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        {isPlanning ? (
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              color: 'var(--text-secondary)',
              fontSize: 13
            }}
          >
            <Spinner />
            Reading the knowledge base and drafting the steps...
          </div>
        ) : null}
        <ClarificationCard />
        <div id={SCROLL_ANCHOR_ID} />
      </div>

      <div
        style={{
          flex: 'none',
          padding: '14px 20px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <SuggestionChips suggestions={suggestions} onPick={submitDraft} />
        <Composer />
      </div>
    </div>
  )
}
