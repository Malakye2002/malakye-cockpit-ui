export default function Page() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="bg-white border-r border-slate-200 p-4">
        <div className="text-lg font-semibold mb-6">🚀 Malakye Cockpit</div>
        <nav className="space-y-2">
          <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/">
            Dashboard
          </a>
          <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/aws">
            AWS
          </a>
          <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/datadog">
            Datadog
          </a>
          <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/github">
            GitHub
          </a>
          <a className="block rounded-lg px-3 py-2 hover:bg-slate-100" href="/settings">
            Settings
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary">Refresh</button>
          </div>
        </header>

        {/* Cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="card">
            <div className="text-sm text-slate-500">GitHub Repos</div>
            <div className="mt-2 text-2xl font-semibold">–</div>
            <div className="mt-2 text-xs text-slate-500">Pending integration</div>
          </div>

          <div className="card">
            <div className="text-sm text-slate-500">Datadog Metrics</div>
            <div className="mt-2 text-2xl font-semibold">–</div>
            <div className="mt-2 text-xs text-slate-500">Pending integration</div>
          </div>

          <div className="card">
            <div className="text-sm text-slate-500">RDS Instances</div>
            <div className="mt-2 text-2xl font-semibold">–</div>
            <div className="mt-2 text-xs text-slate-500">Pending integration</div>
          </div>

          <div className="card">
            <div className="text-sm text-slate-500">EC2 Health</div>
            <div className="mt-2 text-2xl font-semibold">–</div>
            <div className="mt-2 text-xs text-slate-500">Pending integration</div>
          </div>
        </section>

        {/* Activity */}
        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Activity</h2>
            <span className="text-xs text-slate-500">Coming soon</span>
          </div>
          <div className="mt-4 text-sm text-slate-600">
            Integrations for GitHub, AWS, and Datadog will appear here once connected.
          </div>
        </section>
      </main>
    </div>
  );
}
