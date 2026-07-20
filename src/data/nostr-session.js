// ── Remembered Nostr login (display only) ──────────────────────────────────
//
// A tiny, browser-only record of "this browser has connected a Nostr identity
// here" — so we can show a login avatar top-right and let the user pick up
// where they left off. Consistent with the site's model: this lives ONLY in
// the user's own localStorage, is never sent to any server, and is cleared on
// disconnect. It holds PUBLIC data (npub + public profile name/picture) plus,
// for a bunker, what a return visit needs to resume the signer without
// re-pasting: the connection string AND our own client CHANNEL key (the
// throwaway key this site introduced itself to the bunker with — required
// because the bunker authorized that exact client, and its connect secret is
// single-use, so a fresh client can never redial). The channel key is NOT the
// user's key; the user's nsec never touches the browser, and the bunker still
// gates every request.
//
// Shape: { kind: 'extension'|'bunker', pubkey, npub, name, picture,
//          bunkerInput?, clientKey? }

const KEY = 'bkeys.nostr.session';
export const NOSTR_CHANGE_EVENT = 'bkeys-nostr-change';

export function getSession() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; }
}

function announce() {
  try { window.dispatchEvent(new CustomEvent(NOSTR_CHANGE_EVENT)); } catch (e) {}
}

export function setSession(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
  announce();
}

export function clearSession() {
  try { localStorage.removeItem(KEY); } catch (e) {}
  announce();
}
