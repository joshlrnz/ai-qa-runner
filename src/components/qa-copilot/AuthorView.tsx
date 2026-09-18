import { ConversationPanel } from './ConversationPanel'
import { PlanPanel } from './PlanPanel'

export function AuthorView({ environmentLabel }: { environmentLabel: string }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: 'minmax(340px,0.9fr) minmax(0,1.1fr)'
      }}
    >
      <ConversationPanel />
      <PlanPanel environmentLabel={environmentLabel} />
    </div>
  )
}
