'use client'

import Image from 'next/image'
import { Library, MessageSquarePlus, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { SidebarNavItem } from './SidebarNavItem'
import { KnowledgeBaseCard } from './KnowledgeBaseCard'
import { useQaCopilot } from './QaCopilotContext'

const SECTION_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: 'var(--text-tertiary)',
  padding: '0 10px 8px'
} as const

export function Sidebar() {
  const { view, setView, run } = useQaCopilot()
  const hasFailure = run?.status === 'failed'

  return (
    <div
      style={{
        width: 236,
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        padding: '20px 14px',
        background: '#F6F5F2'
      }}
    >
      <Image
        src='/oboda-logo.svg'
        alt='Oboda'
        width={73}
        height={26}
        style={{ margin: '4px 8px 0', alignSelf: 'flex-start' }}
        priority
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={SECTION_LABEL_STYLE}>Quality</div>
        <SidebarNavItem
          icon={<MessageSquarePlus size={18} />}
          label='Write a test'
          active={view === 'author'}
          onSelect={() => setView('author')}
        />
        <SidebarNavItem
          icon={<PlayCircle size={18} />}
          label='Run results'
          active={view === 'runs'}
          onSelect={() => setView('runs')}
          trailing={
            hasFailure ? (
              <Badge tone='error' size='sm'>
                1
              </Badge>
            ) : null
          }
        />
        <SidebarNavItem
          icon={<Library size={18} />}
          label='Saved tests'
          active={view === 'library'}
          onSelect={() => setView('library')}
        />
      </div>

      <KnowledgeBaseCard />
    </div>
  )
}
