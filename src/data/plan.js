// ── Sovereign save/restore — the plan model + storage adapters ─────────────
//
// One small doc the visitor owns: their quiz result, ladder rung, chosen
// device, and checklist progress. The site is not just keyless — it's
// dataless: by default NOTHING is written anywhere. Saving is always an
// explicit, opt-in action the user takes; we never auto-persist or sync.
//
// Three backends behind one shape:
//   • local  — this browser's localStorage (survives reloads, one device)
//   • file   — download / import a plain .json the user holds
//   • nostr  — NIP-78 event, NIP-44 encrypted to the user's own key
//
// Any further backend slots in behind the same plan shape. Nothing about an
// unshipped one belongs on a page: the site states what it does today.

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
    // Did this plan ARRIVE in this browser, rather than being built in it? Set by a
    // file import or a Nostr restore, never by the finder.
    //
    // LAYER: the TOP one, beside `owned` — a fact about how this browser got its
    // plan, not about the plan selection. It therefore survives
    // clearPlanSelection() (clearing your setup does not make you a first-time
    // reader) and dies only with clearLocal(). Every new plan field has to be
    // assigned a layer or the next clear silently does the wrong thing to it.
    restored: false,
  };
}

// Keep only strings from a maybe-array (defensive — imported files are untrusted).
function strList(arr, cap = 20) {
  return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string').slice(0, cap) : [];
}
// The finder's four concern keys — stable identifiers that appear in saved
// plans (finder.js is the source; duplicated here so the plan model doesn't
// have to import the whole engine to validate a file).
const CONCERN_KEYS = ['custodial', 'self-loss', 'remote', 'physical'];

// Sanitize the assessment slice inside the saved answers (2026-07-31): the
// risk assessment extends `quiz.answers` with { scores, checkedPrompts,
// skippedSections }. Old plans — a ranked worries[] and nothing else — pass
// through untouched; the finder shims them into an estimated risk picture on
// load and says so. Imported files are untrusted, so every new field is
// coerced or dropped, never believed.
function normAnswers(ans) {
  if (!ans || typeof ans !== 'object') return ans;
  const out = { ...ans };
  if (out.scores && typeof out.scores === 'object') {
    const s = {};
    for (const c of CONCERN_KEYS) {
      const v = out.scores[c];
      if (typeof v === 'number' && Number.isFinite(v)) s[c] = Math.min(100, Math.max(0, Math.round(v)));
    }
    if (Object.keys(s).length) out.scores = s; else delete out.scores;
  } else {
    delete out.scores;
  }
  if (Array.isArray(out.checkedPrompts)) out.checkedPrompts = strList(out.checkedPrompts, 60);
  else delete out.checkedPrompts;
  if (Array.isArray(out.skippedSections)) {
    out.skippedSections = strList(out.skippedSections, 8).filter((c) => CONCERN_KEYS.includes(c));
  } else {
    delete out.skippedSections;
  }
  return out;
}

// Sanitize the planned-setup slice, coercing its device/keys fields to safe types.
function normQuiz(q) {
  if (!q || typeof q !== 'object') return null;
  return {
    ...q,
    answers: q.answers && typeof q.answers === 'object' ? normAnswers(q.answers) : q.answers ?? null,
    keysNeeded: typeof q.keysNeeded === 'number' ? q.keysNeeded : null,
    plannedDevices: strList(q.plannedDevices),
    recommendedDevices: strList(q.recommendedDevices),
    // Coerced rather than carried by the spread, because an imported file is
    // untrusted structure and this one feeds a date comparison.
    decidedAt: typeof q.decidedAt === 'string' ? q.decidedAt : null,
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
    restored: obj.restored === true,
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

/**
 * Write a plan to this browser, stamping `updated`. Returns the stored plan,
 * or NULL when the write didn't take (private mode, storage full, storage
 * blocked). Verified by reading the value back — this used to swallow the
 * failure and return the plan anyway, so every caller toasted "saved" over a
 * write that never happened. Callers must check for null and say so honestly.
 */
export function saveLocal(plan) {
  const p = normalize(plan);
  p.updated = new Date().toISOString();
  const raw = JSON.stringify(p);
  try {
    localStorage.setItem(PLAN_KEY, raw);
    if (localStorage.getItem(PLAN_KEY) !== raw) return null;
  } catch (e) {
    return null;
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
 * One button used to flatten the whole object, so "clear
 * my plan" also forgot which devices you own and every answer you had given. Those
 * sit at different layers:
 *
 *     what you own ──┐      ← a fact about you. Survives everything but the nuke;
 *                    │        it is also settable on /wallets without ever opening
 *     quiz answers ──┤        the setup finder, so it is not downstream of anything.
 *                    ├──→  PLAN SELECTION ──→ checklist ticks
 *
 * Answers are kept so the common case — "redo my setup choice without re-answering
 * everything" — is possible at all. Ticks go with the selection, because a tick
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

// The ONE planned setup the user has chosen. /find-your-setup is the only caller
// — the result card's primary or secondary pick. There is only ever one at a
// time; saving a new setup REPLACES the current one (the UI confirms first when
// it differs). Stored under `quiz`, with `source` values still spelled
// `quiz-primary` / `quiz-secondary`, for backward-compatibility with plans saved
// before the finder replaced that engine — the key is the wire format, not a
// live route. (This read "or from browsing a ladder rung page" until 2026-08-06:
// rungs are sections of /learn/ladder and have not been pages for a restructure,
// and no such caller exists.)
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
    // WHEN THE READER DECIDED THIS, which is not the same as when the plan was
    // last touched. `updated` moves on every auto-save — a checklist tick, a
    // wallet added — so it answers "when were you last here", and someone who
    // ticks one box after a year would look freshly decided. This moves only
    // when the setup is saved, which is the thing the re-check re-decides.
    // Re-saving the SAME setup still counts as deciding it again: the reader
    // looked at the question and stood by the answer.
    decidedAt: new Date().toISOString(),
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

/**
 * Is this a RETURNING reader — someone whose plan came from a file import or a
 * Nostr restore, rather than someone who just built one here?
 *
 * The re-check tool on /my-plan ("Has your situation changed?") asks a question
 * that only makes sense across a gap of time. Nothing has changed five minutes
 * after the finder, and asking implies it might have — so the tool is shown to
 * a reader whose plan arrived from somewhere else, and to nobody else.
 *
 * Deliberately NOT inferred from `updated`: that timestamp moves on every
 * auto-save (a checklist tick, adding a wallet), so an age test would answer
 * "when did you last touch this" rather than "did you build this here".
 */
export function planWasRestored() {
  const p = loadLocal();
  return Boolean(p && p.restored);
}

/**
 * How long a plan sits before "has your situation changed?" is worth asking of
 * a reader who built it right here. Six months.
 *
 * Long enough that nobody is asked twice about a quiet week — the thing that
 * made this gated in the first place — and short enough that a plan made before
 * a real change in someone's life gets looked at again. Stakes, family and
 * holdings are the inputs it would move, and none of those change weekly.
 */
export const RECHECK_AFTER_MONTHS = 6;

/**
 * Should /my-plan offer the re-check? Returns the REASON, not just a boolean,
 * because the two cases deserve different sentences: one reader's plan came
 * from another device, the other's has simply been sitting a while.
 *
 *   'restored' — arrived by file import or Nostr restore. Another day, another
 *                device; the question is fair on arrival.
 *   'aged'     — decided here, more than RECHECK_AFTER_MONTHS ago.
 *   null       — built here recently. Nothing has changed since the finder, and
 *                asking implies something might have.
 *
 * AGE IS MEASURED FROM `quiz.decidedAt`, never from `updated`. See the note on
 * that field: `updated` answers "when were you last here". A plan from before
 * 2026-08-04 has no decidedAt, so it falls back to `updated` — which can only
 * ever be LATER than the real decision, so the prompt arrives late rather than
 * early. Late is the safe direction for a question that implies something has
 * changed.
 */
export function planNeedsRecheck(now = new Date()) {
  const p = loadLocal();
  if (!p) return null;
  if (p.restored) return 'restored';
  const stamp = (p.quiz && p.quiz.decidedAt) || p.updated;
  if (!stamp) return null;
  const then = new Date(stamp);
  if (Number.isNaN(then.getTime())) return null;
  const cutoff = new Date(now.getTime());
  cutoff.setMonth(cutoff.getMonth() - RECHECK_AFTER_MONTHS);
  return then <= cutoff ? 'aged' : null;
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

/**
 * WHICH BAND the saved setup came from — 'quiz-primary', 'quiz-secondary',
 * 'quiz-fork-<key>'. Added 2026-07-30 because the result page was deciding
 * "is this the saved one?" on the RUNG SLUG alone, and two different
 * recommendations can legitimately land on the same rung (a "start simple, then
 * graduate" first choice and a "graduate to cold storage" second choice are both
 * single-sig). Saving either lit up BOTH bands with "this is your saved plan".
 * The source is the only thing unique per band.
 */
export function plannedSetupSource() {
  const p = loadLocal();
  return (p && p.quiz && p.quiz.source) || null;
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
