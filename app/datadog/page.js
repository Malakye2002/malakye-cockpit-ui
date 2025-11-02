export const dynamic = "force-dynamic";

export default function DatadogPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Datadog Integration</h1>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Status</div>
          <div className="mt-2 text-2xl font-semibold">Connected</div>
          <p className="mt-1 text-xs text-slate-500">
            Runtime page ready for live metrics.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Next Action</div>
          <div className="mt-2 text-2xl font-semibold">Wire API</div>
          <p className="mt-1 text-xs text-slate-500">
            Add server route to fetch Datadog metrics.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Notes</div>
          <p className="mt-2 text-sm text-slate-700">
            This page is dynamic so env vars and live data will load at runtime.
          </p>
        </div>
      </section>
    </main>
  );
}
