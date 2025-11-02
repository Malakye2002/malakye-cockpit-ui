export const dynamic = "force-dynamic";
import { DATADOG_ENABLED } from "../../lib/flags";

export default async function DatadogPage() {
  if (!DATADOG_ENABLED) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Datadog</h1>
        <p className="mt-2 text-sm text-slate-600">
          Datadog is disabled. Set <code>ENABLE_DATADOG=1</code> in your Vercel
          Environment Variables and redeploy to enable.
        </p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Datadog</h1>
      <p className="mt-2 text-sm text-slate-600">
        Datadog is enabled and available through API routes.
      </p>
    </main>
  );
}
