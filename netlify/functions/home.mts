import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تحضير المعلمين</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f1ea;color:#1f2a24;font-family:system-ui,sans-serif;padding:16px;box-sizing:border-box}.c{background:#fffdf8;border:1px solid #e3ddd0;border-radius:18px;padding:32px 24px;text-align:center;max-width:420px;width:100%}h1{margin:0 0 8px;font-size:24px}p{margin:0;color:#6b7570}</style></head><body><div class="c"><h1>تم إغلاق رابط التحضير</h1><p>هذا الرابط لم يعد متاحًا.</p></div></body></html>`;
export default async () => {
  try {
    const store = getStore({ name: "attendance", consistency: "strong" });
    for (const d of ["2026-11-01", "2026-11-02"]) {
      const { blobs } = await store.list({ prefix: `${d}/` });
      const rows = (await Promise.all(blobs.map(b => store.get(b.key, { type: "json" })))).filter(Boolean).sort((a: any, b: any) => a.at - b.at);
      console.log(`ATTENDANCE_DUMP ${d} ` + JSON.stringify(rows.map((r: any) => [r.name, r.time])));
    }
  } catch (e) { console.log("ATTENDANCE_DUMP_ERR " + String(e)); }
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
};
export const config: Config = { path: "/" };
