declare const Netlify: { env: { get(k: string): string | undefined } };
const envNum = (k: string, d: number) => { const v = Number(Netlify.env.get(k)); return Number.isFinite(v) && Netlify.env.get(k) ? v : d; };
// Window in minutes after midnight Riyadh time. Defaults 07:00–07:15; override with OPEN_MIN / CLOSE_MIN env vars.
export const OPEN_MIN = () => envNum("OPEN_MIN", 7 * 60);
export const CLOSE_MIN = () => envNum("CLOSE_MIN", 7 * 60 + 15);
// TEST_MODE=1 keeps test check-ins in a separate store so real data stays clean
export const STORE = () => (Netlify.env.get("TEST_MODE") === "1" ? "attendance-test" : "attendance");
// Riyadh is fixed UTC+3 (no DST)
export function riyadhNow(ms = Date.now()) {
  const d = new Date(ms + 3 * 3600 * 1000);
  const date = d.toISOString().slice(0, 10);
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const time = d.toISOString().slice(11, 19);
  return { date, minutes, time };
}
export function state(minutes: number) {
  return minutes < OPEN_MIN() ? "before" : minutes < CLOSE_MIN() ? "open" : "closed";
}
export const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
