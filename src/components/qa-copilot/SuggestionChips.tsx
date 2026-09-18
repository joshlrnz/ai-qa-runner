'use client'

type SuggestionChipsProps = {
  suggestions: string[]
  onPick: (suggestion: string) => void
}

export function SuggestionChips({ suggestions, onPick }: SuggestionChipsProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          type='button'
          onClick={() => onPick(suggestion)}
          style={{
            display: 'inline-flex',
            maxWidth: '100%',
            cursor: 'pointer',
            padding: '5px 11px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--neutral-white)',
            border: '1px solid var(--neutral-200)',
            fontSize: 12.5,
            lineHeight: 1.35,
            textAlign: 'left',
            color: 'var(--neutral-700)'
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
