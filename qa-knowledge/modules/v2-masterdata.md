---
module: v2-masterdata
routes: 29
targets: 65
flows: 13
status: drafted
lastUpdated: 2026-09-17
---

# v2-masterdata

## Purpose

The records everything else points at — customers, customer groups, contacts, distributors —
together with the tenant's own configuration and observability surfaces: settings, audit logs,
import logs, the dashboard, the oGPT assistant, and the superuser company tools.

This module is deliberately broad. It is the home for anything that is neither a transaction nor
stock, so its routes have less in common with each other than the other modules' do.

## Routes

| page name | path | permission gate |
| --- | --- | --- |
| `v2-masterdata.customers-list` / `-create` / `-update` | `…/v2/customers…` (`{customerId}`) | CUSTOMER READ / WRITE |
| `v2-masterdata.customer-groups-list` / `-create` / `-update` | `…/v2/customer-groups…` (`{customerGroupId}`) | CUSTOMER READ / WRITE |
| `v2-masterdata.contacts-list` / `-create` / `-update` | `…/v2/contacts…` (`{contactId}`) | CONTACTS READ / WRITE |
| `v2-masterdata.distributors-*` | `…/v2/distributors…` (`{distributorId}`, `{reportId}`) | not identified |
| `v2-masterdata.dashboard-list` | `…/v2/dashboard` | CUSTOMER + PRODUCT + SALES + SALES_AGENT READ |
| `v2-masterdata.settings-list` | `…/v2/settings` | company-admin (enforced in the sidenav, not the page) |
| `v2-masterdata.audit-logs-list`, `v2-masterdata.import-logs-list` | `…/v2/audit-logs`, `…/v2/import-logs` | no page-level gate found |
| `v2-masterdata.oGPT-list` | `…/v2/oGPT` | **out of scope — AI surface** |
| `v2-masterdata.companies-list`, `v2-masterdata.company-*` | `…/v2/companies`, `…/v2/company…` | superuser |
| `v2-masterdata.customer-success-*`, `v2-masterdata.customer-success-announcements-*` | `…/v2/customer-success…` | superuser |
| `v2-masterdata.home` | `/companies/{companyId}/v2` | — |

Exact paths in `routes.md`.

**Several routes here report no page-level permission gate.** That does not mean they are open —
it means the gate is elsewhere (sidenav visibility, a superuser check inside the component, or
server-side on the tRPC procedure). Treat an unexpectedly empty page as a permission result.

## Preconditions

- Signed in; **Prime** tenant.
- Customers and customer groups share the `CUSTOMER` category — a role with customer access has
  group access.
- Settings, companies and the customer-success tools need company-admin or superuser. A normal
  user reaching them will not see the rail entry and may or may not be able to load the URL.
- For update flows: the record's id parameter bound.

## Targets

List chrome (`shell.table-*`), `shell.select-option` and `shell.toast` come from `shell.md`.

### Customers

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.customer-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `CustomersPage/index.tsx:162` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-masterdata.customer-export-button` | button "Export" | `role=button[name="Export"]` | `CustomersPage/index.tsx:157` | low | triggers a download the plan cannot follow |
| `v2-masterdata.customer-row` | row containing the code | `tr:has(td:has-text('{recordCode}'))` | `CustomersPage` | high | **verified 2026-09-18**: 1 match with a real customer code. The earlier "8 matches" came from probing with `recordCode` bound to the single letter `a`, which is substring-matched by `has-text`; bind a full code. |
| `v2-masterdata.customer-name-input` | textbox "Name*" | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/Details/components/AddressContactCard/index.tsx:29` | high | required **verified 2026-09-17**: 1 match. |
| `v2-masterdata.customer-code-input` | textbox "Code" | `[data-field='code'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:38` | high | **verified 2026-09-17**: 1 match. |
| `v2-masterdata.customer-submit` | button "Submit" | `role=button[name="Submit"]` | `Customers/CreateUpdateForm/components/Details/index.tsx:51` | high | **verified 2026-09-17**: 1 match. |
| `v2-masterdata.customer-delete-button` | button "Delete" | `role=button[name="Delete"]` | `Customers/CreateUpdateForm/index.tsx:420` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-attach-file-button` | button "Attach file" | `role=button[name="Attach file"]` | `Customers/CreateUpdateForm/index.tsx:414` | high | file picker **verified 2026-09-18**: 1 match. |

### Customer groups

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.customer-group-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `CustomerGroupTable/index.tsx:95` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-masterdata.customer-group-submit` | button "Submit" | `role=button[name="Submit"]` | `CustomerGroup/CreateUpdateForm/components/Details/index.tsx:50` | high | **verified 2026-09-17**: 1 match. |
| `v2-masterdata.customer-group-delete-button` | button "Delete" | `role=button[name="Delete"]` | `CustomerGroup/CreateUpdateForm/index.tsx:148` | high | **verified 2026-09-18**: 1 match. |

### Contacts

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.contact-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `ContactsPage/index.tsx:59` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-masterdata.contact-import-button` | button "Import" | `role=button[name="Import"]` | `ContactsPage/index.tsx:57` | high | file picker **verified 2026-09-17**: 1 match. |
| `v2-masterdata.contact-submit` | button "Submit" | `role=button[name="Submit"]` | `Contacts/CreateUpdateForm/Details/index.tsx:169` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-delete-button` | button "Delete" | `role=button[name="Delete"]` | `Contacts/CreateUpdateForm/index.tsx:184` | high | **verified 2026-09-18**: 1 match. |

### Settings, logs and oGPT

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.settings-user-create-button` | button "Create" | `role=button[name="Create"]` | `Settings/components/Auth/components/Users/index.tsx:426` | high | adds a company user **verified 2026-09-17**: 1 match. |
| `v2-masterdata.settings-user-export-button` | button "Export" | `role=button[name="Export"]` | `Settings/components/Auth/components/Users/index.tsx:427` | low | download |
| `v2-masterdata.settings-xero-save-button` | button "Save Account Codes" | `role=button[name="Save Account Codes"]` | `Settings/components/Integrations/XeroPanel.tsx:167` | low | only for Xero-connected tenants |
| `v2-masterdata.audit-logs-download-button` | button "Download" | `role=button[name="Download"]` | `AuditLogsPage/index.tsx:74` | high | download **verified 2026-09-17**: 1 match. |


## Record page tabs

Tabs use the shared `ChipTabs` primitive: labels are **uppercase**, `role=` matching is exact and
case-sensitive, and **only the active panel is in the DOM** (`_common/ChipTabs/Content.tsx:9`), so
a tab must be clicked before any target inside it can resolve. Panels mount lazily.

### Customer record — `/v2/customers/{customerId}/update`

Twelve tabs (`Customers/CreateUpdateForm/index.tsx:298-332`). This is the densest record page in
the module — a customer's whole commercial relationship hangs off it.

**The tablist's aria-label reads `Supplier details tabs`** — a copy-paste error in the source
(`Customers/CreateUpdateForm/index.tsx:435`). Target it as written; do not "correct" it to
`Customer details tabs` or the selector will not resolve. It is also identical to the supplier
record's tablist, so the tablist alone cannot tell you which record you are on.

| name | tab label | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.customer-tablist` | – | `role=tablist[name="Supplier details tabs"]` | `Customers/CreateUpdateForm/index.tsx:435` | high | mislabelled in the app — see above **verified 2026-09-17**: 1 match. |
| `v2-masterdata.customer-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:298` | high | **verified 2026-09-17**: 1 match. |
| `v2-masterdata.customer-tab-sales-orders` | SALES ORDERS | `role=tab[name="SALES ORDERS"]` | `…/index.tsx:307` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-product-codes` | PRODUCT CODES | `role=tab[name="PRODUCT CODES"]` | `…/index.tsx:308` | high | customer-specific product codes **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-receivables` | RECEIVABLES | `role=tab[name="RECEIVABLES"]` | `…/index.tsx:311` | high | `SHOW_PRICES` **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-collections` | COLLECTIONS | `role=tab[name="COLLECTIONS"]` | `…/index.tsx:315` | high | `SHOW_PRICES` **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-refunds` | REFUNDS | `role=tab[name="REFUNDS"]` | `…/index.tsx:318` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-returns` | RETURNS | `role=tab[name="RETURNS"]` | `…/index.tsx:322` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-post-dated-checks` | POST DATED CHECKS | `role=tab[name="POST DATED CHECKS"]` | `…/index.tsx:325` | high | no hyphen in the label **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-credits` | CREDITS | `role=tab[name="CREDITS"]` | `…/index.tsx:330` | high | credit limit and transactions **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:331` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:332` | high | **verified 2026-09-18**: 1 match. |
| `v2-masterdata.customer-active-tabpanel` | – | `role=tabpanel` | `_common/ChipTabs/Content.tsx:16` | high | only one exists at a time **verified 2026-09-17**: 1 match. |

### Contact record — `/v2/contacts/{contactId}/update`

Seven tabs (`Contacts/CreateUpdateForm/index.tsx:119-153`). Everything after DETAILS is a
read-only list of the documents this contact appears on. Tablist aria-label:
`Contact details tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-masterdata.contact-tablist` | – | `role=tablist[name="Contact details tabs"]` | `Contacts/CreateUpdateForm/index.tsx` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:119` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-releasings` | RELEASINGS | `role=tab[name="RELEASINGS"]` | `…/index.tsx:128` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-receivings` | RECEIVINGS | `role=tab[name="RECEIVINGS"]` | `…/index.tsx:133` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-customers` | CUSTOMERS | `role=tab[name="CUSTOMERS"]` | `…/index.tsx:138` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-suppliers` | SUPPLIERS | `role=tab[name="SUPPLIERS"]` | `…/index.tsx:143` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-stock-adjustments` | STOCK ADJUSTMENTS | `role=tab[name="STOCK ADJUSTMENTS"]` | `…/index.tsx:148` | medium **verified 2026-09-18**: 1 match. |
| `v2-masterdata.contact-tab-stocktakes` | STOCKTAKES | `role=tab[name="STOCKTAKES"]` | `…/index.tsx:153` | medium **verified 2026-09-18**: 1 match. |


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


### Customer form — `/v2/customers/create`, `/v2/customers/{customerId}/update`

The most complete create form in the knowledge base: no line-item grid, so a customer can be
created end to end through the vocabulary.

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.customer-legal-name-input` | Legal name | text | `[data-field='legalName'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:31` | medium |
| `v2-masterdata.customer-business-style-input` | Business style | text | `[data-field='businessStyle'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:39` | medium |
| `v2-masterdata.customer-mailing-address-input` | Mailing address | text | `[data-field='mailingAddress'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:46` | medium |
| `v2-masterdata.customer-email-input` | Primary email | text | `[data-field='email'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:53` | medium |
| `v2-masterdata.customer-phone-input` | Contact number | text | `[data-field='phoneNumber'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:59` | medium |
| `v2-masterdata.customer-group-input` | Customer group | autocomplete | `[data-field='customerGroupId'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:66` | medium |
| `v2-masterdata.customer-contacts-input` | Contacts | multi-autocomplete | `[data-field='contactIds'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:75` | medium |
| `v2-masterdata.customer-website-input` | Website | text | `[data-field='website'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:82` | medium |
| `v2-masterdata.customer-remarks-input` | Remarks | multiline | `[data-field='remarks'] :is(input,textarea):not([aria-hidden])` | `…/AddressContactCard/index.tsx:83` | medium |
| `v2-masterdata.customer-bank-input` | Bank | autocomplete | `[data-field='bank'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:33` | medium |
| `v2-masterdata.customer-account-number-input` | Account number | text | `[data-field='accountNumber'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:40` | medium |
| `v2-masterdata.customer-ewt-input` | EWT % | number | `[data-field='defaultEwtPercentage'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:53` | medium |
| `v2-masterdata.customer-price-matrix-input` | Sales price matrix | autocomplete | `[data-field='salesPriceMatrixId'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:62` | medium |
| `v2-masterdata.customer-sales-agent-input` | Sales agent | autocomplete | `[data-field='salesAgentId'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:71` | medium |
| `v2-masterdata.customer-tin-input` | TIN | text | `[data-field='tin'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:79` | medium |
| `v2-masterdata.customer-credit-limit-input` | Credit limit | money | `[data-field='creditLimit'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:80` | medium |
| `v2-masterdata.customer-vat-chargeable-checkbox` | This customer is VAT chargeable | checkbox | `[data-field='vatChargeable'] :is(input,textarea):not([aria-hidden])` | `…/PaymentCard/index.tsx:86` | medium |

`v2-masterdata.customer-name-input` (Name, **REQUIRED**) and `-code-input` (Code) are defined in
the Customers target table above.

### Customer group form — `/v2/customer-groups/create`, `…/{customerGroupId}/update`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.customer-group-name-input` | Customer group name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:25` | medium |
| `v2-masterdata.customer-group-customers-input` | Customers | multi-autocomplete | `[data-field='customers'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:33` | medium |
| `v2-masterdata.customer-group-price-matrix-input` | Sales price matrix | autocomplete | `[data-field='salesPriceMatrixId'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:41` | medium |

### Contact form — `/v2/contacts/create`, `/v2/contacts/{contactId}/update`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.contact-name-input` | Contact Name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `Contacts/CreateUpdateForm/Details/index.tsx:89` | medium |
| `v2-masterdata.contact-email-input` | Email | text | `[data-field='email'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:98` | medium |
| `v2-masterdata.contact-description-input` | Description | text | `[data-field='description'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:106` | medium |
| `v2-masterdata.contact-birthday-input` | Birthday | date | `[data-field='birthday'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:158` | medium |
| `v2-masterdata.contact-number-label-input` | phone label (row 0) | text | `[data-field='contactNumbers.0.label'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:43` | low |
| `v2-masterdata.contact-number-value-input` | phone number (row 0) | text | `[data-field='contactNumbers.0.number'] :is(input,textarea):not([aria-hidden])` | `…/Details/index.tsx:56` | low |

## Flows

### Find a customer

Preconditions: CUSTOMER READ; `{recordCode}` bound.

1. `navigate` → `/companies/{companyId}/v2/customers`
2. `assertText` → `shell.breadcrumb` contains `Customers`
3. `fill` → `shell.table-search` = `<recordCode>`
4. `assertVisible` → `v2-masterdata.customer-row`

### Create a customer

Preconditions: CUSTOMER WRITE.

1. `navigate` → `/companies/{companyId}/v2/customers/create`
2. `fill` → `v2-masterdata.customer-name-input` = `<customer name>`
3. `fill` → `v2-masterdata.customer-code-input` = `<customer code>`
4. `click` → `v2-masterdata.customer-submit`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. This is the most complete create flow in the knowledge base — customers have
> no line-item grid, so the whole form is expressible in the six actions.

### Rename a customer

Preconditions: CUSTOMER WRITE; `{customerId}` bound.

1. `navigate` → `/companies/{companyId}/v2/customers/{customerId}/update`
2. `fill` → `v2-masterdata.customer-name-input` = `<new name>`
3. `click` → `v2-masterdata.customer-submit`
4. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record.

### Open the audit log

Preconditions: whatever gates audit logs — not identified; assume company-admin.

1. `navigate` → `/companies/{companyId}/v2/audit-logs`
2. `assertText` → `shell.breadcrumb` contains `Audit Logs`
3. `assertVisible` → `shell.table`


### Delete a customer

Preconditions: CUSTOMER WRITE; `{customerId}` bound.

1. `navigate` → `/companies/{companyId}/v2/customers/{customerId}/update`
2. `click` → `v2-masterdata.customer-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete. Any confirmation dialog is untargeted — see Open questions.

### Delete a customer group

Preconditions: CUSTOMER WRITE; `{customerGroupId}` bound.

1. `navigate` → `/companies/{companyId}/v2/customer-groups/{customerGroupId}/update`
2. `click` → `v2-masterdata.customer-group-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete.

### Delete a contact

Preconditions: CONTACTS WRITE; `{contactId}` bound.

1. `navigate` → `/companies/{companyId}/v2/contacts/{contactId}/update`
2. `click` → `v2-masterdata.contact-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete.

### Tour a customer's record tabs

Preconditions: CUSTOMER READ and `SHOW_PRICES`; `{customerId}` bound.

1. `navigate` → `/companies/{companyId}/v2/customers/{customerId}/update`
2. `click` → `v2-masterdata.customer-tab-sales-orders`
3. `assertVisible` → `v2-masterdata.customer-active-tabpanel`
4. `click` → `v2-masterdata.customer-tab-collections`
5. `assertVisible` → `v2-masterdata.customer-active-tabpanel`
6. `click` → `v2-masterdata.customer-tab-credits`
7. `assertVisible` → `v2-masterdata.customer-active-tabpanel`

The shape to reuse for any record page's tabs: click, assert the panel, repeat. Each
`assertVisible` proves the previous panel unmounted and the new one mounted, since only one
`role=tabpanel` exists at a time. Substitute any of the twelve customer tabs.

A tab that is absent means a permission or configuration result — RECEIVABLES and COLLECTIONS
need `SHOW_PRICES`.

### Save Xero account codes

Preconditions: company admin; the tenant has Xero connected.

1. `navigate` → `/companies/{companyId}/v2/settings`
2. `click` → `v2-masterdata.settings-xero-save-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Writes integration settings. **Incomplete**: Settings is a tabbed panel and the tab navigation
> has no targets, so step 2 only works if the Xero panel happens to be the default view.

### Actions with no flow, and why

| target | why no flow |
| --- | --- |
| `v2-masterdata.customer-export-button`, `v2-masterdata.settings-user-export-button`, `v2-masterdata.audit-logs-download-button` | downloads |
| `v2-masterdata.contact-import-button` | file picker |
| `v2-masterdata.customer-attach-file-button` | file picker |


### Create a customer (complete)

Preconditions: CUSTOMER WRITE. Every target below is verified at exactly 1 match.

1. `navigate` → `/companies/{companyId}/v2/customers/create`
2. `assertVisible` → `v2-masterdata.customer-name-input`
3. `fill` → `v2-masterdata.customer-name-input` = `<customer name>`
4. `fill` → `v2-masterdata.customer-code-input` = `<customer code>`
5. `fill` → `v2-masterdata.customer-email-input` = `<email>`
6. `fill` → `v2-masterdata.customer-phone-input` = `<phone>`
7. `fill` → `v2-masterdata.customer-mailing-address-input` = `<address>`
8. `click` → `v2-masterdata.customer-submit`
9. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record.

This is the reference create flow for the whole knowledge base: no line-item grid, every field
addressable, every step verified. Copy its shape for any other header-only entity.

### Edit a customer's contact details

Preconditions: CUSTOMER WRITE; `{customerId}` bound.

1. `navigate` → `/companies/{companyId}/v2/customers/{customerId}/update`
2. `assertVisible` → `v2-masterdata.customer-tab-details`
3. `fill` → `v2-masterdata.customer-email-input` = `<new email>`
4. `fill` → `v2-masterdata.customer-phone-input` = `<new phone>`
5. `click` → `v2-masterdata.customer-submit`
6. `assertText` → `shell.toast` contains `<success copy>`

> Writes to an existing record. Step 2 guards that an existing customer loaded — the tab bar
> only renders on the update page.

### Create a customer group

Preconditions: CUSTOMER WRITE.

1. `navigate` → `/companies/{companyId}/v2/customer-groups/create`
2. `fill` → `v2-masterdata.customer-group-name-input` = `<group name>`
3. `click` → `v2-masterdata.customer-group-submit`
4. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Name is the only required field.

### Create a contact

Preconditions: CONTACTS WRITE.

1. `navigate` → `/companies/{companyId}/v2/contacts/create`
2. `fill` → `v2-masterdata.contact-name-input` = `<contact name>`
3. `fill` → `v2-masterdata.contact-email-input` = `<email>`
4. `click` → `v2-masterdata.contact-submit`
5. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record.

### Route flows — every page in this module

29 routes, each reachable by the same three-step shape. This table is the flow: read a row and
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
| `v2-masterdata.audit-logs-list` | `/companies/{companyId}/v2/audit-logs` | `Audit Logs` | `v2-masterdata.audit-logs-download-button` |  |
| `v2-masterdata.companies-list` | `/companies/{companyId}/v2/companies` | `Companies` | `shell.table` |  |
| `v2-masterdata.company-create` | `/companies/{companyId}/v2/company/create` | `New company` | — |  |
| `v2-masterdata.company-list` | `/companies/{companyId}/v2/company` | `Company` | `shell.table` |  |
| `v2-masterdata.contacts-create` | `/companies/{companyId}/v2/contacts/create` | `New contact` | `v2-masterdata.contact-submit` |  |
| `v2-masterdata.contacts-list` | `/companies/{companyId}/v2/contacts` | `Contacts` | `v2-masterdata.contact-create-button` |  |
| `v2-masterdata.contacts-update` | `/companies/{companyId}/v2/contacts/{contactId}/update` | `Contact` | `v2-masterdata.contact-tab-details` | breadcrumb shows the record code once it loads |
| `v2-masterdata.customer-groups-create` | `/companies/{companyId}/v2/customer-groups/create` | `New customer group` | `v2-masterdata.customer-group-submit` |  |
| `v2-masterdata.customer-groups-list` | `/companies/{companyId}/v2/customer-groups` | `Customer Groups` | `v2-masterdata.customer-group-create-button` |  |
| `v2-masterdata.customer-groups-update` | `/companies/{companyId}/v2/customer-groups/{customerGroupId}/update` | `Customer Group` | `v2-masterdata.customer-group-submit` | breadcrumb shows the record code once it loads |
| `v2-masterdata.customer-success-announcements-create` | `/companies/{companyId}/v2/customer-success-announcements/create` | `New customer success announcement` | — |  |
| `v2-masterdata.customer-success-announcements-list` | `/companies/{companyId}/v2/customer-success-announcements` | `Customer Success Announcements` | `shell.table` |  |
| `v2-masterdata.customer-success-announcements-update` | `/companies/{companyId}/v2/customer-success-announcements/{announcementId}/update` | `Customer Success Announcement` | — | breadcrumb shows the record code once it loads |
| `v2-masterdata.customer-success-tool-logs` | `/companies/{companyId}/v2/customer-success/tool-logs` | `Tool Logs` | — |  |
| `v2-masterdata.customer-success-tools` | `/companies/{companyId}/v2/customer-success/tools` | `Tools` | — |  |
| `v2-masterdata.customers-create` | `/companies/{companyId}/v2/customers/create` | `New customer` | `v2-masterdata.customer-submit` |  |
| `v2-masterdata.customers-list` | `/companies/{companyId}/v2/customers` | `Customers` | `v2-masterdata.customer-create-button` |  |
| `v2-masterdata.customers-update` | `/companies/{companyId}/v2/customers/{customerId}/update` | `Customer` | `v2-masterdata.customer-tab-details` | breadcrumb shows the record code once it loads |
| `v2-masterdata.dashboard-list` | `/companies/{companyId}/v2/dashboard` | `Dashboard` | `shell.table` |  |
| `v2-masterdata.distributors-create` | `/companies/{companyId}/v2/distributors/create` | `New distributor` | — |  |
| `v2-masterdata.distributors-detail` | `/companies/{companyId}/v2/distributors/{distributorId}` | `Distributor` | — | breadcrumb shows the record code once it loads |
| `v2-masterdata.distributors-list` | `/companies/{companyId}/v2/distributors` | `Distributors` | `shell.table` |  |
| `v2-masterdata.distributors-quarterly-reports` | `/companies/{companyId}/v2/distributors/{distributorId}/quarterly-reports` | `Distributor` | — | breadcrumb shows the record code once it loads |
| `v2-masterdata.distributors-quarterly-reports-detail` | `/companies/{companyId}/v2/distributors/{distributorId}/quarterly-reports/{reportId}` | `Distributor` | — | breadcrumb shows the record code once it loads |
| `v2-masterdata.distributors-update` | `/companies/{companyId}/v2/distributors/{distributorId}/update` | `Distributor` | — | breadcrumb shows the record code once it loads |
| `v2-masterdata.home` | `/companies/{companyId}/v2` | `Dashboard` | — |  |
| `v2-masterdata.import-logs-list` | `/companies/{companyId}/v2/import-logs` | `Import Logs` | `shell.table` |  |
| `v2-masterdata.oGPT-list` | `/companies/{companyId}/v2/oGPT` | `oGPT` | `shell.table` |  |
| `v2-masterdata.settings-list` | `/companies/{companyId}/v2/settings` | `Settings` | `v2-masterdata.settings-user-create-button` |  |

## Contract gaps

All of `v2-sales.md`'s gaps apply. Specific to master data:

- **Downloads are dead ends.** Customer export, audit log download and settings exports all
  start a file download. The plan cannot assert anything about the result.
- **Settings is a tabbed panel**, so most of its controls are behind a tab click that has no
  target yet. Only the users table and the Xero panel were reached.

## Open questions

- **Several routes have no identified permission gate** — settings, audit logs, import logs,
  oGPT, companies. The gate is real but lives outside the page file. Until it is pinned down,
  flows here cannot state accurate preconditions, and a 403 will look like a missing element.
- **Distributors has no targets.** Six routes, including nested quarterly reports, none read.
  It is also tenant-specific in practice.
- **The customer-success and announcements surfaces are superuser-only** and were not read.
- **Settings tab navigation is unmapped**, so the module can reach only the tab that happens to
  render first.
- **`v2-masterdata` is a catch-all.** If the reports or dashboard surfaces become a testing
  priority, they should be split out rather than grown here.
