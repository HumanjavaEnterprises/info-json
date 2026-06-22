// INFO.json — shared constants for the bpub-business profile.
// The format is an OPEN STANDARD (CC BY 4.0); the generation method is patent-pending.
// Spec: sendrelay.bizdocs.src/strategy/info-json-standard.md.

export const BPUB_BUSINESS = 'bpub-business/0.1';
export const VERSION = '0.1';

export const LICENSE = 'INFO.json schema: CC BY 4.0 | Generation methods: Patent pending';
export const PATENT_NOTICE =
  'The methods and processes used to generate this metadata are patent pending. The INFO.json format itself is an open standard.';

// Verb-typed channels (the agentic transaction surface) + their transports.
export const CHANNEL_VERBS = ['book', 'pay', 'support', 'ask', 'order', 'quote', 'website', 'menu'];
export const CHANNEL_VIA = ['web', 'email', 'sms', 'voice', 'mcp', 'api'];

// The core channels every business manifest declares (null when absent) — vs the
// optional extras (menu/order/quote) that only appear when present.
export const CORE_CHANNELS = ['book', 'pay', 'support', 'ask', 'website'];

export const DEFAULT_REGISTRY = 'https://bpub.app';
