import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  search,
  querySchema,
  datasetSchema,
  type Service,
} from "../lib/server/model";
const dir = mkdtempSync(join(tmpdir(), "routerush-"));
process.env.ROUTERUSH_DB_PATH = join(dir, "test.sqlite");
process.env.ROUTERUSH_ADMIN_TOKEN = "test-only-admin-token";
const { handle } = await import("../lib/server/api");
const { db, dataset } = await import("../lib/server/db");
after(() => {
  db().close();
  rmSync(dir, { recursive: true, force: true });
});
async function call(
  path: string,
  body?: unknown,
  cookie = "",
  method = "POST",
  headers: Record<string, string> = {},
) {
  const r = await handle(
    new Request("http://localhost/api/" + path, {
      method: body === undefined ? "GET" : method,
      headers: { "content-type": "application/json", cookie, ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  return {
    status: r.status,
    body: (await r.json()) as {
      trips: import("../lib/server/model").Trip[];
      saved: { id: string }[];
      services: Service[];
      transfers: import("../lib/server/model").Transfer[];
    },
    cookie: r.headers.get("set-cookie")?.split(";")[0] || "",
  };
}
function input() {
  const d = dataset(),
    first = d.services[0];
  return querySchema.parse({
    from: "Indore",
    to: "New Delhi",
    date: new Date(Date.parse(first.departure) + 330 * 60000)
      .toISOString()
      .slice(0, 10),
    budget: 1200,
    deadline: new Date(
      Date.parse(first.departure.slice(0, 10) + "T00:00:00+05:30") +
        86400000 +
        9 * 3600000,
    ).toISOString(),
  });
}
test("database seeded once and exact fallback recomputed", () => {
  const d = dataset(),
    q = input();
  const run = (ids: string[]) =>
    search(
      q,
      d.services.map((s) =>
        ids.some((id) => s.id.endsWith(id))
          ? { ...s, status: "sold-out", seats: 0 }
          : s,
      ),
      d.transfers,
    ).filter((t) => t.usable);
  assert.equal(run([])[0].total, 1000);
  assert.equal(run([])[0].transfers[0].slack, 50);
  assert.equal(run(["train-A"])[0].total, 1140);
  assert.equal(run(["train-A", "train-B"]).length, 0);
  assert.equal(
    search({ ...q, budget: 999 }, d.services, d.transfers).filter(
      (t) => t.usable,
    ).length,
    0,
  );
});
test("group seats, destination, modes and exact deadline", () => {
  const d = dataset(),
    q = input();
  assert.equal(
    search({ ...q, travellers: 4, budget: 5000 }, d.services, d.transfers).find(
      (t) => t.id.includes("train-A"),
    )?.usable,
    false,
  );
  assert.equal(
    search({ ...q, from: "Unknown" }, d.services, d.transfers).length,
    0,
  );
  assert.ok(
    search({ ...q, mode: "train" }, d.services, d.transfers).every((t) =>
      t.legs.every((s) => s.mode === "train"),
    ),
  );
  assert.equal(
    querySchema.safeParse({ ...q, date: "2026-02-30" }).success,
    false,
  );
});
test("multi-transfer graph, loops and unknown/stale inventory", () => {
  const base = dataset().services[0];
  const make = (
    id: string,
    from: string,
    to: string,
    dep: string,
    arr: string,
  ): Service => ({
    ...base,
    id,
    from,
    to,
    fromCity: from,
    toCity: to,
    departure: `2026-12-01T${dep}:00+05:30`,
    arrival: `2026-12-01T${arr}:00+05:30`,
    status: "available",
    seats: 5,
    fare: 100,
  });
  const services = [
    make("a", "A", "B", "06:00", "07:00"),
    make("b", "B", "C", "08:00", "09:00"),
    make("c", "C", "D", "10:00", "11:00"),
  ];
  const transfers = ["B", "C"].map((x) => ({
    from: x,
    to: x,
    minutes: 0,
    boarding: 20,
    cost: 0,
  }));
  const q = querySchema.parse({
    from: "A",
    to: "D",
    date: "2026-12-01",
    maxTransfers: 2,
  });
  assert.equal(search(q, services, transfers)[0].legs.length, 3);
  assert.equal(
    search({ ...q, maxTransfers: 1 }, services, transfers).length,
    0,
  );
  assert.equal(
    search(
      q,
      services.map((s) => ({ ...s, seats: null })),
      transfers,
    )[0].usable,
    false,
  );
  assert.equal(
    search(
      q,
      services.map((s) => ({
        ...s,
        simulated: false,
        checkedAt: "2000-01-01T00:00:00Z",
      })),
      transfers,
    )[0].usable,
    false,
  );
});
test("accounts, sessions, saved ownership, signout and admin authorization", async () => {
  const a = await call("auth/register", {
    email: "one@example.com",
    password: "longpassword123",
  });
  assert.equal(a.status, 200);
  assert.ok(a.cookie);
  assert.equal(
    (
      await call("auth/login", {
        email: "one@example.com",
        password: "wrongpassword",
      })
    ).status,
    401,
  );
  const login = await call("auth/login", {
    email: "one@example.com",
    password: "longpassword123",
  });
  assert.equal(login.status, 200);
  assert.equal((await call("saved")).status, 401);
  const q = input(),
    found = await call("search", q);
  const tripId = found.body.trips.find(
    (t: { usable: boolean }) => t.usable,
  )!.id;
  assert.equal(
    (await call("saved", { query: q, tripId }, a.cookie)).status,
    201,
  );
  const saved = await call("saved", undefined, a.cookie);
  assert.equal(saved.body.saved.length, 1);
  const b = await call("auth/register", {
    email: "two@example.com",
    password: "longpassword123",
  });
  assert.equal((await call("saved", undefined, b.cookie)).body.saved.length, 0);
  await call("saved", { id: saved.body.saved[0].id }, b.cookie, "DELETE");
  assert.equal((await call("saved", undefined, a.cookie)).body.saved.length, 1);
  assert.equal((await call("admin/dataset")).status, 403);
  const admin = await call("admin/dataset", undefined, "", "GET", {
    authorization: "Bearer test-only-admin-token",
  });
  assert.equal(admin.status, 200);
  assert.equal(
    (
      await call("admin/dataset", { ...admin.body, services: [] }, "", "PUT", {
        authorization: "Bearer test-only-admin-token",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("admin/dataset", admin.body, "", "PUT", {
        authorization: "Bearer test-only-admin-token",
      })
    ).status,
    200,
  );
  await call("auth/logout", {}, a.cookie);
  assert.equal((await call("saved", undefined, a.cookie)).status, 401);
  assert.equal(
    (
      await call(
        "auth/register",
        { email: "x@example.com", password: "longpassword123" },
        "",
        "POST",
        { origin: "https://evil.example" },
      )
    ).status,
    403,
  );
});
test("dataset validation rejects duplicate IDs and backwards travel", () => {
  const d = dataset();
  assert.equal(
    datasetSchema.safeParse({ ...d, services: [d.services[0], d.services[0]] })
      .success,
    false,
  );
  assert.equal(
    datasetSchema.safeParse({
      ...d,
      services: [{ ...d.services[0], arrival: d.services[0].departure }],
    }).success,
    false,
  );
});

test('backend journeys retain totals and timing in original result cards', async()=>{
 const {present}=await import('../lib/server/presentation');
 const q=input(),d=dataset();const trip=search(q,d.services,d.transfers).find(t=>t.usable)!;
 const card=present(trip,q.date);
 assert.equal(card.totalPrice,1000);assert.equal(card.arrivalTime,'07:50');assert.equal(card.arrivalDayOffset,1);assert.equal(card.transferCost,100);assert.equal(card.segments.length,2);assert.equal(card.connectionViable,true);assert.match(card.transfers[0].note,/50 min spare/);
});
