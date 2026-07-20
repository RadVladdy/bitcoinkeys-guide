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
    owned: [], // slugs of hardware wallets the user already HAS — their status inventory
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
    checklist,
    notes: typeof obj.notes === 'string' ? obj.notes.slice(0, 2000) : '',
  };
}

/** True if this parsed object looks like it holds any actual user data. */
export function planHasContent(p) {
  if (!p) return false;
  return Boolean(
    p.quiz || p.ladder || p.device || p.notes ||
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

/** Forget the saved plan in this browser. */
export function clearLocal() {
  try {
    localStorage.removeItem(PLAN_KEY);
  } catch (e) {}
}

// ── per-tool save helpers (merge one slice into the shared plan) ────────────
// Each starts from whatever is already saved, so tools compose into one plan.

// The ONE planned setup the user has chosen — from the quiz (primary OR
// secondary) or from browsing a ladder rung page. There is only ever one at a
// time; saving a new setup REPLACES the current one (the UI confirms first when
// it differs). Stored under `quiz` for backward-compatibility with earlier plans.
export function savePlannedSetup({ rung, label, tier, device, source, answers, keysNeeded, owned }) {
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
  };
  if (device) cur.device = device;
  // owned wallets captured in the quiz MERGE into the status inventory (never clobber
  // devices recorded on /wallets or a prior visit).
  if (Array.isArray(owned) && owned.length) {
    cur.owned = Array.from(new Set([...(cur.owned || []), ...owned.filter((s) => typeof s === 'string')]));
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
// Assign/unassign a device to the plan. No-op if there is no planned setup yet.
export function togglePlannedDevice(slug) {
  const cur = loadLocal();
  if (!cur || !cur.quiz) return cur;
  const set = new Set(cur.quiz.plannedDevices || []);
  if (set.has(slug)) set.delete(slug); else set.add(slug);
  cur.quiz.plannedDevices = Array.from(set);
  return saveLocal(cur);
}
export function hasPlannedSetup() {
  const p = loadLocal();
  return Boolean(p && p.quiz && (p.quiz.primaryLabel || p.quiz.rung));
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

/** Parse imported file text into a normalized plan. Throws on invalid JSON. */
export function parsePlanText(text) {
  const obj = JSON.parse(text); // throws → caller shows "not a valid plan file"
  return normalize(obj);
}
