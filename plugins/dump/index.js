import { getStore } from "@netlify/blobs";
export const onPostBuild = async ({ utils }) => {
  try {
    const store = getStore({ name: "attendance", consistency: "strong" });
    const out = {};
    for (const d of ["2026-11-01", "2026-11-02"]) {
      const { blobs } = await store.list({ prefix: `${d}/` });
      const rows = (await Promise.all(blobs.map(b => store.get(b.key, { type: "json" })))).filter(Boolean).sort((a, b) => a.at - b.at);
      out[d] = rows.map(r => [r.name, r.time]);
    }
    const text = JSON.stringify(out);
    console.log("ATTENDANCE_DUMP " + text);
    utils.status.show({ title: "attendance-dump", summary: `${out["2026-11-01"].length} / ${out["2026-11-02"].length}`, text });
  } catch (e) {
    utils.status.show({ title: "attendance-dump-error", summary: String(e && e.message || e), text: String(e && e.stack || e) });
  }
};
