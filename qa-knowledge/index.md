# Module registry

Phase 1 and Phase 2 complete: every in-scope route is mapped and parametrized, and every module
has a file. Phase 3 (compile) is automated — see `scripts/`. **Phase 4 (verification against a
running app) has not been done.**

| module | routes | targets | named flows | status | lastUpdated |
| --- | --- | --- | --- | --- | --- |
| shell | 23 | 46 | 9 | drafted | 2026-09-18 |
| v2-sales | 26 | 43 | 15 | drafted | 2026-09-18 |
| v2-sales-order-record | 1 | 47 | 14 | drafted | 2026-09-18 |
| v2-purchasing | 23 | 52 | 15 | drafted | 2026-09-18 |
| v2-purchase-order-record | 1 | 35 | 9 | drafted | 2026-09-18 |
| v2-inventory | 35 | 119 | 29 | drafted | 2026-09-18 |
| v2-finance | 15 | 61 | 15 | drafted | 2026-09-18 |
| v2-masterdata | 29 | 66 | 13 | drafted | 2026-09-18 |
| v3-analytics | 6 | 13 | 6 | drafted | 2026-09-18 |
| lite | 77 | 12 | 6 | drafted | 2026-09-18 |

**234 routes, 482 targets, 126 named flows** — plus a route-flow table in every module giving the three-step shape for all 234 pages. Coverage is audited, not assumed: `scripts/audit.mjs` reports **234/234 pages** reachable by a flow and `scripts/validate.mjs` reports **0 of 169 action targets uninvoked**. Status values: `pending` → `recon` → `drafted` →
`verified`. **Every module is `drafted`: nothing here has been run against the application.**
Only Phase 4 verification may promote a module to `verified`, and until it does, every selector
is a hypothesis derived by reading the source.

## Depth, by module

The modules were written in priority order and the depth reflects it. Read this before trusting
a module's coverage:

| module | depth |
| --- | --- |
| `shell` | Deep. Sign-in, rail, breadcrumb, toast, dialogs and the shared list-page primitives every other module reuses. |
| `v2-sales` | Deep. The list, the order header and all five confirmation dialogs. |
| `v2-sales-order-record` | Deep. The tabbed record workspace behind `/sales-orders/{orderId}/update` — collections, releasings, returns, refunds, printing, attachments, audit logs. Adds no routes; it is depth on one page. |
| `v2-purchase-order-record` | Deep. The same treatment for `/purchase-orders/{purchaseOrderId}/update` — receivings, payments, returns, refunds. Every tab is gated on its own permission. |
| `v2-purchasing` | Deep. PO form and dialogs, receivings, requisitions, suppliers. |
| `v2-inventory` | Good. Document surfaces plus the record tabs for products (13 tabs), stocktakes, adjustments, transfers and releasings. Thin on dispatches and the generators. |
| `v2-finance` | Record tabs for payments, expenses and bank accounts, but **no form field targets for any finance entity.** |
| `v2-masterdata` | Customers are complete, including all 12 record tabs; contacts have their tabs. The rest of this catch-all module is shallow. |
| `v3-analytics` | Tabs and a few controls. Read-only analytics, so there is little to drive. |
| — | **AI surfaces are out of scope** by decision: oGPT, the AI INSIGHTS record tabs and the oGPT changelog carry no targets or flows. |
| `lite` | Deliberately thin — Lite renders the same components as v2, so it points at the v2 targets rather than duplicating them. |

## Where to start verifying

`shell` first — every other module's flows depend on sign-in and the breadcrumb assertion, so a
wrong selector there invalidates everything else. Then `v2-masterdata`'s customer flows: they are
the only create flows that are complete end to end (no line-item grid), which makes them the
cleanest test of whether the form conventions in this knowledge base are right. Then sales and
purchasing.

## Roles

The repo documents a hierarchy of **superuser > company admin > module admin > user**, with
per-procedure gates (`authPermission` READ/WRITE/DELETE, `authCategory`) and a `SHOW_PRICES`
permission that hides financial columns.

Like every other environment-dependent value, the role a run authenticates as is a
**parameter**, not something this knowledge base pins down. What Phase 2 does record, per
module, is which targets and flows are role-dependent — an approve button that only a company
admin renders, a financial column `SHOW_PRICES` hides — so the caller knows which role a flow
needs before binding one.

## Verification status (Phase 4)

Run 2026-09-17/18 against **releasing.oboda.app**, Prime company **10004**, as an admin user.
Harness and raw results in `scripts/verify/` (`report-2026-09-18.json`). Read-only: the probe
navigates, clicks tabs and opens dialogs, and counts matches. It never clicks a submit, confirm
or delete.

| module | targets | verified (1 match) | ambiguous (>1) | 0 matches | not probed |
| --- | ---: | ---: | ---: | ---: | ---: |
| shell | 46 | 29 | 0 | 16 | 1 |
| v2-sales | 43 | 20 | 1 | 22 | 0 |
| v2-sales-order-record | 50 | 26 | 3 | 21 | 0 |
| v2-purchasing | 52 | 38 | 0 | 13 | 1 |
| v2-purchase-order-record | 35 | 15 | 0 | 20 | 0 |
| v2-inventory | 110 | 81 | 1 | 24 | 4 |
| v2-finance | 62 | 48 | 1 | 12 | 1 |
| v2-masterdata | 66 | 59 | 0 | 7 | 0 |
| v3-analytics | 13 | 0 | 0 | 13 | 0 |
| lite | 12 | 0 | 0 | 0 | 12 |
| **total** | **489** | **315** | **7** | **148** | **19** |

**315 of 489 selectors resolve to exactly one element; 7 are ambiguous.** The zeros are
dominated by record state, unopened dialogs and tenant configuration — the breakdown is below.

### Form fields (added 2026-09-18)

167 form-field targets across `v2-finance`, `v2-inventory` and `v2-masterdata`, **101 verified**.
Without these a plan could open a page and click Save but never fill anything in, so every create
and edit flow was a stub.

They are addressed through the form primitive's own authored attribute:

```
[data-field='<field name>'] :is(input,textarea):not([aria-hidden])
```

`_common/Form/Field.tsx:121` sets `data-field={name}` on every field wrapper, whatever the type.
Verification killed the obvious alternative: `input[id='<name>']` matched **0** for every
multiline field (renders a `<textarea>`, plus a hidden autosize twin) and **0** for every date
field (`DatePicker` never passes an `id`, and its `<label htmlFor>` therefore points at nothing,
so accessible-name matching is not a fallback either).

**Routes:** 154/157 Prime paths returned 200; `/404`, `/sign-up` and `/auth-callback` are correct
exceptions. The `pages` half of the registry is verified.

**Registry after verification:** 398 targets plus **7 held out as `unresolved`** — an ambiguous
selector is kept out of `application.json` entirely, so a plan can never pick one up. The six:
`v2-sales.order-delete-button`, `v2-sales-order-record.releasing-open-button`,
`v2-sales-order-record.releasing-print-button`, `v2-sales-order-record.attachments-files-heading`,
`v2-inventory.location-view-qr-button`, `v2-masterdata.customer-row`.

### What verification caught that reading source could not

- **`role=button[name="Create"]` matched 2 everywhere** — 18 targets, one cause: the rail has its
  own global Create menu that collides with each list page's Create button. Fixed to
  `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')`, re-tested on 10 list
  pages at exactly 1 each.
- **`shell.account-button` matched 0.** The avatar renders the user's initial inside the button,
  so the accessible name is `"P Account"`, not `"Account"`. Now a substring match.
- **`shell.sidenav-help` matched 0.** Help sits in the rail *footer*, outside the `<nav>`, so the
  `nav`-scoped selector could never find it.
- **Every `*-row` selector matched 0.** `tr:has(td:text-is('CODE'))` fails because `:text-is`
  resolves to the innermost element holding the text — the code is nested in `Stack > a >
  Typography`, so the `td` itself never matches. All six changed to `:has-text()`.
- **Four per-row buttons are ambiguous**, as their notes predicted: `releasing-open-button`
  matched **9** on a real order, `order-delete-button` **4**, `location-view-qr-button` **4**,
  `releasing-print-button` **2**.

### Confirmed correct

`Typography component='h1'` does expose a `heading` role. `role=` name matching is exact —
`[name="Sign in with email"]` never collided with the `Sign in` submit. Rail flyout items resolve
to 1 **after** clicking the section tile and 0 before, exactly as documented. Only one
`role=tabpanel` is in the DOM at a time. Uppercase tab labels are real.

### The 138 zero-match targets are not 138 broken selectors

A zero means "not present on the page and in the state the probe reached". Three causes dominate:

- **Record state.** The biggest group. Buttons like `*-complete-button`, `*-save-pending-button`,
  Lock, Override and Cancel only render for a record in the right status. The probe used whichever
  record happened to be first in each list — a completed stocktake has no Complete button. Testing
  these needs a record deliberately left in the required state.
- **Dialog-scoped confirms** whose dialog the probe never opened (it will not click a destructive
  trigger on a shared environment).
- **Tenant configuration.** All 13 `v3-analytics` targets: the dashboard renders but contains
  **zero** `role=tab` elements, because the tab bar is built from per-section permission flags.
  Likewise Xero panels, channel importers and `shell.table-filter-button` (the sales-orders list
  uses chip filters instead).

None of these were re-derived as wrong. They are simply unproven, and the module files say so.

### Still unverified

**127 targets were never reached** by these plans, and **all 12 `lite` targets are unverifiable
on a Prime tenant** — tier routing blocks `/lite/*`, so that module needs a second `companyId`.
Modules therefore stay `drafted`.

## Known gaps

Rolled up from modules; added to as Phase 2 proceeds.

- **Path templates are not supported by the runner.** `assertKnownPath` in
  `ai-qa-runner/src/runner/execute-test-plan.ts` exact-matches `Object.values(pages)` against
  a literal path. `pages` here stores `{companyId}` / `{orderId}` templates, so every
  `navigate` step fails until the runner matches templates and substitutes bound params.
  Blocking for every module. See `README.md`.
- **Record ids are caller-supplied.** All 34 record-id params are `source: "parameter"`, by
  decision: this knowledge base does no seeding. A plan that navigates to a detail or update
  route is only as good as the id bound to it, so flows state the precondition ("an order in
  `pending` state") and leave the value to the caller.
- **Six actions, no waiting.** The vocabulary has no `waitFor`, no URL assertion, no list
  indexing, no file upload. Already visible as a problem for: `upload-with-ovision` routes
  (file upload), any toast-based confirmation, and any flow that asserts a redirect landed.
  Individual instances get recorded per module.
- **The `select` action is dead against this app.** Every v2 dropdown is a MUI `TextField select`
  — a `div[role=combobox]` plus a popover listbox, not a native `<select>` — and Playwright's
  `selectOption()` throws on anything but a real `<select>`. Workaround in the existing
  vocabulary: `click` the combobox, then `click` `shell.select-option` with `{optionLabel}` bound.
  Affects every module.
- **Data-grid cell inputs are unaddressable.** Inputs generated per row/column inside
  `_common/DataGrid` carry no stable id, so line-item entry — adding a product with a quantity to
  a sales or purchase order — cannot be expressed. This is the biggest blocker to real coverage
  and it will recur in every transactional module.
- **Parameters appear in selectors, not just paths.** Tenant-named controls (the rail's company
  switcher, the `/companies` picker) resolve through the `{companyName}` run parameter, so
  `resolveTarget` has to substitute bound values into selector strings the same way
  `assertKnownPath` must for paths. Same runner change, second half.
- **The rail's sub-menus open on hover only** (`SidenavItem.tsx:313`) and the vocabulary has no
  `hover`. Flows navigate by URL instead, so nothing is blocked — but the flyout contents are
  unreachable, so "does this role see Collections under Sales?" cannot be asserted.
- **`data-testid` is effectively absent** from the v2 surface (32 files repo-wide, almost all
  unit tests or `lite` components). Every target will be inferred from role, label, or text,
  so Phase 4 verification is not optional.
