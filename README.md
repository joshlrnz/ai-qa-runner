# AI QA Runner

This hackathon prototype converts a structured test plan into a Playwright run against a deployed application.

The current runner targets `https://releasing.oboda.app` by default. Set `TARGET_BASE_URL` to use another environment.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env.local
```

## Run the smoke test

```bash
npm run test:e2e
```

The command runs `plans/smoke.json` against the authenticated dashboard. It writes the HTML report and trace to `runs/local/`.

Open the report with:

```bash
npx playwright show-report runs/local/playwright-report
```

## Save an authenticated session

```bash
npm run auth:setup
```

A browser opens at the configured target. Sign in manually, then press Enter in the terminal.

The script saves the session to `.auth/dev-user.json`. Git ignores this file.

## Start the QA API

```bash
npm run dev
```

### Start a test run

```bash
curl -X POST http://localhost:3000/api/runs \
  -H 'Content-Type: application/json' \
  --data @- <<'JSON'
{
  "plan": {
    "name": "Open the sales orders list",
    "requiredParams": {
      "companyId": { "description": "Company the run operates in.", "secret": false }
    },
    "steps": [
      { "action": "navigate", "path": "/companies/{companyId}/v2/sales-orders" },
      { "action": "assertVisible", "selector": "role=heading[name=\"Sales Orders\"]" }
    ]
  },
  "params": {
    "companyId": "10004"
  }
}
JSON
```

The response contains a run ID.

### Read run status

```bash
curl http://localhost:3000/api/runs/<run-id>
```

When the run finishes, open the returned `reportUrl` in the browser.

## Generate a plan from free text

The planning agent turns an instruction into a plan, grounded in `qa-knowledge/`. It needs
`OPENAI_API_KEY`, and optionally `QA_PLANNER_MODEL` (default `openai/gpt-5.6-sol`).

The agent pauses once to confirm the parameters it inferred and to resolve any ambiguity, so
planning is always two calls.

```bash
curl -X POST http://localhost:3000/api/plans \
  -H 'Content-Type: application/json' \
  -d '{ "instruction": "check that the sales orders list loads" }'
```

It returns `needs_input` with a `runId` and the questions:

```json
{
  "status": "needs_input",
  "runId": "143302e1-...",
  "questions": [{ "id": "edition", "question": "Prime/v2 or Lite?", "why": "..." }],
  "inferredParams": [{ "name": "companyId", "description": "...", "secret": false }]
}
```

Answer to resume. The reply is `planned`, with the plan, the assumptions the agent made and the
warnings it wants read:

```bash
curl -X POST http://localhost:3000/api/plans/<run-id> \
  -H 'Content-Type: application/json' \
  -d '{ "answers": [{ "id": "edition", "answer": "Prime" }] }'
```

An instruction the vocabulary cannot express returns `blocked` instead, naming what is missing:

```json
{ "status": "blocked", "reason": "The Sales flyout opens on mouseover...", "missingCapabilities": ["hover"] }
```

Post the returned `plan` to `POST /api/runs` with its parameter values to execute it.

From the command line instead:

```bash
npm run planner:ask  -- "which selectors would I use to sign in?"
npm run planner:plan -- "open the sales orders list" out.json
```

## Supported actions

- `navigate`
- `click`
- `fill`
- `assertVisible`
- `assertText`

Steps carry Playwright selector strings directly. The runner performs no name lookup and reads no
knowledge file.

`select` is not part of the contract. The application renders dropdowns as MUI comboboxes rather
than native `<select>` elements, and Playwright's `selectOption()` throws on those. Drive a
dropdown by clicking the combobox and then clicking the option.

## Parameters

A path, selector or value may contain `{paramName}` placeholders. A plan declares what it needs:

```json
{
  "requiredParams": {
    "companyId": { "description": "Company the run operates in.", "secret": false }
  }
}
```

The runner substitutes bound values before each step. A referenced parameter with no bound value
throws `Unbound plan parameter: <name>`.

Values are supplied per run, in the `params` object of the `POST /api/runs` body. A request that
omits a declared parameter returns 400 listing the missing names.

## Secrets

A parameter declared `"secret": true` is passed to the Playwright process as an environment
variable and is never written to disk. Each run directory holds:

- `plan.json` — the plan, which contains parameter *declarations*, never values
- `params.json` — the bound values of **non-secret** parameters only

Every parameter reaches the browser process as `QA_PARAM_<name>`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
