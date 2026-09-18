# Phase 4 verification harness

Turns the inferred selectors in `application.json` into facts by resolving each one against a
running app and recording the match count. **Exactly 1 is a pass**; 0 means the selector is wrong
(or the data isn't there); more than 1 means it is ambiguous and will throw on `click`.

## Run

```bash
npm i -D playwright && npx playwright install --with-deps chromium

cd qa-knowledge/scripts/verify
BASE=https://releasing.oboda.app \
E2E_EMAIL=... E2E_PASSWORD=... node auth.mjs        # writes auth.json (session cookies)

BASE=https://releasing.oboda.app CID=<prime company id> node routes.mjs   # every path resolves?
BASE=https://releasing.oboda.app CID=<prime company id> node probe.mjs    # every selector resolves?
```

`auth.mjs` signs in through the **next-auth credentials API**, not the sign-in form. That is
deliberate: it is faster, and it does not depend on the form rendering.

`probe.mjs` reads `plan.json` — a list of `{path, targets, discover}` steps. `targets` accepts a
`module.prefix*` wildcard. `discover` scrapes a real record id out of the first row's link so
record pages can be probed without seeded fixtures.

**The probe is read-only**: it navigates and counts. It never clicks a submit, confirm or delete,
because the environments worth verifying against are shared.

## Linux note (this is how it was made to work)

On a bare Ubuntu box Chromium will download fine and then **exit silently** a few seconds after
any authenticated app page commits, while public pages render fine. That is not the app. It is
missing system libraries — and in particular **missing fonts**. `npx playwright install-deps`
lists 73 packages; installing all of them fixes it.

If you cannot use `sudo`, they can be extracted into a user directory instead:

```bash
npx playwright install-deps --dry-run chromium | grep -E '^  [a-z]' | tr -d ' ' > deps.txt
mkdir -p libs/debs && cd libs/debs && xargs -a ../../deps.txt apt-get download
for d in *.deb; do dpkg -x "$d" ../root; done
```

Then run with `LD_LIBRARY_PATH=<libs>/root/usr/lib/x86_64-linux-gnu` and a `FONTCONFIG_FILE`
pointing at a config whose `<dir>` is `<libs>/root/usr/share/fonts` (see `fonts.conf.example`).
Fonts were the piece that mattered; libraries alone were not enough.

## Results, 2026-09-17 (releasing.oboda.app, company 10004)

- `routes.mjs`: **154/157 Prime paths returned 200** — `/404`, `/sign-up` and `/auth-callback`
  are correct exceptions. The `pages` half of the registry is verified.
- `probe.mjs` (`plan.json` then `plan-records.json`): **356 targets probed — 147 matched exactly
  1**, 23 were ambiguous, 180 were not reached by these two plans.

Full analysis is in `../../index.md` under *Verification status*.

## Extending the probe

`plan.json` covers list and create pages. `plan-records.json` covers record pages and their tabs,
using ids discovered by the first pass (see `ids.txt`). To close the 180 unreached targets, add
steps for the pages they live on — a step is `{path, targets, clicks?, discover?}` and `targets`
accepts a `module.prefix*` wildcard.
