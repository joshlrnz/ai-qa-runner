'use client'

import { Library } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQaCopilot } from './QaCopilotContext'

const SUITES = ['All suites', 'Release Regression', 'Nightly', 'Weekly']

const CELL_STYLE = {
  padding: '12px 14px',
  borderBottom: '1px solid var(--border-subtle)',
  fontSize: 13,
  color: 'var(--neutral-700)'
} as const

export function LibraryView() {
  const { savedCases, suiteFilter, setSuiteFilter, setView } = useQaCopilot()

  const visibleCases = []

  for (const savedCase of savedCases) {
    if (suiteFilter === 'All suites' || savedCase.suite === suiteFilter) {
      visibleCases.push(savedCase)
    }
  }

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {SUITES.map((suite) => (
            <button
              key={suite}
              type='button'
              onClick={() => setSuiteFilter(suite)}
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: 12.5,
                cursor: 'pointer',
                background: suite === suiteFilter ? 'var(--brand-600)' : 'var(--neutral-white)',
                color: suite === suiteFilter ? 'var(--neutral-white)' : 'var(--neutral-700)',
                border: `1px solid ${suite === suiteFilter ? 'var(--brand-600)' : 'var(--neutral-200)'}`
              }}
            >
              {suite}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto' }}>
          <Button hierarchy='primary' size='sm' onClick={() => setView('author')}>
            New test case
          </Button>
        </span>
      </div>

      {visibleCases.length === 0 ? (
        <div style={{ padding: '60px 0' }}>
          <EmptyState
            icon={<Library size={26} />}
            title='No saved tests yet'
            description='Approve a plan on the Write a test page and it shows up here, ready to run again next release.'
          />
        </div>
      ) : (
        <div
          style={{
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 0 1px #EAECF0',
            background: 'var(--neutral-white)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--neutral-50)' }}>
                <th style={{ ...CELL_STYLE, textAlign: 'left', fontWeight: 600, width: 110 }}>Case</th>
                <th style={{ ...CELL_STYLE, textAlign: 'left', fontWeight: 600 }}>What it checks</th>
                <th style={{ ...CELL_STYLE, textAlign: 'left', fontWeight: 600, width: 180 }}>Suite</th>
                <th style={{ ...CELL_STYLE, textAlign: 'left', fontWeight: 600, width: 140 }}>Last run</th>
                <th style={{ ...CELL_STYLE, textAlign: 'left', fontWeight: 600, width: 130 }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {visibleCases.map((savedCase) => (
                <tr key={savedCase.id}>
                  <td style={{ ...CELL_STYLE, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{savedCase.id}</td>
                  <td style={{ ...CELL_STYLE, fontWeight: 600, color: 'var(--neutral-900)' }}>{savedCase.name}</td>
                  <td style={CELL_STYLE}>{savedCase.suite}</td>
                  <td style={CELL_STYLE}>{savedCase.lastRun}</td>
                  <td style={CELL_STYLE}>
                    <Badge tone='brand' size='sm'>
                      {savedCase.result}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
