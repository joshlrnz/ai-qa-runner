import { BookOpenCheck } from 'lucide-react'
import applicationKnowledge from '@/knowledge/application.json'

export function KnowledgeBaseCard() {
  const pageCount = Object.keys(applicationKnowledge.pages).length
  const targetCount = Object.keys(applicationKnowledge.targets).length

  return (
    <div
      style={{
        marginTop: 'auto',
        padding: 12,
        borderRadius: 'var(--radius-card)',
        background: 'var(--neutral-white)',
        boxShadow: 'inset 0 0 0 1px #EAECF0'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: 'var(--brand-oboda-blue)',
          fontWeight: 600,
          fontSize: 13
        }}
      >
        <BookOpenCheck size={16} />
        Knowledge base
      </div>
      <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.45, color: 'var(--text-secondary)' }}>
        {pageCount} pages and {targetCount} named targets indexed from the running app.
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)' }}>
        Built from releasing.oboda.app
      </div>
    </div>
  )
}
