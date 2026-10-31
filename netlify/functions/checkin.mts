import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { riyadhNow, state, json } from "../lib/shared.mts";

export default async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const now = riyadhNow();
  if (state(now.minutes) !== "open") return json({ error: "closed", state: state(now.minutes) }, 403);
  let body: any = {};
  try { body = await req.json(); } catch {}
  const name = String(body.name || "").replace(/\s+/g, " ").trim();
  if (name.length < 3 || name.length > 60) return json({ error: "name" }, 400);
  const norm = name.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
  const store = getStore({ name: "attendance", consistency: "strong" });
  const key = `${now.date}/${encodeURIComponent(norm)}`;
  const { modified } = await store.setJSON(key, { name, time: now.time, at: Date.now() }, { onlyIfNew: true });
  if (!modified) return json({ error: "duplicate" }, 409);
  return json({ ok: true, name, time: now.time, date: now.date });
};
export const config: Config = { path: "/api/checkin", method: "POST" };
