import { NextResponse } from "next/server";
import { DATADOG_ENABLED } from "../../../lib/flags";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!DATADOG_ENABLED) {
    return NextResponse.json({ ok: false, disabled: true }, { status: 503 });
  }

  try {
    const site = process.env.DATADOG_SITE || "datadoghq.com";
    const apiKey = process.env.DATADOG_API_KEY || "";
    const appKey = process.env.DATADOG_APP_KEY || "";

    const res = await fetch(`https://api.${site}/api/v1/validate`, {
      headers: {
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    const text = await res.text();
    const body = (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })();

    return NextResponse.json({ ok: res.ok, status: res.status, body }, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
