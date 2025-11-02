import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

/**
 * GET /api/datadog?query=<DDQL>&from=<unix_sec>&to=<unix_sec>[&debug=1]
 * Example: /api/datadog?query=avg:system.cpu.user{env:production}
 */
function json(status, body) { return NextResponse.json(body, { status }); }
function sanitizeSite(s) {
  const site = (s || "").trim().toLowerCase();
  return /^[a-z0-9.-]+\.datadoghq\.com$/.test(site) ? site : null;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    if (!query) return json(400, { ok: false, error: "Missing required 'query' parameter." });
    const debug = searchParams.get("debug") === "1";
    const now = Math.floor(Date.now() / 1000);
    const to = Number(searchParams.get("to") || now);
    const from = Number(searchParams.get("from") || now - 15 * 60);

    const rawSite = process.env.DATADOG_SITE || "us5.datadoghq.com";
    const site = sanitizeSite(rawSite);
    const apiKey = (process.env.DATADOG_API_KEY || "").trim();
    const appKey = (process.env.DATADOG_APP_KEY || "").trim();

    const missing = [];
    if (!apiKey) missing.push("DATADOG_API_KEY");
    if (!appKey) missing.push("DATADOG_APP_KEY");
    if (!site) missing.push("DATADOG_SITE");
    if (missing.length) return json(500, { ok: false, error: `Missing/invalid env(s): ${missing.join(", ")}` });

    const base = `https://api.${site}/api/v1/query?from=${from}&to=${to}&query=${encodeURIComponent(query)}`;

    // Try with headers; if a proxy strips them, fall back to query-string auth.
    const attempt = async (useQS) => {
      const url = useQS
        ? `${base}&api_key=${encodeURIComponent(apiKey)}&application_key=${encodeURIComponent(appKey)}`
        : base;
      const res = await fetch(url, {
        method: "GET",
        headers: useQS ? { Accept: "application/json" } : {
          "DD-API-KEY": apiKey,
          "DD-APPLICATION-KEY": appKey,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
      return { status: res.status, data, urlUsedQS: useQS };
    };

    let r = await attempt(false);
    if (r.status === 401 || r.status === 403) r = await attempt(true);

    if (! (r.status >= 200 && r.status < 300)) {
      const hints = {
        401: "Unauthorized: verify API+APP keys belong to the same org+region and are not revoked.",
        403: "Forbidden: app key lacks Metrics read scope or owner permissions.",
        404: "Not found: check DATADOG_SITE (e.g., us5.datadoghq.com).",
        429: "Rate limited: add .rollup(60) or widen window; reduce polling.",
      };
      return json(r.status, {
        ok: false,
        error: `Datadog error ${r.status}`,
        hint: hints[r.status] || "See response payload.",
        response: r.data,
        meta: debug ? { site, usedQueryStringAuth: r.urlUsedQS } : undefined,
      });
    }

    const series = Array.isArray(r.data?.series) ? r.data.series : [];
    const summary = series.map((s) => {
      const last = Array.isArray(s.pointlist) && s.pointlist.length
        ? (s.pointlist[s.pointlist.length - 1]?.[1] ?? null)
        : null;
      return { metric: s.metric, scope: s.scope, last };
    });

    return json(200, { ok: true, site, from, to, query, seriesCount: series.length, summary, raw: r.data });
  } catch (err) {
    return json(502, { ok: false, error: /abort|timeout/i.test(err?.message || "") ? "Upstream timeout" : err?.message || "Network error" });
  }
}
