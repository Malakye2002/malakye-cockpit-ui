import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function safeParse(text) {
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

export async function GET() {
  const headers = {
    // Works with or without a token; token lifts rate limit but is optional
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    Accept: "application/vnd.github+json",
  };

  try {
    const res = await fetch("https://api.github.com/users/Malakye2002/repos", {
      headers,
      cache: "no-store",
    });

    const rawText = await res.text();
    const body = safeParse(rawText);

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, status: res.status, github: body },
        { status: res.status }
      );
    }

    const repos = Array.isArray(body) ? body : [];
    repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
    const latest = repos[0] || null;

    return NextResponse.json({
      ok: true,
      repoCount: repos.length,
      latestRepo: latest?.name || "None",
      latestPush: latest?.pushed_at || "N/A",
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
