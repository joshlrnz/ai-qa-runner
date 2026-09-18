'use client'

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export type ButtonHierarchy = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  hierarchy?: ButtonHierarchy
  size?: ButtonSize
  children: ReactNode
}

const HIERARCHY_STYLE: Record<ButtonHierarchy, CSSProperties> = {
  primary: {
    background: 'var(--action-primary-bg)',
    color: 'var(--action-primary-fg)',
    border: '1px solid transparent'
  },
  secondary: {
    background: 'var(--neutral-white)',
    color: 'var(--neutral-800)',
    border: '1px solid var(--border-default)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--brand-600)',
    border: '1px solid transparent'
  }
}

export function Button({ hierarchy = 'primary', size = 'md', children, disabled, style, ...rest }: ButtonProps) {
  const isSmall = size === 'sm'

  const baseStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: isSmall ? 36 : 40,
    padding: isSmall ? '0 14px' : '0 18px',
    borderRadius: 'var(--radius-lg)',
    fontSize: 13.5,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: `background var(--dur-fast) var(--ease-standard)`,
    ...HIERARCHY_STYLE[hierarchy],
    ...style
  }

  return (
    <button type='button' disabled={disabled} style={baseStyle} {...rest}>
      {children}
    </button>
  )
}
