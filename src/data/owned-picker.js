// owned-picker.js — a compact make→model picker for "which hardware wallet(s) do
// you own?". Shared by the quiz's owned step and /my-plan's status card.
//
// UX: pick a MAKE, then a MODEL from that make, then Add — repeat to add as many
// wallets as you hold (each shows as a removable chip). A "Something else" make
// lets you type anything unlisted (stored as "x:<name>"). A privacy opt-out —
// "I'd rather not say" — records nothing and is fully on-brand.
//
// mountOwnedPicker(root, { initial:[slugs], privateInit:bool, onChange(slugs, isPrivate) })

import { ownableCatalog, ownedName } from './wallets.js';

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const s = document.createElement('style');
  s.textContent = `
    .owp { display: block; }
    .owp-row { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
    .owp select, .owp .owp-free { font-family: var(--sans); font-size: 0.9rem; color: var(--text);
      background: var(--raise); border: 1px solid var(--line); border-radius: 0.55rem; padding: 0.55rem 0.7rem; min-width: 0; }
    .owp select:focus, .owp .owp-free:focus { outline: none; border-color: var(--accent); }
    .owp .owp-make { flex: 1 1 10rem; }
    .owp .owp-model { flex: 1 1 11rem; }
    .owp .owp-free { flex: 1 1 12rem; }
    .owp select:disabled { opacity: 0.5; }
    .owp .owp-add { font-family: var(--sans); font-size: 0.88rem; font-weight: 600; cursor: pointer;
      background: var(--accent); color: var(--accent-ink); border: none; border-radius: 0.55rem; padding: 0.55rem 0.95rem; }
    .owp .owp-add:disabled { opacity: 0.4; cursor: not-allowed; }
    .owp .owp-selected { display: flex; flex-wrap: wrap; gap: 0.45rem; margin: 0.8rem 0 0; }
    .owp .owp-chip { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 600;
      background: var(--safe-dim); color: var(--safe); border: 1px solid color-mix(in srgb, var(--safe) 40%, var(--line));
      border-radius: 999px; padding: 0.35rem 0.4rem 0.35rem 0.8rem; }
    .owp .owp-x { background: none; border: none; color: inherit; cursor: pointer; font-size: 1.05rem; line-height: 1; padding: 0 0.15rem; opacity: 0.7; }
    .owp .owp-x:hover { opacity: 1; }
    .owp .owp-private-note { display: inline-block; margin-top: 0.8rem; color: var(--muted); font-size: 0.9rem;
      background: var(--surface); border: 1px dashed var(--line); border-radius: 0.5rem; padding: 0.55rem 0.85rem; }
    .owp .owp-private { margin-top: 0.9rem; background: none; border: 1px solid var(--line); color: var(--muted);
      font-family: var(--sans); font-size: 0.83rem; cursor: pointer; padding: 0.45rem 0.85rem; border-radius: 999px; }
    .owp .owp-private:hover { border-color: var(--accent); color: var(--accent); }
    .owp .owp-private.on { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); font-weight: 600; }
  `;
  document.head.appendChild(s);
}

function esc(x) { const d = document.createElement('div'); d.textContent = x == null ? '' : x; return d.innerHTML; }

export function mountOwnedPicker(root, { initial = [], privateInit = false, onChange } = {}) {
  injectStyles();
  let selected = Array.from(new Set(initial));
  let isPrivate = Boolean(privateInit) && selected.length === 0;
  const emit = () => onChange && onChange(selected.slice(), isPrivate);

  root.classList.add('owp');
  root.innerHTML = `
    <div class="owp-row">
      <select class="owp-make" aria-label="Make">
        <option value="">Make…</option>
        ${ownableCatalog.map((b, i) => `<option value="${i}">${esc(b.brand)}</option>`).join('')}
        <option value="__other__">Something else (type it)</option>
      </select>
      <select class="owp-model" aria-label="Model" disabled><option value="">Model…</option></select>
      <input class="owp-free" type="text" placeholder="Make &amp; model" autocomplete="off" hidden />
      <button type="button" class="owp-add" disabled>＋ Add</button>
    </div>
    <div class="owp-selected" hidden></div>
    <button type="button" class="owp-private">🔒 I’d rather not say</button>`;

  const makeSel = root.querySelector('.owp-make');
  const modelSel = root.querySelector('.owp-model');
  const freeIn = root.querySelector('.owp-free');
  const addBtn = root.querySelector('.owp-add');
  const chipsWrap = root.querySelector('.owp-selected');
  const privBtn = root.querySelector('.owp-private');

  function drawChips() {
    if (isPrivate) {
      chipsWrap.hidden = false;
      chipsWrap.innerHTML = `<span class="owp-private-note">🔒 You’d rather not say — we’ll record no devices.</span>`;
      return;
    }
    if (!selected.length) { chipsWrap.hidden = true; chipsWrap.innerHTML = ''; return; }
    chipsWrap.hidden = false;
    chipsWrap.innerHTML = selected.map((s) =>
      `<span class="owp-chip">✓ ${esc(ownedName(s))}<button type="button" class="owp-x" data-slug="${esc(s)}" aria-label="Remove">×</button></span>`).join('');
    chipsWrap.querySelectorAll('.owp-x').forEach((b) => b.addEventListener('click', () => {
      selected = selected.filter((x) => x !== b.dataset.slug); drawChips(); emit();
    }));
  }

  function syncPrivate() {
    privBtn.classList.toggle('on', isPrivate);
    privBtn.textContent = isPrivate ? '🔒 Rather not say — tap to undo' : '🔒 I’d rather not say';
    [makeSel, modelSel, addBtn].forEach((el) => { el.disabled = isPrivate || (el === modelSel && !modelSel.dataset.ready) || (el === addBtn && !canAdd()); });
    freeIn.disabled = isPrivate;
  }

  function currentPick() {
    if (makeSel.value === '__other__') {
      const v = freeIn.value.trim();
      return v ? 'x:' + v : null;
    }
    return modelSel.value || null;
  }
  function canAdd() { return !isPrivate && !!currentPick(); }
  function refreshAddBtn() { addBtn.disabled = !canAdd(); }

  makeSel.addEventListener('change', () => {
    const other = makeSel.value === '__other__';
    freeIn.hidden = !other;
    modelSel.hidden = other;
    if (other) {
      modelSel.dataset.ready = '';
      freeIn.value = '';
    } else {
      const brand = ownableCatalog[Number(makeSel.value)];
      if (brand) {
        modelSel.innerHTML = `<option value="">Model…</option>` +
          brand.models.map((m) => `<option value="${esc(m.slug)}">${esc(m.name)}${m.current ? ' — current' : ''}</option>`).join('');
        modelSel.dataset.ready = '1';
        modelSel.disabled = false;
      } else {
        modelSel.innerHTML = `<option value="">Model…</option>`;
        modelSel.dataset.ready = '';
        modelSel.disabled = true;
      }
    }
    refreshAddBtn();
  });
  modelSel.addEventListener('change', refreshAddBtn);
  freeIn.addEventListener('input', refreshAddBtn);
  freeIn.addEventListener('keydown', (e) => { if (e.key === 'Enter' && canAdd()) { e.preventDefault(); addBtn.click(); } });

  addBtn.addEventListener('click', () => {
    const pick = currentPick();
    if (!pick) return;
    if (!selected.includes(pick)) selected.push(pick);
    isPrivate = false;
    // reset the row
    makeSel.value = ''; modelSel.innerHTML = `<option value="">Model…</option>`; modelSel.disabled = true; modelSel.dataset.ready = '';
    freeIn.value = ''; freeIn.hidden = true; modelSel.hidden = false;
    refreshAddBtn(); syncPrivate(); drawChips(); emit();
  });

  privBtn.addEventListener('click', () => {
    isPrivate = !isPrivate;
    if (isPrivate) { selected = []; makeSel.value = ''; modelSel.disabled = true; modelSel.dataset.ready = ''; freeIn.value = ''; freeIn.hidden = true; modelSel.hidden = false; }
    syncPrivate(); drawChips(); emit();
  });

  drawChips();
  syncPrivate();
  return { get selected() { return selected.slice(); }, get isPrivate() { return isPrivate; } };
}
