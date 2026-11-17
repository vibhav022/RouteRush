# Data and API contract

All APIs are same-origin under `/api`, return JSON and disable caching. Validation errors return 400; unauthorized account calls 401; admin failures and cross-origin writes 403; conflicts 409; throttled authentication 429.

| Endpoint | Method | Purpose |
|---|---|---|
| /locations | GET | Distinct city/terminal names, date coverage, sources |
| /search | POST | Validated query to ranked journeys |
| /auth/register | POST | Email/password registration and session |
| /auth/login | POST | Password login and session |
| /auth/me | GET | Current account or null |
| /auth/logout | POST | Revoke session and clear cookie |
| /saved | GET/POST/DELETE | List, save a recomputed itinerary, remove owned snapshot |
| /admin/dataset | GET/PUT | Export or replace dataset with admin bearer token |

Search body: `from`, `to`, `date` (YYYY-MM-DD), `travellers` (1–12), `budget` (whole group), `deadline` (ISO timestamp with offset, or empty), `mode` (all/train/bus/combined), `maxTransfers` (0–2), `sort` (arrival/price/duration/transfers). Dates and deadlines are distinct; input in the planner is interpreted in India time.

Save body: `{query: <search body>, tripId: <returned ID>}`. The server recomputes the trip instead of accepting a client-supplied price. Delete body: `{id: <saved UUID>}`.

Dataset structure:

```json
{
  "services": [{
    "id": "example-2026-12-01",
    "mode": "bus",
    "operator": "Example operator",
    "from": "Indore Bus Terminal",
    "to": "Bhopal Bus Terminal",
    "fromCity": "Indore",
    "toCity": "Bhopal",
    "departure": "2026-12-01T15:00:00+05:30",
    "arrival": "2026-12-01T19:00:00+05:30",
    "fare": 350,
    "seats": null,
    "status": "unknown",
    "source": "Example manually entered schedule",
    "checkedAt": "2026-12-01T12:00:00+05:30",
    "simulated": true
  }],
  "transfers": [{
    "from": "Bhopal Bus Terminal",
    "to": "Bhopal Junction",
    "minutes": 30,
    "boarding": 25,
    "cost": 100
  }]
}
```

Each service is one departure instance, not a recurring timetable. IDs must be unique. Arrival must follow departure. Seats can be null, and statuses are available/waitlisted/sold-out/unknown. Fares are per person; transfer cost is for the group. Exact terminal names must agree between services and transfer rules, including same-terminal changes. Unknown seat inventory must remain unknown. Never infer seats from timetable existence. `simulated=false` is for actual, attributable data, not relabelled sample records.

Imports replace the whole dataset after validation (up to 5,000 services / 1,000 transfer rules, UI file limit 3 MB). Download the current dataset before editing. Real schedule data can be entered or converted from appropriately licensed sources; live availability integration will need an authorised feed and a server-side adapter.
