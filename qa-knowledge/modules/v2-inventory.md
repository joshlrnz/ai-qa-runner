---
module: v2-inventory
routes: 35
targets: 109
flows: 25
status: drafted
lastUpdated: 2026-09-17
---

# v2-inventory

## Purpose

Stock itself and everything that moves it: the product catalogue, warehouse locations, and the
documents that change on-hand quantity — stocktakes, adjustments, transfers, releasings,
dispatches — plus assemblies and bills of materials for tenants that manufacture.

## Routes

| page name | path | permission gate |
| --- | --- | --- |
| `v2-inventory.products-list` / `-create` / `-detail` / `-update` | `…/v2/products…` (`{productId}`) | PRODUCT / INVENTORY READ, WRITE |
| `v2-inventory.stocktakes-list` / `-create` / `-update` | `…/v2/stocktakes…` (`{stocktakeId}`) | STOCKTAKE READ / WRITE / DELETE |
| `v2-inventory.stock-adjustments-list` / `-create` / `-update` | `…/v2/stock-adjustments…` (`{adjustmentId}`) | STOCK_ADJUSTMENT READ / WRITE / DELETE |
| `v2-inventory.stock-transfers-list` / `-create` / `-update` | `…/v2/stock-transfers…` (`{transferId}`) | STOCK_TRANSFER READ / WRITE / DELETE |
| `v2-inventory.stock-transfers-upload-with-ovision` | `…/v2/stock-transfers/upload-with-ovision` | STOCK_TRANSFER WRITE |
| `v2-inventory.inventory-locations-list` / `-detail` / `-qr-codes` | `…/v2/inventory-locations…` (`{inventoryLocationId}`) | INVENTORY READ |
| `v2-inventory.inventory-transactions-list` | `…/v2/inventory-transactions` | INVENTORY READ |
| `v2-inventory.releasings-list` / `-create` / `-update` | `…/v2/releasings…` (`{releasingId}`) | RELEASING / INVENTORY READ, WRITE |
| `v2-inventory.dispatches-list` / `-create` / `-update` | `…/v2/dispatches…` (`{dispatchId}`) | DISPATCH READ / WRITE |
| `v2-inventory.vehicles-list` / `-create` / `-update` | `…/v2/vehicles…` (`{vehicleId}`) | VEHICLE READ / WRITE |
| `v2-inventory.assemblies-list` / `-create` / `-update` | `…/v2/assemblies…` (`{assemblyId}`) | ASSEMBLY READ / WRITE |
| `v2-inventory.bill-of-materials-list` / `-create` / `-update` | `…/v2/bill-of-materials…` (`{billOfMaterialId}`) | RECIPE READ / WRITE |
| `v2-inventory.serial-numbers-generator-list`, `v2-inventory.barcodes-generator-list` | `…/v2/serial-numbers-generator`, `…/v2/barcodes-generator` | INVENTORY READ |

Exact paths in `routes.md`.

## Preconditions

- Signed in; **Prime** tenant.
- Category READ for the document being tested; create pages assert WRITE, and stocktakes,
  adjustments and transfers assert DELETE as well.
- At least one product and at least one inventory location. Every movement document needs both.
- Transfers need **two** locations.

### The pending/complete split matters

Stocktakes, stock adjustments, releasings and receivings all submit through two buttons rather
than one: **"Save as Pending"** stores a draft and moves no stock; **"Complete"** commits the
movement and changes on-hand quantity. A flow that means to test a stock change must click
Complete — asserting a toast after Save as Pending proves only that a draft saved.

## Targets

List chrome (`shell.table-*`), `shell.select-option` and `shell.toast` come from `shell.md`.

### Products

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.product-create-button` | button "Add product" | `role=button[name="Add product"]` | `ProductsPage/index.tsx:383` | high | labelled "Add product", not "Create" — the only list in v2 that differs **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-import-button` | button "Import" | `role=button[name="Import"]` | `ProductsPage/index.tsx:371` | high | file picker **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-row` | row containing the code | `tr:has(td:has-text('{recordCode}'))` | `ProductsPage` | medium | |
| `v2-inventory.product-name-input` | textbox "Name*" | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/Overview/components/GeneralSection.tsx:59` | high | required **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-submit` | button "Save changes" | `role=button[name="Save changes"]` | `…/Overview/components/ProductDetailsCard.tsx:95` | high | disabled until the form is dirty **and** valid **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-delete-button` | button "Delete Product" | `role=button[name="Delete Product"]` | `…/Overview/components/SettingsSection.tsx:98` | high | **verified 2026-09-17**: 1 match. |

### Stocktakes

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.stocktake-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `StocktakeTable/index.tsx:245` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.stocktake-import-button` | button "Import" | `role=button[name="Import"]` | `StocktakeTable/index.tsx:244` | high | file picker **verified 2026-09-17**: 1 match. |
| `v2-inventory.stocktake-sync-xero-button` | button "Sync to Xero" | `role=button[name="Sync to Xero"]` | `StocktakeTable/index.tsx:242` | low | Xero tenants only |
| `v2-inventory.stocktake-save-pending-button` | button "Save as Pending" | `role=button[name="Save as Pending"]` | `Stocktake/CreateUpdateForm/index.tsx:483` | medium | draft; moves no stock |
| `v2-inventory.stocktake-complete-button` | button "Complete" | `role=button[name="Complete"]` | `Stocktake/CreateUpdateForm/index.tsx:492` | medium | commits the count |
| `v2-inventory.stocktake-print-button` | button "Print" | `role=button[name="Print"]` | `Stocktake/CreateUpdateForm/index.tsx:429` | high | **verified 2026-09-17**: 1 match. |

### Stock adjustments

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.adjustment-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `StockAdjustmentTable/index.tsx:287` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.adjustment-save-pending-button` | button "Save as Pending" | `role=button[name="Save as Pending"]` | `StockAdjustment/CreateUpdateForm/index.tsx:434` | medium | |
| `v2-inventory.adjustment-complete-button` | button "Complete" | `role=button[name="Complete"]` | `StockAdjustment/CreateUpdateForm/index.tsx:443` | medium | commits the adjustment |
| `v2-inventory.adjustment-delete-button` | button "Delete" | `role=button[name="Delete"]` | `StockAdjustment/CreateUpdateForm/index.tsx:387` | medium | |

### Stock transfers

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.transfer-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `StockTransferTable/index.tsx:330` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.transfer-submit` | button "Submit" | `role=button[name="Submit"]` | `StockTransfer/CreateUpdateForm/index.tsx:428` | medium | transfers submit with one button, not the pending/complete pair |
| `v2-inventory.transfer-cancel-button` | button "Cancel" | `role=button[name="Cancel"]` | `StockTransfer/CreateUpdateForm/index.tsx:331` | high | opens a dialog **verified 2026-09-17**: 1 match. |
| `v2-inventory.transfer-cancel-confirm-button` | button "Cancel" | `role=dialog >> role=button[name="Cancel"]` | `CancelStockTransferDialog.tsx:99` | low | **the dialog's confirm and its dismiss may both be "Cancel"** — see Open questions |
| `v2-inventory.transfer-delete-button` | button "Delete" | `role=button[name="Delete"]` | `StockTransfer/CreateUpdateForm/index.tsx:340` | medium | |

### Releasings

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.releasing-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `ReleasingsTable/index.tsx:319` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.releasing-save-pending-button` | button "Save as Pending" | `role=button[name="Save as Pending"]` | `Releasings/CreateUpdateForm/index.tsx:520` | medium | |
| `v2-inventory.releasing-complete-button` | button "Complete" | `role=button[name="Complete"]` | `Releasings/CreateUpdateForm/index.tsx:529` | medium | releases stock against a sales order |
| `v2-inventory.releasing-override-button` | button "Override" | `role=button[name="Override"]` | `Releasings/CreateUpdateForm/index.tsx:428` | medium | |
| `v2-inventory.releasing-override-confirm-button` | button "Override releasing" | `role=dialog >> role=button[name="Override releasing"]` | `OverrideReleasingDialog.tsx:129` | medium | |
| `v2-inventory.releasing-create-sales-return-button` | button "Create sales return" | `role=button[name="Create sales return"]` | `Releasings/CreateUpdateForm/index.tsx:421` | medium | crosses into `v2-sales` |

### Locations, vehicles, assemblies, BOM

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.location-create-confirm-button` | button "Create" | `role=dialog >> role=button[name="Create"]` | `InventoryLocations/Dialogs/CreateUpdateLocationDialog/index.tsx:142` | medium | locations are created in a dialog, not on a page |
| `v2-inventory.location-view-qr-button` | button "View QR" | `role=button[name="View QR"]` | `…/getInventoryLocationColumns.tsx:131` | unresolved | **verified 2026-09-17: AMBIGUOUS — 4 matches.** Will throw on click. Needs scoping before use. |
| `v2-inventory.vehicle-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `VehiclesTable/index.tsx:134` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.vehicle-submit` | button "Submit" | `role=button[name="Submit"]` | `Vehicles/CreateUpdateForm/components/Details/index.tsx:61` | high | **verified 2026-09-18**: 1 match. |
| `v2-inventory.vehicle-delete-button` | button "Delete" | `role=button[name="Delete"]` | `Vehicles/CreateUpdateForm/index.tsx:151` | high | **verified 2026-09-18**: 1 match. |
| `v2-inventory.assembly-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `AssembliesTable/index.tsx:313` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.assembly-complete-button` | button "Complete" | `role=button[name="Complete"]` | `Assemblies/CreateUpdateForm` | high | builds the assembly and consumes components **verified 2026-09-18**: 1 match. |
| `v2-inventory.bom-create-button` | button "Create" | `button.MuiIconButton-root:not(.MuiDrawer-root *):has-text('Create')` | `BillOfMaterialsTable/index.tsx:273` | high | **verified 2026-09-17**: the plain `role=button[name="Create"]` matched **2** — the sidenav's own Create menu collides with the page button. Scoped selector above matched exactly 1 on all 10 list pages tested. **verified 2026-09-18**: the plain `role=button[name="Create"]` matched **2** (the rail's own Create menu collides); this scoped selector matched exactly 1 on all 10 list pages tested. |
| `v2-inventory.bom-submit` | button "Submit" | `role=button[name="Submit"]` | `BillOfMaterials/CreateUpdateForm/components/DetailsTabContent.tsx:121` | high | **verified 2026-09-18**: 1 match. |
| `v2-inventory.bom-create-po-button` | button "Create PO" | `role=button[name="Create PO"]` | `BillOfMaterials/CreateUpdateForm/index.tsx:182` | high | crosses into `v2-purchasing` **verified 2026-09-18**: 1 match. |


## Record page tabs

Tabs use the shared `ChipTabs` primitive: labels are **uppercase**, `role=` matching is exact and
case-sensitive, and **only the active panel is in the DOM** (`_common/ChipTabs/Content.tsx:9`), so
a tab must be clicked before any target inside it can resolve. Panels mount lazily.

### Product record — `/v2/products/{productId}/update`

Thirteen tabs, several of them conditional on the product's own configuration
(`Products/CreateUpdateForm/index.tsx:308-390`). Tablist aria-label: `Product details tabs`.

| name | tab label | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.product-tablist` | – | `role=tablist[name="Product details tabs"]` | `Products/CreateUpdateForm/index.tsx` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-overview` | OVERVIEW | `role=tab[name="OVERVIEW"]` | `…/index.tsx:311` | high | disabled until the product loads **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-serials` | SERIALS | `role=tab[name="SERIALS"]` | `…/index.tsx:331` | medium | only when `inventoryType` is `SERIALIZED` |
| `v2-inventory.product-tab-batches` | BATCHES | `role=tab[name="BATCHES"]` | `…/index.tsx:340` | high | only for batched products **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-locations` | LOCATIONS | `role=tab[name="LOCATIONS"]` | `…/index.tsx:347` | high | per-location on-hand **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-sales-orders` | SALES ORDERS | `role=tab[name="SALES ORDERS"]` | `…/index.tsx:352` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-purchase-orders` | PURCHASE ORDERS | `role=tab[name="PURCHASE ORDERS"]` | `…/index.tsx:357` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-inventory-history` | INVENTORY HISTORY | `role=tab[name="INVENTORY HISTORY"]` | `…/index.tsx:362` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-price-history` | PRICE HISTORY | `role=tab[name="PRICE HISTORY"]` | `…/index.tsx:367` | high | `SHOW_PRICES` **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-bill-of-materials` | BILL OF MATERIALS | `role=tab[name="BILL OF MATERIALS"]` | `…/index.tsx:372` | high | manufacturing tenants **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-assembly` | ASSEMBLY | `role=tab[name="ASSEMBLY"]` | `…/index.tsx:378` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-analytics` | ANALYTICS | `role=tab[name="ANALYTICS"]` | `…/index.tsx:384` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:389` | high | **verified 2026-09-17**: 1 match. |
| `v2-inventory.product-batch-edit-button` | – | `role=button[name="Edit"]` | `…/components/Batches/index.tsx:244` | high | per batch row; generic name, likely ambiguous **verified 2026-09-18**: 1 match. |
| `v2-inventory.product-batch-filter-button` | – | `role=button[name="Filter"]` | `…/components/Batches/index.tsx:281` | high | **verified 2026-09-18**: 1 match. |
| `v2-inventory.product-history-export-button` | – | `role=button[name="Export"]` | `…/components/History/index.tsx:120` | low | download |

**SERIALS and BATCHES are mutually exclusive** — they key off `inventoryType`, so a plan must
know which kind of product `{productId}` is before targeting either.

### Stocktake record — `/v2/stocktakes/{stocktakeId}/update`

Tablist aria-label: `Stocktake tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-inventory.stocktake-tablist` | – | `role=tablist[name="Stocktake tabs"]` | `Stocktake/CreateUpdateForm/index.tsx:463` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.stocktake-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:324` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.stocktake-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:331` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.stocktake-tab-history` | HISTORY | `role=tab[name="HISTORY"]` | `…/index.tsx:340` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.stocktake-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:354` | high **verified 2026-09-17**: 1 match. |

### Stock adjustment record — `/v2/stock-adjustments/{adjustmentId}/update`

Tablist aria-label: `Stock adjustment tabs`. Note the first tab is **ADJUSTMENTS**, not DETAILS.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-inventory.adjustment-tablist` | – | `role=tablist[name="Stock adjustment tabs"]` | `StockAdjustment/CreateUpdateForm/index.tsx:414` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.adjustment-tab-adjustments` | ADJUSTMENTS | `role=tab[name="ADJUSTMENTS"]` | `…/index.tsx:223` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.adjustment-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:230` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.adjustment-tab-history` | HISTORY | `role=tab[name="HISTORY"]` | `…/index.tsx:239` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.adjustment-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:248` | high **verified 2026-09-17**: 1 match. |

### Stock transfer record — `/v2/stock-transfers/{transferId}/update`

Tablist aria-label: `Stock transfer details tabs`. The first tab's **label is TRANSFERS but its
internal value is `adjustments`** — a copy-paste leftover. Target the label, not the value.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-inventory.transfer-tablist` | – | `role=tablist[name="Stock transfer details tabs"]` | `StockTransfer/CreateUpdateForm/index.tsx:414` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.transfer-tab-transfers` | TRANSFERS | `role=tab[name="TRANSFERS"]` | `…/index.tsx:247` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.transfer-tab-attachments` | ATTACHMENTS | `role=tab[name="ATTACHMENTS"]` | `…/index.tsx:254` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.transfer-tab-history` | HISTORY | `role=tab[name="HISTORY"]` | `…/index.tsx:261` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.transfer-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:268` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.transfer-override-received-qty-button` | – | `role=button[name="Override received quantity"]` | `…/StockTransferItemsDataGrid/ReceivedQuantityCell.tsx:69` | medium |
| `v2-inventory.transfer-override-save-button` | – | `role=dialog >> role=button[name="Save"]` | `…/OverrideReceivedQuantityDialog.tsx:108` | medium |

### Releasing record — `/v2/releasings/{releasingId}/update`

Tablist aria-label: `Releasing details tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-inventory.releasing-tablist` | – | `role=tablist[name="Releasing details tabs"]` | `Releasings/CreateUpdateForm/index.tsx:495` | medium |
| `v2-inventory.releasing-tab-details` | DETAILS | `role=tab[name="DETAILS"]` | `…/index.tsx:495` | medium |
| `v2-inventory.releasing-tab-delivery-receipts` | DELIVERY RECEIPTS | `role=tab[name="DELIVERY RECEIPTS"]` | `…/index.tsx:496` | medium |
| `v2-inventory.releasing-tab-audit-logs` | AUDIT LOGS | `role=tab[name="AUDIT LOGS"]` | `…/index.tsx:497` | medium |

### Releasings list status tabs

The releasings **list** also has a tab bar — a status filter, not record navigation. Tablist
aria-label: `Sales Order Tracker Tabs`.

| name | tab label | selector | source | confidence |
| --- | --- | --- | --- | --- |
| `v2-inventory.releasings-list-tab-all` | ALL | `role=tab[name="ALL"]` | `ReleasingsTable/index.tsx:355` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.releasings-list-tab-pending` | PENDING | `role=tab[name="PENDING"]` | `ReleasingsTable/index.tsx:356` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.releasings-list-tab-completed` | COMPLETED | `role=tab[name="COMPLETED"]` | `ReleasingsTable/index.tsx:357` | high **verified 2026-09-17**: 1 match. |
| `v2-inventory.releasings-list-tab-cancelled` | CANCELLED | `role=tab[name="CANCELLED"]` | `ReleasingsTable/index.tsx:358` | high **verified 2026-09-17**: 1 match. |


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


### Product form — `/v2/products/create`, `/v2/products/{productId}/update`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.product-name-field` | Name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/Overview/components/GeneralSection.tsx:59` | medium |
| `v2-inventory.product-sku-input` | SKU | text | `[data-field='code'] :is(input,textarea):not([aria-hidden])` | `…/GeneralSection.tsx:211` | medium |
| `v2-inventory.product-description-input` | Description | text | `[data-field='description'] :is(input,textarea):not([aria-hidden])` | `…/GeneralSection.tsx:232` | medium |
| `v2-inventory.product-barcode-input` | Barcode | text | `[data-field='barcode'] :is(input,textarea):not([aria-hidden])` | `…/GeneralSection.tsx:233` | medium |
| `v2-inventory.product-selling-price-input` | Selling Price **REQUIRED** | money | `[data-field='sellingPrice'] :is(input,textarea):not([aria-hidden])` | `…/PricingSection.tsx:118` | medium |
| `v2-inventory.product-buying-price-input` | Buying price | money | `[data-field='buyingPrice'] :is(input,textarea):not([aria-hidden])` | `…/PricingSection.tsx:97` | medium |
| `v2-inventory.product-srp-input` | Suggested Retail Price | money | `[data-field='suggestedRetailPrice'] :is(input,textarea):not([aria-hidden])` | `…/PricingSection.tsx:124` | medium |
| `v2-inventory.product-minimum-quantity-input` | Minimum quantity | number | `[data-field='minimumQuantity'] :is(input,textarea):not([aria-hidden])` | `…/StockLevelCard.tsx:45` | medium |
| `v2-inventory.product-maximum-quantity-input` | Maximum quantity | number | `[data-field='maximumQuantity'] :is(input,textarea):not([aria-hidden])` | `…/StockLevelCard.tsx:52` | medium |
| `v2-inventory.product-reordering-quantity-input` | Reordering quantity | number | `[data-field='reorderingQuantity'] :is(input,textarea):not([aria-hidden])` | `…/StockLevelCard.tsx:53` | medium |

`v2-inventory.product-name-field` is the same element as `v2-inventory.product-name-input` defined
above under Products; prefer the older name. Both are listed because the earlier one predates this
section.

### Vehicle form — `/v2/vehicles/create`, `/v2/vehicles/{vehicleId}/update`

The most completely expressible form in the knowledge base — no grid, all plain inputs.

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.vehicle-name-input` | Name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:8` | medium |
| `v2-inventory.vehicle-plate-number-input` | Plate number | text | `[data-field='plateNumber'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:9` | medium |
| `v2-inventory.vehicle-model-input` | Model | text | `[data-field='model'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:15` | medium |
| `v2-inventory.vehicle-maker-input` | Maker | text | `[data-field='maker'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:16` | medium |
| `v2-inventory.vehicle-color-input` | Color | text | `[data-field='color'] :is(input,textarea):not([aria-hidden])` | `…/GeneralCard/index.tsx:17` | medium |
| `v2-inventory.vehicle-cor-number-input` | Certificate of registration number | text | `[data-field='certificateOfRegistrationNumber'] :is(input,textarea):not([aria-hidden])` | `…/RegistrationDetailsCard/index.tsx:8` | medium |
| `v2-inventory.vehicle-engine-number-input` | Engine number | text | `[data-field='engineNumber'] :is(input,textarea):not([aria-hidden])` | `…/RegistrationDetailsCard/index.tsx:21` | medium |
| `v2-inventory.vehicle-chassis-number-input` | Chassis number | text | `[data-field='chassisNumber'] :is(input,textarea):not([aria-hidden])` | `…/RegistrationDetailsCard/index.tsx:27` | medium |
| `v2-inventory.vehicle-vin-input` | Vehicle identification number (VIN) | text | `[data-field='vehicleIdentificationNumber'] :is(input,textarea):not([aria-hidden])` | `…/RegistrationDetailsCard/index.tsx:33` | medium |

### Stock transfer form — `/v2/stock-transfers/create`, `…/{transferId}/update`

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.transfer-source-input` | Source **REQUIRED** | autocomplete | `[data-field='sourceLocationId'] :is(input,textarea):not([aria-hidden])` | `…/Adjustments/Location/index.tsx:100` | medium |
| `v2-inventory.transfer-destination-input` | Destination **REQUIRED** | autocomplete | `[data-field='destinationLocationId'] :is(input,textarea):not([aria-hidden])` | `…/Adjustments/Location/index.tsx:109` | medium |
| `v2-inventory.transfer-vehicle-input` | Vehicle | autocomplete | `[data-field='vehicleId'] :is(input,textarea):not([aria-hidden])` | `…/Delivery/DeliveryCard.tsx:42` | medium |
| `v2-inventory.transfer-delivered-at-input` | Delivery date | date | `[data-field='deliveredAt'] :is(input,textarea):not([aria-hidden])` | `…/Delivery/DeliveryCard.tsx:52` | medium |
| `v2-inventory.transfer-reference-input` | Reference Number | text | `[data-field='referenceNumber'] :is(input,textarea):not([aria-hidden])` | `…/Delivery/DeliveryCard.tsx:58` | medium |

Source and Destination are the two required fields, and they must differ — this is the one
transactional form whose header is fully expressible even though its line items are not.

### Stocktake and stock adjustment forms

Both are almost entirely line-item grids; their headers carry only a few fields.

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.stocktake-reference-date-input` | Reference Date | date | `[data-field='referenceDate'] :is(input,textarea):not([aria-hidden])` | `Stocktake/…/ReferencesCard/index.tsx:92` | medium |
| `v2-inventory.stocktake-contacts-input` | Contacts | multi-autocomplete | `[data-field='contactIds'] :is(input,textarea):not([aria-hidden])` | `Stocktake/…/ReferencesCard/index.tsx:100` | medium |
| `v2-inventory.adjustment-type-input` | Release Type | autocomplete | `[data-field='type'] :is(input,textarea):not([aria-hidden])` | `StockAdjustment/…/LocationAndRemarksCard/index.tsx:39` | medium |
| `v2-inventory.adjustment-reference-date-input` | Reference Date | date | `[data-field='referenceDate'] :is(input,textarea):not([aria-hidden])` | `StockAdjustment/…/ReferencesCard/index.tsx:162` | medium |
| `v2-inventory.adjustment-vehicle-input` | Vehicle | autocomplete | `[data-field='vehicleId'] :is(input,textarea):not([aria-hidden])` | `StockAdjustment/…/ReferencesCard/index.tsx:170` | medium |

### Inventory location dialog

Locations are created in a dialog, not on a page.

| name | field | type | selector | source | confidence |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.location-name-input` | Name **REQUIRED** | text | `[data-field='name'] :is(input,textarea):not([aria-hidden])` | `…/CreateUpdateLocationDialog/index.tsx:122` | medium |
| `v2-inventory.location-description-input` | Description | text | `[data-field='description'] :is(input,textarea):not([aria-hidden])` | `…/CreateUpdateLocationDialog/index.tsx:124` | medium |
| `v2-inventory.location-branches-input` | Branches | multi-autocomplete | `[data-field='branchIds'] :is(input,textarea):not([aria-hidden])` | `…/CreateUpdateLocationDialog/index.tsx:129` | medium |

## Flows

### Find a product

Preconditions: PRODUCT READ; `{recordCode}` bound.

1. `navigate` → `/companies/{companyId}/v2/products`
2. `assertText` → `shell.breadcrumb` contains `Products`
3. `fill` → `shell.table-search` = `<recordCode>`
4. `assertVisible` → `v2-inventory.product-row`

### Rename a product

Preconditions: PRODUCT WRITE; `{productId}` bound.

1. `navigate` → `/companies/{companyId}/v2/products/{productId}/update`
2. `fill` → `v2-inventory.product-name-input` = `<new name>`
3. `click` → `v2-inventory.product-submit`
4. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. The submit button is disabled until the form is both dirty and valid, so
> step 2 must actually change the value — refilling the same name leaves step 3 inert.

### Open a stocktake

Preconditions: STOCKTAKE READ; `{stocktakeId}` bound.

1. `navigate` → `/companies/{companyId}/v2/stocktakes/{stocktakeId}/update`
2. `assertVisible` → `v2-inventory.stocktake-save-pending-button`

### Save a stocktake as pending

Preconditions: STOCKTAKE WRITE; `{stocktakeId}` bound to a draft stocktake.

1. `navigate` → `/companies/{companyId}/v2/stocktakes/{stocktakeId}/update`
2. `click` → `v2-inventory.stocktake-save-pending-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record, but moves no stock. Use `v2-inventory.stocktake-complete-button` instead
> when the point is to test the stock movement — and treat that as destructive.

### Complete a stock adjustment

Preconditions: STOCK_ADJUSTMENT WRITE; `{adjustmentId}` bound to a pending adjustment with items.

1. `navigate` → `/companies/{companyId}/v2/stock-adjustments/{adjustmentId}/update`
2. `click` → `v2-inventory.adjustment-complete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Completing an adjustment changes on-hand quantity and cannot be undone by
> re-running the flow.


### Save a stock adjustment as pending

Preconditions: STOCK_ADJUSTMENT WRITE; `{adjustmentId}` bound.

1. `navigate` → `/companies/{companyId}/v2/stock-adjustments/{adjustmentId}/update`
2. `click` → `v2-inventory.adjustment-save-pending-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record. Moves no stock — use `v2-inventory.adjustment-complete-button` for that.

### Complete a stocktake

Preconditions: STOCKTAKE WRITE; `{stocktakeId}` bound to a pending stocktake with counted items.

1. `navigate` → `/companies/{companyId}/v2/stocktakes/{stocktakeId}/update`
2. `assertVisible` → `v2-inventory.stocktake-complete-button`
3. `click` → `v2-inventory.stocktake-complete-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Completing a stocktake writes counted quantities to on-hand stock.

### Print a stocktake

Preconditions: STOCKTAKE READ; `{stocktakeId}` bound.

1. `navigate` → `/companies/{companyId}/v2/stocktakes/{stocktakeId}/update`
2. `click` → `v2-inventory.stocktake-print-button`

No assertion — printing produces a document the vocabulary cannot reach. The flow proves the
control is present and clickable.

### Submit a stock transfer

Preconditions: STOCK_TRANSFER WRITE; `{transferId}` bound to an editable transfer.

1. `navigate` → `/companies/{companyId}/v2/stock-transfers/{transferId}/update`
2. `assertVisible` → `v2-inventory.transfer-submit`
3. `click` → `v2-inventory.transfer-submit`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Transfers move stock between locations on submit; there is no pending/complete
> split here, unlike stocktakes and adjustments.

### Cancel a stock transfer

Preconditions: STOCK_TRANSFER WRITE; `{transferId}` bound to a cancellable transfer.

1. `navigate` → `/companies/{companyId}/v2/stock-transfers/{transferId}/update`
2. `click` → `v2-inventory.transfer-cancel-button`
3. `click` → `v2-inventory.transfer-cancel-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. **Step 3's target is `low` confidence** — the dialog's confirm, its dismiss and the
> page trigger may all be named "Cancel", in which case the scoped selector still matches two
> elements and throws. Verify before running.

### Delete a stock transfer

Preconditions: STOCK_TRANSFER DELETE; `{transferId}` bound.

1. `navigate` → `/companies/{companyId}/v2/stock-transfers/{transferId}/update`
2. `click` → `v2-inventory.transfer-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete. The confirmation dialog this opens has no target — the flow is
> incomplete past step 2.

### Override a received quantity on a transfer

Preconditions: STOCK_TRANSFER WRITE; `{transferId}` bound to a transfer with received lines.

1. `navigate` → `/companies/{companyId}/v2/stock-transfers/{transferId}/update`
2. `click` → `v2-inventory.transfer-override-received-qty-button`
3. `click` → `v2-inventory.transfer-override-save-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. The dialog's quantity field has no target, so this saves whatever it opened with.

### Complete a releasing

Preconditions: RELEASING WRITE; `{releasingId}` bound to a pending releasing.

1. `navigate` → `/companies/{companyId}/v2/releasings/{releasingId}/update`
2. `assertVisible` → `v2-inventory.releasing-complete-button`
3. `click` → `v2-inventory.releasing-complete-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Releases stock against the linked sales order.

Use `v2-inventory.releasing-save-pending-button` for a draft that moves nothing.

### Override a releasing

Preconditions: RELEASING WRITE; `{releasingId}` bound to a completed releasing.

1. `navigate` → `/companies/{companyId}/v2/releasings/{releasingId}/update`
2. `click` → `v2-inventory.releasing-override-button`
3. `click` → `v2-inventory.releasing-override-confirm-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive.

### Create a sales return from a releasing

Preconditions: RELEASING READ and SALES WRITE; `{releasingId}` bound to a completed releasing.

1. `navigate` → `/companies/{companyId}/v2/releasings/{releasingId}/update`
2. `click` → `v2-inventory.releasing-create-sales-return-button`
3. `assertText` → `shell.breadcrumb` contains `Sales Returns`

Crosses into `v2-sales`. Asserts arrival rather than a toast, because this navigates rather than
mutating.

### Delete a product

Preconditions: PRODUCT WRITE; `{productId}` bound.

1. `navigate` → `/companies/{companyId}/v2/products/{productId}/update`
2. `click` → `v2-inventory.product-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete. Any confirmation dialog this opens has no target.

### Delete a vehicle

Preconditions: VEHICLE WRITE; `{vehicleId}` bound.

1. `navigate` → `/companies/{companyId}/v2/vehicles/{vehicleId}/update`
2. `click` → `v2-inventory.vehicle-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete.

### Delete a stock adjustment

Preconditions: STOCK_ADJUSTMENT DELETE; `{adjustmentId}` bound.

1. `navigate` → `/companies/{companyId}/v2/stock-adjustments/{adjustmentId}/update`
2. `click` → `v2-inventory.adjustment-delete-button`
3. `assertText` → `shell.toast` contains `<success copy>`

> Destructive, soft delete.

### Complete an assembly

Preconditions: ASSEMBLY WRITE; `{assemblyId}` bound to a pending assembly.

1. `navigate` → `/companies/{companyId}/v2/assemblies/{assemblyId}/update`
2. `assertVisible` → `v2-inventory.assembly-complete-button`
3. `click` → `v2-inventory.assembly-complete-button`
4. `assertText` → `shell.toast` contains `<success copy>`

> Destructive. Completing an assembly consumes component stock and produces the finished item.

### Create a purchase order from a bill of materials

Preconditions: RECIPE READ and PURCHASE_ORDER WRITE; `{billOfMaterialId}` bound.

1. `navigate` → `/companies/{companyId}/v2/bill-of-materials/{billOfMaterialId}/update`
2. `click` → `v2-inventory.bom-create-po-button`
3. `assertText` → `shell.breadcrumb` contains `Purchase Order`

Crosses into `v2-purchasing`.

### Create an inventory location

Preconditions: INVENTORY WRITE.

1. `navigate` → `/companies/{companyId}/v2/inventory-locations`
2. `click` → `v2-inventory.location-create-confirm-button`
3. `assertText` → `shell.toast` contains `<validation or success copy>`

> Writes a record. **Incomplete**: locations are created in a dialog, and neither the button that
> opens it nor the dialog's name field has a target. As written this will fail to find the confirm
> button. Listed so the gap is visible; see Open questions.

### View a location's QR code

> **BLOCKED by verification (2026-09-17).** `v2-inventory.location-view-qr-button` matched **4**
> elements — it is a per-row button and the selector is not row-scoped.

Preconditions: INVENTORY READ.

1. `navigate` → `/companies/{companyId}/v2/inventory-locations`
2. `click` → `v2-inventory.location-view-qr-button`

No assertion — the QR renders as an image or canvas with no text.

### Filter a product's batches

Preconditions: PRODUCT READ; `{productId}` bound to a batched product.

1. `navigate` → `/companies/{companyId}/v2/products/{productId}/update`
2. `click` → `v2-inventory.product-tab-batches`
3. `click` → `v2-inventory.product-batch-filter-button`
4. `click` → `shell.filter-apply-button`
5. `assertVisible` → `shell.table`

### Actions with no flow, and why

| target | why no flow |
| --- | --- |
| `v2-inventory.product-import-button`, `v2-inventory.stocktake-import-button` | file pickers |
| `v2-inventory.product-history-export-button` | download |
| `v2-inventory.stocktake-sync-xero-button` | external service; no observable result in the page |
| `v2-inventory.product-batch-edit-button` | per-row action with a generic name ("Edit"), almost certainly ambiguous; needs row-scoping before it can be used |


### Create a vehicle (complete)

Preconditions: VEHICLE WRITE. All targets verified at 1.

1. `navigate` → `/companies/{companyId}/v2/vehicles/create`
2. `assertVisible` → `v2-inventory.vehicle-name-input`
3. `fill` → `v2-inventory.vehicle-name-input` = `<vehicle name>`
4. `fill` → `v2-inventory.vehicle-plate-number-input` = `<plate number>`
5. `fill` → `v2-inventory.vehicle-model-input` = `<model>`
6. `click` → `v2-inventory.vehicle-submit`
7. `assertText` → `shell.toast` contains `<success copy>`

> Writes a record.

Vehicles have no line-item grid, so this module's only fully expressible create flow.

### Start a stock transfer

Preconditions: STOCK_TRANSFER WRITE; at least two inventory locations.

1. `navigate` → `/companies/{companyId}/v2/stock-transfers/create`
2. `assertVisible` → `v2-inventory.transfer-source-input`
3. `fill` → `v2-inventory.transfer-source-input` = `<source location>`
4. `click` → `shell.select-option` with `{optionLabel}` = `<source location>`
5. `fill` → `v2-inventory.transfer-destination-input` = `<destination location>`
6. `click` → `shell.select-option` with `{optionLabel}` = `<destination location>`
7. `fill` → `v2-inventory.transfer-reference-input` = `<reference number>`

> Fills the header only — **no submit step**, deliberately. A transfer cannot be submitted
> without line items, and those are grid cells with no targets. This flow proves the header is
> drivable and stops where the vocabulary does.

### Route flows — every page in this module

35 routes, each reachable by the same three-step shape. This table is the flow: read a row and
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
| `v2-inventory.assemblies-create` | `/companies/{companyId}/v2/assemblies/create` | `New assembly` | — |  |
| `v2-inventory.assemblies-list` | `/companies/{companyId}/v2/assemblies` | `Assemblies` | `v2-inventory.assembly-create-button` |  |
| `v2-inventory.assemblies-update` | `/companies/{companyId}/v2/assemblies/{assemblyId}/update` | `Assembly` | — | breadcrumb shows the record code once it loads |
| `v2-inventory.barcodes-generator-list` | `/companies/{companyId}/v2/barcodes-generator` | `Barcodes Generator` | `shell.table` |  |
| `v2-inventory.bill-of-materials-create` | `/companies/{companyId}/v2/bill-of-materials/create` | `New bill of material` | `v2-inventory.bom-submit` |  |
| `v2-inventory.bill-of-materials-list` | `/companies/{companyId}/v2/bill-of-materials` | `Bill of Materials` | `v2-inventory.bom-create-button` |  |
| `v2-inventory.bill-of-materials-update` | `/companies/{companyId}/v2/bill-of-materials/{billOfMaterialId}/update` | `Bill Of Material` | `v2-inventory.bom-submit` | breadcrumb shows the record code once it loads |
| `v2-inventory.dispatches-create` | `/companies/{companyId}/v2/dispatches/create` | `New dispatch` | — |  |
| `v2-inventory.dispatches-list` | `/companies/{companyId}/v2/dispatches` | `Dispatches` | `shell.table` |  |
| `v2-inventory.dispatches-update` | `/companies/{companyId}/v2/dispatches/{dispatchId}/update` | `Dispatch` | — | breadcrumb shows the record code once it loads |
| `v2-inventory.inventory-locations-detail` | `/companies/{companyId}/v2/inventory-locations/{inventoryLocationId}` | `Inventory Location` | — | breadcrumb shows the record code once it loads |
| `v2-inventory.inventory-locations-list` | `/companies/{companyId}/v2/inventory-locations` | `Inventory Locations` | `shell.table` |  |
| `v2-inventory.inventory-locations-qr-codes` | `/companies/{companyId}/v2/inventory-locations/qr-codes` | `Qr Codes` | — |  |
| `v2-inventory.inventory-transactions-list` | `/companies/{companyId}/v2/inventory-transactions` | `Inventory Transactions` | `shell.table` |  |
| `v2-inventory.products-create` | `/companies/{companyId}/v2/products/create` | `New product` | — |  |
| `v2-inventory.products-detail` | `/companies/{companyId}/v2/products/{productId}` | `Product` | `v2-inventory.product-tab-overview` | breadcrumb shows the record code once it loads |
| `v2-inventory.products-list` | `/companies/{companyId}/v2/products` | `Products` | `v2-inventory.product-create-button` |  |
| `v2-inventory.products-update` | `/companies/{companyId}/v2/products/{productId}/update` | `Product` | `v2-inventory.product-tab-overview` | breadcrumb shows the record code once it loads |
| `v2-inventory.releasings-create` | `/companies/{companyId}/v2/releasings/create` | `New releasing` | — |  |
| `v2-inventory.releasings-list` | `/companies/{companyId}/v2/releasings` | `Releasings` | `v2-inventory.releasing-create-button` |  |
| `v2-inventory.releasings-update` | `/companies/{companyId}/v2/releasings/{releasingId}/update` | `Releasing` | `v2-inventory.releasing-tab-details` | breadcrumb shows the record code once it loads |
| `v2-inventory.serial-numbers-generator-list` | `/companies/{companyId}/v2/serial-numbers-generator` | `Serial Numbers Generator` | `shell.table` |  |
| `v2-inventory.stock-adjustments-create` | `/companies/{companyId}/v2/stock-adjustments/create` | `New stock adjustment` | — |  |
| `v2-inventory.stock-adjustments-list` | `/companies/{companyId}/v2/stock-adjustments` | `Stock Adjustments` | `v2-inventory.adjustment-create-button` |  |
| `v2-inventory.stock-adjustments-update` | `/companies/{companyId}/v2/stock-adjustments/{adjustmentId}/update` | `Stock Adjustment` | `v2-inventory.adjustment-tab-adjustments` | breadcrumb shows the record code once it loads |
| `v2-inventory.stock-transfers-create` | `/companies/{companyId}/v2/stock-transfers/create` | `New stock transfer` | — |  |
| `v2-inventory.stock-transfers-list` | `/companies/{companyId}/v2/stock-transfers` | `Stock Transfers` | `v2-inventory.transfer-create-button` |  |
| `v2-inventory.stock-transfers-update` | `/companies/{companyId}/v2/stock-transfers/{transferId}/update` | `Stock Transfer` | `v2-inventory.transfer-tab-transfers` | breadcrumb shows the record code once it loads |
| `v2-inventory.stock-transfers-upload-with-ovision` | `/companies/{companyId}/v2/stock-transfers/upload-with-ovision` | `Upload with oVision` | — |  |
| `v2-inventory.stocktakes-create` | `/companies/{companyId}/v2/stocktakes/create` | `New stocktake` | — |  |
| `v2-inventory.stocktakes-list` | `/companies/{companyId}/v2/stocktakes` | `Stocktakes` | `v2-inventory.stocktake-create-button` |  |
| `v2-inventory.stocktakes-update` | `/companies/{companyId}/v2/stocktakes/{stocktakeId}/update` | `Stocktake` | `v2-inventory.stocktake-tab-details` | breadcrumb shows the record code once it loads |
| `v2-inventory.vehicles-create` | `/companies/{companyId}/v2/vehicles/create` | `New vehicle` | `v2-inventory.vehicle-submit` |  |
| `v2-inventory.vehicles-list` | `/companies/{companyId}/v2/vehicles` | `Vehicles` | `v2-inventory.vehicle-create-button` |  |
| `v2-inventory.vehicles-update` | `/companies/{companyId}/v2/vehicles/{vehicleId}/update` | `Vehicle` | `v2-inventory.vehicle-submit` | breadcrumb shows the record code once it loads |

## Contract gaps

All of `v2-sales.md`'s gaps apply. Specific to inventory:

- **Item grids block every create flow.** Stocktakes, adjustments, transfers, releasings and
  assemblies are all a header plus a line-item grid. Without addressable grid cells, none of
  them can be created from empty through the six actions — only opened and submitted. Every
  create flow in this module is therefore missing, by necessity, not by omission.
- **Quantity assertions are impossible.** The point of this module is that a number changed.
  `assertText` can read a rendered figure but nothing can compare before and after, so
  "completing this adjustment reduced stock by 5" is out of reach.
- **QR and barcode generators render canvases/images.** `serial-numbers-generator`,
  `barcodes-generator` and `inventory-locations/qr-codes` produce visual output with no text to
  assert. Navigable, effectively untestable.

## Open questions

- **`v2-inventory.transfer-cancel-confirm-button` is ambiguous.** `CancelStockTransferDialog.tsx:99`
  renders a submit button whose label appears to be "Cancel" — the same as both the page trigger
  and the dialog's own dismiss. If so, three elements share the name and the scoped selector
  still matches two. Marked `low`; do not use in a flow until Phase 4 resolves it.
- **Dispatches has almost no coverage.** Its form does not use plain `<Button>` children, so the
  extraction pass found only the list's "Create". The completion dialog is titled
  `Complete {dispatchCode}?` — a dynamic title, which suggests a `{recordCode}`-parameterised
  target would work, but the buttons were not read.
- **Assembly "Complete" line number unconfirmed.** The label is right; the file location was not
  pinned to a line.
- **Location creation happens in a dialog** reached from the locations list, and the trigger
  button for that dialog was not identified.
- **Products has three permission categories** (`PRODUCT`, `INVENTORY`, `SALES`) across its
  pages. Which page asserts which was not separated; a role failure here will look like a
  missing element.
