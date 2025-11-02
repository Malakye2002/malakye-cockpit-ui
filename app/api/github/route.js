import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  try {
    const res = await fetch("https://api.github.com/users/Malakye2002/repos", {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch repos" }, { status: res.status });
    }

    const repos = await res.json();
    const latest = repos.sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))[0];

    return NextResponse.json({
      repoCount: repos.length,
      latestRepo: latest?.name || "None",
      latestPush: latest?.pushed_at || "N/A",
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
