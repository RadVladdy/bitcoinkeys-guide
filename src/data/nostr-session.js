// ── Remembered Nostr login (display only) ──────────────────────────────────
//
// A tiny, browser-only record of "this browser has connected a Nostr identity
// here" — so we can show a login avatar top-right and let the user pick up
// where they left off. Consistent with the site's model: this lives ONLY in
// the user's own localStorage, is never sent to any server, and is cleared on
// disconnect. It holds PUBLIC data only (npub + public profile name/picture)
// plus, for a bunker, the connection string so a return visit can re-establish
// the signer without re-pasting (the bunker still approves every signature —
// the nsec never touches the browser). No secret key is ever stored.
//
// Shape: { kind: 'extension'|'bunker', pubkey, npub, name, picture, bunkerInput? }

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
