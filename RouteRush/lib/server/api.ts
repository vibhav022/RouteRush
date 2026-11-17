import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { z } from "zod";
import { db, dataset } from "./db";
import { datasetSchema, querySchema, search } from "./model";
const credentials = z.object({
  email: z
    .string()
    .email()
    .max(254)
    .transform((s) => s.toLowerCase()),
  password: z.string().min(10).max(128),
});
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const token = (r: Request) =>
  r.headers.get("cookie")?.match(/(?:^|;\s*)rr_session=([a-f0-9]+)/)?.[1] || "";
function user(r: Request) {
  return db()
    .prepare(
      "SELECT users.id,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?",
    )
    .get(hash(token(r)), Date.now()) as
    { id: string; email: string } | undefined;
}
function reply(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
function cookie(value: string, maxAge = 604800) {
  return `rr_session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
async function body(r: Request) {
  const text = await r.text();
  if (text.length > 3_000_000) throw new Error("Request too large");
  return JSON.parse(text);
}
export async function handle(r: Request): Promise<Response> {
  try {
    const url = new URL(r.url),
      path = url.pathname.replace("/api/", ""),
      method = r.method;
    if (method !== "GET") {
      const origin = r.headers.get("origin");
      const expectedOrigin =
        process.env.ROUTERUSH_PUBLIC_ORIGIN ||
        `${url.protocol}//${r.headers.get("host") || url.host}`;
      if (origin && origin !== expectedOrigin)
        return reply({ error: "Cross-origin request rejected" }, 403);
    }
    if (path === "locations" && method === "GET") {
      const d = dataset();
      return reply({
        locations: [
          ...new Set(
            d.services.flatMap((s) => [s.from, s.to, s.fromCity, s.toCity]),
          ),
        ].sort(),
        coverage: {
          from: d.services.reduce(
            (a, s) => (a < s.departure ? a : s.departure),
            d.services[0].departure,
          ),
          to: d.services.reduce(
            (a, s) => (a > s.departure ? a : s.departure),
            d.services[0].departure,
          ),
        },
        source: [...new Set(d.services.map((s) => s.source))],
      });
    }
    if (path === "search" && method === "POST") {
      const q = querySchema.parse(await body(r));
      const trips = search(q, dataset().services, dataset().transfers);
      return reply({
        trips,
        count: trips.filter((t) => t.usable).length,
        query: q,
      });
    }
    if (path === "auth/me" && method === "GET")
      return reply({ user: user(r) || null });
    if (["auth/register", "auth/login"].includes(path) && method === "POST") {
      const c = credentials.parse(await body(r));
      const d = db(),
        key = c.email,
        now = Date.now();
      d.prepare("DELETE FROM attempts WHERE expires<?").run(now);
      d.prepare("DELETE FROM sessions WHERE expires<?").run(now);
      const attempts = d
        .prepare("SELECT count FROM attempts WHERE key=?")
        .get(key) as { count: number } | undefined;
      if ((attempts?.count ?? 0) >= 10)
        return reply(
          { error: "Too many attempts. Try again in 15 minutes." },
          429,
        );
      d.prepare(
        "INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
      ).run(key, now + 900000);
      let row = d.prepare("SELECT * FROM users WHERE email=?").get(c.email) as
        { id: string; email: string; password: string } | undefined;
      if (path === "auth/register") {
        if (row)
          return reply(
            { error: "Account already exists. Sign in instead." },
            409,
          );
        const salt = randomBytes(16).toString("hex"),
          password =
            salt + ":" + scryptSync(c.password, salt, 64).toString("hex");
        row = { id: randomUUID(), email: c.email, password };
        d.prepare("INSERT INTO users VALUES(?,?,?)").run(
          row.id,
          row.email,
          row.password,
        );
      } else {
        const [salt, expected] = (
          row?.password || "invalid:" + "0".repeat(128)
        ).split(":");
        if (
          !timingSafeEqual(
            scryptSync(c.password, salt, 64),
            Buffer.from(expected, "hex"),
          ) ||
          !row
        )
          return reply({ error: "Incorrect email or password" }, 401);
      }
      d.prepare("DELETE FROM attempts WHERE key=?").run(key);
      const session = randomBytes(32).toString("hex");
      d.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
        hash(session),
        row.id,
        now + 604800000,
      );
      return reply({ user: { id: row.id, email: row.email } }, 200, {
        "Set-Cookie": cookie(session),
      });
    }
    if (path === "auth/logout" && method === "POST") {
      db()
        .prepare("DELETE FROM sessions WHERE token=?")
        .run(hash(token(r)));
      return reply({ ok: true }, 200, { "Set-Cookie": cookie("", 0) });
    }
    if (path === "saved") {
      const u = user(r);
      if (!u) return reply({ error: "Sign in to save and view journeys" }, 401);
      if (method === "GET")
        return reply({
          saved: db()
            .prepare(
              "SELECT id,query,trip,created FROM saved WHERE user_id=? ORDER BY created DESC",
            )
            .all(u.id)
            .map((row) => ({
              ...row,
              query: JSON.parse(String(row.query)),
              trip: JSON.parse(String(row.trip)),
            })),
        });
      if (method === "POST") {
        const data = z
          .object({ query: querySchema, tripId: z.string().max(500) })
          .parse(await body(r));
        const d = dataset();
        const trip = search(data.query, d.services, d.transfers).find(
          (t) => t.id === data.tripId,
        );
        if (!trip)
          return reply(
            { error: "Journey changed. Search again before saving." },
            409,
          );
        const count = db()
          .prepare("SELECT count(*) AS n FROM saved WHERE user_id=?")
          .get(u.id) as { n: number };
        if (count.n >= 100)
          return reply(
            { error: "Saved trip limit reached (100). Remove an older trip." },
            409,
          );
        db()
          .prepare("INSERT INTO saved VALUES(?,?,?,?,?)")
          .run(
            randomUUID(),
            u.id,
            JSON.stringify(data.query),
            JSON.stringify(trip),
            new Date().toISOString(),
          );
        return reply({ ok: true }, 201);
      }
      if (method === "DELETE") {
        const id = z.object({ id: z.string().uuid() }).parse(await body(r)).id;
        db()
          .prepare("DELETE FROM saved WHERE id=? AND user_id=?")
          .run(id, u.id);
        return reply({ ok: true });
      }
    }
    if (path === "admin/dataset") {
      const expected = process.env.ROUTERUSH_ADMIN_TOKEN,
        provided =
          r.headers.get("authorization")?.replace(/^Bearer /, "") || "";
      if (
        !expected ||
        !timingSafeEqual(
          Buffer.from(hash(expected)),
          Buffer.from(hash(provided)),
        )
      )
        return reply({ error: "A valid server admin token is required" }, 403);
      if (method === "GET") return reply(dataset());
      if (method === "PUT") {
        const data = datasetSchema.parse(await body(r));
        db()
          .prepare("UPDATE dataset SET body=?,updated=? WHERE id=1")
          .run(JSON.stringify(data), new Date().toISOString());
        return reply({ ok: true, services: data.services.length });
      }
    }
    return reply({ error: "Not found" }, 404);
  } catch (e) {
    if (e instanceof z.ZodError)
      return reply(
        {
          error: e.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        },
        400,
      );
    if (e instanceof RangeError) return reply({ error: e.message }, 400);
    if (e instanceof SyntaxError) return reply({ error: "Invalid JSON" }, 400);
    console.error(e);
    return reply({ error: "Request could not be completed" }, 500);
  }
}
