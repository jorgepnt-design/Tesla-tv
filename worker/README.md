# Tesla TV – Cloudflare Worker Bridge

This optional backend lets the HTTPS-hosted Tesla TV website access **one** HTTP IPTV provider. Cloudflare Pages / GitHub Pages by themselves cannot do this.

## Setup
1. Create a Cloudflare account and a new **Worker**, then upload the contents of `worker/src/index.js`.
2. Configure secret **IPTV_ORIGIN** with the **origin only**, e.g. `http://your-provider.example:8080/` (no username/password, no playlist).
3. Deploy the Worker, and copy its `https://…workers.dev` address.
4. Open Tesla TV → Xtream Login → enter normal HTTP server address and credentials → enable “HTTP über Cloudflare Worker” and paste the deployed Worker URL.
5. Only use sources that you are authorized to watch.

The origin entered in the app must match the configured origin. A single Worker is locked to one IPTV server; host changes require reconfiguring the secret.

## Important technical limits
- A Cloudflare Worker is **not free of usage limits**; streaming video can exceed quotas or provider restrictions.
- Credentials and stream tokens are passed in URLs to the Worker. They can occur in access logs, history and third-party diagnostics. Do **not** share Worker URLs or use this for credentials unless you trust the Worker account and know the risks.
- Only streams on the configured upstream **origin** are proxied. Cross-host stream redirects/URLs will fail or still be blocked by the browser.
- Some providers disallow proxies or Cloudflare traffic and some codecs/DRM do not work in browsers.
- An accessible workers.dev endpoint can be invoked by non-browser clients. If others know the upstream credentials and endpoint, they could consume proxy bandwidth. Add Cloudflare security controls if publishing widely.
- Nothing bypasses Tesla's in-motion video restriction. Use video only while parked.
