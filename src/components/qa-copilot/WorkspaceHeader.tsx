'use client'

import { Badge } from '@/components/ui/Badge'
import type { WorkspaceView } from '@/contracts/qa-copilot'
import { useQaCopilot } from './QaCopilotContext'

const TITLES: Record<WorkspaceView, { title: string; subtitle: string }> = {
  author: {
    title: 'Write a test',
    subtitle: 'Describe a check in plain English. The agent drafts it, you approve it.'
  },
  runs: {
    title: 'Run results',
    subtitle: 'Step-by-step evidence from the last execution.'
  },
  library: {
    title: 'Saved tests',
    subtitle: 'Reusable cases for recurring regression runs.'
  }
}

export function WorkspaceHeader({ environmentLabel }: { environmentLabel: string }) {
  const { view } = useQaCopilot()
  const { title, subtitle } = TITLES[view]

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 20px',
        borderBottom: '1px solid var(--border-subtle)'
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ font: '700 20px/1.1 var(--font-display)', color: 'var(--brand-oboda-blue)' }}>{title}</div>
        <div style={{ marginTop: 3, fontSize: 12, color: 'var(--text-secondary)' }}>{subtitle}</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Badge tone='info' dot>
          {environmentLabel}
        </Badge>
      </div>
    </div>
  )
}
