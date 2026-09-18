# Routes

Every route in `src/pages` that renders UI. API routes (`src/pages/api/**`) are out of scope.

Next.js **Pages Router** (14.2.35) — route = file path under `src/pages`, `[param]` is a
dynamic segment, `index` collapses to the directory. There are no route groups, no parallel
slots and no per-segment `layout.tsx`; shared chrome comes from HOCs in `src/layouts/`
(`authenticated`, `authenticatedV2`, `general`).

`path` is written in **parametrized form** — `{companyId}`, `{orderId}` — which is what
`pages` in `application.json` stores. See `README.md` for how a parameter is bound at run time.

- In scope: **234** routes across 8 modules.
- Out of scope: **349** routes (v1 deprecated, novellino carve-out, v2 reports, dev-only pages) — summarised at the bottom, not mapped.

## shell (23)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `shell.home` | `/` | `src/pages/index.tsx` | public / shell | – |  |
| `shell._offline` | `/_offline` | `src/pages/_offline.tsx` | public / shell | – |  |
| `shell.403` | `/403` | `src/pages/403.tsx` | public / shell | – |  |
| `shell.404` | `/404` | `src/pages/404.tsx` | public / shell | – |  |
| `shell.account-deleted` | `/account-deleted` | `src/pages/account-deleted.tsx` | public / shell | – |  |
| `shell.auth-callback` | `/auth-callback` | `src/pages/auth-callback.tsx` | public / shell | – |  |
| `shell.companies-list` | `/companies` | `src/pages/companies/index.tsx` | session | – | company picker; lists companies the session can access |
| `shell.company-home` | `/companies/{companyId}` | `src/pages/companies/[companyId]/index.tsx` | session + company | `companyId` | company landing; where sign-in redirects to |
| `shell.company-deleted` | `/company-deleted` | `src/pages/company-deleted.tsx` | public / shell | – |  |
| `shell.delete-account` | `/delete-account` | `src/pages/delete-account.tsx` | public / shell | – |  |
| `shell.lite-check-email` | `/lite/check-email` | `src/pages/lite/check-email.tsx` | public / shell | – |  |
| `shell.lite-signup` | `/lite/signup` | `src/pages/lite/signup/index.tsx` | public / shell | – |  |
| `shell.lite-signup-complete` | `/lite/signup/complete` | `src/pages/lite/signup/complete.tsx` | public / shell | – |  |
| `shell.lite-thank-you` | `/lite/thank-you` | `src/pages/lite/thank-you.tsx` | public / shell | – |  |
| `shell.lite-verify-email` | `/lite/verify-email` | `src/pages/lite/verify-email.tsx` | public / shell | – |  |
| `shell.no-company-access` | `/no-company-access` | `src/pages/no-company-access.tsx` | public / shell | – |  |
| `shell.privacy-policy` | `/privacy-policy` | `src/pages/privacy-policy.tsx` | public / shell | – |  |
| `shell.redirect` | `/redirect` | `src/pages/redirect.tsx` | public / shell | – |  |
| `shell.sign-in` | `/sign-in` | `src/pages/sign-in.tsx` | public / shell | – |  |
| `shell.sign-out` | `/sign-out` | `src/pages/sign-out.tsx` | public / shell | – |  |
| `shell.sign-up` | `/sign-up` | `src/pages/sign-up.tsx` | public / shell | – |  |
| `shell.temporary-print-on-top` | `/temporary-print-on-top` | `src/pages/temporary-print-on-top.tsx` | public / shell | – |  |
| `shell.unauthorized` | `/unauthorized` | `src/pages/unauthorized.tsx` | public / shell | – |  |

## v2-sales (26)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `v2-sales.beat-route-pending-orders-list` | `/companies/{companyId}/v2/beat-route-pending-orders` | `src/pages/companies/[companyId]/v2/beat-route-pending-orders/index.tsx` | session + company | `companyId` |  |
| `v2-sales.quick-checkout-list` | `/companies/{companyId}/v2/quick-checkout` | `src/pages/companies/[companyId]/v2/quick-checkout/index.tsx` | session + company | `companyId` |  |
| `v2-sales.quick-checkout-order-receipts` | `/companies/{companyId}/v2/quick-checkout/order-receipts` | `src/pages/companies/[companyId]/v2/quick-checkout/order-receipts.tsx` | session + company | `companyId` |  |
| `v2-sales.quotations-list` | `/companies/{companyId}/v2/quotations` | `src/pages/companies/[companyId]/v2/quotations/index.tsx` | session + company | `companyId` |  |
| `v2-sales.quotations-update` | `/companies/{companyId}/v2/quotations/{quotationId}/update` | `src/pages/companies/[companyId]/v2/quotations/[quotationId]/update.tsx` | session + company | `companyId`, `quotationId` |  |
| `v2-sales.sales-agents-list` | `/companies/{companyId}/v2/sales-agents` | `src/pages/companies/[companyId]/v2/sales-agents/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-agents-update` | `/companies/{companyId}/v2/sales-agents/{salesAgentId}/update` | `src/pages/companies/[companyId]/v2/sales-agents/[salesAgentId]/update.tsx` | session + company | `companyId`, `salesAgentId` |  |
| `v2-sales.sales-agents-create` | `/companies/{companyId}/v2/sales-agents/create` | `src/pages/companies/[companyId]/v2/sales-agents/create.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-collections-list` | `/companies/{companyId}/v2/sales-collections` | `src/pages/companies/[companyId]/v2/sales-collections/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-collections-update` | `/companies/{companyId}/v2/sales-collections/{collectionId}/update` | `src/pages/companies/[companyId]/v2/sales-collections/[collectionId]/update.tsx` | session + company | `companyId`, `collectionId` |  |
| `v2-sales.sales-collections-create` | `/companies/{companyId}/v2/sales-collections/create` | `src/pages/companies/[companyId]/v2/sales-collections/create.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-orders-list` | `/companies/{companyId}/v2/sales-orders` | `src/pages/companies/[companyId]/v2/sales-orders/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-orders-update` | `/companies/{companyId}/v2/sales-orders/{orderId}/update` | `src/pages/companies/[companyId]/v2/sales-orders/[orderId]/update.tsx` | session + company | `companyId`, `orderId` |  |
| `v2-sales.sales-orders-analytics` | `/companies/{companyId}/v2/sales-orders/analytics` | `src/pages/companies/[companyId]/v2/sales-orders/analytics.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-orders-create` | `/companies/{companyId}/v2/sales-orders/create` | `src/pages/companies/[companyId]/v2/sales-orders/create.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-orders-upload-with-ovision` | `/companies/{companyId}/v2/sales-orders/upload-with-ovision` | `src/pages/companies/[companyId]/v2/sales-orders/upload-with-ovision.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-price-matrices-list` | `/companies/{companyId}/v2/sales-price-matrices` | `src/pages/companies/[companyId]/v2/sales-price-matrices/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-price-matrices-update` | `/companies/{companyId}/v2/sales-price-matrices/{salesPriceMatrixId}/update` | `src/pages/companies/[companyId]/v2/sales-price-matrices/[salesPriceMatrixId]/update.tsx` | session + company | `companyId`, `salesPriceMatrixId` |  |
| `v2-sales.sales-price-matrices-create` | `/companies/{companyId}/v2/sales-price-matrices/create` | `src/pages/companies/[companyId]/v2/sales-price-matrices/create.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-refunds-list` | `/companies/{companyId}/v2/sales-refunds` | `src/pages/companies/[companyId]/v2/sales-refunds/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-returns-list` | `/companies/{companyId}/v2/sales-returns` | `src/pages/companies/[companyId]/v2/sales-returns/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-returns-update` | `/companies/{companyId}/v2/sales-returns/{salesReturnId}/update` | `src/pages/companies/[companyId]/v2/sales-returns/[salesReturnId]/update.tsx` | session + company | `companyId`, `salesReturnId` |  |
| `v2-sales.sales-returns-create` | `/companies/{companyId}/v2/sales-returns/create` | `src/pages/companies/[companyId]/v2/sales-returns/create.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-services-list` | `/companies/{companyId}/v2/sales-services` | `src/pages/companies/[companyId]/v2/sales-services/index.tsx` | session + company | `companyId` |  |
| `v2-sales.sales-services-update` | `/companies/{companyId}/v2/sales-services/{salesServiceId}/update` | `src/pages/companies/[companyId]/v2/sales-services/[salesServiceId]/update.tsx` | session + company | `companyId`, `salesServiceId` |  |
| `v2-sales.sales-services-create` | `/companies/{companyId}/v2/sales-services/create` | `src/pages/companies/[companyId]/v2/sales-services/create.tsx` | session + company | `companyId` |  |

## v2-purchasing (23)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `v2-purchasing.purchase-order-returns-list` | `/companies/{companyId}/v2/purchase-order-returns` | `src/pages/companies/[companyId]/v2/purchase-order-returns/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-order-returns-update` | `/companies/{companyId}/v2/purchase-order-returns/{purchaseOrderReturnId}/update` | `src/pages/companies/[companyId]/v2/purchase-order-returns/[purchaseOrderReturnId]/update.tsx` | session + company | `companyId`, `purchaseOrderReturnId` |  |
| `v2-purchasing.purchase-order-returns-create` | `/companies/{companyId}/v2/purchase-order-returns/create` | `src/pages/companies/[companyId]/v2/purchase-order-returns/create.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-orders-list` | `/companies/{companyId}/v2/purchase-orders` | `src/pages/companies/[companyId]/v2/purchase-orders/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-orders-update` | `/companies/{companyId}/v2/purchase-orders/{purchaseOrderId}/update` | `src/pages/companies/[companyId]/v2/purchase-orders/[purchaseOrderId]/update.tsx` | session + company | `companyId`, `purchaseOrderId` |  |
| `v2-purchasing.purchase-orders-create` | `/companies/{companyId}/v2/purchase-orders/create` | `src/pages/companies/[companyId]/v2/purchase-orders/create.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-orders-upload-with-ovision` | `/companies/{companyId}/v2/purchase-orders/upload-with-ovision` | `src/pages/companies/[companyId]/v2/purchase-orders/upload-with-ovision.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-price-matrices-list` | `/companies/{companyId}/v2/purchase-price-matrices` | `src/pages/companies/[companyId]/v2/purchase-price-matrices/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-price-matrices-update` | `/companies/{companyId}/v2/purchase-price-matrices/{purchasePriceMatrixId}/update` | `src/pages/companies/[companyId]/v2/purchase-price-matrices/[purchasePriceMatrixId]/update.tsx` | session + company | `companyId`, `purchasePriceMatrixId` |  |
| `v2-purchasing.purchase-price-matrices-create` | `/companies/{companyId}/v2/purchase-price-matrices/create` | `src/pages/companies/[companyId]/v2/purchase-price-matrices/create.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-refunds-list` | `/companies/{companyId}/v2/purchase-refunds` | `src/pages/companies/[companyId]/v2/purchase-refunds/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-services-list` | `/companies/{companyId}/v2/purchase-services` | `src/pages/companies/[companyId]/v2/purchase-services/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.purchase-services-update` | `/companies/{companyId}/v2/purchase-services/{purchaseServiceId}/update` | `src/pages/companies/[companyId]/v2/purchase-services/[purchaseServiceId]/update.tsx` | session + company | `companyId`, `purchaseServiceId` |  |
| `v2-purchasing.purchase-services-create` | `/companies/{companyId}/v2/purchase-services/create` | `src/pages/companies/[companyId]/v2/purchase-services/create.tsx` | session + company | `companyId` |  |
| `v2-purchasing.receivings-list` | `/companies/{companyId}/v2/receivings` | `src/pages/companies/[companyId]/v2/receivings/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.receivings-update` | `/companies/{companyId}/v2/receivings/{receivingId}/update` | `src/pages/companies/[companyId]/v2/receivings/[receivingId]/update.tsx` | session + company | `companyId`, `receivingId` |  |
| `v2-purchasing.receivings-create` | `/companies/{companyId}/v2/receivings/create` | `src/pages/companies/[companyId]/v2/receivings/create.tsx` | session + company | `companyId` |  |
| `v2-purchasing.requisitions-list` | `/companies/{companyId}/v2/requisitions` | `src/pages/companies/[companyId]/v2/requisitions/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.requisitions-update` | `/companies/{companyId}/v2/requisitions/{requisitionId}/update` | `src/pages/companies/[companyId]/v2/requisitions/[requisitionId]/update.tsx` | session + company | `companyId`, `requisitionId` |  |
| `v2-purchasing.requisitions-create` | `/companies/{companyId}/v2/requisitions/create` | `src/pages/companies/[companyId]/v2/requisitions/create.tsx` | session + company | `companyId` |  |
| `v2-purchasing.suppliers-list` | `/companies/{companyId}/v2/suppliers` | `src/pages/companies/[companyId]/v2/suppliers/index.tsx` | session + company | `companyId` |  |
| `v2-purchasing.suppliers-update` | `/companies/{companyId}/v2/suppliers/{supplierId}/update` | `src/pages/companies/[companyId]/v2/suppliers/[supplierId]/update.tsx` | session + company | `companyId`, `supplierId` |  |
| `v2-purchasing.suppliers-create` | `/companies/{companyId}/v2/suppliers/create` | `src/pages/companies/[companyId]/v2/suppliers/create.tsx` | session + company | `companyId` |  |

## v2-inventory (35)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `v2-inventory.assemblies-list` | `/companies/{companyId}/v2/assemblies` | `src/pages/companies/[companyId]/v2/assemblies/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.assemblies-update` | `/companies/{companyId}/v2/assemblies/{assemblyId}/update` | `src/pages/companies/[companyId]/v2/assemblies/[assemblyId]/update.tsx` | session + company | `companyId`, `assemblyId` |  |
| `v2-inventory.assemblies-create` | `/companies/{companyId}/v2/assemblies/create` | `src/pages/companies/[companyId]/v2/assemblies/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.barcodes-generator-list` | `/companies/{companyId}/v2/barcodes-generator` | `src/pages/companies/[companyId]/v2/barcodes-generator/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.bill-of-materials-list` | `/companies/{companyId}/v2/bill-of-materials` | `src/pages/companies/[companyId]/v2/bill-of-materials/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.bill-of-materials-update` | `/companies/{companyId}/v2/bill-of-materials/{billOfMaterialId}/update` | `src/pages/companies/[companyId]/v2/bill-of-materials/[billOfMaterialId]/update.tsx` | session + company | `companyId`, `billOfMaterialId` |  |
| `v2-inventory.bill-of-materials-create` | `/companies/{companyId}/v2/bill-of-materials/create` | `src/pages/companies/[companyId]/v2/bill-of-materials/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.dispatches-list` | `/companies/{companyId}/v2/dispatches` | `src/pages/companies/[companyId]/v2/dispatches/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.dispatches-update` | `/companies/{companyId}/v2/dispatches/{dispatchId}/update` | `src/pages/companies/[companyId]/v2/dispatches/[dispatchId]/update.tsx` | session + company | `companyId`, `dispatchId` |  |
| `v2-inventory.dispatches-create` | `/companies/{companyId}/v2/dispatches/create` | `src/pages/companies/[companyId]/v2/dispatches/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.inventory-locations-list` | `/companies/{companyId}/v2/inventory-locations` | `src/pages/companies/[companyId]/v2/inventory-locations/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.inventory-locations-detail` | `/companies/{companyId}/v2/inventory-locations/{inventoryLocationId}` | `src/pages/companies/[companyId]/v2/inventory-locations/[inventoryLocationId]/index.tsx` | session + company | `companyId`, `inventoryLocationId` |  |
| `v2-inventory.inventory-locations-qr-codes` | `/companies/{companyId}/v2/inventory-locations/qr-codes` | `src/pages/companies/[companyId]/v2/inventory-locations/qr-codes.tsx` | session + company | `companyId` |  |
| `v2-inventory.inventory-transactions-list` | `/companies/{companyId}/v2/inventory-transactions` | `src/pages/companies/[companyId]/v2/inventory-transactions/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.products-list` | `/companies/{companyId}/v2/products` | `src/pages/companies/[companyId]/v2/products/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.products-detail` | `/companies/{companyId}/v2/products/{productId}` | `src/pages/companies/[companyId]/v2/products/[productId]/index.tsx` | session + company | `companyId`, `productId` |  |
| `v2-inventory.products-update` | `/companies/{companyId}/v2/products/{productId}/update` | `src/pages/companies/[companyId]/v2/products/[productId]/update.tsx` | session + company | `companyId`, `productId` |  |
| `v2-inventory.products-create` | `/companies/{companyId}/v2/products/create` | `src/pages/companies/[companyId]/v2/products/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.releasings-list` | `/companies/{companyId}/v2/releasings` | `src/pages/companies/[companyId]/v2/releasings/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.releasings-update` | `/companies/{companyId}/v2/releasings/{releasingId}/update` | `src/pages/companies/[companyId]/v2/releasings/[releasingId]/update.tsx` | session + company | `companyId`, `releasingId` |  |
| `v2-inventory.releasings-create` | `/companies/{companyId}/v2/releasings/create` | `src/pages/companies/[companyId]/v2/releasings/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.serial-numbers-generator-list` | `/companies/{companyId}/v2/serial-numbers-generator` | `src/pages/companies/[companyId]/v2/serial-numbers-generator/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.stock-adjustments-list` | `/companies/{companyId}/v2/stock-adjustments` | `src/pages/companies/[companyId]/v2/stock-adjustments/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.stock-adjustments-update` | `/companies/{companyId}/v2/stock-adjustments/{adjustmentId}/update` | `src/pages/companies/[companyId]/v2/stock-adjustments/[adjustmentId]/update.tsx` | session + company | `companyId`, `adjustmentId` |  |
| `v2-inventory.stock-adjustments-create` | `/companies/{companyId}/v2/stock-adjustments/create` | `src/pages/companies/[companyId]/v2/stock-adjustments/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.stock-transfers-list` | `/companies/{companyId}/v2/stock-transfers` | `src/pages/companies/[companyId]/v2/stock-transfers/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.stock-transfers-update` | `/companies/{companyId}/v2/stock-transfers/{transferId}/update` | `src/pages/companies/[companyId]/v2/stock-transfers/[transferId]/update.tsx` | session + company | `companyId`, `transferId` |  |
| `v2-inventory.stock-transfers-create` | `/companies/{companyId}/v2/stock-transfers/create` | `src/pages/companies/[companyId]/v2/stock-transfers/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.stock-transfers-upload-with-ovision` | `/companies/{companyId}/v2/stock-transfers/upload-with-ovision` | `src/pages/companies/[companyId]/v2/stock-transfers/upload-with-ovision.tsx` | session + company | `companyId` |  |
| `v2-inventory.stocktakes-list` | `/companies/{companyId}/v2/stocktakes` | `src/pages/companies/[companyId]/v2/stocktakes/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.stocktakes-update` | `/companies/{companyId}/v2/stocktakes/{stocktakeId}/update` | `src/pages/companies/[companyId]/v2/stocktakes/[stocktakeId]/update.tsx` | session + company | `companyId`, `stocktakeId` |  |
| `v2-inventory.stocktakes-create` | `/companies/{companyId}/v2/stocktakes/create` | `src/pages/companies/[companyId]/v2/stocktakes/create.tsx` | session + company | `companyId` |  |
| `v2-inventory.vehicles-list` | `/companies/{companyId}/v2/vehicles` | `src/pages/companies/[companyId]/v2/vehicles/index.tsx` | session + company | `companyId` |  |
| `v2-inventory.vehicles-update` | `/companies/{companyId}/v2/vehicles/{vehicleId}/update` | `src/pages/companies/[companyId]/v2/vehicles/[vehicleId]/update.tsx` | session + company | `companyId`, `vehicleId` |  |
| `v2-inventory.vehicles-create` | `/companies/{companyId}/v2/vehicles/create` | `src/pages/companies/[companyId]/v2/vehicles/create.tsx` | session + company | `companyId` |  |

## v2-finance (15)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `v2-finance.accounts-list` | `/companies/{companyId}/v2/accounts` | `src/pages/companies/[companyId]/v2/accounts/index.tsx` | session + company | `companyId` |  |
| `v2-finance.accounts-create` | `/companies/{companyId}/v2/accounts/create` | `src/pages/companies/[companyId]/v2/accounts/create.tsx` | session + company | `companyId` |  |
| `v2-finance.accounts-scorecard` | `/companies/{companyId}/v2/accounts/scorecard` | `src/pages/companies/[companyId]/v2/accounts/scorecard.tsx` | session + company | `companyId` |  |
| `v2-finance.bank-accounts-list` | `/companies/{companyId}/v2/bank-accounts` | `src/pages/companies/[companyId]/v2/bank-accounts/index.tsx` | session + company | `companyId` |  |
| `v2-finance.bank-accounts-detail` | `/companies/{companyId}/v2/bank-accounts/{bankAccountId}` | `src/pages/companies/[companyId]/v2/bank-accounts/[bankAccountId]/index.tsx` | session + company | `companyId`, `bankAccountId` |  |
| `v2-finance.bank-accounts-create` | `/companies/{companyId}/v2/bank-accounts/create` | `src/pages/companies/[companyId]/v2/bank-accounts/create.tsx` | session + company | `companyId` |  |
| `v2-finance.expenses-list` | `/companies/{companyId}/v2/expenses` | `src/pages/companies/[companyId]/v2/expenses/index.tsx` | session + company | `companyId` |  |
| `v2-finance.expenses-update` | `/companies/{companyId}/v2/expenses/{expenseId}/update` | `src/pages/companies/[companyId]/v2/expenses/[expenseId]/update.tsx` | session + company | `companyId`, `expenseId` |  |
| `v2-finance.expenses-create` | `/companies/{companyId}/v2/expenses/create` | `src/pages/companies/[companyId]/v2/expenses/create.tsx` | session + company | `companyId` |  |
| `v2-finance.payments-list` | `/companies/{companyId}/v2/payments` | `src/pages/companies/[companyId]/v2/payments/index.tsx` | session + company | `companyId` |  |
| `v2-finance.payments-update` | `/companies/{companyId}/v2/payments/{paymentId}/update` | `src/pages/companies/[companyId]/v2/payments/[paymentId]/update.tsx` | session + company | `companyId`, `paymentId` |  |
| `v2-finance.payments-create` | `/companies/{companyId}/v2/payments/create` | `src/pages/companies/[companyId]/v2/payments/create.tsx` | session + company | `companyId` |  |
| `v2-finance.post-dated-cheques-list` | `/companies/{companyId}/v2/post-dated-cheques` | `src/pages/companies/[companyId]/v2/post-dated-cheques/index.tsx` | session + company | `companyId` |  |
| `v2-finance.post-dated-cheques-update` | `/companies/{companyId}/v2/post-dated-cheques/{chequeId}/update` | `src/pages/companies/[companyId]/v2/post-dated-cheques/[chequeId]/update.tsx` | session + company | `companyId`, `chequeId` |  |
| `v2-finance.post-dated-cheques-create` | `/companies/{companyId}/v2/post-dated-cheques/create` | `src/pages/companies/[companyId]/v2/post-dated-cheques/create.tsx` | session + company | `companyId` |  |

## v2-masterdata (29)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `v2-masterdata.home` | `/companies/{companyId}/v2` | `src/pages/companies/[companyId]/v2/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.audit-logs-list` | `/companies/{companyId}/v2/audit-logs` | `src/pages/companies/[companyId]/v2/audit-logs/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.companies-list` | `/companies/{companyId}/v2/companies` | `src/pages/companies/[companyId]/v2/companies/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.company-list` | `/companies/{companyId}/v2/company` | `src/pages/companies/[companyId]/v2/company/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.company-create` | `/companies/{companyId}/v2/company/create` | `src/pages/companies/[companyId]/v2/company/create.tsx` | session + company | `companyId` |  |
| `v2-masterdata.contacts-list` | `/companies/{companyId}/v2/contacts` | `src/pages/companies/[companyId]/v2/contacts/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.contacts-update` | `/companies/{companyId}/v2/contacts/{contactId}/update` | `src/pages/companies/[companyId]/v2/contacts/[contactId]/update.tsx` | session + company | `companyId`, `contactId` |  |
| `v2-masterdata.contacts-create` | `/companies/{companyId}/v2/contacts/create` | `src/pages/companies/[companyId]/v2/contacts/create.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customer-groups-list` | `/companies/{companyId}/v2/customer-groups` | `src/pages/companies/[companyId]/v2/customer-groups/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customer-groups-update` | `/companies/{companyId}/v2/customer-groups/{customerGroupId}/update` | `src/pages/companies/[companyId]/v2/customer-groups/[customerGroupId]/update.tsx` | session + company | `companyId`, `customerGroupId` |  |
| `v2-masterdata.customer-groups-create` | `/companies/{companyId}/v2/customer-groups/create` | `src/pages/companies/[companyId]/v2/customer-groups/create.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customer-success-announcements-list` | `/companies/{companyId}/v2/customer-success-announcements` | `src/pages/companies/[companyId]/v2/customer-success-announcements/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customer-success-announcements-update` | `/companies/{companyId}/v2/customer-success-announcements/{announcementId}/update` | `src/pages/companies/[companyId]/v2/customer-success-announcements/[announcementId]/update.tsx` | session + company | `companyId`, `announcementId` |  |
| `v2-masterdata.customer-success-announcements-create` | `/companies/{companyId}/v2/customer-success-announcements/create` | `src/pages/companies/[companyId]/v2/customer-success-announcements/create.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customer-success-tool-logs` | `/companies/{companyId}/v2/customer-success/tool-logs` | `src/pages/companies/[companyId]/v2/customer-success/tool-logs.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customer-success-tools` | `/companies/{companyId}/v2/customer-success/tools` | `src/pages/companies/[companyId]/v2/customer-success/tools.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customers-list` | `/companies/{companyId}/v2/customers` | `src/pages/companies/[companyId]/v2/customers/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.customers-update` | `/companies/{companyId}/v2/customers/{customerId}/update` | `src/pages/companies/[companyId]/v2/customers/[customerId]/update.tsx` | session + company | `companyId`, `customerId` |  |
| `v2-masterdata.customers-create` | `/companies/{companyId}/v2/customers/create` | `src/pages/companies/[companyId]/v2/customers/create.tsx` | session + company | `companyId` |  |
| `v2-masterdata.dashboard-list` | `/companies/{companyId}/v2/dashboard` | `src/pages/companies/[companyId]/v2/dashboard/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.distributors-list` | `/companies/{companyId}/v2/distributors` | `src/pages/companies/[companyId]/v2/distributors/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.distributors-detail` | `/companies/{companyId}/v2/distributors/{distributorId}` | `src/pages/companies/[companyId]/v2/distributors/[distributorId]/index.tsx` | session + company | `companyId`, `distributorId` |  |
| `v2-masterdata.distributors-quarterly-reports` | `/companies/{companyId}/v2/distributors/{distributorId}/quarterly-reports` | `src/pages/companies/[companyId]/v2/distributors/[distributorId]/quarterly-reports/index.tsx` | session + company | `companyId`, `distributorId` |  |
| `v2-masterdata.distributors-quarterly-reports-detail` | `/companies/{companyId}/v2/distributors/{distributorId}/quarterly-reports/{reportId}` | `src/pages/companies/[companyId]/v2/distributors/[distributorId]/quarterly-reports/[reportId].tsx` | session + company | `companyId`, `distributorId`, `reportId` |  |
| `v2-masterdata.distributors-update` | `/companies/{companyId}/v2/distributors/{distributorId}/update` | `src/pages/companies/[companyId]/v2/distributors/[distributorId]/update.tsx` | session + company | `companyId`, `distributorId` |  |
| `v2-masterdata.distributors-create` | `/companies/{companyId}/v2/distributors/create` | `src/pages/companies/[companyId]/v2/distributors/create.tsx` | session + company | `companyId` |  |
| `v2-masterdata.import-logs-list` | `/companies/{companyId}/v2/import-logs` | `src/pages/companies/[companyId]/v2/import-logs/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.oGPT-list` | `/companies/{companyId}/v2/oGPT` | `src/pages/companies/[companyId]/v2/oGPT/index.tsx` | session + company | `companyId` |  |
| `v2-masterdata.settings-list` | `/companies/{companyId}/v2/settings` | `src/pages/companies/[companyId]/v2/settings/index.tsx` | session + company | `companyId` |  |

## v3-analytics (6)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `v3-analytics.home` | `/companies/{companyId}/v3` | `src/pages/companies/[companyId]/v3/index.tsx` | session + company | `companyId` |  |
| `v3-analytics.quarterly-reports-list` | `/companies/{companyId}/v3/quarterly-reports` | `src/pages/companies/[companyId]/v3/quarterly-reports/index.tsx` | session + company | `companyId` |  |
| `v3-analytics.quarterly-reports-detail` | `/companies/{companyId}/v3/quarterly-reports/{reportId}` | `src/pages/companies/[companyId]/v3/quarterly-reports/[reportId].tsx` | session + company | `companyId`, `reportId` |  |
| `v3-analytics.superuser-lite-onboarding-tracker` | `/companies/{companyId}/v3/superuser/lite-onboarding-tracker` | `src/pages/companies/[companyId]/v3/superuser/lite-onboarding-tracker/index.tsx` | session + company | `companyId` |  |
| `v3-analytics.superuser-oGPT-changelog` | `/companies/{companyId}/v3/superuser/oGPT-changelog` | `src/pages/companies/[companyId]/v3/superuser/oGPT-changelog/index.tsx` | session + company | `companyId` |  |
| `v3-analytics.superuser-quarterly-reports` | `/companies/{companyId}/v3/superuser/quarterly-reports` | `src/pages/companies/[companyId]/v3/superuser/quarterly-reports/index.tsx` | session + company | `companyId` |  |

## lite (77)

| page name | path | page file | auth | params | purpose |
| --- | --- | --- | --- | --- | --- |
| `lite.home` | `/companies/{companyId}/lite` | `src/pages/companies/[companyId]/lite/index.tsx` | session + company | `companyId` |  |
| `lite.contacts-list` | `/companies/{companyId}/lite/contacts` | `src/pages/companies/[companyId]/lite/contacts/index.tsx` | session + company | `companyId` |  |
| `lite.contacts-update` | `/companies/{companyId}/lite/contacts/{contactId}/update` | `src/pages/companies/[companyId]/lite/contacts/[contactId]/update.tsx` | session + company | `companyId`, `contactId` |  |
| `lite.contacts-create` | `/companies/{companyId}/lite/contacts/create` | `src/pages/companies/[companyId]/lite/contacts/create.tsx` | session + company | `companyId` |  |
| `lite.customers-list` | `/companies/{companyId}/lite/customers` | `src/pages/companies/[companyId]/lite/customers/index.tsx` | session + company | `companyId` |  |
| `lite.customers-update` | `/companies/{companyId}/lite/customers/{customerId}/update` | `src/pages/companies/[companyId]/lite/customers/[customerId]/update.tsx` | session + company | `companyId`, `customerId` |  |
| `lite.customers-create` | `/companies/{companyId}/lite/customers/create` | `src/pages/companies/[companyId]/lite/customers/create.tsx` | session + company | `companyId` |  |
| `lite.customers-import` | `/companies/{companyId}/lite/customers/import` | `src/pages/companies/[companyId]/lite/customers/import.tsx` | session + company | `companyId` |  |
| `lite.expenses-list` | `/companies/{companyId}/lite/expenses` | `src/pages/companies/[companyId]/lite/expenses/index.tsx` | session + company | `companyId` |  |
| `lite.expenses-update` | `/companies/{companyId}/lite/expenses/{expenseId}/update` | `src/pages/companies/[companyId]/lite/expenses/[expenseId]/update.tsx` | session + company | `companyId`, `expenseId` |  |
| `lite.expenses-create` | `/companies/{companyId}/lite/expenses/create` | `src/pages/companies/[companyId]/lite/expenses/create.tsx` | session + company | `companyId` |  |
| `lite.inventory-locations-list` | `/companies/{companyId}/lite/inventory-locations` | `src/pages/companies/[companyId]/lite/inventory-locations/index.tsx` | session + company | `companyId` |  |
| `lite.inventory-locations-detail` | `/companies/{companyId}/lite/inventory-locations/{inventoryLocationId}` | `src/pages/companies/[companyId]/lite/inventory-locations/[inventoryLocationId]/index.tsx` | session + company | `companyId`, `inventoryLocationId` |  |
| `lite.inventory-locations-qr-codes` | `/companies/{companyId}/lite/inventory-locations/qr-codes` | `src/pages/companies/[companyId]/lite/inventory-locations/qr-codes.tsx` | session + company | `companyId` |  |
| `lite.inventory-reports-list` | `/companies/{companyId}/lite/inventory-reports` | `src/pages/companies/[companyId]/lite/inventory-reports/index.tsx` | session + company | `companyId` |  |
| `lite.inventory-transactions-list` | `/companies/{companyId}/lite/inventory-transactions` | `src/pages/companies/[companyId]/lite/inventory-transactions/index.tsx` | session + company | `companyId` |  |
| `lite.oGPT-list` | `/companies/{companyId}/lite/oGPT` | `src/pages/companies/[companyId]/lite/oGPT/index.tsx` | session + company | `companyId` |  |
| `lite.products-list` | `/companies/{companyId}/lite/products` | `src/pages/companies/[companyId]/lite/products/index.tsx` | session + company | `companyId` |  |
| `lite.products-detail` | `/companies/{companyId}/lite/products/{productId}` | `src/pages/companies/[companyId]/lite/products/[productId]/index.tsx` | session + company | `companyId`, `productId` |  |
| `lite.products-update` | `/companies/{companyId}/lite/products/{productId}/update` | `src/pages/companies/[companyId]/lite/products/[productId]/update.tsx` | session + company | `companyId`, `productId` |  |
| `lite.products-create` | `/companies/{companyId}/lite/products/create` | `src/pages/companies/[companyId]/lite/products/create.tsx` | session + company | `companyId` |  |
| `lite.products-import` | `/companies/{companyId}/lite/products/import` | `src/pages/companies/[companyId]/lite/products/import.tsx` | session + company | `companyId` |  |
| `lite.purchase-orders-list` | `/companies/{companyId}/lite/purchase-orders` | `src/pages/companies/[companyId]/lite/purchase-orders/index.tsx` | session + company | `companyId` |  |
| `lite.purchase-orders-update` | `/companies/{companyId}/lite/purchase-orders/{purchaseOrderId}/update` | `src/pages/companies/[companyId]/lite/purchase-orders/[purchaseOrderId]/update.tsx` | session + company | `companyId`, `purchaseOrderId` |  |
| `lite.purchase-orders-create` | `/companies/{companyId}/lite/purchase-orders/create` | `src/pages/companies/[companyId]/lite/purchase-orders/create.tsx` | session + company | `companyId` |  |
| `lite.purchase-orders-upload-with-ovision` | `/companies/{companyId}/lite/purchase-orders/upload-with-ovision` | `src/pages/companies/[companyId]/lite/purchase-orders/upload-with-ovision.tsx` | session + company | `companyId` |  |
| `lite.purchase-services-list` | `/companies/{companyId}/lite/purchase-services` | `src/pages/companies/[companyId]/lite/purchase-services/index.tsx` | session + company | `companyId` |  |
| `lite.purchase-services-update` | `/companies/{companyId}/lite/purchase-services/{purchaseServiceId}/update` | `src/pages/companies/[companyId]/lite/purchase-services/[purchaseServiceId]/update.tsx` | session + company | `companyId`, `purchaseServiceId` |  |
| `lite.purchase-services-create` | `/companies/{companyId}/lite/purchase-services/create` | `src/pages/companies/[companyId]/lite/purchase-services/create.tsx` | session + company | `companyId` |  |
| `lite.purchasing-reports-list` | `/companies/{companyId}/lite/purchasing-reports` | `src/pages/companies/[companyId]/lite/purchasing-reports/index.tsx` | session + company | `companyId` |  |
| `lite.quick-checkout-list` | `/companies/{companyId}/lite/quick-checkout` | `src/pages/companies/[companyId]/lite/quick-checkout/index.tsx` | session + company | `companyId` |  |
| `lite.quick-checkout-order-receipts` | `/companies/{companyId}/lite/quick-checkout/order-receipts` | `src/pages/companies/[companyId]/lite/quick-checkout/order-receipts.tsx` | session + company | `companyId` |  |
| `lite.reports-list` | `/companies/{companyId}/lite/reports` | `src/pages/companies/[companyId]/lite/reports/index.tsx` | session + company | `companyId` |  |
| `lite.reports-collections-report` | `/companies/{companyId}/lite/reports/collections-report` | `src/pages/companies/[companyId]/lite/reports/collections-report.tsx` | session + company | `companyId` |  |
| `lite.reports-current-inventory-value` | `/companies/{companyId}/lite/reports/current-inventory-value` | `src/pages/companies/[companyId]/lite/reports/current-inventory-value.tsx` | session + company | `companyId` |  |
| `lite.reports-customer-aging-accounts-receivable` | `/companies/{companyId}/lite/reports/customer-aging-accounts-receivable` | `src/pages/companies/[companyId]/lite/reports/customer-aging-accounts-receivable.tsx` | session + company | `companyId` |  |
| `lite.reports-customer-sales` | `/companies/{companyId}/lite/reports/customer-sales` | `src/pages/companies/[companyId]/lite/reports/customer-sales.tsx` | session + company | `companyId` |  |
| `lite.reports-customer-statement-of-account` | `/companies/{companyId}/lite/reports/customer-statement-of-account` | `src/pages/companies/[companyId]/lite/reports/customer-statement-of-account.tsx` | session + company | `companyId` |  |
| `lite.reports-history` | `/companies/{companyId}/lite/reports/history` | `src/pages/companies/[companyId]/lite/reports/history.tsx` | session + company | `companyId` |  |
| `lite.reports-inventory-by-date` | `/companies/{companyId}/lite/reports/inventory-by-date` | `src/pages/companies/[companyId]/lite/reports/inventory-by-date.tsx` | session + company | `companyId` |  |
| `lite.reports-inventory-per-location` | `/companies/{companyId}/lite/reports/inventory-per-location` | `src/pages/companies/[companyId]/lite/reports/inventory-per-location.tsx` | session + company | `companyId` |  |
| `lite.reports-order-items-report` | `/companies/{companyId}/lite/reports/order-items-report` | `src/pages/companies/[companyId]/lite/reports/order-items-report.tsx` | session + company | `companyId` |  |
| `lite.reports-products` | `/companies/{companyId}/lite/reports/products` | `src/pages/companies/[companyId]/lite/reports/products.tsx` | session + company | `companyId` |  |
| `lite.reports-purchase-order-items-report` | `/companies/{companyId}/lite/reports/purchase-order-items-report` | `src/pages/companies/[companyId]/lite/reports/purchase-order-items-report.tsx` | session + company | `companyId` |  |
| `lite.reports-receiving-items-report` | `/companies/{companyId}/lite/reports/receiving-items-report` | `src/pages/companies/[companyId]/lite/reports/receiving-items-report.tsx` | session + company | `companyId` |  |
| `lite.reports-releasing-items-report` | `/companies/{companyId}/lite/reports/releasing-items-report` | `src/pages/companies/[companyId]/lite/reports/releasing-items-report.tsx` | session + company | `companyId` |  |
| `lite.reports-sales-order-services` | `/companies/{companyId}/lite/reports/sales-order-services` | `src/pages/companies/[companyId]/lite/reports/sales-order-services.tsx` | session + company | `companyId` |  |
| `lite.reports-sales-orders-report` | `/companies/{companyId}/lite/reports/sales-orders-report` | `src/pages/companies/[companyId]/lite/reports/sales-orders-report.tsx` | session + company | `companyId` |  |
| `lite.reports-sales-report-by-product-type` | `/companies/{companyId}/lite/reports/sales-report-by-product-type` | `src/pages/companies/[companyId]/lite/reports/sales-report-by-product-type.tsx` | session + company | `companyId` |  |
| `lite.sales-agents-list` | `/companies/{companyId}/lite/sales-agents` | `src/pages/companies/[companyId]/lite/sales-agents/index.tsx` | session + company | `companyId` |  |
| `lite.sales-agents-update` | `/companies/{companyId}/lite/sales-agents/{salesAgentId}/update` | `src/pages/companies/[companyId]/lite/sales-agents/[salesAgentId]/update.tsx` | session + company | `companyId`, `salesAgentId` |  |
| `lite.sales-agents-create` | `/companies/{companyId}/lite/sales-agents/create` | `src/pages/companies/[companyId]/lite/sales-agents/create.tsx` | session + company | `companyId` |  |
| `lite.sales-orders-list` | `/companies/{companyId}/lite/sales-orders` | `src/pages/companies/[companyId]/lite/sales-orders/index.tsx` | session + company | `companyId` |  |
| `lite.sales-orders-update` | `/companies/{companyId}/lite/sales-orders/{orderId}/update` | `src/pages/companies/[companyId]/lite/sales-orders/[orderId]/update.tsx` | session + company | `companyId`, `orderId` |  |
| `lite.sales-orders-analytics` | `/companies/{companyId}/lite/sales-orders/analytics` | `src/pages/companies/[companyId]/lite/sales-orders/analytics.tsx` | session + company | `companyId` |  |
| `lite.sales-orders-create` | `/companies/{companyId}/lite/sales-orders/create` | `src/pages/companies/[companyId]/lite/sales-orders/create.tsx` | session + company | `companyId` |  |
| `lite.sales-orders-upload-with-ovision` | `/companies/{companyId}/lite/sales-orders/upload-with-ovision` | `src/pages/companies/[companyId]/lite/sales-orders/upload-with-ovision.tsx` | session + company | `companyId` |  |
| `lite.sales-reports-list` | `/companies/{companyId}/lite/sales-reports` | `src/pages/companies/[companyId]/lite/sales-reports/index.tsx` | session + company | `companyId` |  |
| `lite.sales-services-list` | `/companies/{companyId}/lite/sales-services` | `src/pages/companies/[companyId]/lite/sales-services/index.tsx` | session + company | `companyId` |  |
| `lite.sales-services-update` | `/companies/{companyId}/lite/sales-services/{salesServiceId}/update` | `src/pages/companies/[companyId]/lite/sales-services/[salesServiceId]/update.tsx` | session + company | `companyId`, `salesServiceId` |  |
| `lite.sales-services-create` | `/companies/{companyId}/lite/sales-services/create` | `src/pages/companies/[companyId]/lite/sales-services/create.tsx` | session + company | `companyId` |  |
| `lite.settings-list` | `/companies/{companyId}/lite/settings` | `src/pages/companies/[companyId]/lite/settings/index.tsx` | session + company | `companyId` |  |
| `lite.stock-adjustments-list` | `/companies/{companyId}/lite/stock-adjustments` | `src/pages/companies/[companyId]/lite/stock-adjustments/index.tsx` | session + company | `companyId` |  |
| `lite.stock-adjustments-update` | `/companies/{companyId}/lite/stock-adjustments/{adjustmentId}/update` | `src/pages/companies/[companyId]/lite/stock-adjustments/[adjustmentId]/update.tsx` | session + company | `companyId`, `adjustmentId` |  |
| `lite.stock-adjustments-create` | `/companies/{companyId}/lite/stock-adjustments/create` | `src/pages/companies/[companyId]/lite/stock-adjustments/create.tsx` | session + company | `companyId` |  |
| `lite.stock-transfers-list` | `/companies/{companyId}/lite/stock-transfers` | `src/pages/companies/[companyId]/lite/stock-transfers/index.tsx` | session + company | `companyId` |  |
| `lite.stock-transfers-update` | `/companies/{companyId}/lite/stock-transfers/{transferId}/update` | `src/pages/companies/[companyId]/lite/stock-transfers/[transferId]/update.tsx` | session + company | `companyId`, `transferId` |  |
| `lite.stock-transfers-create` | `/companies/{companyId}/lite/stock-transfers/create` | `src/pages/companies/[companyId]/lite/stock-transfers/create.tsx` | session + company | `companyId` |  |
| `lite.stock-transfers-upload-with-ovision` | `/companies/{companyId}/lite/stock-transfers/upload-with-ovision` | `src/pages/companies/[companyId]/lite/stock-transfers/upload-with-ovision.tsx` | session + company | `companyId` |  |
| `lite.stocktakes-list` | `/companies/{companyId}/lite/stocktakes` | `src/pages/companies/[companyId]/lite/stocktakes/index.tsx` | session + company | `companyId` |  |
| `lite.stocktakes-update` | `/companies/{companyId}/lite/stocktakes/{stocktakeId}/update` | `src/pages/companies/[companyId]/lite/stocktakes/[stocktakeId]/update.tsx` | session + company | `companyId`, `stocktakeId` |  |
| `lite.stocktakes-create` | `/companies/{companyId}/lite/stocktakes/create` | `src/pages/companies/[companyId]/lite/stocktakes/create.tsx` | session + company | `companyId` |  |
| `lite.suppliers-list` | `/companies/{companyId}/lite/suppliers` | `src/pages/companies/[companyId]/lite/suppliers/index.tsx` | session + company | `companyId` |  |
| `lite.suppliers-update` | `/companies/{companyId}/lite/suppliers/{supplierId}/update` | `src/pages/companies/[companyId]/lite/suppliers/[supplierId]/update.tsx` | session + company | `companyId`, `supplierId` |  |
| `lite.suppliers-create` | `/companies/{companyId}/lite/suppliers/create` | `src/pages/companies/[companyId]/lite/suppliers/create.tsx` | session + company | `companyId` |  |
| `lite.suppliers-import` | `/companies/{companyId}/lite/suppliers/import` | `src/pages/companies/[companyId]/lite/suppliers/import.tsx` | session + company | `companyId` |  |
| `lite.users-list` | `/companies/{companyId}/lite/users` | `src/pages/companies/[companyId]/lite/users/index.tsx` | session + company | `companyId` |  |

## Out of scope

| group | routes | reason |
| --- | --- | --- |
| `v1-deprecated` | 156 | `@deprecated`, guarded by the `prime/no-deprecated-v1` ESLint rule. A v2 replacement exists for each. |
| `v2-novellino` | 77 | `src/middleware.ts` redirects `/companies/15/*` to a separate carve-out deployment. Not reachable from the main host. |
| `v2-reports` | 114 | 114 flat read-only report pages. Deferred by decision at Checkpoint 1. |
| dev-only | 2 | `/v2/ui`, `/v2/query-metrics` — internal, not user-facing. |
