export const dynamic = "force-dynamic";

async function getGithubCard() {
  try {
    const base = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
    const res = await fetch(`${base}/api/github`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data || data.ok === false) {
      return { repoCount: 0, latestRepo: "None", latestPush: "N/A" };
    }
    return {
      repoCount: Number(data.repoCount || 0),
      latestRepo: data.latestRepo || "None",
      latestPush: data.latestPush || "N/A",
    };
  } catch {
    return { repoCount: 0, latestRepo: "None", latestPush: "N/A" };
  }
}

export default async function Page() {
  const gh = await getGithubCard();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">GitHub Repositories</div>
          <div className="mt-2 text-2xl font-semibold">{gh.repoCount}</div>
          <p className="mt-1 text-xs text-slate-500">
            Latest: {gh.latestRepo} · {gh.latestPush}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">AWS</div>
          <div className="mt-2 text-2xl font-semibold text-slate-700">Connected</div>
          <p className="mt-1 text-xs text-slate-500">EC2 and RDS integration in progress.</p>
        </div>
      </section>
    </main>
  );
}
