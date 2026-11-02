import type { Config } from "@netlify/functions";
export default async () => new Response(JSON.stringify({ error: "closed" }), { status: 410, headers: { "content-type": "application/json" } });
export const config: Config = { path: "/api/checkin" };
