# RouteRush hackathon demo

A mobile-first, simulated bus/train journey planner for the Indore–Delhi corridor. No fares, seats, or ticket handoffs are live.

## Run locally

Requires Node 22.13+ and Linux build utilities.

```sh
npm ci
npm run dev
```

The application lives in this nested `RouteRush/` folder. This project uses Next-compatible App Router components hosted by Vite/Vinext and Cloudflare Workers.

## Judging flow

Open search results, then click **Load judging scenario**. This sets Indore → New Delhi station, one traveller, ₹1,200 total budget, and arrival by 09:00 the next day (India time).

1. Bus + train A: ₹1,000, 07:50 arrival, 50 minutes transfer slack.
2. Select **Sell out train-A**: train B becomes recommended, ₹1,140, 08:35 arrival.
3. Select **Sell out train-B**: no fully available qualifying journey.
4. Reset seats to repeat.

Unavailable and infeasible journeys remain visible for context unless filtered out. Group budgets include per-person fares multiplied by party size plus one fixture transfer cost. Transfer estimates and fares are assumed complete in these fixtures. Dates select daily simulated service instances; they do not query an actual timetable. Exact New Delhi searches require NDLS; city searches may include other Delhi terminals.

The engine generates direct and one-transfer journeys from services in `lib/journey-engine.ts`. Inventory is shared across generated journeys. Changing seats recomputes cards, counts, recommendation, open details, and comparisons. The fixture adapter can later be replaced with an authorised server-side provider feed.

## Verification

```sh
node --test tests/journey-engine.test.mjs
npx tsc --noEmit
npm test
npm run lint
```

The engine acceptance tests cover fallback, party size, total costs, overnight time, infeasible transfers, unknown seats, modes, and unsupported locations. Existing tests also check built HTML and UI primitives.
