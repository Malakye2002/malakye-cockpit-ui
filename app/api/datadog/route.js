import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/datadog?query=<DDQL>&from=<unix_sec>&to=<unix_sec>
 * Example:
 *  /api/datadog?query=avg:system.cpu.user{env:production}
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Missing required 'query' parameter" },
      { status: 400 }
    );
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const to = Number(searchParams.get("to") || nowSec);
  const from = Number(searchParams.get("from") || nowSec - 15 * 60); // default 15m window

  const site = process.env.DATADOG_SITE?.trim() || "datadoghq.com";
  const apiKey = process.env.DATADOG_API_KEY?.trim();
  const appKey = process.env.DATADOG_APP_KEY?.trim();

  if (!apiKey || !appKey) {
    return NextResponse.json(
      { error: "Datadog keys not configured" },
      { status: 500 }
    );
  }

  const url = `https://api.${site}/api/v1/query?from=${from}&to=${to}&query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        "Content-Type": "application/json",
        "User-Agent": "malakye-cockpit-ui/1.0 (vercel)",
      },
      cache: "no-store",
    });

    // Check for authentication issues
    if (res.status === 401) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: "Datadog API unauthorized — verify DATADOG_APP_KEY and site region (US5)",
          body: text,
        },
        { status: 401 }
      );
    }

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Datadog error ${res.status}`, body: text },
        { status: res.status }
      );
    }

    const data = await res.json();
    const summary =
      Array.isArray(data.series) &&
      data.series.map((s) => {
        const lastPoint =
          Array.isArray(s.pointlist) && s.pointlist.length
            ? s.pointlist.at(-1)?.[1] ?? null
            : null;
        return { metric: s.metric, scope: s.scope, last: lastPoint };
      });

    return NextResponse.json({
      ok: true,
      query,
      from,
      to,
      summary,
      raw: data,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
