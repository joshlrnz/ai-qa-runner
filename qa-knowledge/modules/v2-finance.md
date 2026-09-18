---
module: v2-finance
routes: 15
targets: 36
flows: 12
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

> Writes a record when the form is complete. **The bank account form's fields have no targets
> yet**, so as written this flow only proves the page submits and reports something. Fill steps
> must be added once the fields are identified.

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
