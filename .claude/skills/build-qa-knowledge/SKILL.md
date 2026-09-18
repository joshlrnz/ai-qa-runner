---
name: build-qa-knowledge
description: Parse a Next.js App Router repository and build a per-module QA knowledge base (markdown + compiled selector registry) that a planning agent uses to turn free-text test instructions into valid TestPlan JSON. Use when asked to map an app's flows for testing, generate or refresh the QA knowledge base, or add a module to it.
---

# Build the QA knowledge base

You are mapping a **target application repository** so that a separate planning agent can
convert free-text instructions ("check that an admin can void a paid invoice") into a
`TestPlan` JSON document that `ai-qa-runner` executes deterministically.

You are not writing tests. You are writing the map the test-writer reads.

## The contract you are serving

Everything you produce exists to make this pipeline work:

```text
free text
  → planning agent (reads YOUR markdown)
  → TestPlan JSON (validated by src/contracts/test-plan.ts)
  → executeTestStep (resolves target names via a selector registry)
  → Playwright
```

The plan vocabulary is **closed**. Six actions, nothing else:

| action | fields | resolves against |
| --- | --- | --- |
| `navigate` | `path` | `pages` (exact-match allowlist) |
| `click` | `target` | `targets` |
| `fill` | `target`, `value` | `targets` |
| `select` | `target`, `value` (option **label**) | `targets` |
| `assertVisible` | `target` | `targets` |
| `assertText` | `target`, `value` (substring) | `targets` |

If a flow cannot be expressed in those six actions, **you do not invent an action**. You
record it under `Contract gaps` in the module file and move on. Growing the contract is a
separate, human decision.

## What you output

Everything lands in `qa-knowledge/` **at the root of the target app repo** (not in
`ai-qa-runner`).

```text
qa-knowledge/
├── README.md            # how this was generated, how to refresh it
├── index.md             # module registry + per-module status
├── routes.md            # global route table (every reachable path)
├── application.json     # COMPILED registry — the runner's only machine input
├── modules/
│   ├── <module>.md      # one per module: targets, flows, preconditions, gaps
│   └── ...
└── .progress.json       # crawl state, so this is resumable across sessions
```

`application.json` is the same shape `ai-qa-runner` already reads, so the runner needs no
code change:

```json
{
  "pages": { "<route-name>": "/path" },
  "targets": {
    "<module>.<element>": {
      "selector": "role=button[name=\"Save\"]",
      "module": "orders",
      "confidence": "high",
      "fallbacks": ["css=form[data-state] button[type='submit']"],
      "verifiedAt": "2026-09-17"
    }
  }
}
```

`resolveTarget` reads only `.selector`; the extra keys are inert metadata for you and the
planner. Namespace every target `<module>.<element>` — the map is flat and global, and
`orders.submit-button` vs `invoices.submit-button` will otherwise collide silently.

Read `references/templates.md` for the exact file templates before writing anything.

## Selector inference

The target app has **no `data-testid`**. Inferring stable selectors is the hard part of this
job and it has its own document: read `references/selectors.md` before Phase 2. It covers
the priority ladder, the subset of selector syntax `page.locator()` accepts, how to scope
for uniqueness, and how to assign `confidence`.

Two rules that override everything else there:

1. **Never emit a selector you reasoned your way to but did not verify.** Phase 4 exists
   for this. An unverified selector ships as `confidence: low` or not at all.
2. **Prefer a selector that survives a restyle.** Role and accessible-name beat text, text
   beats structural CSS, structural CSS beats `nth-child`. A selector that breaks on a
   Tailwind class change is worse than no selector, because it produces a red test that
   isn't a bug.

## Strategy: this is a multi-session job

The app is large. Do not attempt it in one pass. Work phase by phase, write state to
`.progress.json` after every module, and **stop at the checkpoints** rather than guessing.

Stopping to ask is cheap. A knowledge base built on a wrong module partition is not.

### Phase 0 — Recon (no files written except `.progress.json`)

Read structure, not implementations. Budget: breadth over depth.

1. Confirm the stack: `app/` directory, `next.config.*`, Next major version. If it is not
   App Router, stop and say so — the heuristics below assume it.
2. Enumerate route files: every `app/**/page.tsx` (and `route.ts` for API routes, which you
   note but do not map as UI).
3. Note route groups `(marketing)`, dynamic segments `[id]`, parallel `@slots`, and
   `layout.tsx` files — layouts are shared chrome and usually belong to a `shell` module,
   not to any feature.
4. Detect auth: middleware, route-group split, session helpers. Which routes require a
   session, and are there distinct roles?
5. Propose a **module partition**. Start from top-level segments under `app/`, then merge or
   split using: shared layout, shared feature directory outside `app/`, and whether a user
   would describe them as one thing.

**→ CHECKPOINT 1.** Present the proposed partition as a table (module, route count, example
routes, auth requirement) and the detected roles. Ask the user to confirm boundaries and to
rank modules by priority. Do not proceed until they answer.

### Phase 1 — Global route map

Write `routes.md` and the `pages` half of `application.json` for **all** modules at once.
This is cheap, whole-app, and everything else depends on it.

For each route record: path, module, the page file, auth requirement, dynamic params, and
what it is for in one line.

Dynamic routes need care. `assertKnownPath` does exact string matching against `pages`
values, so `/orders/[id]` can never be navigated to. Record both the template and at least
one concrete example path, and list the template under `Contract gaps`.

**→ CHECKPOINT 2.** Report route count, how many are auth-gated, how many are dynamic, and
anything unreachable or dead. Confirm the module order before the deep pass.

### Phase 2 — Per-module deep pass (one module per session)

For each module, in the agreed priority order, read only the files Phase 0 mapped to it.
Produce `modules/<module>.md` containing:

- **Purpose** — two sentences, what a user does here.
- **Routes** — the slice of the route table owned by this module.
- **Preconditions** — auth role, and what data must already exist for the module to be
  testable at all. Be specific: "at least one order in `pending` state", not "some data".
- **Targets** — a table of logical name, role/accessible name, proposed selector, source
  file:line, confidence, and notes. See `references/selectors.md`.
- **Flows** — named user journeys, each written as an ordered step list **in the six-action
  vocabulary**, with `<placeholder>` for any value the planner must supply. A flow that
  reads as prose is not done.
- **Contract gaps** — anything real the six actions cannot express (waits, URL assertions,
  list indexing, file upload, drag, new tabs, toast timing). One line each, with the flow
  that needs it.
- **Open questions** — anything you could not determine from the code.

Update `.progress.json` and `index.md` after each module. If a module's `Open questions` has
an entry that blocks its flows, surface it immediately rather than at the end.

**→ CHECKPOINT 3** (per module, only when needed): ask when you hit credentials, seeded-data
requirements, destructive flows, or a genuine ambiguity about intended behaviour. Do not ask
about things the code answers.

### Phase 3 — Compile

Merge every module's targets and the Phase 1 pages into `qa-knowledge/application.json`.

- Fail loudly on duplicate target keys — do not silently take the last one.
- Every target in a flow must exist in the registry, and every registry entry should be
  reachable from at least one flow. Report both kinds of orphan.

### Phase 4 — Verify against the running app

Inferred selectors are hypotheses. This phase turns them into facts.

For each target, resolve it against the live app (authenticated where the module requires
it) and record the match count:

- exactly 1 → `confidence: high`, set `verifiedAt`
- 0 → the selector is wrong. Try the fallbacks, then re-derive. If it still fails, mark
  `confidence: unresolved` and list it in the module's `Open questions`.
- more than 1 → scope it (see `references/selectors.md`); do not ship an ambiguous selector.

Then execute each flow end to end as a plan. A flow that has never run is a guess.

**→ CHECKPOINT 4.** Report the verification table: targets verified, unresolved, ambiguous;
flows passing and failing. Unresolved targets are the honest output here — report them, do
not paper over them with a brittle `nth-child` selector to make the number look better.

## Working rules

- **Read the smallest thing that answers the question.** Phase 0 builds the file→module map
  precisely so later phases never re-scan the repo.
- **Cite your source.** Every target and flow carries `path/to/file.tsx:42`. The next agent
  to touch this needs to check your work without re-deriving it.
- **Record uncertainty as uncertainty.** `confidence: low` and an `Open question` are
  correct outputs. A confident wrong selector costs more than an admitted gap.
- **Never edit the target app.** You are read-only in its source. You write only under
  `qa-knowledge/`.
- **Resumability is a feature.** Any session should be able to read `.progress.json` and
  `index.md` and know exactly what is done and what is next.
