import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// No R2/KV/D1 cache: pages load their data at request time or in the browser, so the
// default in-memory ("dummy") caches are enough and the site needs no extra Cloudflare resources.
export default defineCloudflareConfig({});
