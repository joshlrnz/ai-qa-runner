type ProgressBarProps = {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div
      role='progressbar'
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ height: 8, borderRadius: 'var(--radius-pill)', background: 'var(--neutral-100)', overflow: 'hidden' }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: 'var(--brand-500)',
          transition: `width var(--dur-base) var(--ease-standard)`
        }}
      />
    </div>
  )
}
