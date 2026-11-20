# RouteRush

A full-stack intercity journey planner with a persistent SQLite database, accounts, private saved journeys, dated schedule imports, and direct / one-transfer / two-transfer bus and rail search. Runs without paid API keys.

**Data coverage:** first startup seeds 30 days of explicitly simulated Indore–Delhi corridor services. This is a working application with sample inventory, not a live Indian Railways or bus availability feed. The admin interface accepts independently obtained, authorised schedule records. Unknown or stale inventory is never counted as fully available. No bookings or payments are processed.

## Windows / macOS / Linux setup

Install Node.js **24 LTS** (Node 22.13+ supports the required SQLite module, but Node 24 is recommended). In the inner `RouteRush` directory containing this package.json:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The home search leads to `/planner`. No Bash, PostgreSQL subscription, external authentication service, or API key is required. The native SQLite API may emit an experimental warning on some Node versions.

The database is created at `storage/routerush.sqlite`. Keep this directory to preserve schedules, users and saved journeys between restarts. It is ignored by Git. Do not place it on a public static file server.

## Using the application

1. Search Indore to New Delhi for a date within the displayed coverage. Set one traveller and ₹1,200 group budget. Set the arrival deadline to 09:00 on the following day.
2. Open itinerary details to inspect each leg, its source, seats, fare and terminal transfer calculation.
3. Compare up to three results. Create an account with a password of at least ten characters and save a journey.
4. Reopen the app, sign in, and use **Recheck journey** to calculate against the current dataset. Saved prices are historical estimates.
5. Open `/demo` for the isolated original hackathon seat-toggle scenario. Its data changes do not modify the database.

## Admin schedule imports

Generate a random token:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Create `.env.local` in the app folder with `ROUTERUSH_ADMIN_TOKEN=<the generated value>`, restart the server, open `/admin`, and enter the token. The endpoint is disabled when no token is configured. Do not commit or share this file.

Load and download the current dataset as a JSON template/backup. Edit it or import a JSON file. The interface asks you to review replacement before saving. Validation completes before the existing dataset is replaced. See [data contract](docs/DATA.md).

To exercise fallback against the backend, set the selected date's train A status to `sold-out` and seats to zero, import, and search again: train B replaces A. Repeat for B: no fully available itinerary meets the judging constraints. Refreshing search also updates comparison candidates; saved trip snapshots remain unchanged until rechecked.

## Verification

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
npm start
```

`npm test` runs engine and API integration tests against an isolated temporary database. It covers fallback, budget, group seats, multi-transfer paths, unknown/stale inventory, calendar validation, registration/login/logout, cross-origin rejection, private saved-trip ownership and admin imports. For browser checks, start `npm run dev`, then run `npx playwright install chromium` and `npm run test:browser` in a second terminal. This creates a test account and saved trip; use a disposable database.

Historical demo tests remain available in `tests/journey-engine.test.mjs`; the active suite is `tests/server.test.ts`.

## Hosting

Use a **single Node server with a persistent writable disk**, or the included Docker setup. SQLite storage cannot be placed on an ephemeral serverless filesystem. Production must be served through HTTPS because session cookies use Secure in production. Provide TLS at your reverse proxy / hosting service.

```sh
npm run build
npm start
```

Optional environment variables: `ROUTERUSH_DB_PATH` changes the database file path; `ROUTERUSH_ADMIN_TOKEN` enables schedule administration. Set `ROUTERUSH_PUBLIC_ORIGIN=https://your-domain.example` behind a TLS reverse proxy so origin checks match the public URL. Back up the SQLite database with a SQLite-aware backup tool or stop the server before copying its storage directory. Avoid copying only the main file while WAL writes are active.

Docker: set ROUTERUSH_ADMIN_TOKEN in your shell or a local `.env` next to compose.yaml, then run `docker compose up --build`. The volume persists the SQLite files. Put the server behind HTTPS before using production authentication. Docker configuration is supplied but was not executed in this workspace.

## Project documentation

- [Architecture and scope](docs/ARCHITECTURE.md)
- [Data and API contract](docs/DATA.md)
- [Evaluation and presentation guide](docs/EVALUATION.md)

Remaining production work: authorised live provider feeds, provider-specific freshness policies, password recovery/email verification, automated alerts, larger-corridor load testing and a public HTTPS deployment. Provider links currently open IRCTC / redBus homepages; they are not ticket reservations or itinerary-prefilled links.

## Nationwide station lookup

The original search UI now includes 8,989 distinct railway code/name records from the CC0 DataMeet community directory. This is a historical 2016 snapshot, not a guarantee of complete current station coverage. Type a name or code to see up to 30 matches. Schedule coverage and seat availability remain separate. See [station data provenance and live-data requirements](docs/STATION_DATA.md).
