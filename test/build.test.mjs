// Tests for the shared INFO.json builder + validator.
import { buildBusinessManifest, linksToChannels, validateBusinessManifest, BPUB_BUSINESS, CHANNEL_VIA } from '../src/index.js';

let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? (pass++, console.log('  ok  ', name)) : (fail++, console.log('  FAIL', name)); };

// ── build from a links-style record (Business Bios / directory shape) ──
const m = buildBusinessManifest({
  slug: 'joes', biz_id: 'biz_abc', name: 'Joe’s Plumbing', tagline: 'Fast & fair',
  description: 'Plumbing.', category: 'plumber', geo: 'toronto', verified: true,
  lang: 'en', languages: ['en', 'fr'], updated: '2026-06-21', generated_by: 'businessbios',
  npub: 'npub1xyz',
  links: [
    { kind: 'website', url: 'https://joes.example' },
    { kind: 'booking', url: 'https://book.joes' },
    { kind: 'pay', url: 'https://pay.joes' },
    { kind: 'social', url: 'https://instagram.com/joes' },
    { kind: 'other', url: 'mailto:hi@joes.example' },
  ],
});
ok('schema + llm_friendly', m.schema === BPUB_BUSINESS && m.llm_friendly === true);
ok('meta versioned + emitter + license', m.meta.version === '0.1' && m.meta.generated_by === 'businessbios' && m.meta.license.includes('CC BY 4.0'));
ok('identity mapped', m.identity.name === 'Joe’s Plumbing' && m.identity.biz_id === 'biz_abc' && m.identity.verified === true);
ok('nostr block when npub present', m.identity.nostr && m.identity.nostr.npub === 'npub1xyz');
ok('links → channels', m.channels.book.endpoint === 'https://book.joes' && m.channels.pay.via === 'web'
  && m.channels.support.endpoint === 'mailto:hi@joes.example' && m.channels.website.endpoint === 'https://joes.example');
ok('ask always present', m.channels.ask && m.channels.ask.via === 'web' && m.channels.ask.endpoint === 'https://joes.bpub.app');
ok('default page from slug', m.identity.page === 'https://joes.bpub.app');
ok('triangulation social + website', m.resilience.triangulation.social === 'https://instagram.com/joes' && m.resilience.triangulation.website === 'https://joes.example');
ok('agents policy', m.agents.policy === 'read-and-transact');

// ── build from an explicit-channels record (bpub KV / SendRelay shape) ──
const m2 = buildBusinessManifest({
  name: 'Follow the Sun Tanning', page: 'https://followthesun.bpub.app', verified: true,
  channels: {
    book: { via: 'voice', endpoint: '+12505550123' },
    pay: { via: 'email', endpoint: 'payments@followthesun.ca' },
    support: { via: 'email', endpoint: 'support@followthesun.ca' },
  },
  icon: { style: 'icons', seed: 'sun', icon: ['sun'], backgroundColor: ['10b981'] },
});
ok('explicit channels respected', m2.channels.book.via === 'voice' && m2.channels.pay.endpoint === 'payments@followthesun.ca');
ok('ask backfilled from page', m2.channels.ask.endpoint === 'https://followthesun.bpub.app');
ok('branding.icon (DiceBear recipe) carried', m2.branding.icon.style === 'icons');

// ── hours carried through ──
const mh = buildBusinessManifest({ name: 'X', page: 'https://x', hours: [{ day: 'mon', open: '09:00', close: '17:00', tz: 'America/Vancouver' }] });
ok('hours carried to output', Array.isArray(mh.hours) && mh.hours[0].close === '17:00');
ok('hours null when absent', m2.hours === null);

// ── interac: the spec's own flagship example must validate (regression) ──
// sendrelay.bizdocs.src/strategy/info-json-standard.md ships `pay: { via: "interac", … }`.
const mi = buildBusinessManifest({
  name: 'Follow the Sun Tanning', page: 'https://followthesun.bpub.app',
  channels: {
    book: { via: 'voice', endpoint: '+12505550123' },
    pay: { via: 'interac', endpoint: 'payments@followthesun.ca', note: 'e-transfer; holding place only' },
    support: { via: 'email', endpoint: 'support@followthesun.ca' },
    ask: { via: 'mcp', endpoint: 'https://followthesun.bpub.app/mcp' },
  },
});
ok('interac pay channel carried', mi.channels.pay.via === 'interac' && mi.channels.pay.endpoint === 'payments@followthesun.ca');
const vi = validateBusinessManifest(mi);
ok('spec example (pay via interac) VALIDATES', vi.valid === true);
if (!vi.valid) console.log('       errors:', vi.errors);
ok('CHANNEL_VIA includes interac', CHANNEL_VIA.includes('interac'));

// email-shaped pay link → interac (bare endpoint); URL pay link stays web
const chp = linksToChannels([{ kind: 'pay', url: 'mailto:payments@x.ca' }], { pageUrl: 'https://x' });
ok('email pay link → via interac, bare endpoint', chp.pay.via === 'interac' && chp.pay.endpoint === 'payments@x.ca');
ok('url pay link stays via web', linksToChannels([{ kind: 'pay', url: 'https://pay.x' }]).pay.via === 'web');

// ── linksToChannels unit ──
const ch = linksToChannels([{ kind: 'menu', url: 'https://m' }, { kind: 'support', url: 'help@x.ca' }], { pageUrl: 'https://x' });
ok('linksToChannels menu + support(email) + ask', ch.menu.endpoint === 'https://m' && ch.support.endpoint === 'mailto:help@x.ca' && ch.ask.endpoint === 'https://x');

// ── validator ──
ok('valid manifest passes', validateBusinessManifest(m).valid === true);
const bad = validateBusinessManifest({ schema: 'wrong', llm_friendly: false, channels: { book: { via: 'carrier-pigeon', endpoint: 'x' } } });
ok('invalid manifest caught', bad.valid === false && bad.errors.length >= 3);
ok('bad via flagged', validateBusinessManifest({ ...m, channels: { book: { via: 'pigeon', endpoint: 'x' } } }).errors.some((e) => e.includes('via')));

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
