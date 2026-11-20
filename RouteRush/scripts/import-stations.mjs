import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const revision = "e0c538a1e41ae5eace454d2818902e1065608e16";
const url = `https://raw.githubusercontent.com/datameet/railways/${revision}/stations.json`;
const raw = process.argv[2]
  ? await readFile(process.argv[2], "utf8")
  : await (async () => {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw Error(`Download failed: ${response.status}`);
      return response.text();
    })();
const input = JSON.parse(raw);
const codes = new Map();
for (const f of input.features) {
  const p = f.properties || {};
  if (typeof p.code !== "string" || typeof p.name !== "string") continue;
  const code = p.code.trim().toUpperCase(),
    name = p.name.trim();
  if (!code || !name) continue;
  if (!codes.has(code))
    codes.set(code, { code, name, state: p.state || "", zone: p.zone || "" });
}
const stations = [...codes.values()].sort((a, b) =>
  a.code.localeCompare(b.code),
);
await writeFile(
  new URL("../data/stations.json", import.meta.url),
  JSON.stringify({
    source: "DataMeet / railways",
    url,
    revision,
    sourceDate: "2016-08-08",
    license: "CC0",
    downloadedAt: new Date().toISOString(),
    sha256: createHash("sha256").update(raw).digest("hex"),
    coverage:
      "Historical community directory; includes non-passenger operational points. Not an authoritative current complete list.",
    stations,
  }),
);
console.log(`Imported ${stations.length} unique station-code records`);
