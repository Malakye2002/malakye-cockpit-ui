import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Datadog metrics query proxy
 * GET /api/datadog?query=<DDQL>&from=<unix_sec>&to=<unix_sec>[&debug=1]
 * Example:
 *   /api/datadog?query=avg:system.cpu.user{env:production}
 */

function json(status, body) {
  return NextResponse.json(body, { status });
}

function sanitizeSite(input) {
  const site = (input || "").trim().toLowerCase();
  // Accept common Datadog sites and custom subregions (e.g., us5.datadoghq.com)
  if (!/^[a-z0-9.-]+\.datadoghq\.com$/.test(site)) return null;
  return site;
}

async function fetchWithRetry(url, init, { retries = 1, timeoutMs = 8000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(t);
      return res;
    } catch (err) {
      clearTimeout(t);
      lastErr = err;
      // Retry only on network/abort errors; not on HTTP errors (those return a Response)
      if (attempt < retries) continue;
    }
  }
  throw lastErr;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    if (!query) return json(400, { ok: false, error: "Missing required 'query' parameter." });

    const nowSec = Math.floor(Date.now() / 1000);
    const to = Number(searchParams.get("to") || nowSec);
    const from = Number(searchParams.get("from") || nowSec - 15 * 60); // default 15m
    const debug = searchParams.get("debug") === "1";

    const rawSite = process.env.DATADOG_SITE || "us5.datadoghq.com";
    const site = sanitizeSite(rawSite);
    const apiKey = (process.env.DATADOG_API_KEY || "").trim();
    const appKey = (process.env.DATADOG_APP_KEY || "").trim();

    const missing = [];
    if (!apiKey) missing.push("DATADOG_API_KEY");
    if (!appKey) missing.push("DATADOG_APP_KEY");
    if (!site) missing.push("DATADOG_SITE");

    if (missing.length) {
      return json(500, {
        ok: false,
        error: `Missing/invalid environment variable(s): ${missing.join(", ")}`,
        meta: debug ? { rawSite, siteSanitized: !!site } : undefined,
      });
    }

    const url =
      `https://api.${site}/api/v1/query` +
      `?from=${encodeURIComponent(from)}` +
      `&to=${encodeURIComponent(to)}` +
      `&query=${encodeURIComponent(query)}`;

    const res = await fetchWithRetry(
      url,
      {
        method: "GET",
        headers: {
          "DD-API-KEY": apiKey,
          "DD-APPLICATION-KEY": appKey,
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "malakye-cockpit-ui/1.0 (vercel-runtime)",
        },
        cache: "no-store",
      },
      { retries: 1, timeoutMs: 9000 }
    );

    const text = await res.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }

    if (!res.ok) {
      // Helpful hints per status
      const hints = {
        401:
          "Unauthorized: confirm DATADOG_APP_KEY (not Key ID) and DATADOG_API_KEY belong to the same org + region.",
        403:
          "Forbidden: the application key lacks permissions for metrics query. Regenerate with default/full access.",
        404:
          "Not found: verify DATADOG_SITE (e.g., us5.datadoghq.com) and that the /api/v1/query endpoint is correct.",
        429:
          "Rate limited: reduce query frequency or widen rollup. Try adding .rollup(60) in the query.",
      };
      return json(res.status, {
        ok: false,
        error: `Datadog error ${res.status}`,
        hint: hints[res.status] || "See 'response' for details.",
        response: payload,
        meta: debug ? { site, url } : undefined,
      });
    }

    // Compact summary from the last point of each series (if present)
    const series = Array.isArray(payload?.series) ? payload.series : [];
    const summary = series.map((s) => {
      const last =
        Array.isArray(s.pointlist) && s.pointlist.length
          ? s.pointlist[s.pointlist.length - 1][1] ?? null
          : null;
      return { metric: s.metric, scope: s.scope, last };
    });

    return json(200, {
      ok: true,
      query,
      from,
      to,
      site,
      seriesCount: series.length,
      summary,
      raw: payload,
    });
  } catch (err) {
    // Normalize common network/abort errors to a consistent shape
    const name = err?.name || "Error";
    const message = err?.message || String(err);
    const isAbort = name === "AbortError" || /aborted|timeout/i.test(message);
    return json(502, {
      ok: false,
      error: isAbort ? "Upstream timeout contacting Datadog" : "Upstream network error",
      detail: message,
    });
  }
}
