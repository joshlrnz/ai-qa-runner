'use client'

import { Sidebar } from './Sidebar'
import { WorkspaceHeader } from './WorkspaceHeader'
import { AuthorView } from './AuthorView'
import { RunsView } from './RunsView'
import { LibraryView } from './LibraryView'
import { useQaCopilot } from './QaCopilotContext'

export function QaCopilotWorkspace({ environmentLabel }: { environmentLabel: string }) {
  const { view } = useQaCopilot()

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        minHeight: 480,
        background: '#EAE9E4',
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-primary)',
        fontSize: 14,
        overflow: 'hidden'
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          margin: '12px 12px 12px 0',
          background: 'var(--neutral-white)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'inset 0 0 0 1px #EAECF0, 0 1px 2px rgba(16,24,40,.05)'
        }}
      >
        <WorkspaceHeader environmentLabel={environmentLabel} />
        {view === 'author' ? <AuthorView environmentLabel={environmentLabel} /> : null}
        {view === 'runs' ? <RunsView environmentLabel={environmentLabel} /> : null}
        {view === 'library' ? <LibraryView /> : null}
      </div>
    </div>
  )
}
