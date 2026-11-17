# Evaluation and presentation guide

## Demonstrate the implemented system

1. Start the application with no external API keys and show schedule source/date coverage.
2. Search the Indore–New Delhi scenario with a next-day 09:00 deadline and ₹1,200 group budget.
3. Show the ₹1,000 connection, 50-minute slack and the per-leg provenance.
4. Export the database dataset through admin, sell out the selected date's train A, import, and repeat the same search: train B costs ₹1,140. Sell out B and repeat: no usable itinerary.
5. Change party size to demonstrate that seats on every leg are required and group fares change.
6. Compare results, create an account, save a trip, reload the page, and recheck it. A second account must not see the first account's saved trips.
7. Show validation rejecting an invalid import without replacing the prior data.
8. Explain the actual limitations: sample initial data, no live seat API, provider homepage handoff, no payment or ticket guarantee.

## Evaluation design

Recruit 8–12 volunteers. Provide two comparable journey-planning tasks using the same underlying schedule dataset. Alternate manual planning and RouteRush order. Measure time to a valid answer, percentage finding a valid journey, invalid recommendations and understanding of transfer cost/separate tickets. Report actual sample sizes and observations; do not claim measured improvement before conducting the study.

## Test evidence

The automated suite exercises route generation and HTTP handlers with isolated SQLite storage. A browser smoke test should cover registration, saved-trip persistence after reload, comparison and a 320px viewport. Include the command output and record failures honestly. Load testing and a public deployment are separate readiness steps.

## Suggested report chapters

Problem definition; related work; requirements; system/data architecture; algorithm and constraints; implementation; tests and user evaluation; limitations; future work; references and data licences.
