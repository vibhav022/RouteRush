import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { services as samples } from "../journey-engine";
import type { Service, Transfer } from "./model";
let connection: DatabaseSync | undefined;
export function db() {
  if (connection) return connection;
  const path = resolve(
    process.env.ROUTERUSH_DB_PATH || "storage/routerush.sqlite",
  );
  mkdirSync(dirname(path), { recursive: true });
  const d = new DatabaseSync(path);
  d.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS saved(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,query TEXT NOT NULL,trip TEXT NOT NULL,created TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS dataset(id INTEGER PRIMARY KEY CHECK(id=1),body TEXT NOT NULL,updated TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);`);
  connection = d;
  if (!d.prepare("SELECT id FROM dataset").get()) {
    const now = new Date();
    const date = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const terminals: Record<string, string> = {
      INDB: "Indore Junction",
      IDR: "Indore Bus Terminal",
      NDLS: "New Delhi",
      DEL: "Delhi Bus Terminal",
      "BPL-BUS": "Bhopal Bus Terminal",
      BPL: "Bhopal Junction",
      "UJN-BUS": "Ujjain Bus Terminal",
      UJN: "Ujjain Junction",
      JP: "Jaipur Junction",
      "JP-BUS": "Jaipur Bus Terminal",
    };
    const records: Service[] = [];
    for (let day = 0; day < 30; day++)
      for (const s of samples) {
        const stamp = (time: string, offset: number) =>
          new Date(
            Date.parse(date + "T00:00:00+05:30") +
              (day + offset) * 86400000 +
              (Number(time.slice(0, 2)) * 60 + Number(time.slice(3))) * 60000,
          ).toISOString();
        records.push({
          id: `${day}-${s.id}`,
          mode: s.mode,
          operator: s.operator,
          from: terminals[s.originCode],
          to: terminals[s.destinationCode],
          fromCity: s.originCity,
          toCity: s.destinationCity,
          departure: stamp(s.departureTime, s.departureDayOffset),
          arrival: stamp(s.arrivalTime, s.arrivalDayOffset),
          fare: s.price,
          seats:
            s.availabilityStatus === "unknown"
              ? null
              : (s.seatsRemaining ?? null),
          status:
            s.availabilityStatus === "few" ? "available" : s.availabilityStatus,
          source: "RouteRush sample dataset",
          checkedAt: now.toISOString(),
          simulated: true,
        });
      }
    const transfers: Transfer[] = [
      {
        from: "Bhopal Bus Terminal",
        to: "Bhopal Junction",
        minutes: 30,
        boarding: 25,
        cost: 100,
      },
      {
        from: "Ujjain Bus Terminal",
        to: "Ujjain Junction",
        minutes: 30,
        boarding: 25,
        cost: 80,
      },
      {
        from: "Jaipur Junction",
        to: "Jaipur Bus Terminal",
        minutes: 25,
        boarding: 20,
        cost: 100,
      },
    ];
    d.prepare("INSERT INTO dataset VALUES(1,?,?)").run(
      JSON.stringify({ services: records, transfers }),
      now.toISOString(),
    );
  }
  return d;
}
export function dataset(): { services: Service[]; transfers: Transfer[] } {
  return JSON.parse(
    (
      db().prepare("SELECT body FROM dataset WHERE id=1").get() as {
        body: string;
      }
    ).body,
  );
}
