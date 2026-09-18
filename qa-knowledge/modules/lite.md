---
module: lite
routes: 77
targets: 12
flows: 6
status: drafted
lastUpdated: 2026-09-17
---

# lite

## Purpose

oboda Lite is a reduced edition of the product for smaller businesses: the same application,
fewer modules, its own route tree under `/companies/{companyId}/lite/*`, and a subscription
lifecycle (trial → subscribed → lapsed) the Prime edition does not have.

## The one thing to know first

**Lite pages render the same components as v2.** `lite/sales-orders/index.tsx` is four lines
that render `@/v2/SalesOrders/OrdersTable`; `lite/products/index.tsx` renders
`@/v2/Products/ProductsPage`; `lite/users` and `lite/settings` both render `@/v2/Settings`.

So **the v2 module targets are the lite targets.** To compose a Lite plan, take the flow from
`v2-sales.md`, `v2-inventory.md` or `v2-purchasing.md` and swap the path segment `/v2/` for
`/lite/`. Do not expect a parallel set of `lite.*` targets — only genuinely Lite-specific
surfaces are defined below.

What differs is the *feature set*, not the markup: a handful of controls are hidden in Lite
(for example "Save as Quotation" on the sales order form, because Lite has no Quotations
module). Those exclusions are noted in the v2 module files.

## Routes

77 routes, mirroring the v2 tree minus the modules Lite does not ship. The full list is in
`routes.md`; the shape is:

| area | lite path | equivalent v2 module |
| --- | --- | --- |
| sales orders | `/companies/{companyId}/lite/sales-orders…` | `v2-sales` |
| quick checkout | `/companies/{companyId}/lite/quick-checkout…` | `v2-sales` |
| sales agents, sales services | `…/lite/sales-agents…`, `…/lite/sales-services…` | `v2-sales` |
| purchase orders, purchase services, suppliers | `…/lite/purchase-orders…` etc. | `v2-purchasing` |
| products, stocktakes, stock adjustments, stock transfers, locations, transactions | `…/lite/products…` etc. | `v2-inventory` |
| expenses | `…/lite/expenses…` | `v2-finance` |
| customers, contacts, settings, users, oGPT | `…/lite/customers…` etc. | `v2-masterdata` |
| reports | `…/lite/reports/*` (17 pages) | — (v2 reports are out of scope) |
| import | `…/lite/customers/import`, `…/lite/products/import`, `…/lite/suppliers/import` | Lite-only |

The Lite signup and marketing funnel (`/lite/signup`, `/lite/verify-email`, `/lite/check-email`,
`/lite/thank-you`) is **not** under `/companies/` and belongs to `shell` — see `routes.md`.

## Preconditions

- **`companyId` must be bound to a LITE tenant.** This is the hard precondition for the whole
  module and it is mutually exclusive with every `v2-*` module: `authenticatedV2` resolves a
  tier route during render, forcing a Lite company into `/lite/*` and a Prime company into
  `/v2` / `/v3`. One tenant cannot serve both. Bind a second `companyId` for Lite work.
- **The subscription state changes what renders.** `resolveLiteAccessState` returns one of
  `TRIAL`, `SUBSCRIBED`, `LAPSED`, `FULL` or `NOT_LITE`:
  - `LAPSED` keeps read access but blocks writes server-side and shows a persistent banner —
    any create or update flow will fail against a lapsed tenant, correctly.
  - `NOT_LITE` renders a "Lite unavailable" notice instead of the page.
  - `TRIAL` adds a trial badge to the navbar.
  A flow that writes must run against a `TRIAL` or `SUBSCRIBED` tenant.
- Lite pages carry **no `useRequirePermission` gate** — the v2 pages assert categories, the Lite
  pages do not. Access is governed by tier and subscription instead. Category permissions still
  apply server-side.
- A superuser can always reach Lite routes regardless of subscription state.

## Targets

For everything that mirrors v2, use the v2 module's targets unchanged. Lite-specific:

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `lite.signup-company-name-input` | textbox "Company Name" | `role=textbox[name="Company Name"]` | `lite/landing/auth/LiteSignupCard.tsx:130` | medium | signup funnel, outside `/companies/` |
| `lite.login-email-input` | textbox "Email" | `role=textbox[name="Email"]` | `lite/landing/auth/LiteLoginCard.tsx:83` | medium | the Lite landing page has its own login card, separate from `/sign-in` |
| `lite.login-password-input` | textbox "Password" | `role=textbox[name="Password"]` | `lite/landing/auth/LiteLoginCard.tsx:85` | medium | |
| `lite.profile-first-name-input` | textbox "First name" | `role=textbox[name="First name"]` | `lite/onboarding/LiteProfileModal.tsx:298` | medium | onboarding modal, shown once |
| `lite.profile-last-name-input` | textbox "Last name" | `role=textbox[name="Last name"]` | `lite/onboarding/LiteProfileModal.tsx:306` | medium | |
| `lite.profile-phone-input` | textbox "Phone number (optional)" | `role=textbox[name="Phone number (optional)"]` | `lite/onboarding/LiteProfileModal.tsx:317` | medium | the label includes "(optional)" — match it exactly |
| `lite.welcome-modal-close-button` | button "Close" | `role=button[name="Close"]` | `lite/onboarding/LiteWelcomeModal.tsx:57` | medium | blocks the page until dismissed on first load |
| `lite.onboarding-mark-completed-button` | button "Mark onboarding as completed" | `role=button[name="Mark onboarding as completed"]` | `lite/onboarding/LiteOnboardingImporter.tsx:131` | medium | |
| `lite.invite-full-name-input` | textbox "Full name" | `role=textbox[name="Full name"]` | `lite/onboarding/LiteInviteTeammateStep.tsx:258` | medium | |
| `lite.invite-confirm-password-input` | textbox "Confirm password" | `role=textbox[name="Confirm password"]` | `lite/onboarding/LiteInviteTeammateStep.tsx:339` | medium | |
| `lite.expert-call-dismiss-button` | button "Dismiss expert call invitation" | `role=button[name="Dismiss expert call invitation"]` | `lite/LiteExpertCallStrip.tsx:99` | low | promotional strip, conditionally shown |
| `lite.import-help-dismiss-button` | button "Dismiss import help" | `role=button[name="Dismiss import help"]` | `lite/onboarding/LiteImportHelpPanel.tsx:83` | low | |

## Flows

### Open the Lite sales orders list

Preconditions: signed in; `{companyId}` bound to a **LITE** tenant.

1. `navigate` → `/companies/{companyId}/lite/sales-orders`
2. `assertText` → `shell.breadcrumb` contains `Sales Orders`
3. `assertVisible` → `v2-sales.orders-create-button`

Step 3 uses a `v2-sales` target deliberately — the page is the same component. This is the
pattern for every mirrored Lite route.

### Find a Lite product

Preconditions: signed in; LITE tenant; `{recordCode}` bound.

1. `navigate` → `/companies/{companyId}/lite/products`
2. `fill` → `shell.table-search` = `<recordCode>`
3. `assertVisible` → `v2-inventory.product-row`

### Create a Lite customer

Preconditions: signed in; LITE tenant in `TRIAL` or `SUBSCRIBED` state (**not** `LAPSED`).

1. `navigate` → `/companies/{companyId}/lite/customers/create`
2. `fill` → `v2-masterdata.customer-name-input` = `<customer name>`
3. `click` → `v2-masterdata.customer-submit`
4. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Against a `LAPSED` tenant this fails at step 3 — correctly, since writes are
> blocked server-side — but the failure will read as a broken submit.

### Dismiss the Lite welcome modal

Preconditions: signed in as a Lite user who has not completed onboarding.

1. `navigate` → `/companies/{companyId}/lite`
2. `assertVisible` → `lite.welcome-modal-close-button`
3. `click` → `lite.welcome-modal-close-button`

Worth running first in any Lite session: the modal covers the page, and a flow that does not
expect it will fail on its first click with no obvious cause.


### Complete Lite onboarding

Preconditions: signed in to a LITE tenant with onboarding in progress.

1. `navigate` → `/companies/{companyId}/lite`
2. `click` → `lite.onboarding-mark-completed-button`

> Changes tenant state permanently — onboarding cannot be reset from the UI, so this flow runs
> once per tenant and then its target disappears.

No assertion: the outcome is that an onboarding panel stops rendering, and the vocabulary cannot
assert absence.

### Dismiss the Lite promotional strips

Preconditions: signed in to a LITE tenant where the strips are showing.

1. `navigate` → `/companies/{companyId}/lite`
2. `click` → `lite.expert-call-dismiss-button`
3. `click` → `lite.import-help-dismiss-button`

Both are one-shot and conditional — once dismissed they do not return, so this flow is not
repeatable and either step may find nothing. Worth running first in a Lite session for the same
reason as the welcome modal: the strips displace the page and can push a later target out of
view.

### Route flows — every page in this module

77 routes, each reachable by the same three-step shape. This table is the flow: read a row and
emit it. The longer flows above are the ones worth writing by hand; these are the baseline that
proves every page renders for the bound role.

```
navigate    → <path>
assertText  → shell.breadcrumb contains <breadcrumb>
assertVisible → <guard>          (skip when the guard column is —)
```

Breadcrumb values are **exact**: they come from the app's own route-to-label table
(`parseRouteForBreadcrumbs.ts`), not from guessing at the URL. `assertText` is a substring
match, so the value below is safe to assert verbatim. A create page's crumb is lowercase after
"New" — `New sales order`, not `New Sales Order`.

| page name | navigate | breadcrumb contains | guard | notes |
| --- | --- | --- | --- | --- |
| `lite.contacts-create` | `/companies/{companyId}/lite/contacts/create` | `New contact` | — |  |
| `lite.contacts-list` | `/companies/{companyId}/lite/contacts` | `Contacts` | `shell.table` |  |
| `lite.contacts-update` | `/companies/{companyId}/lite/contacts/{contactId}/update` | `Contact` | — | breadcrumb shows the record code once it loads |
| `lite.customers-create` | `/companies/{companyId}/lite/customers/create` | `New customer` | — |  |
| `lite.customers-import` | `/companies/{companyId}/lite/customers/import` | `Import` | — |  |
| `lite.customers-list` | `/companies/{companyId}/lite/customers` | `Customers` | `shell.table` |  |
| `lite.customers-update` | `/companies/{companyId}/lite/customers/{customerId}/update` | `Customer` | — | breadcrumb shows the record code once it loads |
| `lite.expenses-create` | `/companies/{companyId}/lite/expenses/create` | `New expense` | — |  |
| `lite.expenses-list` | `/companies/{companyId}/lite/expenses` | `Expenses` | `shell.table` |  |
| `lite.expenses-update` | `/companies/{companyId}/lite/expenses/{expenseId}/update` | `Expense` | — | breadcrumb shows the record code once it loads |
| `lite.home` | `/companies/{companyId}/lite` | `Dashboard` | — |  |
| `lite.inventory-locations-detail` | `/companies/{companyId}/lite/inventory-locations/{inventoryLocationId}` | `Inventory Location` | — | breadcrumb shows the record code once it loads |
| `lite.inventory-locations-list` | `/companies/{companyId}/lite/inventory-locations` | `Inventory Locations` | `shell.table` |  |
| `lite.inventory-locations-qr-codes` | `/companies/{companyId}/lite/inventory-locations/qr-codes` | `Qr Codes` | — |  |
| `lite.inventory-reports-list` | `/companies/{companyId}/lite/inventory-reports` | `Inventory Reports` | `shell.table` |  |
| `lite.inventory-transactions-list` | `/companies/{companyId}/lite/inventory-transactions` | `Inventory Transactions` | `shell.table` |  |
| `lite.oGPT-list` | `/companies/{companyId}/lite/oGPT` | `oGPT` | `shell.table` |  |
| `lite.products-create` | `/companies/{companyId}/lite/products/create` | `New product` | — |  |
| `lite.products-detail` | `/companies/{companyId}/lite/products/{productId}` | `Product` | — | breadcrumb shows the record code once it loads |
| `lite.products-import` | `/companies/{companyId}/lite/products/import` | `Import` | — |  |
| `lite.products-list` | `/companies/{companyId}/lite/products` | `Products` | `shell.table` |  |
| `lite.products-update` | `/companies/{companyId}/lite/products/{productId}/update` | `Product` | — | breadcrumb shows the record code once it loads |
| `lite.purchase-orders-create` | `/companies/{companyId}/lite/purchase-orders/create` | `New purchase order` | — |  |
| `lite.purchase-orders-list` | `/companies/{companyId}/lite/purchase-orders` | `Purchase Orders` | `shell.table` |  |
| `lite.purchase-orders-update` | `/companies/{companyId}/lite/purchase-orders/{purchaseOrderId}/update` | `Purchase Order` | — | breadcrumb shows the record code once it loads |
| `lite.purchase-orders-upload-with-ovision` | `/companies/{companyId}/lite/purchase-orders/upload-with-ovision` | `Upload with oVision` | — |  |
| `lite.purchase-services-create` | `/companies/{companyId}/lite/purchase-services/create` | `New purchase service` | — |  |
| `lite.purchase-services-list` | `/companies/{companyId}/lite/purchase-services` | `Purchase Services` | `shell.table` |  |
| `lite.purchase-services-update` | `/companies/{companyId}/lite/purchase-services/{purchaseServiceId}/update` | `Purchase Service` | — | breadcrumb shows the record code once it loads |
| `lite.purchasing-reports-list` | `/companies/{companyId}/lite/purchasing-reports` | `Purchasing Reports` | `shell.table` |  |
| `lite.quick-checkout-list` | `/companies/{companyId}/lite/quick-checkout` | `Quick Checkout` | `shell.table` |  |
| `lite.quick-checkout-order-receipts` | `/companies/{companyId}/lite/quick-checkout/order-receipts` | `Order Receipts` | — |  |
| `lite.reports-collections-report` | `/companies/{companyId}/lite/reports/collections-report` | `Collections Report` | — |  |
| `lite.reports-current-inventory-value` | `/companies/{companyId}/lite/reports/current-inventory-value` | `Current Inventory Value` | — |  |
| `lite.reports-customer-aging-accounts-receivable` | `/companies/{companyId}/lite/reports/customer-aging-accounts-receivable` | `Customer Aging Accounts Receivable` | — |  |
| `lite.reports-customer-sales` | `/companies/{companyId}/lite/reports/customer-sales` | `Customer Sales` | — |  |
| `lite.reports-customer-statement-of-account` | `/companies/{companyId}/lite/reports/customer-statement-of-account` | `Customer Statement Of Account` | — |  |
| `lite.reports-history` | `/companies/{companyId}/lite/reports/history` | `History` | — |  |
| `lite.reports-inventory-by-date` | `/companies/{companyId}/lite/reports/inventory-by-date` | `Inventory By Date` | — |  |
| `lite.reports-inventory-per-location` | `/companies/{companyId}/lite/reports/inventory-per-location` | `Inventory Per Location` | — |  |
| `lite.reports-list` | `/companies/{companyId}/lite/reports` | `Reports` | `shell.table` |  |
| `lite.reports-order-items-report` | `/companies/{companyId}/lite/reports/order-items-report` | `Order Items Report` | — |  |
| `lite.reports-products` | `/companies/{companyId}/lite/reports/products` | `Products` | — |  |
| `lite.reports-purchase-order-items-report` | `/companies/{companyId}/lite/reports/purchase-order-items-report` | `Purchase Order Items Report` | — |  |
| `lite.reports-receiving-items-report` | `/companies/{companyId}/lite/reports/receiving-items-report` | `Receiving Items Report` | — |  |
| `lite.reports-releasing-items-report` | `/companies/{companyId}/lite/reports/releasing-items-report` | `Releasing Items Report` | — |  |
| `lite.reports-sales-order-services` | `/companies/{companyId}/lite/reports/sales-order-services` | `Sales Order Services` | — |  |
| `lite.reports-sales-orders-report` | `/companies/{companyId}/lite/reports/sales-orders-report` | `Sales Orders Report` | — |  |
| `lite.reports-sales-report-by-product-type` | `/companies/{companyId}/lite/reports/sales-report-by-product-type` | `Sales Report By Product Type` | — |  |
| `lite.sales-agents-create` | `/companies/{companyId}/lite/sales-agents/create` | `New sales agent` | — |  |
| `lite.sales-agents-list` | `/companies/{companyId}/lite/sales-agents` | `Sales Agents` | `shell.table` |  |
| `lite.sales-agents-update` | `/companies/{companyId}/lite/sales-agents/{salesAgentId}/update` | `Sales Agent` | — | breadcrumb shows the record code once it loads |
| `lite.sales-orders-analytics` | `/companies/{companyId}/lite/sales-orders/analytics` | `Analytics` | — |  |
| `lite.sales-orders-create` | `/companies/{companyId}/lite/sales-orders/create` | `New sales order` | — |  |
| `lite.sales-orders-list` | `/companies/{companyId}/lite/sales-orders` | `Sales Orders` | `shell.table` |  |
| `lite.sales-orders-update` | `/companies/{companyId}/lite/sales-orders/{orderId}/update` | `Sales Order` | — | breadcrumb shows the record code once it loads |
| `lite.sales-orders-upload-with-ovision` | `/companies/{companyId}/lite/sales-orders/upload-with-ovision` | `Upload with oVision` | — |  |
| `lite.sales-reports-list` | `/companies/{companyId}/lite/sales-reports` | `Sales Reports` | `shell.table` |  |
| `lite.sales-services-create` | `/companies/{companyId}/lite/sales-services/create` | `New sales service` | — |  |
| `lite.sales-services-list` | `/companies/{companyId}/lite/sales-services` | `Sales Services` | `shell.table` |  |
| `lite.sales-services-update` | `/companies/{companyId}/lite/sales-services/{salesServiceId}/update` | `Sales Service` | — | breadcrumb shows the record code once it loads |
| `lite.settings-list` | `/companies/{companyId}/lite/settings` | `Settings` | `shell.table` |  |
| `lite.stock-adjustments-create` | `/companies/{companyId}/lite/stock-adjustments/create` | `New stock adjustment` | — |  |
| `lite.stock-adjustments-list` | `/companies/{companyId}/lite/stock-adjustments` | `Stock Adjustments` | `shell.table` |  |
| `lite.stock-adjustments-update` | `/companies/{companyId}/lite/stock-adjustments/{adjustmentId}/update` | `Stock Adjustment` | — | breadcrumb shows the record code once it loads |
| `lite.stock-transfers-create` | `/companies/{companyId}/lite/stock-transfers/create` | `New stock transfer` | — |  |
| `lite.stock-transfers-list` | `/companies/{companyId}/lite/stock-transfers` | `Stock Transfers` | `shell.table` |  |
| `lite.stock-transfers-update` | `/companies/{companyId}/lite/stock-transfers/{transferId}/update` | `Stock Transfer` | — | breadcrumb shows the record code once it loads |
| `lite.stock-transfers-upload-with-ovision` | `/companies/{companyId}/lite/stock-transfers/upload-with-ovision` | `Upload with oVision` | — |  |
| `lite.stocktakes-create` | `/companies/{companyId}/lite/stocktakes/create` | `New stocktake` | — |  |
| `lite.stocktakes-list` | `/companies/{companyId}/lite/stocktakes` | `Stocktakes` | `shell.table` |  |
| `lite.stocktakes-update` | `/companies/{companyId}/lite/stocktakes/{stocktakeId}/update` | `Stocktake` | — | breadcrumb shows the record code once it loads |
| `lite.suppliers-create` | `/companies/{companyId}/lite/suppliers/create` | `New supplier` | — |  |
| `lite.suppliers-import` | `/companies/{companyId}/lite/suppliers/import` | `Import` | — |  |
| `lite.suppliers-list` | `/companies/{companyId}/lite/suppliers` | `Suppliers` | `shell.table` |  |
| `lite.suppliers-update` | `/companies/{companyId}/lite/suppliers/{supplierId}/update` | `Supplier` | — | breadcrumb shows the record code once it loads |
| `lite.users-list` | `/companies/{companyId}/lite/users` | `Users` | `shell.table` |  |

## Verification status

**Not verified, and not verifiable on the tenant used for Phase 4.** The 2026-09-17/18 run was
against a **Prime** company (10004). Tier routing forces a Prime tenant onto `/v2` and `/v3`, so
no `/lite/*` route and none of the 12 Lite-specific targets in this file were reachable.

Verifying this module needs a second `companyId` bound to a **LITE** tenant. Everything that
mirrors v2 should inherit the v2 verification results, since the components are identical — but
the Lite-only surfaces (signup, onboarding modals, promotional strips) have never been resolved
against a browser.

## Contract gaps

Everything in `v2-sales.md` applies, since the components are the same. Specific to Lite:

- **Onboarding modals are stateful and one-shot.** The welcome modal, profile modal and import
  help panel appear based on stored progress, so the same flow behaves differently on a fresh
  tenant and a used one — and there is no way to reset them from a plan.
- **The import pages are file uploads.** `lite/customers/import`, `lite/products/import` and
  `lite/suppliers/import` are the Lite onboarding path and none of them can be driven.
- **Subscription state is invisible to a plan.** Nothing can assert "this tenant is on trial"
  beyond looking for the trial badge, and nothing can change state to test the lapsed path.
- **17 Lite report pages are unmapped** — same reasoning as the excluded v2 reports.

## Open questions

- **Which v2 controls are hidden in Lite has only been spot-checked.** "Save as Quotation" is
  confirmed hidden. Others almost certainly are too, and a plan reusing a v2 target may find it
  absent. Each mirrored flow needs verification against a real Lite tenant.
- **The Lite landing page has its own login card** (`LiteLoginCard`) separate from `/sign-in`.
  Which one a Lite user actually authenticates through was not determined, so no Lite sign-in
  flow is drafted — use `shell.md`'s.
- **`lite/users` and `lite/settings` render the same `Settings` component** at two paths. What
  differs between them is not known.
- **No Lite tenant was available to check any of this against.** Every statement here is derived
  from the page files and the tier-routing logic. This module is the least verified in the
  knowledge base.
