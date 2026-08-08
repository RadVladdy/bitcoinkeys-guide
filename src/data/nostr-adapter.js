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
// This is the only sovereign backend: an alternative needs a way for an app to
// encrypt TO the user's key without the app ever handling key material, which is
// what NIP-44 plus a NIP-07/46 signer gives. A store that holds only public data,
// or a signer with no encrypt-to-self primitive, cannot host a private plan here.

import { SimplePool } from 'nostr-tools/pool';
import { BunkerSigner, parseBunkerInput } from 'nostr-tools/nip46';
import { generateSecretKey } from 'nostr-tools/pure';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { normalize } from './plan.js';

export const NOSTR_KIND = 30078;
// Legacy plaintext d-tag (kept only as a restore fallback for anything saved before the
// opaque locator below). Do NOT save under this anymore.
export const NOSTR_D_TAG = 'bitcoinkeys.guide/plan';

// Per-user OPAQUE d-tag. The plan's replaceable event lives at a d-tag derived from the
// user's own pubkey, not a shared plaintext string — so nobody can scan relays with
// {kinds:[30078], "#d":["bitcoinkeys.guide/plan"]} to harvest a list of this guide's
// users (the $5-wrench target list). It is deterministic (recomputable on restore from
// the connected pubkey), so it stays key-safe — no signer secret needed.
//   HONEST LIMIT: this is NOT a secret locator. The derivation is open-source and keyed on
//   the PUBLIC key, so an observer who already has YOUR pubkey could recompute it and
//   confirm you use this app. It defeats mass enumeration, not a targeted lookup — the
//   event is still authored by your key, so use a key you're comfortable associating with
//   self-custody. A truly secret locator needs a deterministic secret from the signer,
//   which NIP-07/NIP-46 don't cleanly expose (see _Product-Ideas-Research 2026-07-19).
export function planDTag(pubkey) {
  return bytesToHex(sha256(new TextEncoder().encode(`${pubkey}|bitcoinkeys.guide/plan|v1`)));
}

// Relays are GENERATED from the Nostr registry (nostr-publisher), gated by
// scripts/check-nostr-registry.py. Reader plans are strangers writing their
// own events, so the set is the free-to-write healthy relays, degraded last —
// the old hand list here still pinned degraded relay.nostr.band. (Standing
// hub lesson kept: avoid relay.getalby.com/v1 — its auth/path has silently
// blocked clients; the registry never lists it.)
import { DEFAULT_RELAYS } from './nostr-relays.generated.js';
export { DEFAULT_RELAYS };

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

// NIP-46 bunkers reject with PLAIN STRINGS (e.g. "unauthorized"), not Errors —
// so the UI's `e.message` came up empty and showed a useless generic line.
// Wrap every signer call so whatever the bunker says reaches the user readably.
function asError(promise) {
  return promise.catch((e) => {
    throw e instanceof Error ? e : new Error(`The signer refused: ${String(e)}`);
  });
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
    asError(signer.connect()),
    120000,
    'Timed out waiting for the bunker. Open your signer app (e.g. Amber), approve the request, and try again.'
  );
  const pubkey = await withTimeout(asError(signer.getPublicKey()), 30000, 'Connected, but the signer did not return your key. Try again.');
  return {
    kind: 'bunker',
    pubkey,
    // The ephemeral CLIENT channel key (ours, not the user's). The bunker authorized
    // this exact client — persist it so a return visit can resume as the SAME client
    // instead of a stranger re-spending the (single-use) bunker secret.
    clientKey: bytesToHex(clientKey),
    signEvent: (evt) => asError(signer.signEvent(evt)),
    nip44Encrypt: (pk, pt) => asError(signer.nip44Encrypt(pk, pt)),
    nip44Decrypt: (pk, ct) => asError(signer.nip44Decrypt(pk, ct)),
    close: () => { try { signer.close(); } catch (e) {} },
  };
}

/**
 * Resume a previously-approved bunker connection on a later visit. Rebuilds the
 * signer from the SAME client channel key the bunker already authorized and skips
 * the `connect` handshake entirely (its secret is single-use — re-sending it is
 * why return-visit saves used to fail). getPublicKey() doubles as the liveness
 * check: an authorized client gets an answer; a dead pairing times out.
 */
export async function reconnectBunker(input, clientKeyHex) {
  const bp = await parseBunkerInput(input);
  if (!bp || !bp.pubkey) throw new Error('Saved bunker connection is unreadable — sign out and connect again.');
  const signer = BunkerSigner.fromBunker(hexToBytes(clientKeyHex), bp, {
    pool: pool(),
    onauth: (url) => { try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) {} },
  });
  const pubkey = await withTimeout(
    asError(signer.getPublicKey()),
    25000,
    'Your signer did not answer — open your signer app (e.g. Amber), then try again. If it keeps failing, sign out and connect fresh.'
  );
  return {
    kind: 'bunker',
    pubkey,
    clientKey: clientKeyHex,
    signEvent: (evt) => asError(signer.signEvent(evt)),
    nip44Encrypt: (pk, pt) => asError(signer.nip44Encrypt(pk, pt)),
    nip44Decrypt: (pk, ct) => asError(signer.nip44Decrypt(pk, ct)),
    close: () => { try { signer.close(); } catch (e) {} },
  };
}

/**
 * Fetch the user's public profile (kind-0 metadata) → { name, picture }.
 * Used only to show a friendly "you're signed in" avatar. Best-effort: returns
 * {} on any failure (no profile, relay timeout) so the UI degrades gracefully.
 */
export async function fetchProfile(pubkey, relays = DEFAULT_RELAYS) {
  try {
    const events = await withTimeout(
      pool().querySync(relays, { kinds: [0], authors: [pubkey] }),
      8000, 'profile timeout');
    if (!events || !events.length) return {};
    const newest = events.reduce((a, b) => (b.created_at > a.created_at ? b : a));
    const meta = JSON.parse(newest.content || '{}');
    return { name: meta.display_name || meta.name || '', picture: meta.picture || '' };
  } catch (e) { return {}; }
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
    tags: [['d', planDTag(pk)]],   // opaque, per-user locator (not the plaintext app name)
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
  // Query the opaque locator AND the legacy plaintext d-tag (so a plan saved before the
  // switch still restores), newest across both wins.
  const events = await pool().querySync(relays, {
    kinds: [NOSTR_KIND],
    authors: [pk],
    '#d': [planDTag(pk), NOSTR_D_TAG],
  });
  if (!events || !events.length) return null;
  const newest = events.reduce((a, b) => (b.created_at > a.created_at ? b : a));
  const plaintext = await signer.nip44Decrypt(pk, newest.content);
  return normalize(JSON.parse(plaintext));
}
