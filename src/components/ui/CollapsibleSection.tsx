'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

type CollapsibleSectionProps = {
  title: string
  count?: number
  tone?: 'neutral' | 'warning'
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  title,
  count,
  tone = 'neutral',
  defaultOpen = true,
  children
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const isWarning = tone === 'warning'
  const accent = isWarning ? 'var(--warning-700)' : 'var(--text-tertiary)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <button
        type='button'
        className='qa-collapse-toggle'
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: '6px 8px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: accent
        }}
      >
        <ChevronDown
          className='qa-chevron'
          size={14}
          style={{ flex: 'none', transform: isOpen ? 'none' : 'rotate(-90deg)' }}
        />
        {title}
        {count === undefined ? null : (
          <span
            style={{
              marginLeft: 2,
              padding: '1px 7px',
              borderRadius: 'var(--radius-pill)',
              fontSize: 11,
              background: isWarning ? 'var(--warning-100)' : 'var(--neutral-100)',
              color: isWarning ? 'var(--warning-700)' : 'var(--text-secondary)'
            }}
          >
            {count}
          </span>
        )}
      </button>

      <div className='qa-collapse' data-open={isOpen}>
        <div className='qa-collapse-clip'>
          <div className='qa-collapse-inner'>{children}</div>
        </div>
      </div>
    </div>
  )
}
