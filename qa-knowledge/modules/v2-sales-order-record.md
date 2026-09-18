---
module: v2-sales-order-record
routes: 1
targets: 47
flows: 14
status: drafted
lastUpdated: 2026-09-17
parent: v2-sales
---

# v2-sales-order-record

## Purpose

One route — `/companies/{companyId}/v2/sales-orders/{orderId}/update` — but not one page. The
sales order record is a tabbed workspace where most of the order's life happens after it is
created: taking payment, releasing stock, accepting returns, issuing refunds, attaching
documents and reading the audit trail.

`v2-sales.md` covers the list and the order header. **This file covers everything behind the
tabs.** An instruction like "collect a payment against order 8412" or "release stock for this
order" resolves here, not there.

## Route

| page name | path | permission gate |
| --- | --- | --- |
| `v2-sales.sales-orders-update` | `/companies/{companyId}/v2/sales-orders/{orderId}/update` | SALES READ; WRITE to change anything |

The page name stays in `v2-sales`'s route table — this module adds no routes, only depth.

## How the tabs behave

Seven tabs, rendered as chips rather than a classic tab bar
(`CreateUpdateForm/index.tsx:807-819`):

| tab label | value | when it appears |
| --- | --- | --- |
| `DETAILS` | `details` | always |
| `COLLECTIONS` | `collections` | update page only, and only with `SHOW_PRICES` |
| `RELEASINGS` | `releasings` | update page only, when releasings are enabled for the company |
| `RETURNS` | `returns` | update page only, when returns are enabled |
| `REFUNDS` | `refunds` | update page only, when refunds are enabled |
| `AUDIT LOGS` | `audit logs` | update page only |
| `ATTACHMENTS` | `attachments` | update page only |

Four facts a plan depends on:

1. **Labels are uppercase in the markup.** `role=` matching is exact and case-sensitive, so the
   name is `"COLLECTIONS"`, never `"Collections"`.
2. **The tab set is conditional** (`CreateUpdateForm/index.tsx:491-519`). Tabs are spliced in
   based on `SHOW_PRICES`, company settings and whether this is a create or update page. On the
   create page only `DETAILS` exists. A missing tab is a configuration result, not a bug.
3. **Only the active tab is in the DOM.** `ChipTabs.Content` defaults to `unmountOnHide`
   (`_common/ChipTabs/Content.tsx:9`), so a hidden panel returns `null`. Two consequences: a
   target on any tab **requires clicking that tab first**, and field ids that repeat across tabs
   (`remarks` exists on both Collections and Refunds) can never collide, because only one is
   mounted.
4. **Tab content mounts lazily but stays mounted within a tab's own subtree**
   (`LazyTabContent.tsx`), so a form's state survives leaving and returning to its tab inside one
   page visit.

## Preconditions

Everything in `v2-sales.md` applies, plus:

- `{orderId}` bound by the caller, to an order that is **not** cancelled or locked — those render
  the whole form read-only and remove the submits.
- **Collections needs `SHOW_PRICES`.** Without it the tab is not spliced in at all.
- **The collection form is hidden** when the order is blocked, cancelled, or already fully paid
  (`Collections/index.tsx:17`). On a fully-paid order the tab still renders, showing only the
  existing collections grid — so a "take a payment" flow fails at the form, not at the tab.
- Releasings need stock available at a location; returns need a completed releasing to return
  against; refunds need a collected amount to refund.

## Targets

### Tab navigation

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.tablist` | tablist "Order details tabs" | `role=tablist[name="Order details tabs"]` | `CreateUpdateForm/index.tsx:808` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-details` | tab "DETAILS" | `role=tab[name="DETAILS"]` | `CreateUpdateForm/index.tsx:416` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-collections` | tab "COLLECTIONS" | `role=tab[name="COLLECTIONS"]` | `CreateUpdateForm/index.tsx:424` | high | `SHOW_PRICES` only **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-releasings` | tab "RELEASINGS" | `role=tab[name="RELEASINGS"]` | `CreateUpdateForm/index.tsx:436` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-returns` | tab "RETURNS" | `role=tab[name="RETURNS"]` | `CreateUpdateForm/index.tsx:448` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-refunds` | tab "REFUNDS" | `role=tab[name="REFUNDS"]` | `CreateUpdateForm/index.tsx:460` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-audit-logs` | tab "AUDIT LOGS" | `role=tab[name="AUDIT LOGS"]` | `CreateUpdateForm/index.tsx:472` | high | two words, one space **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.tab-attachments` | tab "ATTACHMENTS" | `role=tab[name="ATTACHMENTS"]` | `CreateUpdateForm/index.tsx:484` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.active-tabpanel` | tabpanel | `role=tabpanel` | `_common/ChipTabs/Content.tsx:16` | high | only one exists at a time — use it to scope an ambiguous control **verified 2026-09-17**: 1 match. |

### Collections tab

The form is a header (date, currency, remarks) plus one or more indexed entry rows. The first
row is index `0`, so its fields are addressable; later rows are not — see Contract gaps.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.collection-date-input` | "Collection date" | `[data-field='collectionDate'] :is(input,textarea):not([aria-hidden])` | `Collections/CollectionEntry/index.tsx:295` | medium | date picker |
| `v2-sales-order-record.collection-currency-input` | combobox "Pay in" | `[data-field='currency'] :is(input,textarea):not([aria-hidden])` | `Collections/CollectionEntry/index.tsx:303` | medium | |
| `v2-sales-order-record.collection-remarks-input` | textbox "Remarks" | `[data-field='remarks'] :is(input,textarea):not([aria-hidden])` | `Collections/CollectionEntry/index.tsx:315` | medium | id is shared with the refund form, but never mounted at the same time |
| `v2-sales-order-record.collection-entry-type-input` | combobox "Payment Type*" | `[data-field='collectionEntries.0.type'] :is(input,textarea):not([aria-hidden])` | `Collections/CollectionEntry/CollectionEntryItem.tsx:149` | high | first entry row **verified 2026-09-18**: 1 match. |
| `v2-sales-order-record.collection-entry-amount-input` | "Amount" | `[data-field='collectionEntries.0.amount'] :is(input,textarea):not([aria-hidden])` | `…/CollectionEntryItem.tsx:234` | high | money input; disabled when the entry type is a post-dated cheque **verified 2026-09-18**: 1 match. |
| `v2-sales-order-record.collection-entry-payment-method-input` | combobox "Payment method" | `[data-field='collectionEntries.0.paymentMethod'] :is(input,textarea):not([aria-hidden])` | `…/CollectionEntryItem.tsx:253` | high | **verified 2026-09-18**: 1 match. |
| `v2-sales-order-record.collection-entry-reference-input` | textbox "Reference Number" | `[data-field='collectionEntries.0.referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/CollectionEntryItem.tsx:283` | high | **verified 2026-09-18**: 1 match. |
| `v2-sales-order-record.collection-create-pdc-button` | button "Create Post-dated Check" | `role=button[name="Create Post-dated Check"]` | `…/CollectionEntryItem.tsx:184` | medium | only when the entry type is a post-dated cheque |
| `v2-sales-order-record.collection-edit-pdc-button` | button "Edit Post-dated Check" | `role=button[name="Edit Post-dated Check"]` | `…/CollectionEntryItem.tsx:198` | medium | |
| `v2-sales-order-record.collection-submit` | button "Submit" | `role=tabpanel >> role=button[name="Submit"]` | `Collections/CollectionEntry/index.tsx:386` | high | **scoped to the panel** — "Submit" is used by the returns and refunds forms too **verified 2026-09-18**: 1 match. |

### Releasings tab

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.releasing-delivered-at-input` | date | `[data-field='deliveredAt'] :is(input,textarea):not([aria-hidden])` | `Releasings/AddReleasingForm/index.tsx:524` | low | rendered twice in the same form (two layouts); may match more than one |
| `v2-sales-order-record.releasing-driver-input` | combobox "Driver" | `[data-field='contactDriverIds'] :is(input,textarea):not([aria-hidden])` | `Releasings/AddReleasingForm/index.tsx:600` | high | `ContactCreatableAutocomplete` — the id mapping from `fieldName` is inferred **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.releasing-checker-input` | combobox "Checker" | `[data-field='contactCheckerIds'] :is(input,textarea):not([aria-hidden])` | `…/AddReleasingForm/index.tsx:617` | high | as above **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.releasing-helper-input` | combobox "Helper" | `[data-field='contactHelperIds'] :is(input,textarea):not([aria-hidden])` | `…/AddReleasingForm/index.tsx:634` | high | as above **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.releasing-dispatcher-input` | combobox "Dispatcher" | `[data-field='contactDispatcherIds'] :is(input,textarea):not([aria-hidden])` | `…/AddReleasingForm/index.tsx:651` | high | as above **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.releasing-add-location-button` | button "Add location" | `role=button[name="Add location"]` | `…/AddReleasingForm/index.tsx:664` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.releasing-apply-location-to-all-button` | button "Apply to All" | `role=dialog >> role=button[name="Apply to All"]` | `…/SelectLocationForAllDialog.tsx:105` | medium | |
| `v2-sales-order-record.releasing-complete-confirm-button` | button "Submit" | `role=dialog >> role=button[name="Submit"]` | `Releasings/Dialogs/CompleteReleasingDialog.tsx:32` | medium | confirms completion; dialog-scoped |
| `v2-sales-order-record.releasing-print-button` | button "Print" | `role=button[name="Print"]` | `…/ReleasingTable/ReleasingTableHeader.tsx:721` | unresolved | per releasing row **verified 2026-09-17: AMBIGUOUS — 2 matches.** Will throw on click. Needs scoping before use. |
| `v2-sales-order-record.releasing-open-button` | button "Open" | `role=button[name="Open"]` | `…/ReleasingTableHeader.tsx:727` | unresolved | opens the releasing record in `v2-inventory` **verified 2026-09-17: AMBIGUOUS — 9 matches.** Will throw on click. Needs scoping before use. |

### Returns tab

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.return-dummy-releasing-toggle` | checkbox "Return with dummy releasing" | `role=checkbox[name="Return with dummy releasing"]` | `Returns/index.tsx:106` | low | a `FormControlLabel`; may resolve as `switch` rather than `checkbox` |
| `v2-sales-order-record.return-driver-input` | combobox "Driver" | `[data-field='contactDriverIds'] :is(input,textarea):not([aria-hidden])` | `Returns/AddReturnForm/index.tsx:247` | low | same inference as releasings |
| `v2-sales-order-record.return-checker-input` | combobox "Checker" | `[data-field='contactCheckerIds'] :is(input,textarea):not([aria-hidden])` | `Returns/AddReturnForm/index.tsx:264` | low | |
| `v2-sales-order-record.return-helper-input` | combobox "Helper" | `[data-field='contactHelperIds'] :is(input,textarea):not([aria-hidden])` | `Returns/AddReturnForm/index.tsx:281` | low | |
| `v2-sales-order-record.return-submit` | button "Submit" | `role=tabpanel >> role=button[name="Submit"]` | `Returns/AddReturnForm/index.tsx:333` | medium | panel-scoped |
| `v2-sales-order-record.return-discard-item-button` | button "Discard Item" | `role=button[name="Discard Item"]` | `Returns/AddReturnForm/getReturnFormColumns.tsx:68` | medium | per line |
| `v2-sales-order-record.return-open-button` | button "Open" | `role=button[name="Open"]` | `…/SalesReturnsTableHeader.tsx:132` | medium | opens the return record |

### Refunds tab

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.refund-type-input` | combobox "Refund Type" | `[data-field='refundType'] :is(input,textarea):not([aria-hidden])` | `Refunds/RefundForm.tsx:184` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.refund-amount-input` | "Amount" | `[data-field='amount'] :is(input,textarea):not([aria-hidden])` | `Refunds/RefundForm.tsx:194` | high | money input **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.refund-date-input` | "Refund date" | `[data-field='refundDate'] :is(input,textarea):not([aria-hidden])` | `Refunds/RefundForm.tsx:203` | medium | date picker |
| `v2-sales-order-record.refund-bank-account-input` | combobox "Bank Account" | `[data-field='bankAccountId'] :is(input,textarea):not([aria-hidden])` | `Refunds/RefundForm.tsx:215` | high | **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.refund-remarks-input` | textbox "Remarks" | `[data-field='remarks'] :is(input,textarea):not([aria-hidden])` | `Refunds/RefundForm.tsx:243` | medium | same id as the collection remarks; never co-mounted |

### Print dialog

The header Print button (`v2-sales.order-print-button`) opens a dialog that picks a printout
template and a set of content toggles, then renders it.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.print-dialog` | dialog | `role=dialog` | `…/PrintModal/index.tsx:204` | high | header reads "Print" **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.print-template-input` | combobox "Title" | `[data-field='specId'] :is(input,textarea):not([aria-hidden])` | `…/PrintModal/index.tsx:208` | high | the printout template; labelled "Title", not "Template" **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.print-discount-option-input` | combobox "Discount" | `[data-field='discountOption'] :is(input,textarea):not([aria-hidden])` | `…/PrintModal/index.tsx:217` | medium | |
| `v2-sales-order-record.print-brand-name-option-input` | combobox "Brand Name" | `[data-field='brandNameOption'] :is(input,textarea):not([aria-hidden])` | `…/PrintModal/index.tsx:227` | medium | |
| `v2-sales-order-record.print-sku-option-input` | combobox "SKU" | `[data-field='skuOption'] :is(input,textarea):not([aria-hidden])` | `…/PrintModal/index.tsx:247` | medium | |
| `v2-sales-order-record.print-price-option-input` | combobox "Price" | `[data-field='priceOption'] :is(input,textarea):not([aria-hidden])` | `…/PrintModal/index.tsx:257` | medium | `SHOW_PRICES` |
| `v2-sales-order-record.print-confirm-button` | button "Print" | `role=dialog >> role=button[name="Print"]` | `…/PrintModal/index.tsx:295` | high | **must stay scoped** — the page header button is also "Print". Reads "Preparing..." while it renders **verified 2026-09-17**: 1 match. |

### Attachments and audit logs

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-sales-order-record.attachments-heading` | text "Upload New File" | `text=Upload New File` | `Attachments/index.tsx:88` | high | a heading, **not** a button — the control beneath it is a file input the plan cannot drive **verified 2026-09-17**: 1 match. |
| `v2-sales-order-record.attachments-files-heading` | text "Files" | `text=Files` | `Attachments/index.tsx:117` | unresolved | short generic string; may match elsewhere on the page **verified 2026-09-17: AMBIGUOUS — 3 matches.** Will throw on click. Needs scoping before use. |

The audit logs tab renders a grid with no identified controls — see Open questions.

## Flows

Every flow here starts the same way: land on the record, prove it loaded, then click the tab.
**The tab click is mandatory** — an inactive panel is not in the DOM, so a target on it cannot
resolve before its tab is selected.

### Open the collections tab

Preconditions: SALES READ **and** `SHOW_PRICES`; `{orderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `assertVisible` → `v2-sales.order-submit-update`
3. `click` → `v2-sales-order-record.tab-collections`
4. `assertVisible` → `v2-sales-order-record.active-tabpanel`

If step 3 fails, the tab was never rendered — almost always a missing `SHOW_PRICES`.

### Record a collection against an order

Preconditions: SALES WRITE, `SHOW_PRICES`; `{orderId}` bound to an order that is not cancelled,
blocked, or already fully paid; at least one payment method configured.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-collections`
3. `assertVisible` → `v2-sales-order-record.collection-entry-amount-input`
4. `fill` → `v2-sales-order-record.collection-entry-amount-input` = `<amount>`
5. `click` → `v2-sales-order-record.collection-entry-payment-method-input`
6. `click` → `shell.select-option` with `{optionLabel}` = `<payment method>`
7. `fill` → `v2-sales-order-record.collection-entry-reference-input` = `<reference number>`
8. `click` → `v2-sales-order-record.collection-submit`
9. `assertText` → `shell.toast` contains `<success copy>`

> Writes a financial record and changes the order's payment status. Destructive in effect —
> there is no undo in the UI.

Step 3 is the guard that distinguishes "tab is open" from "form is available": on a fully-paid
or blocked order the tab renders but the entry form does not.

### Open the releasings tab

Preconditions: SALES READ; `{orderId}` bound; releasings enabled for the company.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-releasings`
3. `assertVisible` → `v2-sales-order-record.active-tabpanel`

### Open a releasing from the order

> **BLOCKED by verification (2026-09-17).** `v2-sales-order-record.releasing-open-button` matched
> **9** elements on a real order — one per releasing row, exactly as the notes predicted. Needs
> row-scoping before this flow can run.

Preconditions: SALES READ; `{orderId}` bound to an order with at least one releasing.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-releasings`
3. `click` → `v2-sales-order-record.releasing-open-button`
4. `assertText` → `shell.breadcrumb` contains `Releasings`

Crosses into `v2-inventory` — the releasing record lives there.

### Issue a refund against an order

Preconditions: SALES WRITE, `SHOW_PRICES`; `{orderId}` bound to an order with a collected amount;
refunds enabled.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-refunds`
3. `assertVisible` → `v2-sales-order-record.refund-amount-input`
4. `fill` → `v2-sales-order-record.refund-amount-input` = `<amount>`
5. `click` → `v2-sales-order-record.refund-type-input`
6. `click` → `shell.select-option` with `{optionLabel}` = `<refund type>`
7. `click` → `v2-sales.order-submit-update`
8. `assertText` → `shell.toast` contains `<success copy>`

> Writes a financial record. Destructive in effect.

**Step 7 is wrong and known to be wrong** — the refund form's own submit was not separately
identified, and reusing the header submit will save the order rather than the refund. This flow
is listed because the fields are correct and useful; the submit must be resolved before it is
run. See Open questions.

### Print a sales order

Preconditions: SALES READ; `{orderId}` bound; at least one printout template configured for the
company.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales.order-print-button`
3. `assertVisible` → `v2-sales-order-record.print-template-input`
4. `click` → `v2-sales-order-record.print-template-input`
5. `click` → `shell.select-option` with `{optionLabel}` = `<template name>`
6. `click` → `v2-sales-order-record.print-confirm-button`

Step 6's target is dialog-scoped on purpose: the page header button behind the dialog is also
named "Print", so an unscoped selector matches two elements and throws.

**The flow ends without an assertion, and that is the honest stopping point.** Printing produces
a rendered document — a new tab, a print preview, or a download depending on the template. None
of those is reachable from the plan vocabulary, so there is nothing to assert. The flow proves
the dialog accepts a template and the button submits; it cannot prove anything was printed.

If step 3 fails, the company has no printout templates configured — the dropdown is empty and
the dialog is unusable.

### Set one location for every releasing line

Preconditions: SALES WRITE; `{orderId}` bound; the releasings tab permitted; the order has
unreleased items; at least one inventory location.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-releasings`
3. `click` → `v2-sales-order-record.releasing-add-location-button`
4. `assertVisible` → `v2-sales-order-record.releasing-apply-location-to-all-button`
5. `click` → `v2-sales-order-record.releasing-apply-location-to-all-button`

"Apply to All" is the one bulk operation inside a line-item grid that **is** expressible in the
six actions, because it is a dialog button rather than a per-row cell. It is therefore the only
way a plan can populate locations across releasing lines at all — setting them row by row is
impossible (see Contract gaps).

The dialog also carries a "Location" field (`SelectLocationForAllDialog.tsx:89`) that chooses
which location to apply. **It has no target yet** — its field name was not read — so as written
this flow applies whatever the dialog defaults to. Add the fill step once the field is
identified; until then treat the outcome as unspecified.

No assertion: the result is grid state, which the vocabulary cannot read.

### Read the audit trail

Preconditions: SALES READ; `{orderId}` bound.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-audit-logs`
3. `assertVisible` → `v2-sales-order-record.active-tabpanel`


### Complete a releasing from the order

Preconditions: SALES WRITE; `{orderId}` bound; the releasings tab permitted; a pending releasing
on the order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-releasings`
3. `click` → `v2-sales-order-record.releasing-complete-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Completing a releasing moves stock out of inventory.

**Incomplete**: the control that opens the completion dialog has no target, so step 2 to 3 is
missing a click.

### Print a releasing from the order

> **BLOCKED by verification (2026-09-17).** `v2-sales-order-record.releasing-print-button` matched
> **2** elements — per-row, as predicted.

Preconditions: SALES READ; `{orderId}` bound with at least one releasing.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-releasings`
3. `click` → `v2-sales-order-record.releasing-print-button`

No assertion — printing leaves the plan's reach. Note this is a **per-row** button: with more
than one releasing on the order the selector matches several and throws. Narrow it or use it only
on single-releasing orders.

### Record a return against an order

Preconditions: SALES WRITE; `{orderId}` bound; the returns tab permitted; a completed releasing
to return against.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-returns`
3. `assertVisible` → `v2-sales-order-record.return-submit`
4. `click` → `v2-sales-order-record.return-submit`
5. `assertText` → `shell.toast` contains `<validation or success copy>`

> Writes a record and returns stock to inventory.

Return **quantities are grid cells** with no targets, so this submits whatever the form
defaults to — most likely a validation message rather than a return. Step 3 is the useful part:
it proves the returns form rendered for this order, which is itself state-dependent (no eligible
items means no form).

`v2-sales-order-record.return-dummy-releasing-toggle` switches to the dummy-releasing variant of
the form, which is a different component behind the same panel-scoped submit selector.

### Discard a line from a return

Preconditions: as above, with the return form showing lines.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-returns`
3. `click` → `v2-sales-order-record.return-discard-item-button`

Per-row button — ambiguous when the form has more than one line. No assertion: the outcome is
grid state.

### Open a return from the order

Preconditions: SALES READ; `{orderId}` bound with at least one return.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-returns`
3. `click` → `v2-sales-order-record.return-open-button`
4. `assertText` → `shell.breadcrumb` contains `Sales Return`

Crosses into `v2-sales`. Per-row button, same ambiguity caveat.

### Attach a post-dated cheque to a collection

Preconditions: SALES WRITE, `SHOW_PRICES`; `{orderId}` bound to a collectable order.

1. `navigate` → `/companies/{companyId}/v2/sales-orders/{orderId}/update`
2. `click` → `v2-sales-order-record.tab-collections`
3. `click` → `v2-sales-order-record.collection-entry-type-input`
4. `click` → `shell.select-option` with `{optionLabel}` = `<post-dated cheque type>`
5. `assertVisible` → `v2-sales-order-record.collection-create-pdc-button`
6. `click` → `v2-sales-order-record.collection-create-pdc-button`

Steps 3-4 are what make step 5 possible: the PDC buttons only render once the entry type is a
post-dated cheque. The dialog that opens has no targets, so the flow stops there.
`v2-sales-order-record.collection-edit-pdc-button` replaces Create once a cheque is attached.

## Contract gaps

Everything in `v2-sales.md` applies. Specific to the record workspace:

- **Only the first entry row is addressable.** Collection entries are indexed
  (`collectionEntries.0.amount`, `.1.`, …). Index 0 has a stable id; a plan cannot target the
  second row without knowing its index, and nothing in the vocabulary can count rows. Split
  payments are out of reach.
- **Releasing and return line quantities are grid cells** — the same blocker as order items.
  Releasing part of an order, or returning specific quantities, cannot be expressed.
- **"Submit" is used by three different forms** on this page (collections, returns, refunds).
  Only one is ever mounted, but the targets are panel-scoped anyway so a future change that
  mounts two does not silently break them.
- **File upload on the Attachments tab** is a file input. Navigable, not drivable.
- **No way to assert payment status changed.** Recording a collection should move the order from
  `PENDING` to `PARTIALLY_PAID` or `PAID`. That status renders as an `Attributes.Item` span with
  no association, so the assertion has nowhere to point — the same gap noted in `v2-sales.md`.

## Open questions

- **The refund form's submit was not identified.** `Refunds/RefundForm.tsx` has fields but its
  submit button was not located in this pass. The refund flow is therefore incomplete and marked
  as such inline. Cheapest fix in this module.
- **`ContactCreatableAutocomplete` id mapping is inferred.** Every personnel field on the
  releasings and returns tabs (`contactDriverIds` and friends) assumes the component passes
  `fieldName` through to the input's `id` the way `Form.Field` does. It is a different component
  and may not. All five are `low`.
- **`deliveredAt` appears twice** in `AddReleasingForm` (lines 524 and 571 — two responsive
  layouts). If both are mounted at once the selector matches two elements and throws. Marked
  `low`; Phase 4 must check the match count.
- **The audit logs tab has no targets.** It renders a grid; its columns and controls were not
  read.
- **Which company settings enable Releasings, Returns and Refunds was not traced** — the tabs are
  spliced conditionally (`CreateUpdateForm/index.tsx:491-519`) but the flags behind the splice
  were not followed. Preconditions say "enabled for the company" because nothing more precise is
  known.
- **Offline variants exist for several tabs** (`OfflineAddReleasingForm`, `OfflineAddReturnForm`,
  `QueuedReleasingsList`) with different labels — "Save as Pending" instead of "Submit". A plan
  run against an offline-capable session may meet a different page entirely. Not covered.
