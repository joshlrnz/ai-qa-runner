# Output templates

Follow these shapes exactly. The planning agent parses them by convention, and drift between
modules is what makes a knowledge base stop being usable.

## `qa-knowledge/modules/<module>.md`

```markdown
---
module: orders
routes: 4
targets: 17
flows: 5
status: verified        # recon | drafted | verified
lastUpdated: 2026-09-17
---

# Orders

## Purpose

Where staff review incoming orders, change their fulfilment state, and issue refunds.
Reachable only by an authenticated user; refunds additionally require the `admin` role.

## Routes

| path | page file | auth | notes |
| --- | --- | --- | --- |
| `/orders` | `app/(app)/orders/page.tsx` | session | list, paginated |
| `/orders/[id]` | `app/(app)/orders/[id]/page.tsx` | session | example: `/orders/ord_demo_1` |

## Preconditions

- Authenticated as `staff` (or `admin` for the refund flow).
- At least one order in `pending` state, and one in `paid` state.
- Storage state: `.auth/dev-user.json`.

## Targets

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `orders.list-heading` | heading "Orders" | `role=heading[name="Orders"]` | `app/(app)/orders/page.tsx:22` | high | |
| `orders.status-filter` | combobox "Status" | `role=combobox[name="Status"]` | `.../OrderFilters.tsx:31` | high | options: All, Pending, Paid |
| `orders.refund-button` | button "Refund" | `role=dialog >> role=button[name="Refund"]` | `.../RefundDialog.tsx:58` | medium | scoped to dialog; a bare match also hits the row action |

## Flows

### Filter orders by status

Preconditions: authenticated `staff`.

1. `navigate` → `/orders`
2. `assertVisible` → `orders.list-heading`
3. `select` → `orders.status-filter` = `Pending`
4. `assertText` → `orders.result-count` contains `<expected count>`

### Refund a paid order

Preconditions: authenticated `admin`; one order in `paid` state.

1. `navigate` → `/orders/<orderId>`
2. `click` → `orders.refund-button`
3. `fill` → `orders.refund-reason` = `<reason text>`
4. `click` → `orders.refund-confirm`
5. `assertText` → `orders.status-badge` contains `Refunded`

> Destructive. Do not run against an environment with real orders.

## Contract gaps

- The refund confirmation is a toast that auto-dismisses in ~4s. Step 5 asserts the badge
  instead, but a `waitFor` action would make the toast itself assertable.
- `/orders/[id]` is dynamic; `assertKnownPath` exact-matches, so only the seeded example
  path is navigable today.
- No way to assert the URL after a redirect (`assertUrl`).

## Open questions

- Can `staff` see the refund button at all, or is it hidden vs. disabled? The component
  reads `canRefund` but the derivation is server-side (`lib/permissions.ts:88`).
```

### Rules for the flow list

- Steps use **only** the six actions, written `action` → `target` (= `value` where the
  action takes one).
- Every `target` must exist in the Targets table of this file or of `shell.md`.
- Values the planner must supply are `<angle-bracket placeholders>`, never invented data.
- Mark destructive flows with a blockquote. The planner needs to know before it composes.

## `qa-knowledge/routes.md`

One table, every route, sorted by path:

| path | module | page file | auth | dynamic | purpose |
| --- | --- | --- | --- | --- | --- |
| `/` | dashboard | `app/(app)/page.tsx` | session | no | landing after sign-in |
| `/orders/[id]` | orders | `app/(app)/orders/[id]/page.tsx` | session | `id` | single order detail |

## `qa-knowledge/index.md`

The registry the next session reads first:

| module | routes | targets | flows | status | lastUpdated |
| --- | --- | --- | --- | --- | --- |
| shell | – | 9 | 1 | verified | 2026-09-17 |
| orders | 4 | 17 | 5 | drafted | 2026-09-17 |
| inventory | 6 | 0 | 0 | pending | – |

Below the table: the agreed module priority order, the roles in use, and a short
`Known gaps` list rolled up from the modules.

## `qa-knowledge/.progress.json`

```json
{
  "targetRepo": "/abs/path/to/app",
  "generatedBy": "build-qa-knowledge",
  "phase": 2,
  "modules": {
    "shell":     { "status": "verified", "files": ["app/(app)/layout.tsx"] },
    "orders":    { "status": "drafted",  "files": ["app/(app)/orders/page.tsx"] },
    "inventory": { "status": "pending",  "files": ["app/(app)/inventory/page.tsx"] }
  },
  "checkpoints": { "1": "confirmed", "2": "confirmed", "3": null, "4": null }
}
```

`files` is the Phase 0 file→module map. Later phases read only their module's slice — that
is the whole reason Phase 0 exists.

## `qa-knowledge/application.json`

Compiled in Phase 3. Same shape `ai-qa-runner` already consumes, plus inert metadata:

```json
{
  "pages": {
    "dashboard": "/",
    "orders": "/orders",
    "order-detail-example": "/orders/ord_demo_1"
  },
  "targets": {
    "orders.list-heading": {
      "selector": "role=heading[name=\"Orders\"]",
      "module": "orders",
      "confidence": "high",
      "fallbacks": ["h1:has-text('Orders')"],
      "verifiedAt": "2026-09-17"
    }
  }
}
```

`resolveTarget` reads `.selector` and ignores the rest, so this drops in with no runner
change. Do not emit `unresolved` targets into the registry — an entry that does not resolve
turns a planning error into a confusing runtime failure. Leave them in the module markdown
and in `index.md`'s `Known gaps`.
