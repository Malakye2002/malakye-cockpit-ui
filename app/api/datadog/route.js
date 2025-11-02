import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const nowSec = Math.floor(Date.now() / 1000);
    const to = Number(searchParams.get("to") || nowSec);
    const from = Number(searchParams.get("from") || nowSec - 15 * 60);

    if (!query) {
      return NextResponse.json({ ok: false, error: "Missing ?query=" }, { status: 400 });
    }

    const site = process.env.DATADOG_SITE;
    const apiKey = process.env.DATADOG_API_KEY;
    const appKey = process.env.DATADOG_APP_KEY;

    if (!apiKey || !appKey) {
      return NextResponse.json({ ok: false, error: "Datadog keys not found" }, { status: 500 });
    }

    const url = `https://api.${site}/api/v1/query?from=${from}&to=${to}&query=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: {
        "DD-API-KEY": apiKey,
        "DD-APPLICATION-KEY": appKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Datadog error ${res.status}`, response: json },
        { status: res.status }
      );
    }

    return NextResponse.json({ ok: true, query, from, to, data: json });
  } catch (err) {
    return NextResponse.json({ ok: false, error: `Server exception: ${err.message}` }, { status: 500 });
  }
}
