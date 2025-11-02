import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function GET() {
  const api = process.env.DATADOG_API_KEY;
  const app = process.env.DATADOG_APP_KEY;
  const site = process.env.DATADOG_SITE || "us5.datadoghq.com";

  if (!api || !app)
    return NextResponse.json({ ok: false, error: "Missing keys" }, { status: 500 });

  const url = `https://api.${site}/api/v1/validate`;
  const res = await fetch(url, {
    headers: { "DD-API-KEY": api, "DD-APPLICATION-KEY": app },
  });
  const data = await res.text();
  return NextResponse.json({ ok: res.ok, status: res.status, body: data });
}
