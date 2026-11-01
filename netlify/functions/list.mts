import type { Config } from "@netlify/functions";
declare const Netlify: { env: { get(k: string): string | undefined } };
import { getStore } from "@netlify/blobs";
import { riyadhNow, state, json, STORE, OPEN_MIN, CLOSE_MIN } from "../lib/shared.mts";

export default async (req: Request) => {
  const now = riyadhNow();
  const url = new URL(req.url);
  let date = url.searchParams.get("date") || now.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) date = now.date;
  const st = state(now.minutes);
  const pin = Netlify.env.get("ADMIN_PIN") || "";
  const given = req.headers.get("x-admin-pin") || "";
  const admin = !!pin && given === pin;
  if (given && !admin) return json({ error: "pin" }, 401);
  const store = getStore({ name: STORE(), consistency: "strong" });
  const { blobs } = await store.list({ prefix: `${date}/` });
  const base = { date, today: now.date, serverTime: now.time, state: st, count: blobs.length, openMin: OPEN_MIN(), closeMin: CLOSE_MIN(), test: STORE() !== "attendance", admin };
  // Names are revealed only after the window closes (or for past days)
  // Names are only for the admin (with PIN), and only after the window closes for today
  if (!admin) return json({ ...base, hidden: true, entries: [] });
  if (date === now.date && st !== "closed") return json({ ...base, hidden: true, entries: [] });
  if (date > now.date) return json({ ...base, entries: [] });
  const entries = (await Promise.all(blobs.map(b => store.get(b.key, { type: "json" }))))
    .filter(Boolean).sort((a: any, b: any) => a.at - b.at);
  return json({ ...base, entries });
};
export const config: Config = { path: "/api/list" };
