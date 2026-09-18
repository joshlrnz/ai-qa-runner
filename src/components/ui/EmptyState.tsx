import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon: ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 10,
        maxWidth: 420,
        margin: '0 auto',
        color: 'var(--text-secondary)'
      }}
    >
      <span style={{ color: 'var(--neutral-400)' }}>{icon}</span>
      <span style={{ font: '700 18px/1.2 var(--font-display)', color: 'var(--brand-oboda-blue)' }}>{title}</span>
      <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{description}</span>
    </div>
  )
}
