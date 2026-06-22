# @humanjavaenterprises/info-json

The **INFO.json** open standard — a shared builder + validator for the **`bpub-business/0.1`** agent-readable business manifest. One source of truth, imported by every emitter (bpub, Business Bios, SendRelay, VoxRelay) so the format never drifts.

> **The file an agent reads instead of emailing you.** A business's identity + verb-typed, transactable **channels** (`book / pay / support / ask`), served at `/.well-known/info.json`. Format = **CC BY 4.0 (open)**; generation methods = **patent-pending**.

Canonical spec: `sendrelay.bizdocs.src/strategy/info-json-standard.md` · endgame: `…/the-agentic-substrate.md`.

## Install

```sh
npm i github:HumanjavaEnterprises/info-json
```

## Use

Each emitter maps its own record to the one normalized input and calls the builder — the envelope, channels, meta, and defaults are identical everywhere:

```js
import { buildBusinessManifest, validateBusinessManifest } from '@humanjavaenterprises/info-json';

// from a flat link list (Business Bios / directory)
const manifest = buildBusinessManifest({
  slug: 'joes', biz_id, name: 'Joe’s Plumbing', category: 'plumber', geo: 'toronto', verified: true,
  generated_by: 'businessbios', languages: ['en', 'fr'],
  links: [
    { kind: 'website', url: 'https://joes.example' },
    { kind: 'booking', url: 'https://book.joes' },
    { kind: 'other',   url: 'mailto:hi@joes.example' }, // → channels.support
  ],
});

// or from explicit channels (bpub KV / SendRelay)
const m2 = buildBusinessManifest({
  name, page: 'https://acme.bpub.app', generated_by: 'bpub',
  channels: { book: { via: 'voice', endpoint: '+1…' }, support: { via: 'email', endpoint: 'support@acme.ca' } },
});

const { valid, errors } = validateBusinessManifest(manifest); // run before serving
```

## API
- `buildBusinessManifest(input)` → a `bpub-business/0.1` manifest. Accepts identity fields + either `links:[{kind,url}]` (auto-mapped to channels) or explicit `channels:{}`. `ask` is backfilled from `page`/`slug`.
- `linksToChannels(links, { pageUrl })` → the verb-typed channels map.
- `validateBusinessManifest(m)` → `{ valid, errors }` (zero-dep structural guard).
- Constants: `BPUB_BUSINESS`, `VERSION`, `LICENSE`, `PATENT_NOTICE`, `CHANNEL_VERBS`, `CHANNEL_VIA`, `CORE_CHANNELS`.
- JSON Schema (for external validators): `schema/bpub-business-0.1.json`.

## The shape (abridged)
```jsonc
{
  "schema": "bpub-business/0.1", "llm_friendly": true,
  "meta": { "version": "0.1", "languages": ["en","fr"], "generated_by": "bpub",
            "license": "INFO.json schema: CC BY 4.0 | Generation methods: Patent pending" },
  "identity": { "biz_id", "name", "tagline", "category", "geo", "verified", "page",
                "nostr": { "npub", "nip05" } },
  "branding": { "icon": { /* DiceBear recipe */ }, "logo", "colors" },
  "channels": {
    "book":    { "via": "voice|web|mcp", "endpoint": "…" },
    "pay":     { "via": "interac|web",   "endpoint": "…" },
    "support": { "via": "email",         "endpoint": "…" },
    "ask":     { "via": "web|mcp",       "endpoint": "…" },
    "website": { "via": "web",           "endpoint": "…" }
  },
  "agents": { "policy": "read-and-transact", "transact_via": "channels" },
  "resilience": { "canonical", "registry", "triangulation": { "page", "website", "social" } }
}
```

## Test
```sh
npm test
```

## License
The schema/format is **CC BY 4.0**. The methods to generate + keep a manifest true are patent-pending (the harness). © Humanjava Enterprises.
