---
module: v2-purchasing
routes: 23
targets: 52
flows: 15
status: drafted
lastUpdated: 2026-09-17
---

# v2-purchasing

## Purpose

The buy side: raising requisitions and purchase orders against suppliers, receiving stock in,
returning and refunding it, and the supplier master data and price matrices those lean on. The
purchase order form mirrors the sales order form closely enough that its conventions transfer —
same `Form.Field` id scheme, same dialog pattern, same toast confirmation.

## Routes

| page name | path | permission gate |
| --- | --- | --- |
| `v2-purchasing.purchase-orders-list` | `/companies/{companyId}/v2/purchase-orders` | PURCHASE_ORDER READ |
| `v2-purchasing.purchase-orders-create` | `/companies/{companyId}/v2/purchase-orders/create` | PURCHASE_ORDER WRITE + DELETE |
| `v2-purchasing.purchase-orders-update` | `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update` | PURCHASE_ORDER READ |
| `v2-purchasing.purchase-orders-upload-with-ovision` | `/companies/{companyId}/v2/purchase-orders/upload-with-ovision` | PURCHASE_ORDER WRITE |
| `v2-purchasing.receivings-list` / `-create` / `-update` | `…/v2/receivings…` (`{receivingId}`) | RECEIVING READ / WRITE |
| `v2-purchasing.requisitions-list` / `-create` / `-update` | `…/v2/requisitions…` (`{requisitionId}`) | REQUISITION READ / WRITE |
| `v2-purchasing.suppliers-list` / `-create` / `-update` | `…/v2/suppliers…` (`{supplierId}`) | SUPPLIER READ / WRITE |
| `v2-purchasing.purchase-order-returns-list` / `-create` / `-update` | `…/v2/purchase-order-returns…` (`{purchaseOrderReturnId}`) | PURCHASE_ORDER_RETURN READ / WRITE / DELETE |
| `v2-purchasing.purchase-refunds-list` | `…/v2/purchase-refunds` | PURCHASE_ORDER READ |
| `v2-purchasing.purchase-services-list` / `-create` / `-update` | `…/v2/purchase-services…` (`{purchaseServiceId}`) | PURCHASE_ORDER READ / WRITE |
| `v2-purchasing.purchase-price-matrices-list` / `-create` / `-update` | `…/v2/purchase-price-matrices…` (`{purchasePriceMatrixId}`) | PURCHASE_ORDER READ / WRITE |

Exact paths for every entry are in `routes.md`.

## Preconditions

- Signed in; `companyId` bound to a **Prime** tenant (a Lite tenant is blocked from `/v2/*`).
- The bound role holds the category READ shown above. Create pages additionally assert WRITE,
  and purchase orders and returns also assert DELETE — a role with WRITE but not DELETE cannot
  open the create page at all.
- `SHOW_PRICES` gates every money column and the payment panel, exactly as in sales.
- At least one supplier exists in the tenant. Nothing on this side can be created without one.
- For update flows: the record's id parameter and its `{recordCode}` bound.

## Targets

List chrome (`shell.table-*`), the dropdown workaround (`shell.select-option`) and the toast
(`shell.toast`) come from `shell.md`.

### Purchase orders — list

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.po-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `PurchaseOrdersTable/index.tsx:437` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-purchasing.po-import-button` | button "Import" | `role=button[name="Import"]` | `PurchaseOrdersTable/index.tsx:387` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-export-button` | button "Export" | `role=button[name="Export"]` | `PurchaseOrdersTable/index.tsx:386` | low | only for tenants with the Helios integration |
| `v2-purchasing.po-ovision-button` | button, name repeats "oVision" | `role=button[name*="oVision"]` | `PurchaseOrdersTable/index.tsx:419` | high | same duplicated-alt problem as sales **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-row` | row containing the code | `tr:has(td:has-text('{recordCode}'))` | `PurchaseOrdersTable` | medium | |

### Purchase orders — form

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.po-supplier-input` | combobox "Supplier*" | `[data-field='supplierId'] :is(input,textarea):not([aria-hidden])` | `…/Details/components/SupplierAutocomplete.tsx:134` | high | autocomplete — `fill`, then click the option **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-invoice-number-input` | textbox "Invoice number" | `[data-field='payment.invoiceNumber'] :is(input,textarea):not([aria-hidden])` | `…/Details/components/PaymentDetailsCard.tsx:133` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-reference-number-input` | textbox "Reference number" | `[data-field='payment.referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/PaymentDetailsCard.tsx:163` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-invoice-date-input` | "Invoice date" | `[data-field='payment.invoiceAt'] :is(input,textarea):not([aria-hidden])` | `…/PaymentDetailsCard.tsx:139` | low | date picker — typing a date string may not commit; unverified |
| `v2-purchasing.po-payment-due-input` | "Payment due" | `[data-field='payment.paymentDueAt'] :is(input,textarea):not([aria-hidden])` | `…/PaymentDetailsCard.tsx:92` | low | date picker |
| `v2-purchasing.po-expected-delivery-input` | "Expected delivery date" | `[data-field='payment.expectedDeliveryAt'] :is(input,textarea):not([aria-hidden])` | `…/PaymentDetailsCard.tsx:165` | low | date picker |
| `v2-purchasing.po-attention-input` | textbox "Attention" | `[data-field='attention'] :is(input,textarea):not([aria-hidden])` | `…/Details/components/SupplierCard.tsx:300` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-submit` | button "Submit" | `role=button[name="Submit"]` | `…/Details/index.tsx:375` | high | same label on create and update, unlike sales **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-save-as-requisition-button` | button "Save as Requisition" | `role=button[name="Save as Requisition"]` | `…/Details/index.tsx:366` | high | create only **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-cancel-button` | button "Cancel" | `role=button[name="Cancel"]` | `CreateUpdateForm/index.tsx:476` | high | opens a dialog **verified 2026-09-17**: 1 match. |
| `v2-purchasing.po-override-button` | button "Override" | `role=button[name="Override"]` | `CreateUpdateForm/index.tsx:491` | medium | |
| `v2-purchasing.po-lock-button` | button "Lock" | `role=button[name="Lock"]` | `CreateUpdateForm/index.tsx:501` | high | **verified 2026-09-17**: 1 match. |

### Purchase orders — dialogs

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.po-cancel-confirm-button` | button "Cancel order" | `role=dialog >> role=button[name="Cancel order"]` | `CancelPurchaseOrderDialog.tsx:95` | medium | |
| `v2-purchasing.po-lock-confirm-button` | button "Lock" | `role=dialog >> role=button[name="Lock"]` | `LockPurchaseOrderDialog.tsx:108` | high | **must stay scoped** — the page trigger is also "Lock" **verified 2026-09-18**: 1 match. |
| `v2-purchasing.po-lock-confirm-checkbox` | checkbox "I confirm that this purchase order is final…" | `[data-field='confirmLock'] :is(input,textarea):not([aria-hidden])` | `LockPurchaseOrderDialog.tsx:84` | high | the confirm button stays disabled until this is ticked **verified 2026-09-18**: 1 match. |
| `v2-purchasing.po-override-confirm-button` | button "Override purchase order" | `role=dialog >> role=button[name="Override purchase order"]` | `OverridePurchaseOrderDialog.tsx:196` | medium | |
| `v2-purchasing.po-override-confirm-checkbox` | checkbox "I confirm that I want to override this purchase order." | `[data-field='confirmOverride'] :is(input,textarea):not([aria-hidden])` | `OverridePurchaseOrderDialog.tsx:183` | medium | gates the confirm button |
| `v2-purchasing.po-delete-confirm-button` | button "Delete" | `role=dialog >> role=button[name="Delete"]` | `DeletePurchaseOrderModal.tsx:49` | medium | |

### Receivings

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.receiving-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `ReceivingsTable/index.tsx:276` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-purchasing.receiving-sync-xero-button` | button "Sync to Xero" | `role=button[name="Sync to Xero"]` | `ReceivingsTable/index.tsx:274` | low | only for tenants with Xero connected |
| `v2-purchasing.receiving-delivery-receipt-input` | textbox "Delivery receipt number" | `[data-field='deliveryReceiptNumber'] :is(input,textarea):not([aria-hidden])` | `Receivings/.../FiltersDialog` and form | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.receiving-location-input` | combobox "Location" | `[data-field='inventoryLocationId'] :is(input,textarea):not([aria-hidden])` | Receivings form | medium | autocomplete |
| `v2-purchasing.receiving-save-pending-button` | button "Save as Pending" | `role=button[name="Save as Pending"]` | `Receivings/CreateUpdateForm/index.tsx:449` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.receiving-complete-button` | button "Complete" | `role=button[name="Complete"]` | `Receivings/CreateUpdateForm/index.tsx:458` | high | completing a receiving moves stock **verified 2026-09-17**: 1 match. |
| `v2-purchasing.receiving-override-confirm-button` | button "Override receiving" | `role=dialog >> role=button[name="Override receiving"]` | `OverrideReceivingDialog.tsx:139` | medium | |

### Requisitions

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.requisition-submit` | button "Save Requisition" | `role=button[name="Save Requisition"]` | `Requisitions/CreateUpdateForm/index.tsx:274` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.requisition-approve-button` | button "Approve" | `role=button[name="Approve"]` | `Requisitions/CreateUpdateForm/index.tsx:315` | high | role-gated and status-gated **verified 2026-09-17**: 1 match. |
| `v2-purchasing.requisition-reject-button` | button "Reject" | `role=button[name="Reject"]` | `Requisitions/CreateUpdateForm/index.tsx:322` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.requisition-cancel-button` | button "Cancel" | `role=button[name="Cancel"]` | `Requisitions/CreateUpdateForm/index.tsx:332` | high | **verified 2026-09-17**: 1 match. |

### Suppliers

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.supplier-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `SuppliersPage/index.tsx:112` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-purchasing.supplier-import-button` | button "Import" | `role=button[name="Import"]` | `SuppliersPage/index.tsx:110` | high | opens a file picker **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-code-input` | textbox "Code" | `[data-field='code'] :is(input,textarea):not([aria-hidden])` | Suppliers form | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-address-input` | textbox "Address" | `[data-field='address'] :is(input,textarea):not([aria-hidden])` | Suppliers form | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-email-input` | textbox "Primary email" | `[data-field='primaryEmail'] :is(input,textarea):not([aria-hidden])` | Suppliers form | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-submit` | button "Submit" | `role=button[name="Submit"]` | `Suppliers/CreateUpdateForm/components/Details/index.tsx:58` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-delete-confirm-button` | button "Delete Supplier" | `role=dialog >> role=button[name="Delete Supplier"]` | `DeleteSupplierModal.tsx:50` | medium | |

The supplier form's name field was not identified in this pass — see Open questions.


## Record page tabs

The purchase order record has its own file — `v2-purchase-order-record.md`. The other record
pages in this module are below.

Tabs use the shared `ChipTabs` primitive: labels are **uppercase**, `role=` matching is exact and
case-sensitive, and **only the active panel is in the DOM** (`_common/ChipTabs/Content.tsx:9`), so
a tab must be clicked before any target inside it can resolve. Panels mount lazily.

### Supplier record — `/v2/suppliers/{supplierId}/update`

Eight tabs (`Suppliers/CreateUpdateForm/index.tsx:236-269`). Tablist aria-label:
`Supplier details tabs` — the same string the customer record uses, so it does not identify
which record you are on.

| name | tab label | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.supplier-tablist` | – | `role=tablist[name="Supplier details tabs"]` | `Suppliers/CreateUpdateForm/index.tsx` | high | shared string with the customer record **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:236` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-products` | PRODUCTS | `role=tab[name="PRODUCTS"]` | `…/index.tsx:251` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-purchase-orders` | PURCHASE ORDERS | `role=tab[name="PURCHASE ORDERS"]` | `…/index.tsx:254` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-credits` | CREDITS | `role=tab[name="CREDITS"]` | `…/index.tsx:257` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-payables` | PAYABLES | `role=tab[name="PAYABLES"]` | `…/index.tsx:261` | high | `SHOW_PRICES`; internal value is `agingPayables` **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:265` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchasing.supplier-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:269` | high | **verified 2026-09-17**: 1 match. |

### Receiving record — `/v2/receivings/{receivingId}/update`

Only two tabs (`Receivings/CreateUpdateForm/index.tsx:428-429`). Tablist aria-label:
`Receiving tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-purchasing.receiving-tablist` | – | `role=tablist[name="Receiving tabs"]` | `Receivings/CreateUpdateForm/index.tsx:428` | high **verified 2026-09-17**: 1 match. |
| `v2-purchasing.receiving-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:428` | high **verified 2026-09-17**: 1 match. |
| `v2-purchasing.receiving-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:429` | high **verified 2026-09-17**: 1 match. |

## Flows

### Find a purchase order by code

Preconditions: PURCHASE_ORDER READ; `{recordCode}` bound.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders`
2. `assertText` → `shell.breadcrumb` contains `Purchase Orders`
3. `fill` → `shell.table-search` = `<recordCode>`
4. `assertVisible` → `v2-purchasing.po-row`

### Open a specific purchase order

Preconditions: PURCHASE_ORDER READ; `{purchaseOrderId}` bound by the caller.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `assertVisible` → `v2-purchasing.po-submit`

Note the weaker guard than sales: the PO submit button reads `"Submit"` on both create and
update, so step 2 confirms the form rendered but **not** that it loaded an existing record. To
distinguish, assert a control that only exists on an update page — `v2-purchasing.po-lock-button`
or `v2-purchasing.po-cancel-button`.

### Edit a specific purchase order

Preconditions: PURCHASE_ORDER READ + WRITE; `{purchaseOrderId}` bound to an unlocked order.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `assertVisible` → `v2-purchasing.po-cancel-button`
3. `fill` → `v2-purchasing.po-invoice-number-input` = `<invoice number>`
4. `click` → `v2-purchasing.po-submit`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes to an existing record.

Step 2 uses the Cancel button as the "this is an existing order" guard, per the note above.
Swap step 3 for `v2-purchasing.po-reference-number-input` or `v2-purchasing.po-attention-input`
for other header fields. Line items are not editable — see Contract gaps. A **locked** order
renders read-only, so step 2 fails.

### Create a purchase order

Preconditions: PURCHASE_ORDER WRITE + DELETE; at least one supplier and one product.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/create`
2. `assertVisible` → `v2-purchasing.po-supplier-input`
3. `fill` → `v2-purchasing.po-supplier-input` = `<supplier name>`
4. `click` → `shell.select-option` with `{optionLabel}` = `<supplier name>`
5. `fill` → `v2-purchasing.po-invoice-number-input` = `<invoice number>`
6. `click` → `v2-purchasing.po-submit`
7. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record.

Line items are not added — the grid problem described under Contract gaps applies here
identically. A purchase order with no items may fail validation; **this flow is drafted, not
proven**.

### Lock a purchase order

Preconditions: PURCHASE_ORDER WRITE; `{purchaseOrderId}` bound to an unlocked order.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchasing.po-lock-button`
3. `click` → `v2-purchasing.po-lock-confirm-checkbox`
4. `click` → `v2-purchasing.po-lock-confirm-button`
5. `assertText` → `shell.toast` contains `<success copy>`

> Destructive in effect — a locked order cannot be changed again. Step 3 is mandatory: the
> confirm button is disabled until the checkbox is ticked. Step 4's target is dialog-scoped
> because the page trigger shares the name "Lock".

### Cancel a purchase order

Preconditions: PURCHASE_ORDER WRITE; `{purchaseOrderId}` bound to a cancellable order.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchasing.po-cancel-button`
3. `click` → `v2-purchasing.po-cancel-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive.

### Create a supplier

Preconditions: SUPPLIER WRITE.

1. `navigate` → `/companies/{companyId}/v2/suppliers/create`
2. `fill` → `v2-purchasing.supplier-code-input` = `<code>`
3. `fill` → `v2-purchasing.supplier-address-input` = `<address>`
4. `click` → `v2-purchasing.supplier-submit`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Likely incomplete — the required name field has no target yet, so this will
> probably fail validation until Open questions are resolved.


### Override a purchase order

Preconditions: PURCHASE_ORDER WRITE; `{purchaseOrderId}` bound to an overridable order.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchasing.po-override-button`
3. `click` → `v2-purchasing.po-override-confirm-checkbox`
4. `click` → `v2-purchasing.po-override-confirm-button`
5. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Step 3 is mandatory — the confirm button stays disabled until the checkbox is
> ticked.

### Delete a purchase order

Preconditions: PURCHASE_ORDER DELETE; `{purchaseOrderId}` bound to a deletable order.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchasing.po-delete-confirm-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete. **Step 1 to 2 is missing the page-level Delete trigger** — this
> module has no target for it (only the dialog's confirm). Add the trigger before running.

### Save a purchase order as a requisition

Preconditions: PURCHASE_ORDER WRITE and REQUISITION WRITE.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/create`
2. `fill` → `v2-purchasing.po-supplier-input` = `<supplier name>`
3. `click` → `shell.select-option` with `{optionLabel}` = `<supplier name>`
4. `click` → `v2-purchasing.po-save-as-requisition-button`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record, into Requisitions rather than Purchase Orders.

### Complete a receiving

Preconditions: RECEIVING WRITE; `{receivingId}` bound to a pending receiving with items.

1. `navigate` → `/companies/{companyId}/v2/receivings/{receivingId}/update`
2. `assertVisible` → `v2-purchasing.receiving-complete-button`
3. `click` → `v2-purchasing.receiving-complete-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Completing a receiving moves stock into inventory and cannot be undone by
> re-running the flow.

Use `v2-purchasing.receiving-save-pending-button` instead to save a draft without moving stock.

### Save a receiving as pending

Preconditions: RECEIVING WRITE; `{receivingId}` bound.

1. `navigate` → `/companies/{companyId}/v2/receivings/{receivingId}/update`
2. `click` → `v2-purchasing.receiving-save-pending-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Moves no stock.

### Override a receiving

Preconditions: RECEIVING WRITE; `{receivingId}` bound to a completed receiving.

1. `navigate` → `/companies/{companyId}/v2/receivings/{receivingId}/update`
2. `click` → `v2-purchasing.receiving-override-confirm-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. As with delete above, the page-level Override trigger has no target in this
> module — only the dialog's confirm — so step 1 to 2 is incomplete.

### Approve a requisition

Preconditions: REQUISITION WRITE plus approver rights; `{requisitionId}` bound to a pending
requisition.

1. `navigate` → `/companies/{companyId}/v2/requisitions/{requisitionId}/update`
2. `assertVisible` → `v2-purchasing.requisition-approve-button`
3. `click` → `v2-purchasing.requisition-approve-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive in effect — approval changes the requisition's state.

Step 2 is the guard: Approve and Reject render conditionally on approver role and requisition
status, and the exact condition is not known (see Open questions). Swap step 3 for
`v2-purchasing.requisition-reject-button` or `v2-purchasing.requisition-cancel-button`.

### Delete a supplier

Preconditions: SUPPLIER WRITE; `{supplierId}` bound.

1. `navigate` → `/companies/{companyId}/v2/suppliers/{supplierId}/update`
2. `click` → `v2-purchasing.supplier-delete-confirm-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete. The page-level Delete trigger (`Suppliers/CreateUpdateForm/index.tsx:209`)
> has no target yet — add it before running.

### Actions with no flow, and why

| target | why no flow |
| --- | --- |
| `v2-purchasing.po-import-button`, `v2-purchasing.supplier-import-button` | file pickers |
| `v2-purchasing.po-export-button` | download; also Helios tenants only |
| `v2-purchasing.po-ovision-button` | navigates to an upload page driven by a file picker |
| `v2-purchasing.receiving-sync-xero-button` | calls an external service; the result is not observable in the page |

### Route flows — every page in this module

23 routes, each reachable by the same three-step shape. This table is the flow: read a row and
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
| `v2-purchasing.purchase-order-returns-create` | `/companies/{companyId}/v2/purchase-order-returns/create` | `New purchase order return` | — |  |
| `v2-purchasing.purchase-order-returns-list` | `/companies/{companyId}/v2/purchase-order-returns` | `Purchase Order Returns` | `shell.table` |  |
| `v2-purchasing.purchase-order-returns-update` | `/companies/{companyId}/v2/purchase-order-returns/{purchaseOrderReturnId}/update` | `Purchase Order Return` | — | breadcrumb shows the record code once it loads |
| `v2-purchasing.purchase-orders-create` | `/companies/{companyId}/v2/purchase-orders/create` | `New purchase order` | `v2-purchasing.po-submit` |  |
| `v2-purchasing.purchase-orders-list` | `/companies/{companyId}/v2/purchase-orders` | `Purchase Orders` | `v2-purchasing.po-create-button` |  |
| `v2-purchasing.purchase-orders-update` | `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update` | `Purchase Order` | `v2-purchasing.po-cancel-button` | breadcrumb shows the record code once it loads |
| `v2-purchasing.purchase-orders-upload-with-ovision` | `/companies/{companyId}/v2/purchase-orders/upload-with-ovision` | `Upload with oVision` | — |  |
| `v2-purchasing.purchase-price-matrices-create` | `/companies/{companyId}/v2/purchase-price-matrices/create` | `New purchase price matrix` | — |  |
| `v2-purchasing.purchase-price-matrices-list` | `/companies/{companyId}/v2/purchase-price-matrices` | `Purchase Price Matrices` | `shell.table` |  |
| `v2-purchasing.purchase-price-matrices-update` | `/companies/{companyId}/v2/purchase-price-matrices/{purchasePriceMatrixId}/update` | `Purchase Price Matrix` | — | breadcrumb shows the record code once it loads |
| `v2-purchasing.purchase-refunds-list` | `/companies/{companyId}/v2/purchase-refunds` | `Purchase Refunds` | `shell.table` |  |
| `v2-purchasing.purchase-services-create` | `/companies/{companyId}/v2/purchase-services/create` | `New purchase service` | — |  |
| `v2-purchasing.purchase-services-list` | `/companies/{companyId}/v2/purchase-services` | `Purchase Services` | `shell.table` |  |
| `v2-purchasing.purchase-services-update` | `/companies/{companyId}/v2/purchase-services/{purchaseServiceId}/update` | `Purchase Service` | — | breadcrumb shows the record code once it loads |
| `v2-purchasing.receivings-create` | `/companies/{companyId}/v2/receivings/create` | `New receiving` | — |  |
| `v2-purchasing.receivings-list` | `/companies/{companyId}/v2/receivings` | `Receivings` | `v2-purchasing.receiving-create-button` |  |
| `v2-purchasing.receivings-update` | `/companies/{companyId}/v2/receivings/{receivingId}/update` | `Receiving` | `v2-purchasing.receiving-tab-details` | breadcrumb shows the record code once it loads |
| `v2-purchasing.requisitions-create` | `/companies/{companyId}/v2/requisitions/create` | `New requisition` | — |  |
| `v2-purchasing.requisitions-list` | `/companies/{companyId}/v2/requisitions` | `Requisitions` | `shell.table` |  |
| `v2-purchasing.requisitions-update` | `/companies/{companyId}/v2/requisitions/{requisitionId}/update` | `Requisition` | `v2-purchasing.requisition-submit` | breadcrumb shows the record code once it loads |
| `v2-purchasing.suppliers-create` | `/companies/{companyId}/v2/suppliers/create` | `New supplier` | `v2-purchasing.supplier-submit` |  |
| `v2-purchasing.suppliers-list` | `/companies/{companyId}/v2/suppliers` | `Suppliers` | `v2-purchasing.supplier-create-button` |  |
| `v2-purchasing.suppliers-update` | `/companies/{companyId}/v2/suppliers/{supplierId}/update` | `Supplier` | `v2-purchasing.supplier-tab-details` | breadcrumb shows the record code once it loads |

## Contract gaps

Everything in `v2-sales.md`'s Contract gaps applies here unchanged. Specific to purchasing:

- **Line-item grids again.** Purchase order items, receiving items and return items all use
  `_common/DataGrid` with per-row generated inputs. No purchasing document can be built to a
  complete, submittable state through the six actions.
- **Date pickers are unproven.** Purchase orders lean on dates far more than sales does
  (invoice date, payment due, expected delivery). `fill` against a MUI date picker input may not
  commit the value. All three are recorded `low` and none is used in a flow.
- **Checkbox confirmation via `click`.** Lock and Override gate their confirm button behind a
  checkbox. `click` on `[data-field='confirmLock'] :is(input,textarea):not([aria-hidden])` should toggle it, but this is inference — the
  checkbox may render the input visually hidden behind a styled span, in which case the click
  lands on nothing. Phase 4 must check.
- **Xero sync and the importers** leave the app or open file pickers. Untestable.

## Open questions

- **The supplier form's name field was not identified.** The extraction pass found `code`,
  `address`, `bank`, `businessStyle`, `comments`, `primaryEmail`, `tin`, `website`,
  `paymentTerms`, `contactPerson`, `accountNumber`, `vatChargeable` and `defaultEwtPercentage`,
  but no `name`. Either it is rendered outside `Form.Field` or it carries a different key. The
  create-supplier flow is incomplete until this is answered.
- **Requisition Approve/Reject visibility is unknown.** Both are rendered conditionally in
  `Requisitions/CreateUpdateForm/index.tsx`, almost certainly on approver role and requisition
  status, but the condition was not read. No approval flow is drafted.
- **`v2-purchasing.receiving-delivery-receipt-input` and `-location-input` ids are inferred**
  from the field names found in the receivings filters dialog; the create form may use a
  different path. Unverified.
- **Purchase order status values have no target**, same as sales. "Assert the PO is Locked"
  cannot be expressed.
