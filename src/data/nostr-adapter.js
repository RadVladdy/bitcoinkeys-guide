// ── Sovereign save/restore — the Nostr backend (NIP-78 + NIP-44) ───────────
//
// Save the user's plan.json to THEIR Nostr identity, encrypted so only they
// can read it, on relays they choose. The site never sees the secret key or
// the plaintext — encryption happens inside the signer (a browser extension
// or a remote bunker).
//
//   • Event: kind 30078 (NIP-78 "app data") — a *replaceable* event, so relays
//     keep only the latest for (pubkey, kind, d-tag). Restore = fetch newest.
//   • d-tag: "bitcoinkeys.guide/plan" — one overwriting slot, invisible to
//     social clients (it is NOT a DM; it never clutters a message inbox).
//   • Encryption: NIP-44 encrypt-to-self (ECDH to your own pubkey). The signer
//     does the ECDH; we hand it plaintext + our own pubkey and get ciphertext.
//   • Auth: NIP-07 extension (window.nostr) OR NIP-46 bunker (bunker:// URI).
//     With a bunker the nsec never touches the browser.
//
// Chosen over Pubky for the first sovereign backend because Pubky has no
// private storage yet (see _Decisions / _Product-Ideas-Research 2026-07-16).

import { SimplePool } from 'nostr-tools/pool';
import { BunkerSigner, parseBunkerInput } from 'nostr-tools/nip46';
import { generateSecretKey } from 'nostr-tools/pure';
import { normalize } from './plan.js';

export const NOSTR_KIND = 30078;
export const NOSTR_D_TAG = 'bitcoinkeys.guide/plan';

// Plain, widely-federated relays. (Per hard-won hub lessons: avoid
// relay.getalby.com/v1 — its auth/path has silently blocked clients.)
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
];

let sharedPool = null;
function pool() {
  if (!sharedPool) sharedPool = new SimplePool();
  return sharedPool;
}

/** True if a NIP-07 browser extension is present. */
export function hasExtension() {
  return typeof window !== 'undefined' && !!window.nostr;
}

/**
 * A uniform signer: { kind, pubkey, signEvent, nip44Encrypt, nip44Decrypt, close }.
 * Both the extension and the bunker are wrapped to this shape so the save/load
 * code never branches on which one is connected.
 */

/** Connect via a NIP-07 browser extension (Alby, nos2x, …). */
export async function connectExtension() {
  if (!hasExtension()) throw new Error('No Nostr extension found in this browser.');
  if (!window.nostr.nip44 || typeof window.nostr.nip44.encrypt !== 'function') {
    throw new Error('Your Nostr extension does not support NIP-44 encryption yet — try a bunker (Amber, nsec.app) instead.');
  }
  const pubkey = await window.nostr.getPublicKey();
  return {
    kind: 'extension',
    pubkey,
    signEvent: (evt) => window.nostr.signEvent(evt),
    nip44Encrypt: (pk, pt) => window.nostr.nip44.encrypt(pk, pt),
    nip44Decrypt: (pk, ct) => window.nostr.nip44.decrypt(pk, ct),
    close: () => {},
  };
}

/** Reject a hung promise so the UI never waits forever on a signer. */
function withTimeout(promise, ms, msg) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(msg)), ms)),
  ]);
}

/** Connect via a NIP-46 bunker (paste a bunker:// string, e.g. from Amber). */
export async function connectBunker(input) {
  const bp = await parseBunkerInput(input);
  if (!bp || !bp.pubkey) throw new Error('That does not look like a bunker:// connection string.');
  if (!bp.relays || !bp.relays.length) {
    throw new Error('That bunker link has no relay in it — copy the full bunker:// string (it includes a relay= part).');
  }
  const clientKey = generateSecretKey(); // ephemeral local key for the signer channel
  // fromBunker (NOT `new BunkerSigner`) wires up the bunker pointer, the
  // conversation key, and the relay subscription. onauth handles bunkers
  // (e.g. nsec.app) that answer with an approval URL instead of an in-app prompt.
  const signer = BunkerSigner.fromBunker(clientKey, bp, {
    pool: pool(),
    onauth: (url) => { try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) {} },
  });
  await withTimeout(
    signer.connect(),
    120000,
    'Timed out waiting for the bunker. Open your signer app (e.g. Amber), approve the request, and try again.'
  );
  const pubkey = await withTimeout(signer.getPublicKey(), 30000, 'Connected, but the signer did not return your key. Try again.');
  return {
    kind: 'bunker',
    pubkey,
    signEvent: (evt) => signer.signEvent(evt),
    nip44Encrypt: (pk, pt) => signer.nip44Encrypt(pk, pt),
    nip44Decrypt: (pk, ct) => signer.nip44Decrypt(pk, ct),
    close: () => { try { signer.close(); } catch (e) {} },
  };
}

/**
 * Encrypt the plan to the user's own key and publish it as the latest
 * kind-30078 replaceable event. Returns how many relays accepted it.
 */
export async function saveToNostr(plan, signer, relays = DEFAULT_RELAYS) {
  const pk = signer.pubkey;
  const clean = normalize(plan);
  clean.updated = new Date().toISOString();
  const ciphertext = await signer.nip44Encrypt(pk, JSON.stringify(clean)); // encrypt-to-self
  const unsigned = {
    kind: NOSTR_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', NOSTR_D_TAG]],
    content: ciphertext,
    pubkey: pk,
  };
  const signed = await signer.signEvent(unsigned);
  const results = await Promise.allSettled(pool().publish(relays, signed));
  const ok = results.filter((r) => r.status === 'fulfilled').length;
  if (ok === 0) throw new Error('No relay accepted the save. Check your connection and try again.');
  return { ok, total: relays.length, updated: clean.updated };
}

/**
 * Fetch the newest kind-30078 plan event for this user, decrypt it, and return
 * the plan (or null if none found). Picks the highest created_at across relays.
 */
export async function loadFromNostr(signer, relays = DEFAULT_RELAYS) {
  const pk = signer.pubkey;
  const events = await pool().querySync(relays, {
    kinds: [NOSTR_KIND],
    authors: [pk],
    '#d': [NOSTR_D_TAG],
  });
  if (!events || !events.length) return null;
  const newest = events.reduce((a, b) => (b.created_at > a.created_at ? b : a));
  const plaintext = await signer.nip44Decrypt(pk, newest.content);
  return normalize(JSON.parse(plaintext));
}
