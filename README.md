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
      { "action": "assertText", "selector": "h2:has-text('Inventory Alerts')", "value": "Inventory Alerts" }
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

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
