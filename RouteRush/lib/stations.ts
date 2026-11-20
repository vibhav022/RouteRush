import directory from "../data/stations.json";
export const stationDirectory = directory;
const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/junction|\bjn\b/g, "")
    .replace(/[^a-z0-9]/g, "");
const aliases: Record<string, string> = {
  indorejunction: "INDB",
  newdelhi: "NDLS",
  bhopaljunction: "BPL",
  ujjainjunction: "UJN",
  jaipurjunction: "JP",
};
const byCode = new Map(directory.stations.map((s) => [s.code, s]));
const byName = new Map(directory.stations.map((s) => [fold(s.name), s.code]));
export function stationCode(value: string) {
  return byCode.has(value.toUpperCase())
    ? value.toUpperCase()
    : aliases[value.toLowerCase().replace(/[^a-z0-9]/g, "")] ||
        byName.get(fold(value));
}
export function stationMatches(a: string, b: string) {
  const ac = stationCode(a),
    bc = stationCode(b);
  return a.toLowerCase() === b.toLowerCase() || Boolean(ac && bc && ac === bc);
}
export function findStations(query: string, limit = 30) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return directory.stations
    .filter(
      (s) =>
        s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
    )
    .sort(
      (a, b) =>
        Number(b.code.toLowerCase() === q) -
          Number(a.code.toLowerCase() === q) ||
        Number(b.code.toLowerCase().startsWith(q)) -
          Number(a.code.toLowerCase().startsWith(q)) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, limit);
}
