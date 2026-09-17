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
    "name": "Open the authenticated oboda dashboard",
    "steps": [
      { "action": "navigate", "path": "/" },
      { "action": "assertText", "target": "inventory-alerts-heading", "value": "Inventory Alerts" }
    ]
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

## Supported actions

- `navigate`
- `click`
- `fill`
- `select`
- `assertVisible`
- `assertText`

The runner resolves logical target names through `src/knowledge/application.json`. It rejects unknown targets and paths.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
