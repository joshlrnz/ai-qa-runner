'use client'

import { Library } from 'lucide-react'
import type { RunStatus } from '@/contracts/test-run'
import type { SavedTest } from '@/contracts/saved-test'
import { Badge, type BadgeTone } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useQaCopilot } from './QaCopilotContext'

const CELL_STYLE = {
  padding: '12px 14px',
  borderBottom: '1px solid var(--border-subtle)',
  fontSize: 13,
  color: 'var(--neutral-700)'
} as const

const RESULT_TONE: Record<RunStatus, BadgeTone> = {
  queued: 'neutral',
  running: 'info',
  passed: 'success',
  failed: 'error'
}

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return 'Not run yet'
  }

  return new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function describeParams(savedTest: SavedTest) {
  const names = Object.keys(savedTest.plan.requiredParams)

  if (names.length === 0) {
    return 'No details needed'
  }

  return `Needs ${names.join(', ')}`
}

export function LibraryView() {
  const { savedTests, isLoadingSavedTests, savedTestsError, openSavedTest, setView } = useQaCopilot()

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap'
        }}
      >
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {isLoadingSavedTests
            ? 'Loading your saved tests...'
            : `${savedTests.length} saved ${savedTests.length === 1 ? 'test' : 'tests'}`}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Button hierarchy="primary" size="sm" onClick={() => setView('author')}>
            New test case
          </Button>
        </span>
      </div>

      {savedTestsError ? (
        <div style={{ marginBottom: 16, fontSize: 13, color: 'var(--error-700)' }}>{savedTestsError}</div>
      ) : null}

      {savedTests.length === 0 && !isLoadingSavedTests ? (
        <div style={{ padding: '60px 0' }}>
          <EmptyState
            icon={<Library size={26} />}
            title="No saved tests yet"
            description="Approve a plan on the Write a test page and it shows up here, ready to run again next release."
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
                <th style={{ ...CELL_STYLE, textAlign: 'left', fontWeight: 600 }}>Test Case</th>
                <th
                  style={{
                    ...CELL_STYLE,
                    textAlign: 'left',
                    fontWeight: 600,
                    width: 90
                  }}
                >
                  Steps
                </th>
                <th
                  style={{
                    ...CELL_STYLE,
                    textAlign: 'left',
                    fontWeight: 600,
                    width: 200
                  }}
                >
                  Required input
                </th>
                <th
                  style={{
                    ...CELL_STYLE,
                    textAlign: 'left',
                    fontWeight: 600,
                    width: 160
                  }}
                >
                  Last run
                </th>
                <th
                  style={{
                    ...CELL_STYLE,
                    textAlign: 'left',
                    fontWeight: 600,
                    width: 110
                  }}
                >
                  Result
                </th>
                <th
                  style={{
                    ...CELL_STYLE,
                    textAlign: 'right',
                    fontWeight: 600,
                    width: 120
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {savedTests.map((savedTest) => (
                <tr key={savedTest.id}>
                  <td
                    style={{
                      ...CELL_STYLE,
                      fontWeight: 600,
                      color: 'var(--neutral-900)'
                    }}
                  >
                    {savedTest.name}
                  </td>
                  <td style={CELL_STYLE}>{savedTest.plan.steps.length}</td>
                  <td style={CELL_STYLE}>{describeParams(savedTest)}</td>
                  <td style={CELL_STYLE}>{formatTimestamp(savedTest.lastRunAt)}</td>
                  <td style={CELL_STYLE}>
                    {savedTest.lastRunStatus ? (
                      <Badge tone={RESULT_TONE[savedTest.lastRunStatus]} size="sm">
                        {savedTest.lastRunStatus}
                      </Badge>
                    ) : (
                      <Badge tone="neutral" size="sm">
                        Saved
                      </Badge>
                    )}
                  </td>
                  <td style={{ ...CELL_STYLE, textAlign: 'right' }}>
                    <Button hierarchy="secondary" size="sm" onClick={() => openSavedTest(savedTest)}>
                      Open
                    </Button>
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
