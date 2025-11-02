import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Helper: safe JSON parse
function tryParse(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const nowSec = Math.floor(Date.now() / 1000);
    const to = Number(searchParams.get("to") || nowSec);
    const from = Number(searchParams.get("from") || nowSec - 15 * 60); // 15m default

    if (!query) {
      return NextResponse.json({ ok: false, error: "Missing ?query=" }, { status: 400 });
    }

    const site = process.env.DATADOG_SITE || "datadoghq.com";
    const apiKey = process.env.DATADOG_API_KEY;
    const appKey = process.env.DATADOG_APP_KEY;

    if (!apiKey || !appKey) {
      return NextResponse.json({ ok: false, error: "Datadog keys not found" }, { status: 500 });
    }

    // 1) Validate keys from the server (proves org/site/scopes are accepted here)
    const validateUrl = `https://api.${site}/api/v1/validate`;
    const validateRes = await fetch(validateUrl, {
      headers: {
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });
    const validateText = await validateRes.text();
    const validateJson = tryParse(validateText);

    if (!validateRes.ok || validateJson.valid !== true) {
      return NextResponse.json(
        { ok: false, step: "validate", status: validateRes.status, response: validateJson },
        { status: validateRes.status || 403 }
      );
    }

    // 2) Query timeseries (v1) with BOTH headers and query params
    //    (some installations only authorize one or the other)
    const q = encodeURIComponent(query);
    const queryUrl = `https://api.${site}/api/v1/query?from=${from}&to=${to}&query=${q}&api_key=${encodeURIComponent(apiKey)}&application_key=${encodeURIComponent(appKey)}`;

    const res = await fetch(queryUrl, {
      headers: {
        // Keep headers too — double path for auth
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    const json = tryParse(text);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, step: "query", status: res.status, response: json },
        { status: res.status }
      );
    }

    // Compact summary: last value of each returned series
    let summary = null;
    if (Array.isArray(json.series)) {
      summary = json.series.map(s => {
        const last = Array.isArray(s.pointlist) && s.pointlist.length
          ? s.pointlist[s.pointlist.length - 1][1]
          : null;
        return { metric: s.metric, scope: s.scope, last };
      });
    }

    return NextResponse.json({
      ok: true,
      site,
      from,
      to,
      query,
      counts: {
        series: Array.isArray(json.series) ? json.series.length : 0,
      },
      summary,
      raw: json,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: `Server exception: ${err.message}` },
      { status: 500 }
    );
  }
}
