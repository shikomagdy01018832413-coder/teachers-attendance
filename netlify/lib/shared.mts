export const OPEN_MIN = 7 * 60;      // 07:00
export const CLOSE_MIN = 7 * 60 + 15; // 07:15
// Riyadh is fixed UTC+3 (no DST)
export function riyadhNow(ms = Date.now()) {
  const d = new Date(ms + 3 * 3600 * 1000);
  const date = d.toISOString().slice(0, 10);
  const minutes = d.getUTCHours() * 60 + d.getUTCMinutes();
  const time = d.toISOString().slice(11, 19);
  return { date, minutes, time };
}
export function state(minutes: number) {
  return minutes < OPEN_MIN ? "before" : minutes < CLOSE_MIN ? "open" : "closed";
}
export const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
