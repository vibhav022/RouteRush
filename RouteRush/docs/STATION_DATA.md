# Railway station directory and live-data readiness

The bundled directory contains 8,989 unique code/name records from DataMeet/railways (8,990 source features, one duplicate code collapsed). Source revision: e0c538a1e41ae5eace454d2818902e1065608e16, dated 2016-08-08. Data licence: CC0, as declared at https://github.com/datameet/railways/blob/master/README.md. Original collectors: Sanjay Bhangar and Sajjad Anwar / DataMeet.

This is a historical community snapshot, not an authoritative list of all currently active passenger stations. It includes operational points and may contain old names/codes. Source, revision, download time and SHA-256 are retained in data/stations.json. No historical train schedules, fares or inventory were imported as live services.

Home and Modify search now suggest station names and codes nationwide; exact code matches rank first. Searches submit codes, and the journey engine resolves station codes against terminal names. City names remain distinct from particular stations (Delhi is not synonymous with NDLS). Selecting a station does not imply available schedule coverage there. Results still depend on the dated services imported into the server database.

GET /api/stations?q=NDLS returns at most 30 matches with directory provenance. The bundled directory is available offline and requires no API key. Reproduce it with `node scripts/import-stations.mjs` or supply a downloaded copy of the pinned GeoJSON as the first argument. Refreshing to a different upstream revision should involve reviewing source age, licence, schema and changes, rather than silently replacing records.

## Live tickets: currently unavailable

No authorised live provider credentials are configured. This application cannot currently claim real-time fares, seats, PNR checks, running status, reservations or nationwide live schedules. IRCTC e-ticket APIs are supplied through its authorised integration arrangements; see https://contents.irctc.co.in/en/NormsforB2B.pdf and https://contents.irctc.co.in/en/Policy_for_e-ticketing_Service_Providers-2013.pdf. These policies describe integration requirements, not a free anonymous API.

The remaining integration needs actual provider access, current API documentation, sandbox credentials and production approval where required. Keep credentials in server environment variables, never in chat or browser code. Before implementation, establish supported endpoints for trains between stations, schedules, dated/class/quota availability, fares, freshness and booking handoff. A trial/free quota, if offered by a provider, is not unlimited nationwide access. Until a real feed is connected, source-labelled sample or manually imported records stay explicitly identified; there is no automatic substitution of invented tickets for missing data.
