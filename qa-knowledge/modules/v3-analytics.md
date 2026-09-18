---
module: v3-analytics
routes: 6
targets: 13
flows: 6
status: drafted
lastUpdated: 2026-09-17
---

# v3-analytics

## Purpose

The read-only analytics layer: the forecasting dashboard a Prime user lands on after sign-in,
and the AI-generated quarterly reports. Almost nothing here writes; the module is charts, metric
cards and drill-in drawers.

That shape matters for testing. There is very little to click and a great deal to look at, and
what there is to look at is computed. Coverage here is mostly "did the surface render for this
role", not "did the number come out right".

## Routes

| page name | path | notes |
| --- | --- | --- |
| `v3-analytics.home` | `/companies/{companyId}/v3` | the forecasting dashboard; **where sign-in lands a Prime user** |
| `v3-analytics.quarterly-reports-list` | `/companies/{companyId}/v3/quarterly-reports` | list of generated reports |
| `v3-analytics.quarterly-reports-detail` | `/companies/{companyId}/v3/quarterly-reports/{reportId}` | one report |
| `v3-analytics.superuser-quarterly-reports-list` | `/companies/{companyId}/v3/superuser/quarterly-reports` | superuser: generate reports |
| `v3-analytics.superuser-oGPT-changelog-list` | `/companies/{companyId}/v3/superuser/oGPT-changelog` | superuser; **out of scope — AI surface** |
| `v3-analytics.superuser-lite-onboarding-tracker-list` | `/companies/{companyId}/v3/superuser/lite-onboarding-tracker` | superuser |

## Preconditions

- Signed in; **Prime** tenant. `/v3` is the Prime landing page — a Lite tenant is routed to
  `/lite` instead and cannot reach any route in this module.
- The three `superuser/*` routes need a superuser account.
- **The dashboard is permission-sliced tab by tab.** Each tab is pushed onto the tab bar only if
  the role can view it (`Dashboard/Layout/navigation/ForecastingTabsSwitcher.tsx:55-80`), so the
  tab set differs per role. A flow that clicks a tab is asserting a permission.
- The dashboard needs real transactional history to render anything. Against an empty tenant it
  loads and shows empty cards, which is not a useful assertion target.
- Quarterly reports must have been generated already; there is no self-service generation
  outside the superuser panel.

## Targets

`shell.*` chrome applies. Note the dashboard does **not** use the v2 `TableToolbar`, so
`shell.table-search` and friends are not available here.

### Dashboard tabs

Tab labels are **uppercase in the markup**, and `role=` name matching is case-sensitive — the
name must be `"OVERVIEW"`, not `"Overview"`.

**The tabs are not `role=tab`.** Verified 2026-09-18 on releasing: the switcher renders MUI
`Chip` components, each a `div[role="button"]` with the label inside `.MuiChip-label`, and the
page has **zero** `[role=tab]` elements. The 2026-09-17 zero-match result for this module was
misread as a permission gate; it was the wrong role. Each label below matched exactly one
`role=button` in the DOM. The `role=` count could not be re-probed while the test account's
Terms & Services modal covers the dashboard (see `shell.md` Preconditions), so these stay
`medium` until a run on an account that has accepted it.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v3-analytics.tab-overview` | button "OVERVIEW" (Chip) | `role=button[name="OVERVIEW"]` | `…/navigation/ForecastingTabsSwitcher.tsx:55` | medium | DOM-verified 2026-09-18: 1 chip |
| `v3-analytics.tab-inventory` | button "INVENTORY" (Chip) | `role=button[name="INVENTORY"]` | `…/ForecastingTabsSwitcher.tsx:60` | medium | DOM-verified 2026-09-18: 1 chip. Exact-case, so it does not collide with the rail's "Inventory" |
| `v3-analytics.tab-sales` | button "SALES" (Chip) | `role=button[name="SALES"]` | `…/ForecastingTabsSwitcher.tsx:64` | medium | DOM-verified 2026-09-18: 1 chip |
| `v3-analytics.tab-purchasing` | button "PURCHASING" (Chip) | `role=button[name="PURCHASING"]` | `…/ForecastingTabsSwitcher.tsx:68` | medium | DOM-verified 2026-09-18: 1 chip |
| `v3-analytics.tab-logistics` | button "LOGISTICS" (Chip) | `role=button[name="LOGISTICS"]` | `…/ForecastingTabsSwitcher.tsx:72` | medium | DOM-verified 2026-09-18: 1 chip |
| `v3-analytics.tab-finances` | button "FINANCES" (Chip) | `role=button[name="FINANCES"]` | `…/ForecastingTabsSwitcher.tsx:76` | medium | DOM-verified 2026-09-18: 1 chip |
| `v3-analytics.tab-production` | button "PRODUCTION" (Chip) | `role=button[name="PRODUCTION"]` | `…/ForecastingTabsSwitcher.tsx:80` | medium | DOM-verified 2026-09-18: 1 chip |

### Dashboard controls

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v3-analytics.vat-mode-button` | group "VAT presentation mode" | `role=group[name="VAT presentation mode"]` | `Dashboard/Layout/Header.tsx:415` | medium | **DOM-verified 2026-09-18**: a MUI `ToggleButtonGroup` (`div[role=group]`), not a menu button. Assert it; the two options below are clicked directly |
| `v3-analytics.vat-inclusive-option` | button "Show VAT-inclusive amounts" | `role=button[name="Show VAT-inclusive amounts"]` | `Dashboard/Layout/Header.tsx:452` | medium | **DOM-verified 2026-09-18**: a real `<button aria-label>` inside the group, visible text "Incl. VAT" |
| `v3-analytics.vat-exclusive-option` | button "Show VAT-exclusive amounts" | `role=button[name="Show VAT-exclusive amounts"]` | `Dashboard/Layout/Header.tsx:455` | medium | **DOM-verified 2026-09-18**: as above, visible text "Excl. VAT" |
| `v3-analytics.drawer-next-page-button` | button "Next page" | `role=button[name="Next page"]` | `…/DashboardDrawer/components/DashboardDrawerPagination.tsx:58` | medium | inside a drill-in drawer |
| `v3-analytics.drawer-previous-page-button` | button "Previous page" | `role=button[name="Previous page"]` | `…/DashboardDrawerPagination.tsx:45` | medium | |

### Quarterly reports

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `v3-analytics.report-close-drawer-button` | button "Close drawer" | `role=button[name="Close drawer"]` | `QuarterlyReport/RightListDrawer.tsx:49` | medium | |

## Flows

### Land on the dashboard

Preconditions: signed in; Prime tenant.

1. `navigate` → `/companies/{companyId}/v3`
2. `assertVisible` → `v3-analytics.tab-overview`

This doubles as the post-sign-in landing check for a Prime tenant — see `shell.md`.

### Switch dashboard tab

Preconditions: signed in; the role can view the target tab.

1. `navigate` → `/companies/{companyId}/v3`
2. `assertVisible` → `v3-analytics.tab-sales`
3. `click` → `v3-analytics.tab-sales`

Step 2 is not redundant: for a role without sales analytics access the tab is never pushed onto
the bar, and clicking it would fail with a selector error rather than a permission message.

### Toggle VAT presentation

Preconditions: signed in; Prime tenant.

1. `navigate` → `/companies/{companyId}/v3`
2. `assertVisible` → `v3-analytics.vat-mode-button`
3. `click` → `v3-analytics.vat-exclusive-option`

The mode control is a toggle-button group, so there is no menu to open first; step 2 only
proves the group rendered. No outcome assertion — the effect is that every figure on the page
changes, and nothing in the vocabulary can compare a figure before and after. **This flow performs an action it cannot
verify**; it is listed so the control is exercised, not because it proves anything.

### Open a quarterly report

Preconditions: signed in; `{reportId}` bound to a generated report.

1. `navigate` → `/companies/{companyId}/v3/quarterly-reports/{reportId}`
2. `assertText` → `shell.breadcrumb` contains `<report label>`


### Page through a dashboard drill-in drawer

Preconditions: signed in; Prime tenant; a dashboard card with enough rows to paginate.

1. `navigate` → `/companies/{companyId}/v3`
2. `click` → `v3-analytics.drawer-next-page-button`
3. `click` → `v3-analytics.drawer-previous-page-button`

**Incomplete**: the drawer must be opened first, and the card that opens it has no target. As
written, step 2 will not find its button. Listed so the gap is recorded — see Open questions.

No assertion is possible either way: the drawer's contents are computed figures.

### Close a quarterly report drawer

Preconditions: signed in; `{reportId}` bound to a generated report.

1. `navigate` → `/companies/{companyId}/v3/quarterly-reports/{reportId}`
2. `click` → `v3-analytics.report-close-drawer-button`

Same caveat: the drawer has to be open, and nothing targets what opens it.

### Route flows — every page in this module

6 routes, each reachable by the same three-step shape. This table is the flow: read a row and
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
| `v3-analytics.home` | `/companies/{companyId}/v3` | `Dashboard` | `v3-analytics.tab-overview` |  |
| `v3-analytics.quarterly-reports-detail` | `/companies/{companyId}/v3/quarterly-reports/{reportId}` | `Quarterly Report` | — | breadcrumb shows the record code once it loads |
| `v3-analytics.quarterly-reports-list` | `/companies/{companyId}/v3/quarterly-reports` | `Quarterly Reports` | `shell.table` |  |
| `v3-analytics.superuser-lite-onboarding-tracker` | `/companies/{companyId}/v3/superuser/lite-onboarding-tracker` | `Lite Onboarding Tracker` | — |  |
| `v3-analytics.superuser-oGPT-changelog` | `/companies/{companyId}/v3/superuser/oGPT-changelog` | `OGPT Changelog` | — |  |
| `v3-analytics.superuser-quarterly-reports` | `/companies/{companyId}/v3/superuser/quarterly-reports` | `Quarterly Reports` | — |  |

## Contract gaps

- **This module's subject is numbers, and numbers cannot be asserted.** Every card is a computed
  figure; `assertText` does substring matching against rendered text, so a plan can check that
  *something* rendered but never that it is correct. Most of what a tester would want to verify
  here is outside the vocabulary by design.
- **Charts are canvas or SVG.** Trend lines, forecasts and distributions have no text nodes to
  assert against.
- **No wait action.** Dashboard queries are heavy and land progressively. `assertVisible` retries,
  which covers the common case, but a flow cannot say "wait until the forecast finishes loading"
  before reading a figure — so a fast assertion can read a skeleton.
- **The VAT toggle has no observable outcome** in the vocabulary, as above.
- **`shell.table-*` targets do not apply.** v3 does not use the v2 table toolbar, so there is no
  search, sort or column control to drive.

## Open questions

- ~~The VAT menu item roles are unconfirmed.~~ Resolved 2026-09-18: they are plain buttons in a
  `role=group`; see Dashboard controls.
- **Which permission gates which tab was not read.** The tab list is built conditionally from
  `canView*` flags, but the flags' sources were not traced. Preconditions here say "the role can
  view it" because nothing more precise is known.
- **The three superuser routes have no targets.** `GenerateReportPanel.tsx` exposes Company, Year
  and Quarter controls, which suggests a generate-a-report flow is draftable, but the submit
  control was not identified.
- **Metric cards have no targets at all.** If "does the Overview show a revenue figure" becomes a
  requirement, each card needs a target, and the card components use styled `Box`/`Typography`
  with no roles — expect rung 4/5 selectors and low confidence.
