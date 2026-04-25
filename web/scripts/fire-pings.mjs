#!/usr/bin/env node
/**
 * fire-pings.mjs — Standalone scheduled job for DigitalOcean App Platform.
 * Calls the internal API endpoint via HTTP using the service URL.
 *
 * Run: TOATRE_API_URL=https://... CRON_SECRET=... node scripts/fire-pings.mjs
 */

const apiUrl = process.env.TOATRE_API_URL;
const cronSecret = process.env.CRON_SECRET;

if (!apiUrl) {
  console.error("TOATRE_API_URL is not set");
  process.exit(1);
}

if (!cronSecret) {
  console.error("CRON_SECRET is not set");
  process.exit(1);
}

try {
  const res = await fetch(`${apiUrl}/api/cron/fire-pings`, {
    method: "GET",
    headers: {
      "x-cron-secret": cronSecret,
    },
  });

  const body = await res.json();

  if (!res.ok) {
    console.error(`fire-pings failed: HTTP ${res.status}`, body);
    process.exit(1);
  }

  console.log(`fire-pings ok:`, body);
  process.exit(0);
} catch (err) {
  console.error("fire-pings error:", err);
  process.exit(1);
}
