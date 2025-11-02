export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">GitHub Token</div>
          <div className="mt-2 text-2xl font-semibold">Configured</div>
          <p className="mt-1 text-xs text-slate-500">
            Your personal access token is valid and being used for API calls.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Integrations</div>
          <div className="mt-2 text-2xl font-semibold">2 Active</div>
          <p className="mt-1 text-xs text-slate-500">
            GitHub and Datadog connections detected.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="text-sm text-slate-500">Environment</div>
          <p className="mt-2 text-sm text-slate-700">
            Running in Vercel production. Environment variables load at runtime.
          </p>
        </div>
      </section>
    </main>
  );
}
