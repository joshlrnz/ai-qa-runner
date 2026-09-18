import type { CSSProperties, ReactNode } from 'react'

export type BadgeTone = 'brand' | 'info' | 'success' | 'warning' | 'error' | 'neutral'
export type BadgeVariant = 'subtle' | 'outline'
export type BadgeSize = 'sm' | 'md'

type BadgeProps = {
  tone?: BadgeTone
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: ReactNode
}

const TONE_PALETTE: Record<BadgeTone, { background: string; foreground: string; border: string }> = {
  brand: { background: 'var(--brand-50)', foreground: 'var(--brand-700)', border: 'var(--brand-200)' },
  info: { background: 'var(--info-50)', foreground: 'var(--info-700)', border: 'var(--info-300)' },
  success: { background: 'var(--success-100)', foreground: 'var(--success-700)', border: 'var(--success-200)' },
  warning: { background: 'var(--warning-100)', foreground: 'var(--warning-700)', border: 'var(--warning-500)' },
  error: { background: 'var(--error-100)', foreground: 'var(--error-700)', border: 'var(--error-200)' },
  neutral: { background: 'var(--neutral-100)', foreground: 'var(--neutral-700)', border: 'var(--neutral-200)' }
}

export function Badge({ tone = 'neutral', variant = 'subtle', size = 'md', dot = false, children }: BadgeProps) {
  const { background, foreground, border } = TONE_PALETTE[tone]
  const isSmall = size === 'sm'

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: isSmall ? 20 : 24,
    padding: isSmall ? '0 8px' : '0 10px',
    borderRadius: 'var(--radius-pill)',
    fontSize: isSmall ? 11.5 : 12.5,
    fontWeight: 600,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: foreground,
    background: variant === 'outline' ? 'transparent' : background,
    border: `1px solid ${variant === 'outline' ? border : 'transparent'}`
  }

  return (
    <span style={style}>
      {dot ? (
        <span
          style={{ width: 6, height: 6, borderRadius: 'var(--radius-pill)', background: foreground, flex: 'none' }}
        />
      ) : null}
      {children}
    </span>
  )
}
