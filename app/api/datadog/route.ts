import { NextResponse } from "next/server";
import { DATADOG_ENABLED } from "@/lib/flags";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!DATADOG_ENABLED) {
    return NextResponse.json(
      { ok: false, disabled: true, reason: "Datadog disabled" },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const nowSec = Math.floor(Date.now() / 1000);
    const to = Number(searchParams.get("to") || nowSec);
    const from = Number(searchParams.get("from") || (nowSec - 15 * 60));
    if (!query) {
      return NextResponse.json({ ok: false, error: "Missing 'query'" }, { status: 400 });
    }

    const site = process.env.DATADOG_SITE || "datadoghq.com";
    const apiKey = process.env.DATADOG_API_KEY || "";
    const appKey = process.env.DATADOG_APP_KEY || "";

    const url = `https://api.${site}/api/v1/query?from=${from}&to=${to}&query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        "Accept": "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Datadog error ${res.status}`, response: safeParse(text) },
        { status: res.status }
      );
    }

    const data = safeParse(text);
    const summary = Array.isArray((data as any)?.series)
      ? (data as any).series.map((s: any) => {
          const last = Array.isArray(s.pointlist) && s.pointlist.length
            ? s.pointlist[s.pointlist.length - 1][1]
            : null;
          return { metric: s.metric, scope: s.scope, last };
        })
      : [];

    return NextResponse.json({ ok: true, from, to, query, summary, raw: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

function safeParse(t: string) {
  try { return JSON.parse(t); } catch { return { raw: t }; }
}
