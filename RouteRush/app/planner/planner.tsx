"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Query, Trip } from "@/lib/server/model";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const time = (s: string) =>
  new Date(s).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
async function api(path: string, data?: unknown, method = "POST") {
  const r = await fetch("/api/" + path, {
    method: data === undefined ? "GET" : method,
    headers: { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const b = (await r.json()) as {
    error?: string;
    locations: string[];
    coverage: { from: string; to: string };
    source: string[];
    trips: Trip[];
    query: Query;
    user: { email: string } | null;
    saved: Saved[];
  };
  if (!r.ok) throw Error(b.error || "Request failed");
  return b;
}
type Saved = { id: string; query: Query; trip: Trip; created: string };
export default function Planner() {
  const params = useSearchParams();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [q, setQ] = useState<Query>({
    from: params.get("from") || "Indore",
    to: params.get("to") || "New Delhi",
    date: params.get("date") || today,
    travellers: Number(params.get("travellers")) || 1,
    budget: Number(params.get("budget") ?? 1200),
    deadline: "",
    mode: (["train", "bus", "combined"].includes(params.get("mode") || "")
      ? params.get("mode")
      : "all") as Query["mode"],
    maxTransfers: Math.max(
      0,
      Math.min(2, Number(params.get("maxTransfers") ?? 2)),
    ),
    sort: (["price", "duration", "transfers"].includes(params.get("sort") || "")
      ? params.get("sort")
      : "arrival") as Query["sort"],
  });
  const [deadline, setDeadline] = useState(() => {
      const value = params.get("deadline");
      if (value && Number.isFinite(Date.parse(value)))
        return new Date(Date.parse(value) + 330 * 60000)
          .toISOString()
          .slice(0, 16);
      const before = params.get("arriveBefore");
      if (before && /^\d{2}:\d{2}$/.test(before))
        return (
          new Date(Date.parse(q.date + "T00:00:00Z") + 86400000)
            .toISOString()
            .slice(0, 10) +
          "T" +
          before
        );
      return "";
    }),
    [locations, setLocations] = useState<string[]>([]),
    [coverage, setCoverage] = useState(""),
    [trips, setTrips] = useState<Trip[]>([]),
    [submitted, setSubmitted] = useState<Query | null>(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [user, setUser] = useState<{ email: string } | null>(null),
    [saved, setSaved] = useState<Saved[]>([]),
    [compare, setCompare] = useState<string[]>([]),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  useEffect(() => {
    let cancelled = false;
    const query = { ...q, deadline: deadline ? deadline + ":00+05:30" : "" };
    api("search", query).then(b => {
      if (!cancelled) { setTrips(b.trips); setSubmitted(b.query); }
    }).catch(e => { if (!cancelled) setMessage(e.message); });
    return () => { cancelled = true; };
    // Search once from the home form's URL; later changes use Modify search.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    api("locations")
      .then((b) => {
        setLocations(b.locations);
        setCoverage(
          `${time(b.coverage.from)} – ${time(b.coverage.to)} · ${b.source.join(", ")}`,
        );
      })
      .catch((e) => setMessage(e.message));
    api("auth/me")
      .then((b) => setUser(b.user))
      .catch((e) => setMessage(e.message));
  }, []);
  useEffect(() => {
    if (user)
      api("saved")
        .then((b) => setSaved(b.saved))
        .catch((e) => setMessage(e.message));
  }, [user]);
  async function run(query: Query) {
    setBusy(true);
    setMessage("");
    setCompare([]);
    try {
      const b = await api("search", query);
      setTrips(b.trips);
      setSubmitted(b.query);
      const url = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => url.set(k, String(v)));
      window.history.replaceState(null, "", "/search?" + url);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function auth(action: string) {
    setBusy(true);
    try {
      const b = await api("auth/" + action, { email, password });
      setUser(b.user);
      setPassword("");
      setMessage("Signed in");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(t: Trip) {
    try {
      await api("saved", { query: submitted, tripId: t.id });
      setSaved((await api("saved")).saved);
      setMessage("Journey saved. Recheck before travelling.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  }
  const selected = trips.filter((t) => compare.includes(t.id));
  return (
    <main className="min-h-screen bg-[#f7f8f4] text-[#102235] p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <nav className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="text-2xl font-extrabold">
            RouteRush
          </Link>
          <Link href="/">New search</Link>
        </nav>
        <header>
          <h1 className="text-3xl font-bold">{q.from} → {q.to}</h1>
          <p>{q.date} · {q.travellers} traveller(s) · All times India time</p>
          <p className="text-sm">{coverage}</p>
        </header>
        <details className="rounded-xl border bg-white p-4">
          <summary className="cursor-pointer font-semibold">Modify search</summary>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run({ ...q, deadline: deadline ? deadline + ":00+05:30" : "" });
          }}
          className="rounded-2xl bg-white border p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {(["from", "to"] as const).map((key) => (
            <label key={key} className="grid gap-1 font-semibold">
              {key === "from" ? "Origin" : "Destination"}
              <input
                required
                list="locations"
                value={q[key]}
                onChange={(e) => setQ({ ...q, [key]: e.target.value })}
                className="border rounded-lg p-3 min-w-0"
              />
            </label>
          ))}
          <datalist id="locations">
            {locations.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          <label className="grid gap-1 min-w-0 max-w-full">
            Departure date
            <input
              required
              type="date"
              value={q.date}
              onChange={(e) => setQ({ ...q, date: e.target.value })}
              className="border rounded-lg p-3 min-w-0 max-w-full"
            />
          </label>
          <label className="grid gap-1 min-w-0 max-w-full">
            Arrive by (optional)
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border rounded-lg p-3 min-w-0"
            />
          </label>
          <label className="grid gap-1 min-w-0 max-w-full">
            Travellers
            <input
              type="number"
              min="1"
              max="12"
              required
              value={q.travellers}
              onChange={(e) =>
                setQ({ ...q, travellers: Number(e.target.value) })
              }
              className="border rounded-lg p-3 min-w-0 max-w-full"
            />
          </label>
          <label className="grid gap-1 min-w-0 max-w-full">
            Group budget (₹)
            <input
              type="number"
              min="0"
              max="1000000"
              required
              value={q.budget}
              onChange={(e) => setQ({ ...q, budget: Number(e.target.value) })}
              className="border rounded-lg p-3 min-w-0 max-w-full"
            />
          </label>
          <label className="grid gap-1 min-w-0 max-w-full">
            Transport
            <select
              value={q.mode}
              onChange={(e) =>
                setQ({ ...q, mode: e.target.value as Query["mode"] })
              }
              className="border rounded-lg p-3 min-w-0 max-w-full"
            >
              <option value="all">All modes</option>
              <option value="train">Train only</option>
              <option value="bus">Bus only</option>
              <option value="combined">Bus + train</option>
            </select>
          </label>
          <label className="grid gap-1 min-w-0 max-w-full">
            Maximum transfers
            <select
              value={q.maxTransfers}
              onChange={(e) =>
                setQ({ ...q, maxTransfers: Number(e.target.value) })
              }
              className="border rounded-lg p-3 min-w-0 max-w-full"
            >
              {[0, 1, 2].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 min-w-0 max-w-full">
            Sort results
            <select
              value={q.sort}
              onChange={(e) =>
                setQ({ ...q, sort: e.target.value as Query["sort"] })
              }
              className="border rounded-lg p-3 min-w-0 max-w-full"
            >
              <option value="arrival">Earliest arrival</option>
              <option value="price">Lowest group cost</option>
              <option value="duration">Shortest journey</option>
              <option value="transfers">Fewest transfers</option>
            </select>
          </label>
          <button
            disabled={busy}
            className="rounded-xl bg-emerald-800 text-white p-3 min-h-12 font-bold disabled:opacity-50"
          >
            {busy ? "Working…" : "Find journeys"}
          </button>
        </form>
        </details>
        {!submitted && !message && <p role="status">Finding journeys…</p>}
        <p role="status" aria-live="polite">
          {message}
        </p>
        {submitted && (
          <section aria-label="Search results" className="space-y-4">
            <h2 className="text-xl font-bold">
              {trips.filter((t) => t.usable).length} qualifying journeys ·{" "}
              {trips.length} results (up to 100 shown)
            </h2>
            {!trips.some((t) => t.usable) && (
              <p className="rounded-xl border p-4">
                No fully available journey meets these constraints. Try another
                date within coverage, a nearby terminal, or a higher budget. Any
                blocked routes below explain what needs attention.
              </p>
            )}
            {trips.map((t) => (
              <article
                key={t.id}
                className="bg-white border rounded-2xl p-5 space-y-3"
              >
                <div className="flex justify-between gap-3 flex-wrap">
                  <h3 className="font-bold text-lg">
                    {t.legs.map((s) => s.fromCity).join(" → ")} →{" "}
                    {t.legs[t.legs.length - 1].toCity}
                  </h3>
                  <strong>{money(t.total)} total</strong>
                </div>
                <p>
                  {time(t.legs[0].departure)} →{" "}
                  {time(t.legs[t.legs.length - 1].arrival)} ·{" "}
                  {Math.floor(t.duration / 60)}h {t.duration % 60}m ·{" "}
                  {t.transfers.length} transfers
                </p>
                <p className={t.usable ? "text-emerald-800" : "text-red-800"}>
                  {t.usable
                    ? "Meets the checks in this dataset"
                    : t.issues.join(" · ")}
                </p>
                <p className="text-sm font-semibold">
                  {t.simulated
                    ? "Sample data — seats and fares are simulated."
                    : "Imported schedule — confirm seats and fares with the operator."}
                </p>
                <details>
                  <summary className="cursor-pointer min-h-11 py-2 font-semibold">
                    Itinerary and why this route works
                  </summary>
                  <ol className="space-y-4">
                    {t.legs.map((s, i) => (
                      <li
                        key={s.id}
                        className="border-l-4 border-emerald-700 pl-4"
                      >
                        <p className="font-bold">
                          {s.mode} · {s.operator}
                        </p>
                        <p>
                          {s.from} → {s.to}
                        </p>
                        <p>
                          {time(s.departure)} → {time(s.arrival)}
                        </p>
                        <p>
                          {money(s.fare)} per traveller · {s.status} ·{" "}
                          {s.seats ?? "unknown"} seats
                        </p>
                        <p className="text-sm">
                          Source: {s.source} · checked {time(s.checkedAt)}
                        </p>
                        {t.transfers[i] && (
                          <p className="bg-amber-50 p-3 mt-2">
                            {t.transfers[i].gap} min connection −{" "}
                            {t.transfers[i].minutes} min terminal travel −{" "}
                            {t.transfers[i].boarding} min boarding ={" "}
                            <strong>{t.transfers[i].slack} min spare</strong>.
                            Transfer {money(t.transfers[i].cost)}.
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-4">
                    {t.legs.length > 1
                      ? "Separate tickets are required. A delay on one service may cause you to miss the next."
                      : "One service for this journey."}{" "}
                    Group total includes all listed fares and terminal
                    transfers; provider fees may differ.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <a
                      href="https://www.irctc.co.in/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Check rail tickets at IRCTC
                    </a>
                    <a
                      href="https://www.redbus.in/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Check bus tickets
                    </a>
                  </div>
                  <p className="text-sm">
                    These links open provider homepages. Enter the date and each
                    leg separately.
                  </p>
                </details>
                <div className="flex gap-5 items-center flex-wrap">
                  <button
                    onClick={() => save(t)}
                    className="border rounded-lg px-4 min-h-11"
                  >
                    Save journey
                  </button>
                  <label className="min-h-11 flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={compare.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked && compare.length >= 3) {
                          setMessage("Compare up to three journeys.");
                          return;
                        }
                        setCompare(
                          e.target.checked
                            ? [...compare, t.id]
                            : compare.filter((id) => id !== t.id),
                        );
                      }}
                    />
                    Compare
                  </label>
                </div>
              </article>
            ))}
          </section>
        )}
        {selected.length > 0 && (
          <section
            className="rounded-2xl border bg-white p-5 min-w-0 max-w-full"
            style={{ overflowX: "auto" }}
          >
            <h2 className="text-xl font-bold mb-4">Compare journeys</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="p-2">Route</th>
                  <th className="p-2">Group cost</th>
                  <th className="p-2">Arrival</th>
                  <th className="p-2">Transfers</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {selected.map((t) => (
                  <tr key={t.id}>
                    <td className="p-2">
                      {t.legs.map((s) => s.operator).join(" + ")}
                    </td>
                    <td className="p-2">{money(t.total)}</td>
                    <td className="p-2">
                      {time(t.legs[t.legs.length - 1].arrival)}
                    </td>
                    <td className="p-2">{t.transfers.length}</td>
                    <td className="p-2">
                      {t.usable ? "Meets checks" : "Needs attention"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        <details className="rounded-2xl border bg-white p-5 space-y-4"><summary className="cursor-pointer font-semibold">Saved journeys and account</summary>
          <h2 className="text-xl font-bold">Your saved journeys</h2>
          {user ? (
            <>
              <p style={{ overflowWrap: "anywhere" }}>
                Signed in as {user.email}
              </p>
              <button
                className="underline min-h-11"
                onClick={async () => {
                  try {
                    await api("auth/logout", {});
                    setUser(null);
                    setSaved([]);
                  } catch (e) {
                    setMessage((e as Error).message);
                  }
                }}
              >
                Sign out
              </button>
              {saved.length === 0 && <p>No saved journeys yet.</p>}
              {saved.map((s) => (
                <div key={s.id} className="border rounded-lg p-4">
                  <p>
                    {s.query.from} → {s.query.to} · {s.query.date} ·{" "}
                    {money(s.trip.total)} saved estimate
                  </p>
                  <p className="text-sm">
                    Saved {time(s.created)}. Availability may have changed.
                  </p>
                  <button
                    className="underline mr-6 min-h-11"
                    onClick={() => {
                      setQ(s.query);
                      setDeadline(
                        s.query.deadline
                          ? new Date(Date.parse(s.query.deadline) + 330 * 60000)
                              .toISOString()
                              .slice(0, 16)
                          : "",
                      );
                      run(s.query);
                    }}
                  >
                    Recheck journey
                  </button>
                  <button
                    className="underline min-h-11"
                    onClick={async () => {
                      try {
                        await api("saved", { id: s.id }, "DELETE");
                        setSaved(saved.filter((x) => x.id !== s.id));
                      } catch (e) {
                        setMessage((e as Error).message);
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                auth("login");
              }}
              className="flex flex-wrap gap-3 items-end"
            >
              <label className="grid gap-1 min-w-0 max-w-full">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded-lg p-3 min-w-0 max-w-full"
                />
              </label>
              <label className="grid gap-1 min-w-0 max-w-full">
                Password (10+ characters)
                <input
                  type="password"
                  minLength={10}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded-lg p-3 min-w-0 max-w-full"
                  autoComplete="current-password"
                />
              </label>
              <button
                disabled={busy}
                className="border rounded-lg p-3 min-w-0 max-w-full"
              >
                Sign in
              </button>
              <button
                disabled={busy}
                type="button"
                onClick={() => auth("register")}
                className="bg-emerald-800 text-white rounded-lg p-3"
              >
                Create account
              </button>
            </form>
          )}
        </details>
        <footer className="text-sm py-5">
          RouteRush · Route discovery and comparison. Ticket purchases happen on
          provider websites.
        </footer>
      </div>
    </main>
  );
}
