import Image from 'next/image'
import type { ChatMessage } from '@/contracts/qa-copilot'

export function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            alignSelf: 'flex-end',
            maxWidth: '86%',
            padding: '10px 14px',
            borderRadius: '14px 14px 4px 14px',
            background: 'var(--brand-50)',
            color: 'var(--brand-800)',
            lineHeight: 1.5
          }}
        >
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <Image
        src='/oboda-smile.svg'
        alt=''
        width={22}
        height={22}
        style={{ marginTop: 6, flex: 'none' }}
      />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ lineHeight: 1.55, color: 'var(--neutral-800)' }}>{message.text}</div>
        {message.details.length > 0 ? (
          <div
            style={{
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px #EAECF0'
            }}
          >
            {message.details.map((detail, detailIndex) => (
              <div
                key={`${detailIndex}-${detail.label}`}
                style={{ padding: '9px 11px', background: 'var(--surface-sunken)' }}
              >
                <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--neutral-700)' }}>
                  <b style={{ color: 'var(--neutral-900)', fontWeight: 600 }}>{detail.label}</b> {detail.value}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
