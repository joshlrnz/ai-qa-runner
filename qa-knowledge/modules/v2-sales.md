---
module: v2-sales
routes: 26
targets: 43
flows: 15
status: drafted
lastUpdated: 2026-09-18
---

# v2-sales

## Purpose

Where a distributor raises and works an order: sales orders and their quotations, returns and
refunds, the collections posted against them, and the supporting master data (agents, services,
price matrices). The sales order create/update form is the centre of gravity — most other
routes are lists that feed it or records it produces.

## Routes

| page name | path | page file | permission gate |
| --- | --- | --- | --- |
| `v2-sales.sales-orders-list` | `/companies/{companyId}/v2/sales-orders` | `…/v2/sales-orders/index.tsx` | SALES READ |
| `v2-sales.sales-orders-create` | `/companies/{companyId}/v2/sales-orders/create` | `…/sales-orders/create.tsx` | SALES READ + WRITE + DELETE |
| `v2-sales.sales-orders-update` | `/companies/{companyId}/v2/sales-orders/{orderId}/update` | `…/sales-orders/[orderId]/update.tsx` | SALES READ |
| `v2-sales.sales-orders-analytics` | `/companies/{companyId}/v2/sales-orders/analytics` | `…/sales-orders/analytics.tsx` | SALES READ |
| `v2-sales.sales-orders-upload-with-ovision` | `/companies/{companyId}/v2/sales-orders/upload-with-ovision` | `…/sales-orders/upload-with-ovision.tsx` | SALES WRITE |
| `v2-sales.quotations-list` / `-update` | `…/v2/quotations…` | | SALES READ |
| `v2-sales.sales-collections-list` / `-create` / `-update` | `…/v2/sales-collections…` | | SALES READ, `SHOW_PRICES` |
| `v2-sales.sales-returns-list` / `-create` / `-update` | `…/v2/sales-returns…` | | SALES READ |
| `v2-sales.sales-refunds-list` | `…/v2/sales-refunds` | | SALES READ |
| `v2-sales.sales-agents-*`, `v2-sales.sales-services-*`, `v2-sales.sales-price-matrices-*` | | | SALES READ |
| `v2-sales.quick-checkout-list` / `-order-receipts` | `…/v2/quick-checkout…` | | RETAIL |
| `v2-sales.beat-route-pending-orders-list` | `…/v2/beat-route-pending-orders` | | `enableBeatRoute` company setting |

Full table in `routes.md`. Pages are thin: each one calls `useRequirePermission(…)` and renders
a single component from `@/v2/SalesOrders/**`, which is where every target below comes from.

## Preconditions

- Signed in, per `shell.md`.
- `companyId` bound to a **Prime** tenant. A Lite tenant is blocked from `/v2/*` during render
  (`authenticatedV2/index.tsx:127`) — the flow will look like it navigated and then fail on the
  first assertion.
- The bound role holds `SALES` READ; create and update additionally need WRITE, and the create
  page asserts DELETE as well (`sales-orders/create.tsx:9-13`).
- **`SHOW_PRICES` changes the page, not just a column.** Without it the collect bulk action is
  disabled (`OrdersTable/index.tsx:689`), the amount column is dropped, and the order form's
  money panel is hidden. Any flow asserting a total needs it.
- For anything but the create flow: an existing order, its `{orderId}` and `{recordCode}` bound.
- For the create flow: at least one active customer and one active product in the tenant.

## The record page is its own file

`/v2/sales-orders/{orderId}/update` is a tabbed workspace — Details, Collections, Releasings,
Returns, Refunds, Audit Logs, Attachments. **This file covers the list and the order header
(the Details tab) only.** Everything behind the other tabs — taking a payment, releasing stock,
accepting a return, issuing a refund — is in `v2-sales-order-record.md`.

Route it this way: if the instruction is about finding, creating, cancelling or deleting an
order, or changing a header field, it is here. If it is about what happens *to* an order after
it exists, it is in `v2-sales-order-record.md`.

## Targets

List-page chrome (`shell.table-*`) and the dropdown workaround (`shell.select-option`) live in
`shell.md` — every v2 module reuses them unchanged.

### Sales orders list

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales.orders-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `OrdersTable/index.tsx:772` | high | `_common/IconButton` renders a real `<button>`; the label text is the accessible name **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-sales.orders-import-button` | button "Import" | `role=button[name="Import"]` | `OrdersTable/index.tsx:739` | high | opens a menu of channel importers **verified 2026-09-17**: 1 match. |
| `v2-sales.orders-ovision-button` | button, name repeats "oVision" | `role=button[name*="oVision"]` | `OrdersTable/index.tsx:756` | high | the icon is `<img alt="oVision">`, so the name is "oVision oVision" — substring is deliberate **verified 2026-09-17**: 1 match. |
| `v2-sales.orders-row` | row containing the order code | `tr:has(td:has-text('{recordCode}'))` | `OrdersTable/getColumns.tsx:43` | high | content-scoped; the plan vocabulary has no row indexing **verified 2026-09-18**: 1 match. |
| `v2-sales.orders-row-code-link` | link showing the order code, inside its row | `tr:has(td:has-text('{recordCode}')) >> a:has-text('{recordCode}')` | `OrdersTable/getColumns.tsx:43` | high | the code cell is `Stack > a > Typography`; clicking it opens `/sales-orders/{orderId}/update`. **verified 2026-09-18**: 1 match and navigates, on DHIN-OR-00395. This is the only way to open an order when the caller has its code but not its id |
| `v2-sales.quotation-rejected-row` | row containing the code **and** a rejected status chip | `tr:has(td:has-text('{recordCode}')):has-text('rejected')` | `QuotationsTable` | high | **verified 2026-09-18**: 1 match on `/v2/quotations`. Status chips hold **lowercase** text in the DOM (`rejected`) and are capitalised by CSS, so `assertText … "Rejected"` fails; `has-text()` matches case-insensitively, which is why the status lives in the selector |
| `v2-sales.orders-empty-state` | text | `text=No sales orders found` | `OrdersTable/index.tsx:921` | medium | pairs with a search that matches nothing |

### Sales orders — bulk actions

Selecting rows reveals a selection bar carrying the bulk actions. The actions are assembled in
`OrdersTable/index.tsx:697-706` from `useSalesOrderBulkCollect`, `useSalesOrderBulkReleaseAction`,
`useSalesOrderBulkPrint` and `getBulkActions`. Row and select-all checkboxes are shared
primitives — see `shell.table-row-checkbox` and `shell.table-select-all-checkbox`.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales.bulk-collect-button` | button "Collect" | `role=button[name="Collect"]` | `…/SalesOrderBulkCollect/useSalesOrderBulkCollect.tsx:62` | medium | **`SHOW_PRICES` only** — the action is registered with `enabled: showPrices` (`OrdersTable/index.tsx:689`) |
| `v2-sales.bulk-release-button` | button "Release" | `role=button[name="Release"]` | `…/SalesOrderBulkRelease/useSalesOrderBulkReleaseAction.tsx:34` | medium | releases stock for every selected order |
| `v2-sales.bulk-print-button` | button "Print" | `role=button[name="Print"]` | `…/SalesOrderBulkPrint/useSalesOrderBulkPrint.tsx:108` | low | shares its name with the record page's Print button, but the two are never on screen together |
| `v2-sales.bulk-lock-button` | button "Lock" | `role=button[name="Lock"]` | `OrdersTable/getBulkActions.tsx:16` | medium | |
| `v2-sales.bulk-delete-button` | button "Delete" | `role=button[name="Delete"] >> visible=true` | `OrdersTable/getBulkActions.tsx:35` | high | soft delete. **verified 2026-09-18** on `/v2/quotations` with one row selected: 1 visible match; unselected, 0. The `visible=true` filter keeps it distinct from the record page's Delete trigger (held out as ambiguous) |
| `v2-sales.bulk-collect-date-input` | "Collection date" | `[data-field='collectionDate'] :is(input,textarea):not([aria-hidden])` | `…/SalesOrderBulkCollect/BulkCollectFields.tsx:41` | medium | in the bulk collect dialog |
| `v2-sales.bulk-collect-reference-input` | textbox "Reference number" | `[data-field='referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/BulkCollectFields.tsx:48` | medium | |

### Sales orders — filters

The Filter button opens a dialog of multi-selects; every v2 filter dialog submits with "Apply"
(`shell.filter-apply-button`). Applied filters then render as removable chips above the table.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales.filter-status-input` | combobox "Status" | `[data-field='status'] :is(input,textarea):not([aria-hidden])` | `OrdersTable/FiltersDialog/FiltersDialog.tsx:319` | medium | multi-select |
| `v2-sales.filter-delivery-status-input` | combobox "Delivery status" | `[data-field='deliveryStatus'] :is(input,textarea):not([aria-hidden])` | `…/FiltersDialog.tsx:344` | medium | |
| `v2-sales.filter-payment-status-input` | combobox "Payment status" | `[data-field='paymentStatus'] :is(input,textarea):not([aria-hidden])` | `…/FiltersDialog.tsx:353` | medium | |
| `v2-sales.filter-customer-input` | combobox "Customer" | `[data-field='customerIds'] :is(input,textarea):not([aria-hidden])` | `…/FiltersDialog.tsx:373` | medium | |
| `v2-sales.filter-product-input` | combobox "Product" | `[data-field='productIds'] :is(input,textarea):not([aria-hidden])` | `…/FiltersDialog.tsx:327` | medium | |
| `v2-sales.filter-payment-method-input` | combobox "Payment method" | `[data-field='paymentMethod'] :is(input,textarea):not([aria-hidden])` | `…/FiltersDialog.tsx:367` | medium | |
| `v2-sales.filter-sales-channel-input` | combobox "Sales channel" | `[data-field='salesChannelIds'] :is(input,textarea):not([aria-hidden])` | `…/FiltersDialog.tsx:390` | medium | |

### Sales order form (create and update)

Field inputs are addressed by `id`, not by label. `_common/Form/Field` renders
`<label htmlFor={name}>` against `<TextField id={name}>` (`Form/Label.tsx:10`,
`Form/TextInput.tsx:21`), so the association is real and `role=textbox[name="…"]` would work —
**except that a required field's label appends a nested `*` span** (`Form/Label.tsx:27`), which
lands inside the accessible name. `[data-field='…'] :is(input,textarea):not([aria-hidden])` sidesteps that entirely, is derived
mechanically from the field's `name` prop, and survives a copy change. Use it as the default for
every v2 form field; the role selector is recorded as the fallback.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales.order-customer-input` | combobox "Customer*" | `[data-field='billing.customerId'] :is(input,textarea):not([aria-hidden])` | `…/Details/Customer/CustomerAutocomplete.tsx:159` | high | MUI Autocomplete — `fill` to filter, then click the option **verified 2026-09-17**: 1 match. |
| `v2-sales.order-delivery-receipt-input` | textbox "Delivery receipt number" | `[data-field='billing.deliveryReceiptNumber'] :is(input,textarea):not([aria-hidden])` | `…/Details/Customer/index.tsx:288` | medium | |
| `v2-sales.order-remarks-input` | textbox | `[data-field='billing.remarks'] :is(input,textarea):not([aria-hidden])` | `…/Details/Customer/index.tsx:323` | medium | |
| `v2-sales.order-invoice-number-input` | textbox "Invoice number" | `[data-field='payment.invoiceNumber'] :is(input,textarea):not([aria-hidden])` | `…/Details/PaymentInformation/index.tsx:193` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales.order-reference-number-input` | textbox "Reference number" | `[data-field='payment.referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/Details/PaymentInformation/index.tsx:196` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales.order-payment-terms-select` | combobox "Payment terms" | `[data-field='payment.terms'] :is(input,textarea):not([aria-hidden])` | `…/Details/PaymentInformation/index.tsx:187` | low | MUI Select renders a div, not an input — needs the two-click workaround and Phase 4 must confirm the element |
| `v2-sales.order-add-product-button` | button "Add product" | `role=button[name="Add product"]` | `…/Details/OrderItemsDataGrid/index.tsx:994` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales.order-submit-create` | button "Save as Pending" | `role=button[name="Save as Pending"]` | `…/Details/index.tsx:679` | high | label is state-derived: create → "Save as Pending" **verified 2026-09-17**: 1 match. |
| `v2-sales.order-submit-update` | button "Save changes" | `role=button[name="Save changes"]` | `…/Details/index.tsx:679` | high | update → "Save changes" **verified 2026-09-17**: 1 match. |
| `v2-sales.order-submit-saving` | button "Saving..." | `role=button[name="Saving..."]` | `…/Details/index.tsx:679` | low | transient; only assertable mid-submit |
| `v2-sales.order-save-as-quotation-button` | button "Save as Quotation" | `role=button[name="Save as Quotation"]` | `…/Details/index.tsx:820` | high | create only, hidden in Lite and without quotation WRITE **verified 2026-09-17**: 1 match. |
| `v2-sales.order-cancel-button` | button "Cancel" | `role=button[name="Cancel"]` | `CreateUpdateForm/index.tsx:613` | high | opens `CancelOrderDialog`, does not cancel directly **verified 2026-09-17**: 1 match. |
| `v2-sales.order-delete-button` | button "Delete" | `role=button[name="Delete"]` | `CreateUpdateForm/index.tsx:672` | unresolved | opens `SalesOrderDeleteModal` **verified 2026-09-17: AMBIGUOUS — 4 matches.** Will throw on click. Needs scoping before use. |
| `v2-sales.order-duplicate-button` | button "Duplicate" | `role=button[name="Duplicate"]` | `CreateUpdateForm/index.tsx:665` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales.order-override-button` | button "Override" | `role=button[name="Override"]` | `CreateUpdateForm/index.tsx:628` | medium | |
| `v2-sales.order-lock-button` | button "Lock" | `role=button[name="Lock"]` | `CreateUpdateForm/index.tsx:644` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales.order-print-button` | button "Print" | `role=button[name="Print"]` | `CreateUpdateForm/index.tsx:604` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales.order-attach-file-button` | button "Attach file" | `role=button[name="Attach file"]` | `CreateUpdateForm/index.tsx:657` | high | opens a file picker the plan cannot drive **verified 2026-09-17**: 1 match. |

### Confirmation dialogs

Every destructive action opens a MUI `Dialog` (`role=dialog`) whose dismiss button is labelled
"Cancel" and whose confirm button repeats the verb. **Two of these collide with a page-level
button of the same name** — the delete confirm is also "Delete", and the cancel dialog's dismiss
is also "Cancel" — so confirm targets are scoped to the dialog. Do not unscope them.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales.order-cancel-confirm-button` | button "Cancel order" | `role=dialog >> role=button[name="Cancel order"]` | `…/CancelOrderDialog.tsx:77` | high | reads "Cancelling..." mid-flight **verified 2026-09-18**: 1 match. |
| `v2-sales.order-delete-confirm-button` | button "Delete" | `role=dialog >> role=button[name="Delete"]` | `…/SalesOrderDeleteModal.tsx:45` | medium | **must stay scoped** — the page trigger has the same name |
| `v2-sales.order-lock-confirm-button` | button "Lock order" | `role=dialog >> role=button[name="Lock order"]` | `…/LockOrderDialog.tsx:85` | high | gated behind a confirmation checkbox in the same dialog **verified 2026-09-18**: 1 match. |
| `v2-sales.order-override-confirm-button` | button "Override order" | `role=dialog >> role=button[name="Override order"]` | `…/OverrideOrderDialog.tsx:170` | medium | gated behind a confirmation checkbox |
| `v2-sales.order-duplicate-confirm-button` | button "Duplicate order" | `role=dialog >> role=button[name="Duplicate order"]` | `…/DuplicateOrderDialog.tsx:46` | high | **verified 2026-09-18**: 1 match. |
| `v2-sales.dialog-dismiss-button` | button "Cancel" | `role=dialog >> role=button[name="Cancel"]` | `…/SalesOrderDeleteModal.tsx:42` | high | the dismiss, shared by every dialog in this module **verified 2026-09-18**: 1 match. |

Status readouts on the update page render through `Attributes.Item` with labels `Status`,
`Payment status`, `Delivery status`, `Remaining due` (`CreateUpdateForm/index.tsx:733-744`).
They are `<span>`s, not a labelled region, so there is no clean per-value target yet — see Open
questions.

## Flows

### Find an order by code

Preconditions: SALES READ; `{recordCode}` bound to an existing order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `assertText` → `shell.breadcrumb` contains `Sales Orders`
3. `fill` → `shell.table-search` = `<recordCode>`
4. `assertVisible` → `v2-sales.orders-row`

### Search yields nothing

Preconditions: SALES READ.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `fill` → `shell.table-search` = `<a string no order matches>`
3. `assertVisible` → `v2-sales.orders-empty-state`

### Open a specific sales order

Preconditions: SALES READ; `{orderId}` bound by the caller.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `assertVisible` → `v2-sales.order-submit-update`
3. `assertText` → `shell.breadcrumb` contains `<order code>`

Step 2 asserts the submit button rather than the page title, because the button's label is what
distinguishes an update page from a create page: `"Save changes"` only renders when the form
loaded an existing record. If the id is wrong or inaccessible, this fails immediately rather
than after a misleading partial render.

### Edit a specific sales order

Preconditions: SALES READ + WRITE; `{orderId}` bound to an editable order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `assertVisible` → `v2-sales.order-submit-update`
3. `fill` → `v2-sales.order-invoice-number-input` = `<invoice number>`
4. `click` → `v2-sales.order-submit-update`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes to an existing record.

This is the shape to reuse for any "change X on order Y" instruction: land on the update page,
confirm it loaded, change the field, save, assert the toast. Swap step 3 for whichever field the
instruction names — `v2-sales.order-reference-number-input`,
`v2-sales.order-delivery-receipt-input` or `v2-sales.order-remarks-input` all behave identically.

Two things this flow cannot do:

- **Edit a line item.** Quantities, prices and products live in the items grid, whose inputs have
  no stable id (see Contract gaps). Only header fields are editable through a plan.
- **Edit a locked or cancelled order.** The form renders read-only and the submit button is not
  present, so step 2 fails. That is the correct outcome, but the failure says "element not
  found", not "the order is locked".

### Filter the sales order list by status

Preconditions: SALES READ.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `click` → `shell.table-filter-button`
3. `click` → `v2-sales.filter-status-input`
4. `click` → `shell.select-option` with `{optionLabel}` = `<status>`
5. `click` → `shell.filter-apply-button`
6. `assertVisible` → `shell.table`

Steps 3-4 are the two-click dropdown workaround; `select` does not work here (see `shell.md`).

The filters are **multi-selects**, so step 4 adds a value rather than replacing one — running it
twice with different statuses filters on both. Nothing in the vocabulary can clear a selection,
so a flow cannot narrow a filter it has already widened.

Step 6 is a weak assertion and deliberately so: the vocabulary cannot count rows or read the
filter chips, so "the list is now filtered" is not directly checkable. To prove a filter worked,
pair it with a record you know does or does not match and assert `v2-sales.orders-row` or
`v2-sales.orders-empty-state`.

### Bulk-release selected sales orders

Preconditions: SALES WRITE; `{recordCode}` bound to a releasable order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `fill` → `shell.table-search` = `<recordCode>`
3. `assertVisible` → `v2-sales.orders-row`
4. `click` → `shell.table-row-checkbox`
5. `assertVisible` → `v2-sales.bulk-release-button`
6. `click` → `v2-sales.bulk-release-button`
7. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Releases stock for every selected order.

Steps 2-3 narrow the list to one order first, because `shell.table-row-checkbox` is
content-scoped — it finds the row containing `{recordCode}`. Selecting a specific record any
other way is impossible: the vocabulary has no row indexing, and
`shell.table-select-all-checkbox` selects the whole page indiscriminately.

Step 5 is the guard. The bulk bar only appears once something is selected, and an action absent
from it means a permission result, not a broken selector — `v2-sales.bulk-collect-button` in
particular is registered only when `SHOW_PRICES` is held.

Swap step 6 for `v2-sales.bulk-collect-button`, `v2-sales.bulk-lock-button` or
`v2-sales.bulk-delete-button` for the other bulk actions. Collect opens a dialog with its own
date and reference fields before it commits.

### Create a sales order

Preconditions: SALES READ + WRITE + DELETE; at least one active customer and one active product.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/create`
2. `assertVisible` → `v2-sales.order-customer-input`
3. `fill` → `v2-sales.order-customer-input` = `<customer name>`
4. `click` → `shell.select-option` with `{optionLabel}` = `<customer name>`
5. `click` → `v2-sales.order-add-product-button`
6. `fill` → `v2-sales.order-invoice-number-input` = `<invoice number>`
7. `click` → `v2-sales.order-submit-create`
8. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Do not run against an environment with real orders.

Step 5 adds an empty item row; filling that row's product and quantity cells happens inside a
`DataGrid` whose inputs are generated per row and are not addressable by a stable id — see
Contract gaps. **This flow is drafted, not proven**, and is the most likely of the five to need
rework after Phase 4.

### Cancel an order

Preconditions: SALES WRITE; `{orderId}` bound to a cancellable order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales.order-cancel-button`
3. `click` → `v2-sales.order-cancel-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive.

### Delete an order

> **BLOCKED by verification (2026-09-17).** `v2-sales.order-delete-button` matched **4** elements on
> the order update page, so step 2 throws. The target is held out of the registry until it is
> scoped. The dialog-scoped confirm (`v2-sales.order-delete-confirm-button`) is fine.

Preconditions: SALES DELETE; `{orderId}` bound to a deletable order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales.order-delete-button`
3. `assertVisible` → `v2-sales.order-delete-confirm-button`
4. `click` → `v2-sales.order-delete-confirm-button`
5. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, and a soft delete in the database — the record stays with `deleted: true`. Step 3
> exists because step 2's trigger and step 4's confirm share the accessible name "Delete"; the
> scoped confirm target is the only one safe to click.


### Lock a sales order

Preconditions: SALES WRITE; `{orderId}` bound to an unlocked, non-cancelled order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales.order-lock-button`
3. `click` → `v2-sales.order-lock-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. A locked order can no longer be edited, and the flow cannot be re-run against the
> same record.

`LockOrderDialog` also carries a confirmation checkbox and an "adjust quantities to match
released quantities" option. Neither has a target, so if the confirm button is gated on the
checkbox this flow stalls at step 3 — the purchase-order equivalent **is** gated, so assume this
one is too until verified.

### Override a sales order

Preconditions: SALES WRITE; `{orderId}` bound to an order in a state that permits override.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales.order-override-button`
3. `click` → `v2-sales.order-override-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Override reverts linked sales returns and refunds.

Same caveat as Lock: `OverrideOrderDialog` has a confirmation checkbox with no target.

### Duplicate a sales order

Preconditions: SALES WRITE; `{orderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales.order-duplicate-button`
3. `click` → `v2-sales.order-duplicate-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Writes a new record. Repeated runs accumulate duplicate orders.

### Select a rejected quotation for bulk delete

Preconditions: SALES READ and DELETE; Prime tenant; `{recordCode}` bound to a quotation whose status
is Rejected. Read-only — the bulk Delete button is asserted, never clicked.

1. `navigate` → `/companies/{companyId}/v2/quotations`
2. `assertText` → `shell.breadcrumb` contains `Quotations`
3. `fill` → `shell.table-search` = `<recordCode>`
4. `assertVisible` → `v2-sales.quotation-rejected-row`
5. `click` → `shell.table-row-checkbox`
6. `assertVisible` → `v2-sales.bulk-delete-button`

Step 4 doubles as the status check: the row target only matches when the row carries the
rejected chip, so a wrong-status fixture fails there with a clear selector error instead of at
the assertion. Step 6 is the observable proxy for "selectable": the bulk action bar, including
Delete, is only mounted once at least one row is checked. **verified 2026-09-18** end to end on
DHIN-QT-00056: the checkbox is enabled, checks, and the bar appears.

### Open a sales order by code

Preconditions: SALES READ; `{recordCode}` bound to an existing order's code. Use this when the
caller knows the code but not the `{orderId}`; otherwise "Open a specific sales order" is shorter.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `assertText` → `shell.breadcrumb` contains `Sales Orders`
3. `fill` → `shell.table-search` = `<recordCode>`
4. `assertVisible` → `v2-sales.orders-row`
5. `click` → `v2-sales.orders-row-code-link`
6. `assertVisible` → `v2-sales.order-submit-update`
7. `assertText` → `shell.breadcrumb` contains `<recordCode>`

Step 6 is the record-loaded guard ("Save changes" only renders on the update page). **verified
2026-09-18** end to end on DHIN-OR-00395.

### Save a new order as a quotation

Preconditions: SALES WRITE **and** quotation WRITE; Prime tenant (the button is hidden in Lite).

1. `navigate` → `/companies/{companyId}/v2/sales-orders/create`
2. `fill` → `v2-sales.order-customer-input` = `<customer name>`
3. `click` → `shell.select-option` with `{optionLabel}` = `<customer name>`
4. `click` → `v2-sales.order-save-as-quotation-button`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record, into Quotations rather than Sales Orders.

Subject to the same line-item limitation as Create a sales order — it may fail validation with
no items.

### Dismiss a confirmation dialog

Preconditions: any flow that has opened a dialog.

1. `click` → `v2-sales.dialog-dismiss-button`

The escape hatch for every dialog in this module. Useful as a final step when a flow opens a
destructive dialog to assert it appeared but must not commit it.

### Actions with no flow, and why

Not every control can be driven. These are listed so the absence is a recorded decision rather
than an oversight.

| target | why no flow |
| --- | --- |
| `v2-sales.orders-import-button` | opens a menu of channel importers, each ending in a file picker the vocabulary cannot drive |
| `v2-sales.orders-ovision-button` | navigates to an upload page whose input is a file picker |
| `v2-sales.order-attach-file-button` | file picker |
| `v2-sales.bulk-print-button` | produces a rendered document — a new tab or download, neither reachable from a plan |

### Route flows — every page in this module

26 routes, each reachable by the same three-step shape. This table is the flow: read a row and
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
| `v2-sales.beat-route-pending-orders-list` | `/companies/{companyId}/v2/beat-route-pending-orders` | `Beat Route Pending Orders` | `shell.table` |  |
| `v2-sales.quick-checkout-list` | `/companies/{companyId}/v2/quick-checkout` | `Quick Checkout` | `shell.table` |  |
| `v2-sales.quick-checkout-order-receipts` | `/companies/{companyId}/v2/quick-checkout/order-receipts` | `Order Receipts` | — |  |
| `v2-sales.quotations-list` | `/companies/{companyId}/v2/quotations` | `Quotations` | `shell.table` |  |
| `v2-sales.quotations-update` | `/companies/{companyId}/v2/quotations/{quotationId}/update` | `Quotation` | — | breadcrumb shows the record code once it loads |
| `v2-sales.sales-agents-create` | `/companies/{companyId}/v2/sales-agents/create` | `New sales agent` | — |  |
| `v2-sales.sales-agents-list` | `/companies/{companyId}/v2/sales-agents` | `Sales Agents` | `shell.table` |  |
| `v2-sales.sales-agents-update` | `/companies/{companyId}/v2/sales-agents/{salesAgentId}/update` | `Sales Agent` | — | breadcrumb shows the record code once it loads |
| `v2-sales.sales-collections-create` | `/companies/{companyId}/v2/sales-collections/create` | `New sales collection` | — |  |
| `v2-sales.sales-collections-list` | `/companies/{companyId}/v2/sales-collections` | `Sales Collections` | `shell.table` |  |
| `v2-sales.sales-collections-update` | `/companies/{companyId}/v2/sales-collections/{collectionId}/update` | `Sales Collection` | — | breadcrumb shows the record code once it loads |
| `v2-sales.sales-orders-analytics` | `/companies/{companyId}/v2/sales-orders/analytics` | `Analytics` | — |  |
| `v2-sales.sales-orders-create` | `/companies/{companyId}/v2/sales-orders/create` | `New sales order` | `v2-sales.order-submit-create` |  |
| `v2-sales.sales-orders-list` | `/companies/{companyId}/v2/sales-orders` | `Sales Orders` | `v2-sales.orders-create-button` |  |
| `v2-sales.sales-orders-update` | `/companies/{companyId}/v2/sales-orders/{orderId}/update` | `Sales Order` | `v2-sales.order-submit-update` | breadcrumb shows the record code once it loads |
| `v2-sales.sales-orders-upload-with-ovision` | `/companies/{companyId}/v2/sales-orders/upload-with-ovision` | `Upload with oVision` | — |  |
| `v2-sales.sales-price-matrices-create` | `/companies/{companyId}/v2/sales-price-matrices/create` | `New sales price matrix` | — |  |
| `v2-sales.sales-price-matrices-list` | `/companies/{companyId}/v2/sales-price-matrices` | `Sales Price Matrices` | `shell.table` |  |
| `v2-sales.sales-price-matrices-update` | `/companies/{companyId}/v2/sales-price-matrices/{salesPriceMatrixId}/update` | `Sales Price Matrix` | — | breadcrumb shows the record code once it loads |
| `v2-sales.sales-refunds-list` | `/companies/{companyId}/v2/sales-refunds` | `Sales Refunds` | `shell.table` |  |
| `v2-sales.sales-returns-create` | `/companies/{companyId}/v2/sales-returns/create` | `New sales return` | — |  |
| `v2-sales.sales-returns-list` | `/companies/{companyId}/v2/sales-returns` | `Sales Returns` | `shell.table` |  |
| `v2-sales.sales-returns-update` | `/companies/{companyId}/v2/sales-returns/{salesReturnId}/update` | `Sales Return` | — | breadcrumb shows the record code once it loads |
| `v2-sales.sales-services-create` | `/companies/{companyId}/v2/sales-services/create` | `New sales service` | — |  |
| `v2-sales.sales-services-list` | `/companies/{companyId}/v2/sales-services` | `Sales Services` | `shell.table` |  |
| `v2-sales.sales-services-update` | `/companies/{companyId}/v2/sales-services/{salesServiceId}/update` | `Sales Service` | — | breadcrumb shows the record code once it loads |

## Contract gaps

- **`select` is unusable.** Covered in `shell.md`: every v2 dropdown is a MUI `TextField select`,
  which is not a native `<select>`, so `selectOption()` throws. Sales uses dropdowns for payment
  terms, payment method, and sales channel. All of them need the two-click workaround.
- **Grid cell inputs are unaddressable.** The order items grid generates an input per row and
  column with no stable id (`…/Details/OrderItemsDataGrid/index.tsx`). Adding a product with a
  quantity and a price — the core of the create flow — cannot be expressed yet. This is the
  single biggest blocker to real sales coverage.
- **File upload.** `upload-with-ovision`, the importer menu, and `Attach file` all open a file
  picker. No action can supply a file, so three routes are navigable but not testable.
- **No URL assertion.** After a successful create the app redirects to the new order's update
  page. The flow can only assert the toast, not that it landed on the right record.
- **Toast timing.** `shell.toast` auto-dismisses. `assertText` retries until it appears, but a
  slow mutation followed by a fast dismiss is a real flake source, and there is no `waitFor`.
- **No numeric or money assertions.** Totals are computed with `decimalV2` and rendered as
  `₱8,160.00`. `assertText` does substring matching, which works, but nothing can assert a
  computed relationship.

## Open questions

- **Lock and Override are gated behind an in-dialog confirmation checkbox**
  (`LockOrderDialog.tsx:69`, `OverrideOrderDialog.tsx:159`). The checkbox has a label but no
  target yet, so neither flow is drafted. Both are also state-dependent — an order must be in the
  right status for the button to render at all.
- **Status values have no target.** `Attributes.Item` renders label and value as sibling spans
  with no association, so "assert the order is now Cancelled" has nowhere to point. The
  breadcrumb does not carry status either. Worth asking whether `Attributes.Item` can take an
  `aria-label`.
- **`v2-sales.order-payment-terms-select` is a guess.** MUI `Select` renders the id onto a `div`,
  not an `input`; `[data-field='payment.terms'] :is(input,textarea):not([aria-hidden])` is inference, not observation. Phase 4 must confirm
  before this is used.
- **Which of the 26 routes are actually reachable for a given tenant** depends on company
  settings (`enableBeatRoute`, `enableCustomerGroups`) and channel integrations (TikTok, Shopee,
  Lazada and eight more importers are conditionally rendered in `OrdersTable`). No flow should
  assume an importer exists.
