import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "vite";
const vite = await createServer({
  configFile: false,
  server: { middlewareMode: true },
});
const { generateJourneys, services, qualifies, minutes, instant } =
  await vite.ssrLoadModule("/lib/journey-engine.ts");
await vite.close();
const q = {
  from: "Indore",
  to: "New Delhi",
  date: "2026-12-01",
  travellers: 1,
  mode: "all",
};
function eligible(sold = [], query = q, budget = 1200) {
  return generateJourneys(
    query,
    services.map((s) =>
      sold.includes(s.id)
        ? { ...s, availabilityStatus: "sold-out", seatsRemaining: 0 }
        : s,
    ),
  )
    .filter(
      (j) =>
        qualifies(j) &&
        j.totalPrice <= budget &&
        minutes(j.arrivalTime, j.arrivalDayOffset) <= minutes("09:00", 1),
    )
    .sort(
      (a, b) =>
        minutes(a.arrivalTime, a.arrivalDayOffset) -
          minutes(b.arrivalTime, b.arrivalDayOffset) ||
        a.totalPrice - b.totalPrice,
    );
}
test("judging sequence recalculates shared service journeys", () => {
  let r = eligible();
  assert.equal(r[0].id, "shared-bus--train-A");
  assert.equal(r[0].totalPrice, 1000);
  assert.match(r[0].recommendationReason, /50 min spare/);
  r = eligible(["train-A"]);
  assert.equal(r[0].id, "shared-bus--train-B");
  assert.equal(r[0].totalPrice, 1140);
  assert.equal(eligible(["train-A", "train-B"]).length, 0);
  assert.equal(eligible(["shared-bus"]).length, 0);
});
test("group seats, costs, and arrival constraints", () => {
  const r = generateJourneys({ ...q, travellers: 4 });
  assert.equal(qualifies(r.find((j) => j.id === "shared-bus--train-A")), false);
  assert.equal(r.find((j) => j.id === "shared-bus--train-B").totalPrice, 4260);
  assert.equal(eligible([], q, 999).length, 0);
  assert.equal(
    instant(q.date, "07:50", 1) - instant(q.date, "15:00"),
    1010 * 60000,
  );
});
test("eight examples and invalid connections / unknown seats", () => {
  const r = generateJourneys({ ...q, to: "Delhi" });
  assert.equal(r.length, 8);
  assert.equal(
    qualifies(r.find((j) => j.id === "ujjain-bus--ujjain-train")),
    false,
  );
  assert.equal(
    qualifies(r.find((j) => j.id === "jaipur-train--jaipur-bus")),
    false,
  );
  assert.equal(generateJourneys({ ...q, from: "Mumbai" }).length, 0);
  assert.ok(
    generateJourneys({ ...q, mode: "train" }).every((j) =>
      j.modes.every((m) => m === "train"),
    ),
  );
  assert.ok(
    generateJourneys({ ...q, mode: "combined" }).every(
      (j) => j.transferCount === 1,
    ),
  );
});
test("tight positive connection, late fallback, and unknown transfer", () => {
  const tight = generateJourneys(
    { ...q, to: "Delhi" },
    services.map((s) =>
      s.id === "ujjain-train" ? { ...s, departureTime: "17:05" } : s,
    ),
  ).find((j) => j.id === "ujjain-bus--ujjain-train");
  assert.equal(tight.connectionRisk, "tight");
  assert.equal(qualifies(tight), true);
  const late = generateJourneys(
    q,
    services.map((s) =>
      s.id === "train-B" ? { ...s, arrivalTime: "09:01" } : s,
    ),
  ).find((j) => j.id === "shared-bus--train-B");
  assert.ok(
    minutes(late.arrivalTime, late.arrivalDayOffset) > minutes("09:00", 1),
  );
  const unknown = generateJourneys(
    q,
    services.map((s) =>
      s.id === "shared-bus" ? { ...s, destinationCode: "OTHER" } : s,
    ),
  ).find((j) => j.id === "shared-bus--train-A");
  assert.equal(qualifies(unknown), false);
});
