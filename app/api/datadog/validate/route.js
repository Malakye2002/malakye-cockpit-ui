import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

/**
 * GET /api/datadog/validate
 * Returns { ok:true, datadog:{ valid:true } } when API+APP keys are accepted by Datadog.
 */
export async function GET() {
  const site = (process.env.DATADOG_SITE || "us5.datadoghq.com").trim().toLowerCase();
  const apiKey = (process.env.DATADOG_API_KEY || "").trim();
  const appKey = (process.env.DATADOG_APP_KEY || "").trim();

  if (!apiKey || !appKey || !/^[a-z0-9.-]+\.datadoghq\.com$/.test(site)) {
    return NextResponse.json(
      { ok: false, error: "Missing/invalid DATADOG_* envs" },
      { status: 500 }
    );
  }

  const url = `https://api.${site}/api/v1/validate`;

  // Try headers first; if some edge strips them, query-string fallback still auths.
  const tryOnce = async (useQS) => {
    const u = useQS ? `${url}?api_key=${encodeURIComponent(apiKey)}&application_key=${encodeURIComponent(appKey)}` : url;
    const res = await fetch(u, {
      method: "GET",
      headers: useQS ? {} : { "DD-API-KEY": apiKey, "DD-APPLICATION-KEY": appKey, Accept: "application/json" },
      cache: "no-store",
    });
    const text = await res.text();
    let json; try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return { status: res.status, json };
  };

  try {
    let r = await tryOnce(false);
    if (r.status === 401 || r.status === 403) r = await tryOnce(true);

    if (r.status === 200 && r.json?.valid === true) {
      return NextResponse.json({ ok: true, datadog: r.json });
    }
    return NextResponse.json(
      { ok: false, error: `Datadog validate ${r.status}`, response: r.json },
      { status: r.status }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
  }
}
