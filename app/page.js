export const dynamic = "force-dynamic";

export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/github`, {
    cache: "no-store",
  });
  const data = await res.json();

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">GitHub Repositories</div>
          <div className="mt-2 text-2xl font-semibold">{data.repoCount}</div>
          <div className="mt-1 text-xs text-slate-500">
            Latest: {data.latestRepo}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Last Push</div>
          <p className="mt-2 text-sm text-slate-700">
            {new Date(data.latestPush).toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Datadog</div>
          <div className="mt-2 text-2xl font-semibold text-slate-700">
            Connected
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Metrics ready for integration.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">AWS</div>
          <div className="mt-2 text-2xl font-semibold text-slate-700">
            Connected
          </div>
          <p className="mt-1 text-xs text-slate-500">
            EC2 and RDS integration in progress.
          </p>
        </div>
      </section>
    </main>
  );
}
