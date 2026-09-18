'use client'

import type { ReactNode } from 'react'

type SidebarNavItemProps = {
  icon: ReactNode
  label: string
  active: boolean
  trailing?: ReactNode
  onSelect?: () => void
}

export function SidebarNavItem({ icon, label, active, trailing, onSelect }: SidebarNavItemProps) {
  const interactive = typeof onSelect === 'function'

  return (
    <button
      type='button'
      onClick={onSelect}
      disabled={!interactive}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        padding: '9px 10px',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'left',
        fontSize: 14,
        cursor: interactive ? 'pointer' : 'default',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--brand-oboda-blue)' : 'var(--neutral-600)',
        background: active ? 'var(--neutral-white)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px #EAECF0' : 'none',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderLeft: `3px solid ${active ? 'var(--orange-500)' : 'transparent'}`
      }}
    >
      {icon}
      {label}
      {trailing ? <span style={{ marginLeft: 'auto' }}>{trailing}</span> : null}
    </button>
  )
}
