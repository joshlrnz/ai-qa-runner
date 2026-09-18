import { QaCopilotProvider } from '@/components/qa-copilot/QaCopilotContext'
import { QaCopilotWorkspace } from '@/components/qa-copilot/QaCopilotWorkspace'

function readEnvironmentLabel() {
  const target = process.env.TARGET_BASE_URL ?? 'https://releasing.oboda.app'

  return target.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default function Home() {
  return (
    <QaCopilotProvider>
      <QaCopilotWorkspace environmentLabel={readEnvironmentLabel()} />
    </QaCopilotProvider>
  )
}
