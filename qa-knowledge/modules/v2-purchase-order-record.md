---
module: v2-purchase-order-record
routes: 1
targets: 35
flows: 9
status: drafted
lastUpdated: 2026-09-17
parent: v2-purchasing
---

# v2-purchase-order-record

## Purpose

The buy-side twin of `v2-sales-order-record.md`. One route —
`/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update` — and a tabbed workspace
where the order is worked after it exists: receiving stock against it, paying it, returning and
refunding, attachments and the audit trail.

`v2-purchasing.md` covers the list and the order header. **This file covers the tabs.**

## Route

| page name | path | permission gate |
| --- | --- | --- |
| `v2-purchasing.purchase-orders-update` | `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update` | PURCHASE_ORDER READ; WRITE to change anything |

## How the tabs behave

Same `ChipTabs` primitive as the sales order record, same rules: uppercase labels, exact
case-sensitive matching, **only the active panel is in the DOM**, so a tab must be clicked before
any of its targets can resolve.

| tab label | value | when it appears |
| --- | --- | --- |
| `DETAILS` | `details` | always |
| `RECEIVINGS` | `receivings` | update page, and the role holds RECEIVING read |
| `PAYMENTS` | `payments` | update page, and the role holds payments read |
| `REFUNDS` | `refunds` | update page, and the role holds purchase-refunds read |
| `RETURNS` | `returns` | update page, and the role holds PURCHASE_ORDER_RETURN read |
| `ATTACHMENTS` | `attachments` | update page, and purchase-order attachments are enabled |
| `AUDIT LOGS` | `auditLogs` | update page |

**Every tab but `DETAILS` is gated on a separate permission**
(`CreateUpdateForm/index.tsx:686-716`: `hasReceivingRead`, `hasPaymentsRead`,
`hasPurchaseRefundsRead`, `hasPurchaseOrderReturnRead`, `hasPurchaseOrderAttachments`). This is
a sharper split than the sales order page, where the tabs turn mostly on `SHOW_PRICES` and
company settings. A role with purchasing access but no receiving access sees a purchase order
with no Receivings tab — correct, and easy to misread as a broken selector.

All non-Details tabs also require `purchaseOrderId` — on the create page only `DETAILS` exists.

## Preconditions

Everything in `v2-purchasing.md` applies, plus:

- `{purchaseOrderId}` bound to an order that is **not locked** — a locked order renders read-only
  and the submits disappear.
- The tab under test must be permitted for the bound role, per the table above.
- Receiving against an order needs an inventory location; paying it needs a bank account and an
  outstanding balance; returning needs a completed receiving to return against.

## Targets

### Tab navigation

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchase-order-record.tablist` | tablist "Order details tabs" | `role=tablist[name="Order details tabs"]` | `CreateUpdateForm/index.tsx:683` | high | same aria-label as the sales order page — but the two pages are never open at once **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-details` | tab "DETAILS" | `role=tab[name="DETAILS"]` | `CreateUpdateForm/index.tsx:684` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-receivings` | tab "RECEIVINGS" | `role=tab[name="RECEIVINGS"]` | `CreateUpdateForm/index.tsx:690` | high | RECEIVING read **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-payments` | tab "PAYMENTS" | `role=tab[name="PAYMENTS"]` | `CreateUpdateForm/index.tsx:695` | high | payments read **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-refunds` | tab "REFUNDS" | `role=tab[name="REFUNDS"]` | `CreateUpdateForm/index.tsx:700` | high | purchase-refunds read **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-returns` | tab "RETURNS" | `role=tab[name="RETURNS"]` | `CreateUpdateForm/index.tsx:705` | high | PURCHASE_ORDER_RETURN read **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-attachments` | tab "ATTACHMENTS" | `role=tab[name="ATTACHMENTS"]` | `CreateUpdateForm/index.tsx:710` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.tab-audit-logs` | tab "AUDIT LOGS" | `role=tab[name="AUDIT LOGS"]` | `CreateUpdateForm/index.tsx:714` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.active-tabpanel` | tabpanel | `role=tabpanel` | `_common/ChipTabs/Content.tsx:16` | high | only one exists at a time **verified 2026-09-17**: 1 match. |

### Payments tab

Header fields plus indexed entry rows, exactly like sales collections. First row is index `0`.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchase-order-record.payment-date-input` | "Payment Date" | `input[id='paymentDate']` | `…/Payments/components/PaymentInformationCard.tsx:39` | medium | date picker |
| `v2-purchase-order-record.payment-currency-input` | combobox "Pay in" | `input[id='currency']` | `…/PaymentInformationCard.tsx:47` | medium | |
| `v2-purchase-order-record.payment-remarks-input` | textbox "Remarks" | `input[id='remarks']` | `…/PaymentInformationCard.tsx:57` | medium | id shared with the refund form; never co-mounted |
| `v2-purchase-order-record.payment-entry-type-input` | combobox "Payment Type" | `input[id='paymentEntries.0.type']` | `…/PaymentEntry/PaymentEntryItem.tsx:152` | medium | first entry row |
| `v2-purchase-order-record.payment-entry-amount-input` | "Amount" | `input[id='paymentEntries.0.amount']` | `…/PaymentEntryItem.tsx:176` | medium | money input |
| `v2-purchase-order-record.payment-entry-method-input` | combobox "Payment method" | `input[id='paymentEntries.0.paymentMethod']` | `…/PaymentEntryItem.tsx:188` | medium | |
| `v2-purchase-order-record.payment-entry-bank-account-input` | combobox "Bank Account" | `input[id='paymentEntries.0.bankAccountId']` | `…/PaymentEntryItem.tsx:207` | medium | |
| `v2-purchase-order-record.payment-entry-reference-input` | textbox "Reference Number" | `input[id='paymentEntries.0.referenceNumber']` | `…/PaymentEntryItem.tsx:218` | medium | |
| `v2-purchase-order-record.payment-add-source-button` | button "Add Another Source" | `role=button[name="Add Another Source"]` | `…/PaymentEntry/index.tsx:313` | medium | adds entry row index 1, which has no target |
| `v2-purchase-order-record.payment-submit` | button "Submit" | `role=tabpanel >> role=button[name="Submit"]` | `…/PaymentEntry/index.tsx:328` | medium | **panel-scoped** — returns and refunds also use "Submit" |
| `v2-purchase-order-record.payment-post-confirm-checkbox` | checkbox "I confirm that this Payment is final and cannot be changed after posting." | `input[id='confirmPost']` | `…/PostContinueWarningDialog.tsx:124` | medium | gates the continue button |
| `v2-purchase-order-record.payment-post-continue-button` | button "Continue" | `role=dialog >> role=button[name="Continue"]` | `…/PostContinueWarningDialog.tsx:144` | medium | posting is irreversible |

### Receivings tab

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchase-order-record.receiving-add-location-button` | button "Add location" | `role=button[name="Add location"]` | `…/Receivings/AddReceivingForm/index.tsx:516` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.receiving-apply-location-to-all-button` | button "Apply to All" | `role=dialog >> role=button[name="Apply to All"]` | `…/AddReceivingForm/SelectLocationForAllDialog.tsx:98` | medium | |
| `v2-purchase-order-record.receiving-complete-dismiss-button` | button "Cancel" | `role=dialog >> role=button[name="Cancel"]` | `…/Receivings/Dialogs/CompleteReceivingDialog.tsx:22` | low | the dialog's **dismiss**; its confirm was not identified — see Open questions |

### Returns tab

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchase-order-record.return-submit` | button "Submit" | `role=tabpanel >> role=button[name="Submit"]` | `…/Returns/AddReturnForm/index.tsx:388` | medium | panel-scoped |
| `v2-purchase-order-record.return-dummy-receiving-submit` | button "Submit" | `role=tabpanel >> role=button[name="Submit"]` | `…/Returns/AddReturnWithDummyReceivingForm/index.tsx:148` | low | **same selector as the row above** — the two forms are alternatives, so only one is mounted, but a plan cannot tell which |
| `v2-purchase-order-record.return-complete-dismiss-button` | button "Cancel" | `role=dialog >> role=button[name="Cancel"]` | `…/Returns/Dialogs/CompleteReturnDialog.tsx:27` | low | dismiss only |

### Refunds tab

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-purchase-order-record.refund-type-input` | combobox "Refund Type" | `input[id='refundType']` | `…/Refunds/RefundForm.tsx:170` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.refund-amount-input` | "Amount" | `input[id='amount']` | `…/Refunds/RefundForm.tsx:179` | high | money input **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.refund-date-input` | "Refund date" | `input[id='refundDate']` | `…/Refunds/RefundForm.tsx:187` | medium | date picker |
| `v2-purchase-order-record.refund-reference-input` | textbox "Reference #" | `input[id='referenceNumber']` | `…/Refunds/RefundForm.tsx:196` | high | label is "Reference #", not "Reference number" **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.refund-payment-method-input` | combobox "Payment method" | `input[id='paymentMethod']` | `…/Refunds/RefundForm.tsx:203` | high | **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.refund-remarks-input` | textbox "Remarks" | `input[id='remarks']` | `…/Refunds/RefundForm.tsx:212` | medium | |
| `v2-purchase-order-record.refund-submit` | button "Submit" | `role=tabpanel >> role=button[name="Submit"]` | `…/Refunds/RefundForm.tsx:226` | high | panel-scoped. **This is the target the sales refund flow is missing** — the purchase side has it, sales does not **verified 2026-09-17**: 1 match. |
| `v2-purchase-order-record.refund-warning-continue-button` | button "Continue" | `role=dialog >> role=button[name="Continue"]` | `…/Refunds/PurchaseRefundSubmissionWarningDialog.tsx:30` | medium | a confirmation step before the refund commits |

## Flows

Like the sales record, every flow lands on the page, guards, then clicks a tab.

### Open the payments tab

Preconditions: PURCHASE_ORDER READ and payments read; `{purchaseOrderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `assertVisible` → `v2-purchasing.po-cancel-button`
3. `click` → `v2-purchase-order-record.tab-payments`
4. `assertVisible` → `v2-purchase-order-record.active-tabpanel`

Step 2 guards that an existing order loaded — the PO submit reads "Submit" on create and update
alike, so it proves nothing (see `v2-purchasing.md`). If step 3 fails, the role lacks payments
read.

### Record a payment against a purchase order

Preconditions: PURCHASE_ORDER WRITE and payments read, `SHOW_PRICES`; `{purchaseOrderId}` bound
to an unlocked order with an outstanding balance; at least one bank account.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-payments`
3. `assertVisible` → `v2-purchase-order-record.payment-entry-amount-input`
4. `fill` → `v2-purchase-order-record.payment-entry-amount-input` = `<amount>`
5. `click` → `v2-purchase-order-record.payment-entry-method-input`
6. `click` → `shell.select-option` with `{optionLabel}` = `<payment method>`
7. `fill` → `v2-purchase-order-record.payment-entry-reference-input` = `<reference number>`
8. `click` → `v2-purchase-order-record.payment-submit`
9. `assertText` → `shell.toast` contains `<success copy>`

> Writes a financial record. Destructive in effect — no undo in the UI.

If the order requires posting, step 8 opens the post-continue dialog instead of submitting: tick
`v2-purchase-order-record.payment-post-confirm-checkbox`, then click
`v2-purchase-order-record.payment-post-continue-button`. **Whether that dialog appears was not
traced** — see Open questions.

### Issue a refund against a purchase order

Preconditions: PURCHASE_ORDER WRITE and purchase-refunds read, `SHOW_PRICES`;
`{purchaseOrderId}` bound to an order with a paid amount.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-refunds`
3. `assertVisible` → `v2-purchase-order-record.refund-amount-input`
4. `fill` → `v2-purchase-order-record.refund-amount-input` = `<amount>`
5. `click` → `v2-purchase-order-record.refund-type-input`
6. `click` → `shell.select-option` with `{optionLabel}` = `<refund type>`
7. `click` → `v2-purchase-order-record.refund-submit`
8. `click` → `v2-purchase-order-record.refund-warning-continue-button`
9. `assertText` → `shell.toast` contains `<success copy>`

> Writes a financial record. Destructive in effect.

Unlike the sales refund flow, this one is complete — the purchase refund form's submit was
identified.

### Open the receivings tab

Preconditions: PURCHASE_ORDER READ and RECEIVING read; `{purchaseOrderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-receivings`
3. `assertVisible` → `v2-purchase-order-record.active-tabpanel`

### Read the audit trail

Preconditions: PURCHASE_ORDER READ; `{purchaseOrderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-audit-logs`
3. `assertVisible` → `v2-purchase-order-record.active-tabpanel`


### Add a second payment source

Preconditions: PURCHASE_ORDER WRITE, `SHOW_PRICES`; `{purchaseOrderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-payments`
3. `click` → `v2-purchase-order-record.payment-add-source-button`
4. `assertVisible` → `v2-purchase-order-record.payment-entry-amount-input`

Step 4 still resolves to **entry row 0**, not the new row. Row 1 has no target, so the flow
proves the button adds a row but cannot fill it — this is the split-tender limitation in
Contract gaps, made concrete.

### Set one location for every receiving line

Preconditions: PURCHASE_ORDER WRITE and RECEIVING WRITE; `{purchaseOrderId}` bound with
unreceived items; at least one inventory location.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-receivings`
3. `click` → `v2-purchase-order-record.receiving-add-location-button`
4. `assertVisible` → `v2-purchase-order-record.receiving-apply-location-to-all-button`
5. `click` → `v2-purchase-order-record.receiving-apply-location-to-all-button`

The purchasing twin of the sales "Apply to All" flow, and for the same reason the only bulk grid
operation expressible here. The dialog's own Location field has no target, so the applied value
is whatever it defaults to.

### Record a return against a purchase order

Preconditions: PURCHASE_ORDER WRITE and PURCHASE_ORDER_RETURN WRITE; `{purchaseOrderId}` bound
with a completed receiving.

1. `navigate` → `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update`
2. `click` → `v2-purchase-order-record.tab-returns`
3. `assertVisible` → `v2-purchase-order-record.return-submit`
4. `click` → `v2-purchase-order-record.return-submit`
5. `assertText` → `shell.toast` contains `<validation or success copy>`

> Writes a record and returns stock.

Return quantities are grid cells, so as with the sales equivalent this submits the form's
defaults. **`v2-purchase-order-record.return-dummy-receiving-submit` resolves to the same
selector** — the two return forms are alternatives and the plan cannot tell which is mounted.

### Back out of a completion dialog

Preconditions: a receiving or return completion dialog is open.

1. `click` → `v2-purchase-order-record.receiving-complete-dismiss-button`

The dismiss for the receiving completion dialog;
`v2-purchase-order-record.return-complete-dismiss-button` is its return equivalent. Both are
dismiss-only — **neither dialog's confirm button has a target**, which is why completing a
receiving from inside the purchase order has no flow (see Open questions).

## Contract gaps

Everything in `v2-purchasing.md` and `v2-sales-order-record.md` applies. Specific to this page:

- **Only payment entry row 0 is addressable.** "Add Another Source" creates row 1, which has no
  target. Split-tender payments cannot be completed.
- **Receiving quantities are grid cells.** Receiving against a purchase order — the main thing
  this tab exists for — cannot be driven, only opened.
- **Two return forms share one selector.** `AddReturnForm` and `AddReturnWithDummyReceivingForm`
  are alternatives chosen by state, and both render a panel-scoped "Submit". The plan cannot tell
  which is mounted, and nothing in the vocabulary can branch.
- **Posting is irreversible and conditional.** A flow that hits the post dialog when it did not
  expect to will click a submit that is not there.

## Open questions

- **`CompleteReceivingDialog` and `CompleteReturnDialog` confirm buttons were not identified** —
  only their "Cancel" dismiss buttons were found. Completing a receiving from inside the purchase
  order is therefore not draftable. Cheapest fix in this module.
- **When the post-continue dialog appears is untraced.** It is wired to `confirmPost` and
  `confirmCredits` checkboxes, but the condition that triggers it was not read, so the payment
  flow documents it as a branch rather than a step.
- **The receivings tab's own add-receiving submit was not found** — only "Add location" and the
  location dialog. The tab may delegate to the standalone receiving create page.
- **Attachments and audit logs tabs have no targets**, same as the sales record.
- **The tablist `aria-label` is `'Order details tabs'` on both this page and the sales order
  page.** Harmless today because the two are never open together, but it means the tablist
  selector alone does not identify which record you are on.
