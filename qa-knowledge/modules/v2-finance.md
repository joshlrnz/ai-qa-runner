---
module: v2-finance
routes: 15
targets: 61
flows: 14
status: drafted
lastUpdated: 2026-09-17
---

# v2-finance

## Purpose

Money out and money tracked: supplier payments against purchase orders, post-dated cheques,
bank accounts, expenses, and the customer accounts (receivables) view. Every route here is
sensitive to `SHOW_PRICES` — without it most of this module renders empty.

## Routes

| page name | path | permission gate |
| --- | --- | --- |
| `v2-finance.payments-list` / `-create` / `-update` | `…/v2/payments…` (`{paymentId}`) | PURCHASE_ORDER READ / WRITE |
| `v2-finance.post-dated-cheques-list` / `-create` / `-update` | `…/v2/post-dated-cheques…` (`{chequeId}`) | POST_DATE_CHEQUE READ / WRITE / DELETE |
| `v2-finance.bank-accounts-list` / `-create` / `-detail` | `…/v2/bank-accounts…` (`{bankAccountId}`) | BANK_ACCOUNT READ / WRITE |
| `v2-finance.expenses-list` / `-create` / `-update` | `…/v2/expenses…` (`{expenseId}`) | EXPENSE READ / WRITE |
| `v2-finance.accounts-list` / `-create` / `-scorecard` | `…/v2/accounts…` | CUSTOMER READ / WRITE |

Exact paths in `routes.md`.

## Preconditions

- Signed in; **Prime** tenant.
- **`SHOW_PRICES` is effectively mandatory for this whole module.** It gates all financial data
  at both the API and render layers. A role without it will see pages that load and tables that
  are empty, which reads as a broken selector rather than a permission result.
- Payments are gated on `PURCHASE_ORDER`, not on a payment-specific category — a role with
  purchasing access has payment access.
- Payments need an existing purchase order with an outstanding balance.
- Expense approval needs an approver role, which was not identified — see Open questions.

## Targets

List chrome (`shell.table-*`), `shell.select-option` and `shell.toast` come from `shell.md`.

### Payments

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.payment-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `PaymentsTable/index.tsx:164` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-finance.payment-row` | row containing the code | `tr:has(td:has-text('{recordCode}'))` | `PaymentsTable` | medium | |
| `v2-finance.payment-print-button` | button "Print" | `role=button[name="Print"]` | `Payments/CreateUpdateForm/index.tsx:112` | medium | |
| `v2-finance.payment-override-button` | button "Override" | `role=button[name="Override"]` | `Payments/CreateUpdateForm/index.tsx:120` | high | **verified 2026-09-17**: 1 match. |
| `v2-finance.payment-override-confirm-button` | button "Override payment" | `role=dialog >> role=button[name="Override payment"]` | `OverridePaymentDialog.tsx:145` | medium | |
| `v2-finance.payment-post-confirm-button` | button "Post payment" | `role=dialog >> role=button[name="Post payment"]` | `PostPaymentDialog.tsx:202` | medium | posting is irreversible |

### Post-dated cheques

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.cheque-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `PostDatedChequesTable/index.tsx:299` | unresolved | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. **verified 2026-09-18: AMBIGUOUS — 2 matches.** Needs scoping. |
| `v2-finance.cheque-bulk-create-button` | button "Bulk create checks" | `role=button[name="Bulk create checks"]` | `PostDatedChequesTable/index.tsx:273` | high | **verified 2026-09-17**: 1 match. |
| `v2-finance.cheque-import-button` | button "Import" | `role=button[name="Import"]` | `PostDatedChequesTable/index.tsx:279` | high | file picker **verified 2026-09-17**: 1 match. |
| `v2-finance.cheque-quick-create-confirm-button` | button "Create Post-dated Check" | `role=dialog >> role=button[name="Create Post-dated Check"]` | `QuickCreatePostDatedChequeDialog.tsx:225` | medium | reads "Save Changes" when editing — a state-dependent label, not a busy state |
| `v2-finance.cheque-bulk-submit-button` | button "Submit" | `role=dialog >> role=button[name="Submit"]` | `BulkCreatePostDatedCheque.tsx:234` | medium | |
| `v2-finance.cheque-cancel-button` | button "Cancel" | `role=button[name="Cancel"]` | `PostDatedCheque/CreateUpdateForm/index.tsx:245` | high | **verified 2026-09-18**: 1 match. |
| `v2-finance.cheque-delete-button` | button "Delete" | `role=button[name="Delete"]` | `PostDatedCheque/CreateUpdateForm/index.tsx:254` | high | **verified 2026-09-18**: 1 match. |

### Bank accounts

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.bank-account-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `BankAccountsTable/index.tsx:175` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-finance.bank-account-submit` | button "Submit" | `role=button[name="Submit"]` | `BankAccount/CreateUpdateForm/components/Details/index.tsx:75` | high | **verified 2026-09-18**: 1 match. |
| `v2-finance.bank-account-delete-button` | button "Delete" | `role=button[name="Delete"]` | `BankAccount/CreateUpdateForm/index.tsx:174` | high | **verified 2026-09-18**: 1 match. |

### Expenses

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.expense-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `Expenses/index.tsx:34` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-finance.expense-import-button` | button "Import" | `role=button[name="Import"]` | `Expenses/index.tsx:32` | high | file picker **verified 2026-09-17**: 1 match. |
| `v2-finance.expense-submit` | button "Submit" | `role=button[name="Submit"]` | `Expenses/CreateUpdateForm/components/Details/index.tsx:196` | high | **verified 2026-09-18**: 1 match. |
| `v2-finance.expense-approve-button` | button "Approve" | `role=button[name="Approve"]` | `Expenses/CreateUpdateForm/index.tsx:63` | high | approver-gated and status-gated **verified 2026-09-18**: 1 match. |
| `v2-finance.expense-reject-button` | button "Reject" | `role=button[name="Reject"]` | `Expenses/CreateUpdateForm/index.tsx:69` | high | **verified 2026-09-18**: 1 match. |


## Record page tabs

Tabs use the shared `ChipTabs` primitive: labels are **uppercase**, `role=` matching is exact and
case-sensitive, and **only the active panel is in the DOM** (`_common/ChipTabs/Content.tsx:9`), so
a tab must be clicked before any target inside it can resolve. Panels mount lazily.

### Payment record — `/v2/payments/{paymentId}/update`

Three tabs (`Payments/CreateUpdateForm/index.tsx:159-161`). Tablist aria-label is
`Order details tabs` — copied from the order pages, so it is shared with both the sales and
purchase order records. Note the tab is **AUDIT LOG**, singular, unlike every other record page.

| name | tab label | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.payment-tablist` | – | `role=tablist[name="Order details tabs"]` | `Payments/CreateUpdateForm/index.tsx` | high | shared string with the order records **verified 2026-09-17**: 1 match. |
| `v2-finance.payment-tab-payments` | PAYMENTS | `role=tab[name="PAYMENTS"]` | `…/index.tsx:159` | high | first tab is PAYMENTS, not DETAILS **verified 2026-09-17**: 1 match. |
| `v2-finance.payment-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:160` | high | **verified 2026-09-17**: 1 match. |
| `v2-finance.payment-tab-audit-log` | AUDIT LOG | `role=tab[name="AUDIT LOG"]` | `…/index.tsx:161` | high | **singular** — "AUDIT LOGS" will not match **verified 2026-09-17**: 1 match. |

### Expense record — `/v2/expenses/{expenseId}/update`

Four tabs (`Expenses/CreateUpdateForm/index.tsx:160-163`). Tablist aria-label:
`Expense details tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-finance.expense-tablist` | – | `role=tablist[name="Expense details tabs"]` | `Expenses/CreateUpdateForm/index.tsx` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.expense-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:160` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.expense-tab-payments` | PAYMENTS | `role=tab[name="PAYMENTS"]` | `…/index.tsx:161` | medium |
| `v2-finance.expense-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:162` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.expense-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:163` | medium **verified 2026-09-18**: 1 match. |

### Bank account record — `/v2/bank-accounts/{bankAccountId}`

Five tabs (`BankAccount/CreateUpdateForm/index.tsx:117-144`). Everything after DETAILS is a
read-only ledger of movements through the account. Tablist aria-label:
`Bank account details tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-finance.bank-account-tablist` | – | `role=tablist[name="Bank account details tabs"]` | `BankAccount/CreateUpdateForm/index.tsx:189` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.bank-account-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:117` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.bank-account-tab-collections` | COLLECTIONS | `role=tab[name="COLLECTIONS"]` | `…/index.tsx:126` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.bank-account-tab-payments` | PAYMENTS | `role=tab[name="PAYMENTS"]` | `…/index.tsx:131` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.bank-account-tab-post-dated-checks` | POST DATED CHECKS | `role=tab[name="POST DATED CHECKS"]` | `…/index.tsx:136` | medium **verified 2026-09-18**: 1 match. |
| `v2-finance.bank-account-tab-expense-payments` | EXPENSE PAYMENTS | `role=tab[name="EXPENSE PAYMENTS"]` | `…/index.tsx:144` | medium |


## Form fields

Every v2 form field is addressed through the **`data-field` attribute on its wrapper**:

```
[data-field='<field name>'] :is(input,textarea):not([aria-hidden])
```

`_common/Form/Field.tsx:121` puts `data-field={name}` on the wrapper of **every** field type, so
one shape works for text, number, money, date, autocomplete, select, checkbox and multiline alike.
It is an authored attribute, not a MUI internal, so it survives a library upgrade. The field name
is the form path passed to `Form.Field` — `name`, `payment.invoiceNumber`, `collectionEntries.0.amount`.

**Verified 2026-09-18.** The obvious alternative, `input[id='<name>']`, is wrong in two ways this
app actually hits: a multiline field renders a `<textarea>` plus a hidden autosize twin (hence
`:not([aria-hidden])`), and `DatePicker` never passes an `id` to its text field at all — every
date field matched **0**. Its `<label htmlFor={name}>` points at nothing too, so accessible-name
matching is not a fallback either.

Never match on the label: a required field appends a `*` inside it, which corrupts exact name
matching.


### Expense form — `/v2/expenses/create`, `/v2/expenses/{expenseId}/update`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.expense-name-input` | Name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/Details/ExpenseDetailsCard.tsx:116` | medium |
| `v2-finance.expense-supplier-input` | Supplier | autocomplete | `[data-field='supplierId'] :is(input,textarea):not([aria-hidden])` | `…/ExpenseDetailsCard.tsx:124` | medium |
| `v2-finance.expense-sales-agent-input` | Sales Agent | autocomplete | `[data-field='salesAgentId'] :is(input,textarea):not([aria-hidden])` | `…/ExpenseDetailsCard.tsx:133` | medium |
| `v2-finance.expense-reference-input` | Reference Number | text | `[data-field='referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/ExpenseDetailsCard.tsx:141` | medium |
| `v2-finance.expense-remarks-input` | Remarks | multiline | `[data-field='remarks'] :is(input,textarea):not([aria-hidden])` | `…/ExpenseDetailsCard.tsx:148` | medium |

### Bank account form — `/v2/bank-accounts/create`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.bank-account-name-input` | Bank Name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:33` | medium |
| `v2-finance.bank-account-number-input` | Bank Account Number | text | `[data-field='bankAccountNumber'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:42` | medium |
| `v2-finance.bank-account-xero-code-input` | Xero Account Code | text | `[data-field='xeroAccountCode'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:51` | medium |

### Post-dated cheque form — `/v2/post-dated-cheques/create`, `…/{chequeId}/update`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.cheque-date-input` | Check date **REQUIRED** | date | `[data-field='chequeDate'] :is(input,textarea):not([aria-hidden])` | `…/ChequeCard/index.tsx:54` | medium |
| `v2-finance.cheque-amount-input` | Amount **REQUIRED** | money | `[data-field='amount'] :is(input,textarea):not([aria-hidden])` | `…/ChequeCard/index.tsx:65` | medium |
| `v2-finance.cheque-reference-input` | Reference no. **REQUIRED** | text | `[data-field='referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/ChequeCard/index.tsx:75` | medium |
| `v2-finance.cheque-bank-account-input` | Bank account | autocomplete | `[data-field='bankAccountId'] :is(input,textarea):not([aria-hidden])` | `…/ChequeCard/index.tsx:85` | medium |
| `v2-finance.cheque-customer-input` | Customer **REQUIRED** | autocomplete | `[data-field='customerId'] :is(input,textarea):not([aria-hidden])` | `…/CustomerSupplierCard/index.tsx:93` | medium |
| `v2-finance.cheque-supplier-input` | Supplier **REQUIRED** | autocomplete | `[data-field='supplierId'] :is(input,textarea):not([aria-hidden])` | `…/CustomerSupplierCard/index.tsx:103` | medium |
| `v2-finance.cheque-remarks-input` | Remarks | multiline | `[data-field='remarks'] :is(input,textarea):not([aria-hidden])` | `…/CustomerSupplierCard/index.tsx:129` | medium |

Customer and Supplier are both marked required because the form switches on cheque direction —
only one renders at a time.

### Payment form — `/v2/payments/create`, `/v2/payments/{paymentId}/update`

Header fields plus indexed entry rows; only row `0` is addressable.

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.payment-supplier-input` | Supplier **REQUIRED** | autocomplete | `[data-field='supplierId'] :is(input,textarea):not([aria-hidden])` | `…/SupplierInformation/index.tsx:77` | medium |
| `v2-finance.payment-date-input` | Date Paid **REQUIRED** | date | `[data-field='paymentDate'] :is(input,textarea):not([aria-hidden])` | `…/PaymentInformation/index.tsx:84` | medium |
| `v2-finance.payment-currency-input` | Pay in | autocomplete | `[data-field='payInCurrency'] :is(input,textarea):not([aria-hidden])` | `…/PaymentInformation/index.tsx:77` | medium |
| `v2-finance.payment-entry-type-input` | Payment Type **REQUIRED** | autocomplete | `[data-field='paymentEntries.0.type'] :is(input,textarea):not([aria-hidden])` | `…/PaymentEntryItem.tsx:152` | medium |
| `v2-finance.payment-entry-amount-input` | Amount **REQUIRED** | money | `[data-field='paymentEntries.0.amount'] :is(input,textarea):not([aria-hidden])` | `…/PaymentEntryItem.tsx:187` | medium |
| `v2-finance.payment-entry-method-input` | Payment Method | autocomplete | `[data-field='paymentEntries.0.paymentMethod'] :is(input,textarea):not([aria-hidden])` | `…/PaymentEntryItem.tsx:207` | medium |
| `v2-finance.payment-entry-bank-account-input` | Bank Account | autocomplete | `[data-field='paymentEntries.0.bankAccountId'] :is(input,textarea):not([aria-hidden])` | `…/PaymentEntryItem.tsx:218` | medium |
| `v2-finance.payment-entry-reference-input` | Reference Number | text | `[data-field='paymentEntries.0.referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/PaymentEntryItem.tsx:243` | medium |
| `v2-finance.payment-entry-remarks-input` | Remarks | multiline | `[data-field='paymentEntries.0.remarks'] :is(input,textarea):not([aria-hidden])` | `…/PaymentEntryItem.tsx:252` | medium |
| `v2-finance.payment-override-confirm-checkbox` | I confirm… override | checkbox | `[data-field='confirmOverride'] :is(input,textarea):not([aria-hidden])` | `…/OverridePaymentDialog.tsx:132` | medium |
| `v2-finance.payment-post-confirm-checkbox` | I confirm… final | checkbox | `[data-field='confirmPost'] :is(input,textarea):not([aria-hidden])` | `…/PostPaymentDialog.tsx:182` | medium |

## Flows

### Open the payments list

Preconditions: PURCHASE_ORDER READ **and** `SHOW_PRICES`.

1. `navigate` → `/companies/{companyId}/v2/payments`
2. `assertText` → `shell.breadcrumb` contains `Payments`
3. `assertVisible` → `v2-finance.payment-create-button`

Step 3 rather than asserting a row: without `SHOW_PRICES` the table renders empty, so a row
assertion would fail for a permission reason and look like a selector bug.

### Find a payment by code

Preconditions: PURCHASE_ORDER READ, `SHOW_PRICES`; `{recordCode}` bound.

1. `navigate` → `/companies/{companyId}/v2/payments`
2. `fill` → `shell.table-search` = `<recordCode>`
3. `assertVisible` → `v2-finance.payment-row`

### Create a bank account

Preconditions: BANK_ACCOUNT WRITE.

1. `navigate` → `/companies/{companyId}/v2/bank-accounts/create`
2. `click` → `v2-finance.bank-account-submit`
3. `assertText` → `shell.toast` contains `<validation or success copy>`

> **Superseded** by *Create a bank account (complete)* below, which fills the fields. Kept only
> as the minimal "does the page submit" check.

### Approve an expense

Preconditions: EXPENSE WRITE plus approver rights; `{expenseId}` bound to a pending expense.

1. `navigate` → `/companies/{companyId}/v2/expenses/{expenseId}/update`
2. `assertVisible` → `v2-finance.expense-approve-button`
3. `click` → `v2-finance.expense-approve-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive in effect — approval changes the expense's state. Step 2 guards the common
> failure: the button simply does not render for a non-approver or a non-pending expense.


### Override a payment

Preconditions: PURCHASE_ORDER WRITE, `SHOW_PRICES`; `{paymentId}` bound to an overridable payment.

1. `navigate` → `/companies/{companyId}/v2/payments/{paymentId}/update`
2. `click` → `v2-finance.payment-override-button`
3. `click` → `v2-finance.payment-override-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive.

### Post a payment

Preconditions: PURCHASE_ORDER WRITE, `SHOW_PRICES`; `{paymentId}` bound to an unposted payment.

1. `navigate` → `/companies/{companyId}/v2/payments/{paymentId}/update`
2. `click` → `v2-finance.payment-post-confirm-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive and irreversible — a posted payment cannot be changed.

**Incomplete**: the page-level control that opens the post dialog has no target, so step 1 to 2
is missing a click. The dialog's own confirm checkbox is also untargeted here (the purchase-order
record file has it as `v2-purchase-order-record.payment-post-confirm-checkbox`).

### Print a payment

Preconditions: PURCHASE_ORDER READ; `{paymentId}` bound.

1. `navigate` → `/companies/{companyId}/v2/payments/{paymentId}/update`
2. `click` → `v2-finance.payment-print-button`

No assertion — printing leaves the plan's reach.

### Quick-create a post-dated cheque

Preconditions: POST_DATE_CHEQUE WRITE.

1. `navigate` → `/companies/{companyId}/v2/post-dated-cheques`
2. `click` → `v2-finance.cheque-create-button`
3. `click` → `v2-finance.cheque-quick-create-confirm-button`
4. `assertText` → `shell.toast` contains `<validation or success copy>`

> Writes a record. **The dialog's fields have no targets**, so this submits an empty form and will
> most likely surface validation copy rather than success. Useful as a "does the dialog open and
> validate" check; not yet a create flow.

The confirm button's label changes with mode — `Create Post-dated Check` when adding,
`Save Changes` when editing. The target matches the create label only.

### Bulk-create post-dated cheques

Preconditions: POST_DATE_CHEQUE WRITE.

1. `navigate` → `/companies/{companyId}/v2/post-dated-cheques`
2. `click` → `v2-finance.cheque-bulk-create-button`
3. `click` → `v2-finance.cheque-bulk-submit-button`
4. `assertText` → `shell.toast` contains `<validation or success copy>`

> Writes several records. Same caveat as above — the dialog's fields are untargeted.

### Cancel a post-dated cheque

Preconditions: POST_DATE_CHEQUE WRITE; `{chequeId}` bound.

1. `navigate` → `/companies/{companyId}/v2/post-dated-cheques/{chequeId}/update`
2. `click` → `v2-finance.cheque-cancel-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Any confirmation dialog is untargeted.

### Delete a bank account

Preconditions: BANK_ACCOUNT WRITE; `{bankAccountId}` bound.

1. `navigate` → `/companies/{companyId}/v2/bank-accounts/{bankAccountId}`
2. `click` → `v2-finance.bank-account-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete.

### Reject an expense

Preconditions: EXPENSE WRITE plus approver rights; `{expenseId}` bound to a pending expense.

1. `navigate` → `/companies/{companyId}/v2/expenses/{expenseId}/update`
2. `assertVisible` → `v2-finance.expense-reject-button`
3. `click` → `v2-finance.expense-reject-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive in effect. Step 2 guards the conditional render, as with Approve.

### Actions with no flow, and why

| target | why no flow |
| --- | --- |
| `v2-finance.cheque-import-button`, `v2-finance.expense-import-button` | file pickers |


### Create a bank account (complete)

Preconditions: BANK_ACCOUNT WRITE. Targets verified at 1.

1. `navigate` → `/companies/{companyId}/v2/bank-accounts/create`
2. `assertVisible` → `v2-finance.bank-account-name-input`
3. `fill` → `v2-finance.bank-account-name-input` = `<bank name>`
4. `fill` → `v2-finance.bank-account-number-input` = `<account number>`
5. `click` → `v2-finance.bank-account-submit`
6. `assertText` → `shell.toast` contains `Bank account created successfully`

> Destructive: writes a record. This replaces the earlier stub, which submitted an empty form
> because no field targets existed.

The toast copy is exact, from `BankAccount/CreateUpdateForm/index.tsx:70`. Step 3 is not
optional: `Submit` is disabled until the name field is non-empty
(`isSubmitButtonDisabled = !hasName || isSubmitting || hasErrors || !hasDirtyFields`,
`index.tsx:25`).

### Update a bank account

Preconditions: BANK_ACCOUNT WRITE; `{bankAccountId}` bound to an existing bank account.

1. `navigate` → `/companies/{companyId}/v2/bank-accounts/{bankAccountId}`
2. `assertVisible` → `v2-finance.bank-account-name-input`
3. `fill` → `v2-finance.bank-account-name-input` = `<bank name>`
4. `click` → `v2-finance.bank-account-submit`
5. `assertText` → `shell.toast` contains `Bank account updated successfully`

> Destructive: mutates an existing record.

The record page opens on the details tab (`setActiveTab('details')`, `index.tsx:84`), so step 3
needs no tab click. `!hasDirtyFields` also gates `Submit`, so the new name must differ from the
current one or the button stays disabled. Toast copy is exact, from `index.tsx:62`.

### Create an expense

Preconditions: EXPENSE WRITE.

1. `navigate` → `/companies/{companyId}/v2/expenses/create`
2. `assertVisible` → `v2-finance.expense-name-input`
3. `fill` → `v2-finance.expense-name-input` = `<expense name>`
4. `fill` → `v2-finance.expense-reference-input` = `<reference number>`
5. `click` → `v2-finance.expense-submit`
6. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Name is the only required field.

### Route flows — every page in this module

15 routes, each reachable by the same three-step shape. This table is the flow: read a row and
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
| `v2-finance.accounts-create` | `/companies/{companyId}/v2/accounts/create` | `New account` | — |  |
| `v2-finance.accounts-list` | `/companies/{companyId}/v2/accounts` | `Accounts` | `shell.table` |  |
| `v2-finance.accounts-scorecard` | `/companies/{companyId}/v2/accounts/scorecard` | `Scorecard` | — |  |
| `v2-finance.bank-accounts-create` | `/companies/{companyId}/v2/bank-accounts/create` | `New bank account` | `v2-finance.bank-account-submit` |  |
| `v2-finance.bank-accounts-detail` | `/companies/{companyId}/v2/bank-accounts/{bankAccountId}` | `Bank Account` | `v2-finance.bank-account-tab-details` | breadcrumb shows the record code once it loads |
| `v2-finance.bank-accounts-list` | `/companies/{companyId}/v2/bank-accounts` | `Bank Accounts` | `v2-finance.bank-account-create-button` |  |
| `v2-finance.expenses-create` | `/companies/{companyId}/v2/expenses/create` | `New expense` | `v2-finance.expense-submit` |  |
| `v2-finance.expenses-list` | `/companies/{companyId}/v2/expenses` | `Expenses` | `v2-finance.expense-create-button` |  |
| `v2-finance.expenses-update` | `/companies/{companyId}/v2/expenses/{expenseId}/update` | `Expense` | `v2-finance.expense-tab-details` | breadcrumb shows the record code once it loads |
| `v2-finance.payments-create` | `/companies/{companyId}/v2/payments/create` | `New payment` | — |  |
| `v2-finance.payments-list` | `/companies/{companyId}/v2/payments` | `Payments` | `v2-finance.payment-create-button` |  |
| `v2-finance.payments-update` | `/companies/{companyId}/v2/payments/{paymentId}/update` | `Payment` | `v2-finance.payment-tab-payments` | breadcrumb shows the record code once it loads |
| `v2-finance.post-dated-cheques-create` | `/companies/{companyId}/v2/post-dated-cheques/create` | `New post-dated check` | — |  |
| `v2-finance.post-dated-cheques-list` | `/companies/{companyId}/v2/post-dated-cheques` | `Post-Dated Checks` | `v2-finance.cheque-create-button` |  |
| `v2-finance.post-dated-cheques-update` | `/companies/{companyId}/v2/post-dated-cheques/{chequeId}/update` | `Post-Dated Check` | `v2-finance.cheque-delete-button` | breadcrumb shows the record code once it loads |

## Contract gaps

All of `v2-sales.md`'s gaps apply. Specific to finance:

- **Money cannot be asserted meaningfully.** Amounts render as `₱8,160.00`. `assertText` can
  match that substring, but a plan cannot verify a computed balance, an allocation, or that a
  payment reduced an outstanding amount by the right figure. This module's actual subject matter
  is largely outside the vocabulary.
- **`SHOW_PRICES` failures are indistinguishable from bugs.** An empty table is the symptom for
  both a missing permission and a broken query. Flows here assert a control rather than data
  wherever possible, but that weakens them.
- **Posting and overriding are irreversible** and have no undo path in the UI, so these flows
  cannot be re-run against the same record.
- **Payment entry is a nested sub-form** with its own Submit inside the parent form. Two
  controls named "Submit" may coexist on one page — see Open questions.

## Open questions

- **The payment form has no identified primary submit.** `Payments/CreateUpdateForm/index.tsx`
  renders no plain `<Button>` with text children; the submit likely lives in a payment-entry
  sub-component (`components/Payments/PaymentEntry`, which does have a "Submit"). Until this is
  resolved there is no create-a-payment flow, which is the main thing this module does.
- **No form field targets exist for any finance entity** — payments, cheques, bank accounts and
  expenses all lack field-level targets. Their `Form.Field` names were not extracted in this
  pass. This is the single biggest gap in the module and the cheapest to close.
- **Expense approver rights are unidentified.** Approve/Reject are conditionally rendered; the
  condition was not read. The approve flow guards with `assertVisible` instead.
- **`/v2/accounts` renders a v1 component** (`components/Account/Table`, outside `components/v2`)
  despite its `/v2` path, and is gated on `CUSTOMER` rather than a finance category. Its targets
  will not follow the v2 conventions the rest of this file assumes. None are drafted.
