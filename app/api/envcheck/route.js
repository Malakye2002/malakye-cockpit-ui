import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const site = process.env.DATADOG_SITE;
  const api = process.env.DATADOG_API_KEY ? "present" : "missing";
  const app = process.env.DATADOG_APP_KEY ? "present" : "missing";
  return NextResponse.json({ site, api, app });
}
