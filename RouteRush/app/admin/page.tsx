"use client";
import { useState } from "react";
import Link from "next/link";
export default function Admin() {
  const [token, setToken] = useState(""),
    [json, setJson] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function request(method: string) {
    setBusy(true);
    setMessage("");
    try {
      if (method === "PUT") JSON.parse(json);
      const r = await fetch("/api/admin/dataset", {
        method,
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: method === "PUT" ? json : undefined,
      });
      const b = (await r.json()) as { error: string; services: unknown[] };
      if (!r.ok) throw Error(b.error);
      if (method === "GET") setJson(JSON.stringify(b, null, 2));
      setMessage(
        method === "GET"
          ? "Dataset loaded. Edit records below or download a backup."
          : `Saved ${b.services} services. Searches now use the updated dataset.`,
      );
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="max-w-5xl mx-auto p-5 space-y-5">
      <Link className="underline" href="/planner">
        ← Journey planner
      </Link>
      <h1 className="text-3xl font-bold">Manage schedules</h1>
      <p>
        Import dated services and terminal transfer estimates. Replacing the
        dataset affects all searches. Download a backup before making changes.
      </p>
      <p>
        Set ROUTERUSH_ADMIN_TOKEN in the server’s .env.local file, restart, then
        enter that token here. It is kept only in this page’s memory.
      </p>
      <label className="grid gap-2">
        Admin token
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border rounded-lg p-3"
          autoComplete="off"
        />
      </label>
      <button
        disabled={busy}
        onClick={() => request("GET")}
        className="bg-emerald-800 text-white rounded-lg p-3"
      >
        Load current dataset
      </button>
      <label className="grid gap-2">
        Import JSON file
        <input
          type="file"
          accept=".json,application/json"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) {
              if (f.size > 3000000) {
                setMessage("Maximum file size is 3 MB");
                return;
              }
              setJson(await f.text());
            }
          }}
        />
      </label>
      <label className="grid gap-2">
        Dataset JSON
        <textarea
          spellCheck={false}
          value={json}
          onChange={(e) => setJson(e.target.value)}
          className="font-mono text-sm border rounded-lg p-3 w-full h-96"
        />
      </label>
      <p>
        Each service needs full ISO departure/arrival timestamps, terminal and
        city names, fare per person, seats (null if unknown), status, source,
        checkedAt, and simulated. Keep simulated=true for invented data.
        Transfers must name the exact arrival and departure terminals and
        specify movement minutes, boarding buffer, and group cost.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          request("PUT");
        }}
        className="space-y-3"
      >
        <label className="flex gap-2">
          <input required type="checkbox" />I have reviewed the data and want to
          replace the current schedule dataset.
        </label>
        <button
          disabled={busy || !json}
          className="bg-emerald-800 text-white rounded-lg p-3"
        >
          Validate and replace dataset
        </button>
      </form>
      <button
        disabled={!json}
        className="underline min-h-11"
        onClick={() => {
          const url = URL.createObjectURL(
            new Blob([json], { type: "application/json" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "routerush-schedules.json";
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        Download JSON backup
      </button>
      <p role="status" aria-live="polite">
        {message}
      </p>
    </main>
  );
}
