import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/datadog?query=<DDQL>&from=<unix_sec>&to=<unix_sec>
 *
 * Examples:
 *  - p95 latency last 15m for FastAPI service:
 *    /api/datadog?query=p95:trace.fastapi.request.duration{service:api,env:prod}
 *
 *  - active DB time (example):
 *    /api/datadog?query=sum:postgresql.queries.time{*}.rollup(sum,60)
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const nowSec = Math.floor(Date.now() / 1000);
  const to = Number(searchParams.get("to") || nowSec);
  const from = Number(searchParams.get("from") || (nowSec - 15 * 60)); // default last 15m

  if (!query) {
    return NextResponse.json(
      { error: "Missing required 'query' parameter" },
      { status: 400 }
    );
  }

  const site = process.env.DATADOG_SITE || "datadoghq.com";
  const apiKey = process.env.DATADOG_API_KEY;
  const appKey = process.env.DATADOG_APP_KEY;

  if (!apiKey || !appKey) {
    return NextResponse.json(
      { error: "Datadog keys not configured" },
      { status: 500 }
    );
  }

  const url = `https://api.${site}/api/v1/query?from=${from}&to=${to}&query=${encodeURIComponent(
    query
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Datadog error ${res.status}`, body: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Simple summary: last point of each series (if present)
    const summary =
      Array.isArray(data.series) &&
      data.series.map((s) => {
        const last = Array.isArray(s.pointlist) && s.pointlist.length
          ? s.pointlist[s.pointlist.length - 1][1]
          : null;
        return { metric: s.metric, scope: s.scope, last };
      });

    return NextResponse.json({ ok: true, from, to, query, summary, raw: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
