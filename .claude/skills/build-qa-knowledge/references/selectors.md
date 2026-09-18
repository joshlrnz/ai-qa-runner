# Inferring selectors without `data-testid`

## The constraint that shapes everything

The runner does exactly this:

```ts
page.locator(resolveTarget(step.target))
```

So a selector is a **string valid for `page.locator()`** — not a `getByRole(...)` call. You
cannot emit builder syntax. You emit the string form of Playwright's selector engines.

Available string forms (chain with `>>`, default engine is CSS):

| form | example | use for |
| --- | --- | --- |
| `role=` | `role=button[name="Save draft"]` | anything with a semantic role + visible label |
| CSS + `:has-text()` | `h2:has-text('Inventory Alerts')` | headings, cards, rows containing text |
| CSS + `:text-is()` | `button:text-is('Delete')` | exact text, when substring would over-match |
| `text=` | `text=Order confirmed` | standalone text nodes, toasts |
| plain CSS | `input[name='email']` | stable attributes: `name`, `type`, `id`, `aria-*` |
| `:has()` | `tr:has(td:text-is('PAID'))` | picking a container by its contents |
| `>>` chain | `main >> role=button[name="Edit"]` | scoping (see below) |
| `:nth-match()` | `:nth-match(li, 2)` | last resort only |

**Verify the exact `role=` name-matching semantics against the installed Playwright version
before relying on them** (exact vs. substring, and the `s` / `i` flags). Version differences
here are a real source of silent over-matching. Phase 4's match-count check catches it
regardless — which is why Phase 4 is not optional.

## Priority ladder

Work down this list. Stop at the first rung that yields exactly one match.

**1. Role + accessible name.** Derive from the JSX: `<button>Save draft</button>` →
`role=button[name="Save draft"]`. Also `<a>` → `link`, `<input type=checkbox>` → `checkbox`,
`<h2>` → `heading`, `<select>` → `combobox`, `role={...}` props, and any `aria-label`.
This is the most restyle-proof rung. Most targets should land here.

**2. Label association.** `<label htmlFor="email">Email address</label>` →
`role=textbox[name="Email address"]`. If the label is not programmatically associated, say
so in the notes — it is an accessibility bug in the app and worth reporting upward.

**3. Stable attributes.** `name`, `type`, `id` (only when authored, not generated —
`:r1a:` style React ids are generated, never use them), `aria-*`, `role`.

**4. Text content.** `h2:has-text('Inventory Alerts')`. Fine for headings and static
copy. Brittle for anything the app translates or personalises — if the repo has i18n,
drop to rung 3 or 5 instead and note why.

**5. Scoped structural CSS.** A semantic container plus an element:
`form[aria-label='Filters'] >> select`. Acceptable when scoped to something stable.

**6. Positional.** `nth-child`, `:nth-match()`. Emit only when nothing else works, always
`confidence: low`, always with a note saying what would break it.

Never use: Tailwind utility classes, CSS-module hashed classes (`.Button_root__x7f2a`),
styled-components generated classes, or generated React ids. They change when someone
touches styling, which produces failing tests that are not bugs.

## Scoping for uniqueness

More than one match is a defect, not a detail — `page.locator()` throws on ambiguity for
actions. Fix it by narrowing, in this order:

1. Scope to a landmark: `main >>`, `nav >>`, `role=dialog >>`.
2. Scope to a labelled region: `role=region[name="Inventory Alerts"] >>`.
3. Scope to a row by content: `tr:has(td:text-is('SKU-1042')) >> role=button[name="Edit"]`.
4. Only then consider position.

Content-scoped selectors (3) are also how you express "the edit button on *that* row" — the
plan vocabulary has no indexing, so the specificity has to live in the selector.

## Where to read in a Next.js App Router repo

- `app/**/page.tsx` — the route's own content; the primary source of targets.
- `app/**/layout.tsx` — shared chrome (nav, sidebar, user menu). These targets belong to a
  `shell` module, referenced by other modules, not duplicated into them.
- `app/**/loading.tsx`, `error.tsx`, `not-found.tsx` — states a flow can land in. Worth a
  target each, since "did the error state appear" is a common assertion.
- `components/`, `ui/`, or the repo's equivalent — shared primitives. Read a `<Button>` once
  to learn whether it renders a real `<button>` (rung 1 works) or a styled `<div>` (it does
  not, and the target drops to rung 3 or 5).
- Server vs. client components: irrelevant to the selector, relevant to the flow. A server
  component means a full navigation; a client component means in-place update, which is
  where missing-wait gaps show up.

**Trace the primitive before trusting the role.** `<Button variant="ghost">Delete</Button>`
tells you nothing until you have read `Button`. Do that read once per primitive, early, and
record the conclusion in the module file so nobody repeats it.

## Confidence

| value | meaning |
| --- | --- |
| `high` | rung 1–3, and Phase 4 saw exactly one match |
| `medium` | rung 4–5, verified; or rung 1–3 not yet verified |
| `low` | rung 6, or verified-but-fragile — always carries a note |
| `unresolved` | did not resolve in Phase 4; listed in the module's Open questions |

Only Phase 4 may write `high`. Before verification the ceiling is `medium`.

Record a `fallbacks` array whenever you had a credible second candidate. It costs one line
now and saves a re-derivation when the first one breaks.
