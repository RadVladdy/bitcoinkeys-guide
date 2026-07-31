// ── Sovereign save/restore — the plan model + storage adapters ─────────────
//
// One small doc the visitor owns: their quiz result, ladder rung, chosen
// device, and checklist progress. The site is not just keyless — it's
// dataless: by default NOTHING is written anywhere. Saving is always an
// explicit, opt-in action the user takes; we never auto-persist or sync.
//
// First shippable cut ships two backends behind one shape:
//   • local  — this browser's localStorage (survives reloads, one device)
//   • file   — download / import a plain .json the user holds
//
// Sovereign backends (Pubky homeserver, Nostr NIP-78) layer on later behind
// the same plan shape — see _Product-Ideas-Research 2026-07-16.

export const PLAN_VERSION = 1;
export const APP = 'bitcoinkeys.guide';
export const PLAN_KEY = 'bkg-plan';
export const PLAN_FILENAME = 'bitcoinkeys-plan.json';

/** A fresh, empty plan. */
export function emptyPlan() {
  return {
    v: PLAN_VERSION,
    app: APP,
    updated: null,
    quiz: null, // { answers, primaryTier, primaryLabel, device, rung, source, keysNeeded, plannedDevices[] }
    ladder: null, // { rung }  (a ladder slug)
    device: null, // last chosen device name
    owned: [], // slugs of hardware wallets the user already HAS (0..n) — their status inventory
    ownPrivate: false, // user chose "I'd rather not say" for owned hardware
    custodian: null, // chosen collaborative-custody service slug (collaborative plans only)
    checklist: {}, // { [itemId]: true }
    notes: '',
  };
}

// Keep only strings from a maybe-array (defensive — imported files are untrusted).
function strList(arr, cap = 20) {
  return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, cap) : [];
}
// Sanitize the planned-setup slice, coercing its device/keys fields to safe types.
function normQuiz(q) {
  if (!q || typeof q !== 'object') return null;
  return {
    ...q,
    keysNeeded: typeof q.keysNeeded === 'number' ? q.keysNeeded : null,
    plannedDevices: strList(q.plannedDevices),
    recommendedDevices: strList(q.recommendedDevices),
  };
}

/**
 * Coerce any parsed object into a valid plan shape. Defensive — an imported
 * file could be anything, so we never trust its structure, only copy known
 * fields with the right types.
 */
export function normalize(obj) {
  const base = emptyPlan();
  if (!obj || typeof obj !== 'object') return base;
  const checklist = {};
  if (obj.checklist && typeof obj.checklist === 'object') {
    for (const [k, v] of Object.entries(obj.checklist)) {
      if (v === true) checklist[k] = true;
    }
  }
  return {
    v: PLAN_VERSION,
    app: APP,
    updated: typeof obj.updated === 'string' ? obj.updated : null,
    quiz: normQuiz(obj.quiz),
    ladder:
      obj.ladder && typeof obj.ladder === 'object' && typeof obj.ladder.rung === 'string'
        ? { rung: obj.ladder.rung }
        : null,
    device: typeof obj.device === 'string' ? obj.device : null,
    owned: strList(obj.owned),
    ownPrivate: obj.ownPrivate === true,
    custodian: typeof obj.custodian === 'string' ? obj.custodian : null,
    checklist,
    notes: typeof obj.notes === 'string' ? obj.notes.slice(0, 2000) : '',
  };
}

/** True if this parsed object looks like it holds any actual user data. */
export function planHasContent(p) {
  if (!p) return false;
  return Boolean(
    p.quiz || p.ladder || p.device || p.notes || p.ownPrivate || p.custodian ||
    (p.owned && p.owned.length) ||
    (p.checklist && Object.keys(p.checklist).length)
  );
}

// ── local adapter (localStorage) ───────────────────────────────────────────

/** Read the saved plan from this browser, or null if none / unreadable. */
export function loadLocal() {
  try {
    const raw = localStorage.getItem(PLAN_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

/** Write a plan to this browser, stamping `updated`. Returns the stored plan. */
export function saveLocal(plan) {
  const p = normalize(plan);
  p.updated = new Date().toISOString();
  try {
    localStorage.setItem(PLAN_KEY, JSON.stringify(p));
  } catch (e) {
    /* private mode / quota — the caller's UI reports failure */
  }
  return p;
}

/** True if a saved plan exists in this browser. */
export function hasLocal() {
  try {
    return localStorage.getItem(PLAN_KEY) != null;
  } catch (e) {
    return false;
  }
}

/**
 * Forget EVERYTHING in this browser — answers, hardware, ticks, notes.
 * The nuke. See clearPlanSelection() for the one people usually want.
 */
export function clearLocal() {
  try {
    localStorage.removeItem(PLAN_KEY);
  } catch (e) {}
}

/**
 * Clear the PLAN SELECTION and the checklist progress under it — keeping the two
 * things that are not downstream of it: your quiz answers, and the hardware you own.
 *
 * ADDED 2026-07-30 (the owner). One button used to flatten the whole object, so "clear
 * my plan" also forgot which devices you own and every answer you had given. Those
 * sit at different layers:
 *
 *     what you own ──┐      ← a fact about you. Survives everything but the nuke;
 *                    │        it is also settable on /wallets without ever opening
 *     quiz answers ──┤        the setup finder, so it is not downstream of anything.
 *                    ├──→  PLAN SELECTION ──→ checklist ticks
 *
 * Answers are kept so the common case — "redo my setup choice without re-answering
 * six questions" — is possible at all. Ticks go with the selection, because a tick
 * against a step that no longer applies is worse than no tick.
 */
export function clearPlanSelection() {
  const p = loadLocal();
  if (!p) return null;
  const answers = (p.quiz && p.quiz.answers) || null;
  p.quiz = answers ? { answers } : null;
  p.ladder = null;
  p.device = null;
  p.custodian = null;
  p.checklist = {};
  p.notes = '';
  return saveLocal(p);
}

// ── per-tool save helpers (merge one slice into the shared plan) ────────────
// Each starts from whatever is already saved, so tools compose into one plan.

// The ONE planned setup the user has chosen — from the quiz (primary OR
// secondary) or from browsing a ladder rung page. There is only ever one at a
// time; saving a new setup REPLACES the current one (the UI confirms first when
// it differs). Stored under `quiz` for backward-compatibility with earlier plans.
export function savePlannedSetup({ rung, label, tier, device, source, answers, keysNeeded, owned, ownPrivate, recommendedDevices }) {
  const cur = loadLocal() || emptyPlan();
  const prev = cur.quiz || {};
  const sameSetup = prev.rung && prev.rung === rung;
  cur.quiz = {
    answers: answers || null,
    primaryTier: tier || null,
    primaryLabel: label || null,
    device: device || null,
    rung: rung || null,
    source: source || null,
    // how many keys this setup needs → the roadmap slot count
    keysNeeded: typeof keysNeeded === 'number' ? keysNeeded : (sameSetup ? prev.keysNeeded : null),
    // keep the user's device assignments only if the SETUP didn't change
    plannedDevices: sameSetup ? strList(prev.plannedDevices) : [],
    // the quiz's recommended devices for THIS setup — suggested in empty slots +
    // annotated on /wallets ("recommended for your plan"). NOT a selection.
    recommendedDevices: Array.isArray(recommendedDevices) ? strList(recommendedDevices) : (sameSetup ? strList(prev.recommendedDevices) : []),
  };
  // NOTE: we deliberately do NOT store the quiz's recommended device as a "chosen
  // device" — a recommendation isn't a selection. The user's real device choices are
  // the plan's key slots (plannedDevices), managed on /my-plan + /wallets.
  // owned wallets captured in the quiz MERGE into the status inventory (never clobber
  // devices recorded on /wallets or a prior visit). Supports multiple wallets.
  if (Array.isArray(owned) && owned.length) {
    cur.owned = Array.from(new Set([...(cur.owned || []), ...owned.filter((s) => typeof s === 'string')]));
  }
  if (typeof ownPrivate === 'boolean') cur.ownPrivate = ownPrivate && !(cur.owned && cur.owned.length);
  // Seed the plan's key slots from the wallets they own (up to what the setup needs),
  // so an owner sees their hardware pre-assigned. Fully editable afterward on /my-plan.
  if (!cur.quiz.plannedDevices.length && cur.owned && cur.owned.length && typeof cur.quiz.keysNeeded === 'number') {
    cur.quiz.plannedDevices = cur.owned.slice(0, cur.quiz.keysNeeded);
  }
  return saveLocal(cur);
}

// ── STATUS: hardware wallets the user already owns ──────────────────────────
export function getOwned() {
  const p = loadLocal();
  return p && Array.isArray(p.owned) ? p.owned : [];
}
export function setOwned(slugs) {
  const cur = loadLocal() || emptyPlan();
  cur.owned = Array.from(new Set(strList(slugs)));
  return saveLocal(cur);
}
export function toggleOwned(slug) {
  const cur = loadLocal() || emptyPlan();
  const set = new Set(cur.owned || []);
  if (set.has(slug)) set.delete(slug); else set.add(slug);
  cur.owned = Array.from(set);
  if (cur.owned.length) cur.ownPrivate = false; // owning something ≠ "rather not say"
  return saveLocal(cur);
}
export function getOwnPrivate() {
  const p = loadLocal();
  return Boolean(p && p.ownPrivate);
}
// Set the whole owned inventory + privacy flag at once (the /my-plan picker's onChange).
export function setOwnedAndPrivacy(slugs, ownPrivate) {
  const cur = loadLocal() || emptyPlan();
  cur.owned = Array.from(new Set(strList(slugs)));
  cur.ownPrivate = Boolean(ownPrivate) && cur.owned.length === 0;
  return saveLocal(cur);
}

// ── PLAN: the wallet(s) assigned to the planned setup's key slots ────────────
export function getPlannedDevices() {
  const p = loadLocal();
  return p && p.quiz && Array.isArray(p.quiz.plannedDevices) ? p.quiz.plannedDevices : [];
}
export function plannedKeysNeeded() {
  const p = loadLocal();
  return p && p.quiz && typeof p.quiz.keysNeeded === 'number' ? p.quiz.keysNeeded : null;
}
// The quiz's recommended device slugs for the saved setup (suggestions, not choices).
export function getRecommendedDevices() {
  const p = loadLocal();
  return p && p.quiz && Array.isArray(p.quiz.recommendedDevices) ? p.quiz.recommendedDevices : [];
}
export function hasPlannedSetup() {
  const p = loadLocal();
  return Boolean(p && p.quiz && (p.quiz.primaryLabel || p.quiz.rung));
}

// ── COLLABORATIVE CUSTODIAN: the service holding one key (collaborative plans) ──
export function getCustodian() {
  const p = loadLocal();
  return p ? p.custodian || null : null;
}
// Set the chosen custodian; passing the one already set clears it (toggle off).
export function setCustodian(slug) {
  const cur = loadLocal() || emptyPlan();
  cur.custodian = cur.custodian === slug ? null : (slug || null);
  return saveLocal(cur);
}
// Assign an owned/chosen device to a key slot. Capped at keysNeeded, so extra owned
// wallets stay "sidelined" (owned but not part of this plan). Returns {ok, reason}.
export function assignToPlan(slug) {
  const cur = loadLocal();
  if (!cur || !cur.quiz) return { ok: false, reason: 'no-plan' };
  const need = typeof cur.quiz.keysNeeded === 'number' ? cur.quiz.keysNeeded : Infinity;
  const list = strList(cur.quiz.plannedDevices);
  if (list.includes(slug)) return { ok: true };
  if (list.length >= need) return { ok: false, reason: 'full' };
  list.push(slug);
  cur.quiz.plannedDevices = list;
  saveLocal(cur);
  return { ok: true };
}
// Take a device out of the plan's slots (it stays in the owned inventory → sidelined).
export function removeFromPlan(slug) {
  const cur = loadLocal();
  if (!cur || !cur.quiz) return cur;
  cur.quiz.plannedDevices = strList(cur.quiz.plannedDevices).filter((s) => s !== slug);
  return saveLocal(cur);
}
// Retire a wallet entirely — out of the plan AND out of the owned inventory.
export function retireOwned(slug) {
  const cur = loadLocal();
  if (!cur) return cur;
  cur.owned = (cur.owned || []).filter((s) => s !== slug);
  if (cur.quiz) cur.quiz.plannedDevices = strList(cur.quiz.plannedDevices).filter((s) => s !== slug);
  return saveLocal(cur);
}

/** The rung slug of the currently-planned setup, or null. */
export function plannedSetupRung() {
  const p = loadLocal();
  return p && p.quiz ? p.quiz.rung || null : null;
}

/** The display label of the currently-planned setup, or null. */
export function plannedSetupLabel() {
  const p = loadLocal();
  return p && p.quiz ? p.quiz.primaryLabel || null : null;
}

export function saveLadderSlice(rung) {
  const cur = loadLocal() || emptyPlan();
  cur.ladder = rung ? { rung } : null;
  return saveLocal(cur);
}

export function saveChecklistSlice(map) {
  const cur = loadLocal() || emptyPlan();
  const next = {};
  for (const [k, v] of Object.entries(map || {})) {
    if (v === true) next[k] = true;
  }
  cur.checklist = next; // full replace — the checklist page owns the whole map
  return saveLocal(cur);
}

// ── file adapter (download / import) ────────────────────────────────────────

/** Trigger a download of the plan as a pretty-printed .json the user holds. */
export function downloadPlan(plan) {
  const p = normalize(plan);
  if (!p.updated) p.updated = new Date().toISOString();
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = PLAN_FILENAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── optional password encryption (WebCrypto AES-GCM + PBKDF2; no deps, no network) ──
// The plaintext download is already private (nothing leaves the browser). This adds a
// belt-and-braces option: encrypt the file with a password before it's saved, so the
// file itself is unreadable without it. There is NO recovery — lose the password, lose
// the file (never your Bitcoin — this is only the plan doc, and it holds no seed words).
const _b64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const _ub64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function _deriveKey(password, salt, iterations) {
  const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export function isEncryptedEnvelope(obj) {
  return Boolean(obj && obj.bkg_encrypted === true && obj.data && obj.salt && obj.iv);
}
export async function encryptPlanToEnvelope(plan, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const iterations = 250000;
  const key = await _deriveKey(password, salt, iterations);
  const pt = new TextEncoder().encode(JSON.stringify(normalize(plan)));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt);
  return { bkg_encrypted: true, app: APP, v: 1, kdf: 'PBKDF2-SHA256', iterations, salt: _b64(salt), iv: _b64(iv), data: _b64(ct) };
}
export async function decryptEnvelope(obj, password) {
  const key = await _deriveKey(password, _ub64(obj.salt), obj.iterations || 250000);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: _ub64(obj.iv) }, key, _ub64(obj.data)); // throws on wrong password
  return normalize(JSON.parse(new TextDecoder().decode(pt)));
}
export function downloadEncryptedPlan(envelope) {
  const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'bitcoinkeys-plan.encrypted.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parse imported file text into a normalized plan. Throws on invalid JSON. */
export function parsePlanText(text) {
  const obj = JSON.parse(text); // throws → caller shows "not a valid plan file"
  return normalize(obj);
}
