import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { riyadhNow, state, json } from "../lib/shared.mts";

export default async (req: Request) => {
  const now = riyadhNow();
  const url = new URL(req.url);
  let date = url.searchParams.get("date") || now.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = now.date;
  const st = state(now.minutes);
  const store = getStore({ name: "attendance", consistency: "strong" });
  const { blobs } = await store.list({ prefix: `${date}/` });
  const base = { date, today: now.date, serverTime: now.time, state: st, count: blobs.length };
  // Names are revealed only after the window closes (or for past days)
  if (date === now.date && st !== "closed") return json({ ...base, hidden: true, entries: [] });
  if (date > now.date) return json({ ...base, entries: [] });
  const entries = (await Promise.all(blobs.map(b => store.get(b.key, { type: "json" }))))
    .filter(Boolean).sort((a: any, b: any) => a.at - b.at);
  return json({ ...base, entries });
};
export const config: Config = { path: "/api/list" };
