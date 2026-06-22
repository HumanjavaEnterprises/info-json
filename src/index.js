// @humanjavaenterprises/info-json — the INFO.json open standard (shared builder + validator).
// One source of truth for the `bpub-business/0.1` agent-readable business manifest,
// imported by bpub, Business Bios, SendRelay, and VoxRelay so the format never drifts.
// Spec: sendrelay.bizdocs.src/strategy/info-json-standard.md.

export { buildBusinessManifest, linksToChannels } from './build.js';
export { validateBusinessManifest } from './validate.js';
export {
  BPUB_BUSINESS, VERSION, LICENSE, PATENT_NOTICE,
  CHANNEL_VERBS, CHANNEL_VIA, CORE_CHANNELS, DEFAULT_REGISTRY,
} from './schema.js';
