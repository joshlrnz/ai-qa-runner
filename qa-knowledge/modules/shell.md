---
module: shell
routes: 23
targets: 46
flows: 9
status: drafted
lastUpdated: 2026-09-17
---

# Shell

## Purpose

Everything outside a feature page: signing in, picking a company, and the persistent chrome
(left icon rail, breadcrumb bar, toasts, account menu) that every authenticated route renders.
No module's flow can start without it, which is why this file is read first and its targets are
referenced by the other modules rather than copied into them.

## Routes

| page name | path | page file | auth | notes |
| --- | --- | --- | --- | --- |
| `shell.sign-in` | `/sign-in` | `src/pages/sign-in.tsx` | public | renders `src/components/SignIn` |
| `shell.home` | `/` | `src/pages/index.tsx` | public | redirects a signed-in session onward |
| `shell.companies-list` | `/companies` | `src/pages/companies/index.tsx` | session | company picker |
| `shell.company-home` | `/companies/{companyId}` | `src/pages/companies/[companyId]/index.tsx` | session + company | v1 layout; bounces to `/v3` |
| `shell.sign-out` | `/sign-out` | `src/pages/sign-out.tsx` | session | |
| `shell.403` / `shell.404` / `shell.unauthorized` / `shell.no-company-access` | – | – | public | error surfaces a flow can land on |

Full list in `routes.md`. The remaining shell routes (`/lite/signup`, `/privacy-policy`,
`/delete-account`, `/account-deleted`, …) are marketing and account-lifecycle pages with no
flows drafted yet.

## Preconditions

- An account that can sign in with email + password, bound as the run's credentials.
- `companyId` bound to a tenant that account has access to.
- **Tier matters.** `authenticatedV2` (`src/layouts/authenticatedV2/index.tsx:127`) resolves a
  tier route on every render: a LITE company is forced into `/companies/{companyId}/lite/*`
  and a PRIME company into `/v2` / `/v3`. An out-of-edition page is blocked during render, not
  merely redirected. **A `v2-*` flow and a `lite` flow cannot use the same `companyId`.**
- Sign-in does not land on a fixed path. `/` and the v1 layout both bounce onward, so the post
  sign-in URL is `/companies/{companyId}/v3` (Prime) or `/companies/{companyId}/lite` (Lite).

## Where the chrome actually comes from

`src/layouts/authenticatedV2/Sidebar/` looks like the navigation and **is not**. `PageWrapper`
renders `Sidenav` / `LiteSidenav` / `MobileBottomNav` (`PageWrapper/index.tsx:242-341`);
`Sidebar/index.tsx` is imported only by `components/v2/ComponentsPlayground`. `Sidebar/SidebarItem`
*is* live — the Sidenav flyouts render it. Derive rail targets from `Sidenav/`, flyout row targets
from `Sidebar/SidebarItem.tsx`, and nothing from `Sidebar/index.tsx`.

Primitives traced once, so no module repeats the work:

- MUI `ButtonBase` → a real `<button>`. Role selectors work on every rail tile.
- `SidebarItem` with a `pathname` → `<a>` wrapping that `<button>` (`SidebarItem.tsx:138-155`).
  Both `role=link[name="X"]` and `role=button[name="X"]` match; prefer `link`.
- MUI `Alert` → `<div role="alert">`. That is the toast.
- MUI `Breadcrumbs` → `<nav aria-label="breadcrumb">`. **There are at least two `nav` elements
  on every authenticated page** (rail + breadcrumb), so a bare `nav >>` scope is ambiguous.
- A rail tile's accessible name is its full text content, icons excluded (`aria-hidden`). For
  Search that includes the shortcut keycap — `"Search ⌘K"` on Mac, `"Search Ctrl K"` elsewhere.

## Targets

`role=` string selectors are **exact and case-sensitive** in the runner's Playwright — the role
engine registers with `internal=false`, so the substring coercion `getByRole` applies never runs
(`playwright-core` role engine, `_engines.set("role", Hb(!1))`). `role=button[name="Sign in"]`
therefore does **not** match "Sign in with email". Use `[name*="…"]` for a deliberate substring.

### Sign-in

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `shell.sign-in-heading` | heading "Sign in to oboda" | `role=heading[name="Sign in to oboda"]` | `src/components/SignIn/index.tsx:167` | high | **verified 2026-09-17**: exactly 1 match on releasing. `Typography component='h1'` does resolve as a heading |
| `shell.sign-in-with-email-button` | button "Sign in with email" | `role=button[name="Sign in with email"]` | `src/components/SignIn/index.tsx:239` | high | **verified 2026-09-17**: exactly 1 match |
| `shell.sign-in-with-google-button` | button "Continue with Google" | `role=button[name="Continue with Google"]` | `src/components/SignIn/index.tsx:213` | high | **verified 2026-09-17**: exactly 1 match. OAuth; leaves the app |
| `shell.sign-in-with-apple-button` | button "Continue with Apple" | `role=button[name="Continue with Apple"]` | `src/components/SignIn/index.tsx:190` | low | **verified 2026-09-17**: 0 matches in a desktop browser, as documented. iOS native only |
| `shell.email-input` | textbox | `input[name='email']` | `src/components/SignIn/index.tsx:246` | medium | placeholder only, **no associated `<label>`** — see Open questions |
| `shell.password-input` | textbox | `input[name='password']` | `src/components/SignIn/index.tsx:263` | medium | `type` toggles password/text with the reveal button; never select on `type` |
| `shell.sign-in-submit` | button "Sign in" | `role=button[name="Sign in"]` | `src/components/SignIn/index.tsx:315` | medium | exact match, so it cannot hit "Sign in with email" (which is unmounted anyway) |
| `shell.sign-in-back-button` | button "Back" | `role=button[name="Back"]` | `src/components/SignIn/index.tsx:338` | medium | returns to the provider choice |

### Left rail (Sidenav)

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `shell.sidenav` | navigation | `nav:not([aria-label='breadcrumb'])` | `Sidenav/index.tsx:200` | high | rung 5; needed because the breadcrumb is also a `nav` **verified 2026-09-17**: 1 match. **verified 2026-09-18**: 1 match. |
| `shell.sidenav-home` | link "Home" | `nav:not([aria-label='breadcrumb']) >> role=link[name="Home"]` | `Sidenav/index.tsx:227` | high | tier-aware href: `/v3` or `/lite` **verified 2026-09-18**: 1 match. |
| `shell.sidenav-search-button` | button "Search ⌘K" | `nav:not([aria-label='breadcrumb']) >> role=button[name*="Search"]` | `Sidenav/index.tsx:214` | high | substring, because the keycap text is platform-dependent. Fallback avoids `[name*=]` entirely **verified 2026-09-18**: 1 match. |
| `shell.sidenav-sales` | button "Sales" | `nav:not([aria-label='breadcrumb']) >> role=button[name="Sales"]` | `Sidebar/menuConfig.tsx:337` | high | section tile, **no href** — opens a flyout on hover **verified 2026-09-18**: 1 match. |
| `shell.sidenav-purchasing` | button "Purchasing" | `nav:not([aria-label='breadcrumb']) >> role=button[name="Purchasing"]` | `Sidenav/sidenavConfig.tsx:35` | high | menuConfig calls the section `Purchase`; the rail relabels it `Purchasing` **verified 2026-09-18**: 1 match. |
| `shell.sidenav-inventory` | button "Inventory" | `nav:not([aria-label='breadcrumb']) >> role=button[name="Inventory"]` | `Sidebar/menuConfig.tsx:267` | high | **verified 2026-09-18**: 1 match. |
| `shell.sidenav-finance` | button "Finance" | `nav:not([aria-label='breadcrumb']) >> role=button[name="Finance"]` | `Sidebar/menuConfig.tsx:554` | high | **verified 2026-09-18**: 1 match. |
| `shell.sidenav-logistics` | button "Logistics" | `nav:not([aria-label='breadcrumb']) >> role=button[name="Logistics"]` | `Sidebar/menuConfig.tsx:437` | high | **verified 2026-09-18**: 1 match. |
| `shell.sidenav-reports` | link "Reports" | `nav:not([aria-label='breadcrumb']) >> role=link[name="Reports"]` | `Sidebar/menuConfig.tsx:601` | high | a link, not a button — the tile has a `pathname` **verified 2026-09-18**: 1 match. |
| `shell.sidenav-settings` | link "Settings" | `nav:not([aria-label='breadcrumb']) >> role=link[name="Settings"]` | `Sidenav/index.tsx:250` | high | company-admin only **verified 2026-09-18**: 1 match. |
| `shell.sidenav-help` | link "Help" | `role=link[name="Help"]` | `Sidenav/index.tsx:290` | high | **verified 2026-09-18**: the `nav`-scoped form matched **0** — Help sits in the rail footer, outside the `<nav>`. Unscoped matched 1. Still `target="_blank"`, so no flow uses it |
| `shell.account-button` | button, name = avatar initial + "Account" | `role=button[name*="Account"]` | `Sidenav/index.tsx:295` | high | **verified 2026-09-18**: exact `[name="Account"]` matched **0** — the avatar renders the user's initial inside the button, so the accessible name is e.g. `"P Account"`. Substring matched 1. Footer, outside the `nav` |
| `shell.company-switcher` | button, name = avatar initial + company name | `role=button[name*="{companyName}"]` | `Sidenav/index.tsx:128` | high | substring, not exact: the avatar's initial is part of the name. Non-interactive when the account has one company (`onClick` is `undefined`) **verified 2026-09-18**: 1 match. |
| `shell.sign-out-menu-item` | menuitem "Sign-out" | `role=menuitem[name="Sign-out"]` | `Sidenav/AccountPopover.tsx:111` | high | only after `shell.account-button` **verified 2026-09-18**: 1 match. |

### Flyout rows

A section tile's sub-items render in a hover flyout as `SidebarItem` links. Names come straight
from `menuConfig.tsx`. They are **not** scoped to the rail (the flyout renders in a popper), so a
same-named link on the page would collide.

**Verified 2026-09-18.** Each resolves to exactly 1 — but only *after* the section tile is
interacted with. Both `hover` and `click` on `shell.sidenav-sales` open the flyout and make these
links resolve; before that they match **0**. That confirms the caveat under Contract gaps: a
`click` works because Playwright moves the pointer onto the tile first. Any flow using these must
click the section tile immediately beforehand.

| name | selector | source | confidence |
| --- | --- | --- | --- |
| `shell.nav-sales-orders` | `role=link[name="Sales Orders"]` | `Sidebar/menuConfig.tsx:342` | high **verified 2026-09-18**: 1 match. |
| `shell.nav-collections` | `role=link[name="Collections"]` | `Sidebar/menuConfig.tsx:365` | high **verified 2026-09-18**: 1 match. |
| `shell.nav-quotations` | `role=link[name="Quotations"]` | `Sidebar/menuConfig.tsx:372` | high **verified 2026-09-18**: 1 match. |
| `shell.nav-customers` | `role=link[name="Customers"]` | `Sidebar/menuConfig.tsx:393` | high **verified 2026-09-18**: 1 match. |
| `shell.nav-purchase-orders` | `role=link[name="Purchase Orders"]` | `Sidebar/menuConfig.tsx:490` | medium **verified 2026-09-18**: 1 match. |
| `shell.nav-requisitions` | `role=link[name="Requisitions"]` | `Sidebar/menuConfig.tsx:497` | medium **verified 2026-09-18**: 1 match. |
| `shell.nav-receivings` | `role=link[name="Receivings"]` | `Sidebar/menuConfig.tsx:504` | medium **verified 2026-09-18**: 1 match. |
| `shell.nav-suppliers` | `role=link[name="Suppliers"]` | `Sidebar/menuConfig.tsx:532` | medium **verified 2026-09-18**: 1 match. |

### Page chrome

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `shell.breadcrumb` | navigation "breadcrumb" | `role=navigation[name="breadcrumb"]` | `Navbar/Breadcrumbs.tsx:14` | high | last crumb is the page name — `assertText` against this is the cheapest "am I on the right page" check **verified 2026-09-17**: 1 match. |
| `shell.toast` | alert | `role=alert` | `Toast/Toast.tsx:54` | high | MUI `Alert`; carries both success and error copy **verified 2026-09-17**: 1 match. |
| `shell.toast-close-button` | button "close" | `role=alert >> role=button[name="close"]` | `Toast/Toast.tsx:90` | medium | |

### Company picker (`/companies`)

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `shell.companies-list-item` | button, name = company name | `role=button[name="{companyName}"]` | `src/pages/companies/index.tsx:54` | medium | MUI `ListItem button` renders a real `<button>`; the name is the `ListItemText` content, so exact matching is safe here |
| `shell.companies-sign-out-button` | button "Sign-out" | `role=button[name="Sign-out"]` | `src/pages/companies/index.tsx:69` | medium | distinct from `shell.sign-out-menu-item`, which is a `menuitem` |

### List-page primitives (shared by every v2 module)

Every v2 list page composes the same `TableToolbar` + `DataGrid` from `@/v2/_common`, so these
targets are defined once here and referenced by module files rather than redefined per module.

| name | role / accessible name | selector | source | confidence | notes |
| --- | --- | --- | --- | --- | --- |
| `shell.table-search` | textbox "Search" | `role=textbox[name="Search"]` | `_common/TableToolbar/Search.tsx:60` | high | `inputProps={{'aria-label':'Search'}}` — a real accessible name, not just a placeholder **verified 2026-09-17**: 1 match. |
| `shell.table-sort-button` | button "Sort" | `role=button[name="Sort"]` | `_common/TableToolbar/Sort.tsx:25` | high | **verified 2026-09-17**: 1 match. |
| `shell.table-filter-button` | button "Filter" | `role=button[name="Filter"]` | `_common/TableToolbar/Filter.tsx:38` | medium | not rendered on every list page |
| `shell.filter-apply-button` | button "Apply" | `role=dialog >> role=button[name="Apply"]` | `**/FiltersDialog*.tsx` | medium | every v2 filter dialog submits with "Apply" |
| `shell.table-columns-button` | button "Columns" | `role=button[name="Columns"]` | `_common/TableToolbar/ColumnsConfig/index.tsx:274` | medium | |
| `shell.table` | table | `role=table` | `_common/DataGrid/index.tsx` | high | real MUI `Table` — `role=row` / `role=cell` and `tr:has(td:text-is('…'))` all work **verified 2026-09-17**: 1 match. |
| `shell.table-select-all-checkbox` | checkbox | `thead >> role=checkbox` | `_common/DataGrid/index.tsx:133` | high | the header checkbox; **no accessible name**, so it is scoped structurally to the table head **verified 2026-09-17**: 1 match. |
| `shell.table-row-checkbox` | checkbox | `tr:has(td:has-text('{recordCode}')) >> role=checkbox` | `_common/DataGrid/index.tsx:170` | high | content-scoped to one row — the only way to select a specific record, since the vocabulary has no row indexing. **Verified 2026-09-18**: the original `:text-is()` form matched **0**, `:has-text()` matches 1. The cell's text *is* exactly the code — the problem is that `td:text-is()` requires the `td` itself to be the element holding that text, but the code is nested inside a `Stack > a > Typography`, so `:text-is` resolves to the innermost element and never the `td`. Use `:has-text()` for any cell whose content is a nested component **verified 2026-09-18**: 1 match. |
| `shell.table-select-all-matching-link` | text "Select all N" | `text=Select all` | `_common/DataGrid/SelectionBar.tsx:100` | low | a clickable `Typography`, **not a button** — no role. The visible text embeds a live count, so the selector matches on a prefix |
| `shell.table-clear-selection-link` | text "Clear selection" | `text=Clear selection` | `_common/DataGrid/SelectionBar.tsx:103` | low | as above; label unconfirmed |
| `shell.select-option` | option, name = `{optionLabel}` | `role=option[name="{optionLabel}"]` | `_common/Form/Select.tsx:41` | medium | the second half of the two-click `select` workaround — see Contract gaps |

## Flows

### Sign in with email

Preconditions: valid credentials bound to the run.

1. `navigate` → `/sign-in`
2. `assertVisible` → `shell.sign-in-heading`
3. `click` → `shell.sign-in-with-email-button`
4. `fill` → `shell.email-input` = `<email>`
5. `fill` → `shell.password-input` = `<password>`
6. `click` → `shell.sign-in-submit`
7. `assertVisible` → `shell.sidenav-home`

Step 7 is the landing assertion because the destination path is tier-dependent and the
vocabulary cannot assert a URL. The rail only renders once the session and company have
resolved, so it doubles as the "signed in" signal.

### Open a module page

Preconditions: signed in; the page is visible to the bound role.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `assertText` → `shell.breadcrumb` contains `Sales Orders`

**Every module flow navigates by URL.** The rail is not a navigation mechanism for plans: its
sub-menus open on `onMouseOver` only (`SidenavItem.tsx:313`) and the vocabulary has no `hover`.
Clicking a section tile appears to work, but only because Playwright moves the pointer before
clicking — a property of the driver, not of the plan. The `shell.sidenav-*` and `shell.nav-*`
targets stay in the registry for `assertVisible` checks ("is Sales in this role's rail at all"),
not for getting somewhere.

### Sign out

Preconditions: signed in.

1. `click` → `shell.account-button`
2. `click` → `shell.sign-out-menu-item`
3. `assertVisible` → `shell.sign-in-heading`

### Switch company from the picker

Preconditions: signed in; `companyName` bound to a company the account can reach.

1. `navigate` → `/companies`
2. `assertVisible` → `shell.companies-list-item`
3. `click` → `shell.companies-list-item`
4. `assertVisible` → `shell.sidenav-home`

Both `shell.companies-list-item` and `shell.company-switcher` resolve through the
`{companyName}` run parameter, so the plan never hardcodes a tenant.


### Open the sign-in form and go back

Preconditions: signed out.

1. `navigate` → `/sign-in`
2. `click` → `shell.sign-in-with-email-button`
3. `assertVisible` → `shell.email-input`
4. `click` → `shell.sign-in-back-button`
5. `assertVisible` → `shell.sign-in-with-email-button`

Proves the provider-choice / credential-form toggle. The two states are mutually exclusive
renders, not hidden elements, which is why step 5 can assert the button came back.

### Open the command palette

Preconditions: signed in.

1. `click` → `shell.sidenav-search-button`

No assertion — the palette's contents have no targets yet. The flow proves the rail's search
control is present and clickable for the bound role.

### Dismiss a toast

Preconditions: a flow that has just produced a toast.

1. `assertVisible` → `shell.toast`
2. `click` → `shell.toast-close-button`

Useful as a cleanup step between two mutations in one plan: a stale toast from the first can
otherwise satisfy the second's `assertText` and hide a failure. **If a plan performs two
mutations and asserts a toast after each, dismiss the first.**

### Sort and configure columns on a list

Preconditions: signed in; any v2 list page.

1. `navigate` → `/companies/{companyId}/v2/sales-orders`
2. `click` → `shell.table-sort-button`
3. `click` → `shell.table-columns-button`
4. `assertVisible` → `shell.table`

Both controls open panels whose contents have no targets, so this proves the controls exist and
the table survives. Substitute any list path.

### Sign out from the company picker

Preconditions: signed in.

1. `navigate` → `/companies`
2. `click` → `shell.companies-sign-out-button`
3. `assertVisible` → `shell.sign-in-heading`

The second of the two sign-out paths — the other is the rail's account menu.

### Actions with no flow, and why

| target | why no flow |
| --- | --- |
| `shell.sign-in-with-google-button`, `shell.sign-in-with-apple-button` | leave the app for an external identity provider; the plan cannot follow. Apple is also iOS-native only |
| `shell.sidenav-help` | `target="_blank"` — opens a tab the plan cannot follow |

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
| `shell._offline` | `/_offline` | `_offline` | — |  |
| `shell.403` | `/403` | `403` | — |  |
| `shell.404` | `/404` | `404` | — |  |
| `shell.account-deleted` | `/account-deleted` | `Account Deleted` | — |  |
| `shell.auth-callback` | `/auth-callback` | `Auth Callback` | — |  |
| `shell.companies-list` | `/companies` | `Companies` | `shell.table` |  |
| `shell.company-deleted` | `/company-deleted` | `Company Deleted` | — |  |
| `shell.company-home` | `/companies/{companyId}` | `Dashboard` | — |  |
| `shell.delete-account` | `/delete-account` | `Delete Account` | — |  |
| `shell.home` | `/` | `Dashboard` | — |  |
| `shell.lite-check-email` | `/lite/check-email` | `Check Email` | — |  |
| `shell.lite-signup` | `/lite/signup` | `Signup` | — |  |
| `shell.lite-signup-complete` | `/lite/signup/complete` | `Complete` | — |  |
| `shell.lite-thank-you` | `/lite/thank-you` | `Thank You` | — |  |
| `shell.lite-verify-email` | `/lite/verify-email` | `Verify Email` | — |  |
| `shell.no-company-access` | `/no-company-access` | `No Company Access` | — |  |
| `shell.privacy-policy` | `/privacy-policy` | `Privacy Policy` | — |  |
| `shell.redirect` | `/redirect` | `Redirect` | — |  |
| `shell.sign-in` | `/sign-in` | `Sign In` | — |  |
| `shell.sign-out` | `/sign-out` | `Sign Out` | — |  |
| `shell.sign-up` | `/sign-up` | `Sign Up` | — |  |
| `shell.temporary-print-on-top` | `/temporary-print-on-top` | `Temporary Print On Top` | — |  |
| `shell.unauthorized` | `/unauthorized` | `Unauthorized` | — |  |

## Contract gaps

- **No `hover`.** The rail's sub-menus open on `onMouseOver` (`SidenavItem.tsx:313`) and nothing
  else. Resolved for flows by navigating via URL instead, so no flow depends on it — but it does
  mean the flyout contents are unreachable and therefore untestable. "Does the Sales flyout list
  Collections for this role?" cannot be asked.
- **The `select` action does not work anywhere in v2.** `_common/Form/Select.tsx` renders a MUI
  `TextField select`, which is a `div[role=combobox]` plus a popover listbox — not a native
  `<select>`. Playwright's `selectOption()` requires a real `<select>` element and throws
  otherwise. Every v2 dropdown must instead be driven as `click` the combobox → `click`
  `shell.select-option` with `{optionLabel}` bound. The `select` action in the contract is dead
  weight against this app.
- **Selectors carry parameters too.** `shell.company-switcher` and `shell.companies-list-item`
  embed `{companyName}`. `resolveTarget` returns `.selector` verbatim, so the runner has to
  substitute bound parameters into selector strings as well as into paths.
- **No URL assertion.** Sign-in lands on a tier-dependent path, `/` and the v1 layout both
  redirect, and `assertKnownPath` only guards the *requested* path. A flow cannot state where it
  ended up; it can only assert something visible there.
- **No new-tab handling.** `shell.sidenav-help` is `target="_blank"`. The plan cannot follow it.
- **No wait.** `authenticatedV2` holds a spinner while the session mirror and tier resolve, with
  a 10s bound (`SESSION_RESOLVE_TIMEOUT_MS`, `constants.ts:32`). `assertVisible` retries, so this is survivable, but
  a flow that needs "wait until the rail settles" has no way to say so.
- **`navigate` cannot express the tier redirect.** Navigating a Lite tenant to a `/v2` path is
  blocked during render. The plan will look like it navigated and then fail on the first
  assertion, with no signal that the tenant was the wrong edition.

## Open questions

- **Sign-in inputs have no associated `<label>`** (`StyledTextField` passes only `placeholder`).
  `input[name='…']` works, but this is a real accessibility defect worth reporting upward.
- **The toast has no `role="status"`/`aria-live`** (`Toast/Toast.tsx`). It resolves as
  `role=alert` via MUI's `Alert`, which is usable, but a screen reader announcement is not
  guaranteed and the container itself has no stable hook.
- **Which rail sections a run sees depends on the bound role, company settings, and a
  server-driven hidden-item list** (`getSidebarItems`, `useSidenavSections.tsx:85-119`). Every
  `shell.sidenav-*` and `shell.nav-*` target is conditional. A flow that clicks one is asserting
  a permission as much as a route.
- **Mobile renders `MobileBottomNav` instead of the rail** (`PageWrapper/index.tsx:341`), so
  every rail target is desktop-viewport only. No mobile targets drafted.
