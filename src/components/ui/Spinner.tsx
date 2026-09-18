import { LoaderCircle } from 'lucide-react'

type SpinnerProps = {
  size?: number
  color?: string
}

export function Spinner({ size = 16, color = 'var(--brand-500)' }: SpinnerProps) {
  return (
    <>
      <style>{'@keyframes qa-spin{to{transform:rotate(360deg)}}'}</style>
      <LoaderCircle
        size={size}
        color={color}
        style={{ flex: 'none', animation: 'qa-spin 900ms linear infinite' }}
      />
    </>
  )
}
