// A small, on-brand replacement for window.confirm() — a themed modal that returns
// a Promise<boolean>. Self-contained: injects its own styles once (using the site's
// CSS variables, so it themes light/dark automatically) and cleans up after itself.
// Text is set via textContent, never innerHTML, so labels can't inject markup.

let styleInjected = false;
function injectStyle() {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement('style');
  style.id = 'uid-style';
  style.textContent = `
    .uid-overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 1.2rem;
      background: rgba(0,0,0,0.55); opacity: 0; transition: opacity 0.18s ease; }
    .uid-overlay.show { opacity: 1; }
    .uid-card { width: 100%; max-width: 26rem; background: var(--surface-2); color: var(--text);
      border: 1px solid var(--line); border-radius: 0.9rem; box-shadow: 0 20px 60px rgba(0,0,0,0.45);
      padding: 1.4rem 1.5rem; transform: translateY(8px) scale(0.985); transition: transform 0.18s ease; }
    .uid-overlay.show .uid-card { transform: none; }
    .uid-title { font-size: 1.15rem; font-weight: 700; margin: 0 0 0.5rem; line-height: 1.25; }
    .uid-msg { color: var(--muted); font-size: 0.95rem; line-height: 1.55; margin: 0 0 1.3rem; }
    .uid-msg .uid-em { color: var(--text); font-weight: 600; }
    .uid-actions { display: flex; justify-content: flex-end; gap: 0.6rem; flex-wrap: wrap; }
    .uid-btn { font-family: var(--sans); font-size: 0.92rem; font-weight: 600; cursor: pointer;
      border-radius: 0.55rem; padding: 0.6rem 1.15rem; border: 1px solid var(--line); transition: border-color 0.15s, filter 0.15s, color 0.15s; }
    .uid-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
    .uid-cancel { background: none; color: var(--muted); }
    .uid-cancel:hover { border-color: var(--accent); color: var(--accent); }
    .uid-confirm { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
    .uid-confirm:hover { filter: brightness(1.07); }
    .uid-confirm.danger { background: var(--warn); border-color: var(--warn); color: #fff; }
    .uid-input { width: 100%; box-sizing: border-box; font-family: var(--sans); font-size: 0.95rem; color: var(--text);
      background: var(--raise); border: 1px solid var(--line); border-radius: 0.55rem; padding: 0.65rem 0.85rem; margin: 0 0 1.1rem; }
    .uid-input:focus { outline: none; border-color: var(--accent); }
    .uid-err { color: var(--warn); font-size: 0.85rem; margin: -0.7rem 0 1rem; min-height: 1rem; }
    .uid-check { display: flex; align-items: flex-start; gap: 0.55rem; margin: 0 0 1rem; cursor: pointer; font-size: 0.95rem; color: var(--text); }
    .uid-check input { margin-top: 0.15rem; width: 1.05rem; height: 1.05rem; accent-color: var(--accent); cursor: pointer; flex: 0 0 auto; }
    .uid-check .uid-check-sub { display: block; color: var(--faint); font-size: 0.82rem; margin-top: 0.15rem; }
    @media (max-width: 480px) { .uid-actions { justify-content: stretch; } .uid-btn { flex: 1 1 auto; } }
  `;
  document.head.appendChild(style);
}

/**
 * Show a themed confirm dialog. Resolves true (confirm) or false (cancel/backdrop/Esc).
 * @param {{title?:string, message?:string, confirmText?:string, cancelText?:string,
 *          danger?:boolean, emphasis?:string[]}} opts
 *   emphasis: substrings in `message` to bold (e.g. the two setup names).
 */
export function confirmDialog(opts = {}) {
  const { title = '', message = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = false, emphasis = [] } = opts;
  injectStyle();
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'uid-overlay';
    const card = document.createElement('div');
    card.className = 'uid-card';
    card.setAttribute('role', 'alertdialog');
    card.setAttribute('aria-modal', 'true');
    if (title) {
      const h = document.createElement('h2');
      h.className = 'uid-title';
      h.textContent = title;
      card.appendChild(h);
    }
    const p = document.createElement('p');
    p.className = 'uid-msg';
    // Build the message, bolding any emphasis substrings (text nodes only — no injection).
    let rest = message;
    if (emphasis.length) {
      const parts = [];
      let idx;
      // naive left-to-right split on the emphasis strings, in order of appearance
      const found = emphasis
        .map((e) => ({ e, i: rest.indexOf(e) }))
        .filter((x) => x.i >= 0)
        .sort((a, b) => a.i - b.i);
      let cursor = 0;
      for (const { e, i } of found) {
        if (i < cursor) continue;
        if (i > cursor) parts.push({ t: rest.slice(cursor, i), em: false });
        parts.push({ t: e, em: true });
        cursor = i + e.length;
      }
      if (cursor < rest.length) parts.push({ t: rest.slice(cursor), em: false });
      for (const part of parts) {
        if (part.em) { const s = document.createElement('span'); s.className = 'uid-em'; s.textContent = part.t; p.appendChild(s); }
        else p.appendChild(document.createTextNode(part.t));
      }
    } else {
      p.textContent = message;
    }
    card.appendChild(p);

    const actions = document.createElement('div');
    actions.className = 'uid-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button'; cancelBtn.className = 'uid-btn uid-cancel'; cancelBtn.textContent = cancelText;
    const confirmBtn = document.createElement('button');
    confirmBtn.type = 'button'; confirmBtn.className = 'uid-btn uid-confirm' + (danger ? ' danger' : ''); confirmBtn.textContent = confirmText;
    actions.appendChild(cancelBtn);
    actions.appendChild(confirmBtn);
    card.appendChild(actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const prevFocus = document.activeElement;
    confirmBtn.focus();

    function close(result) {
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => { overlay.remove(); if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} } }, 180);
      resolve(result);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(false); }
      else if (e.key === 'Enter') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === confirmBtn ? cancelBtn : confirmBtn).focus(); }
    }
    confirmBtn.addEventListener('click', () => close(true));
    cancelBtn.addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    document.addEventListener('keydown', onKey, true);
  });
}

/**
 * Prompt for a password (themed, injection-safe). Resolves the string, or null on
 * cancel/backdrop/Esc. With `confirmField:true` it asks twice and requires a match.
 * @param {{title?:string, message?:string, confirmText?:string, cancelText?:string,
 *          placeholder?:string, confirmField?:boolean, minLength?:number}} opts
 */
export function promptPassword(opts = {}) {
  const { title = 'Password', message = '', confirmText = 'OK', cancelText = 'Cancel',
    placeholder = 'Password', confirmField = false, minLength = 1 } = opts;
  injectStyle();
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'uid-overlay';
    const card = document.createElement('div');
    card.className = 'uid-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    if (title) { const h = document.createElement('h2'); h.className = 'uid-title'; h.textContent = title; card.appendChild(h); }
    if (message) { const p = document.createElement('p'); p.className = 'uid-msg'; p.textContent = message; card.appendChild(p); }

    const in1 = document.createElement('input');
    in1.type = 'password'; in1.className = 'uid-input'; in1.placeholder = placeholder;
    in1.autocomplete = 'new-password'; in1.setAttribute('aria-label', placeholder);
    card.appendChild(in1);
    let in2 = null;
    if (confirmField) {
      in2 = document.createElement('input');
      in2.type = 'password'; in2.className = 'uid-input'; in2.placeholder = 'Confirm password';
      in2.autocomplete = 'new-password'; in2.setAttribute('aria-label', 'Confirm password');
      card.appendChild(in2);
    }
    const err = document.createElement('p'); err.className = 'uid-err'; card.appendChild(err);

    const actions = document.createElement('div');
    actions.className = 'uid-actions';
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button'; cancelBtn.className = 'uid-btn uid-cancel'; cancelBtn.textContent = cancelText;
    const okBtn = document.createElement('button');
    okBtn.type = 'button'; okBtn.className = 'uid-btn uid-confirm'; okBtn.textContent = confirmText;
    actions.appendChild(cancelBtn); actions.appendChild(okBtn);
    card.appendChild(actions);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const prevFocus = document.activeElement;
    in1.focus();

    function close(result) {
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => { overlay.remove(); if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} } }, 180);
      resolve(result);
    }
    function submit() {
      const v = in1.value;
      if (v.length < minLength) { err.textContent = `Use at least ${minLength} character${minLength > 1 ? 's' : ''}.`; return; }
      if (confirmField && v !== in2.value) { err.textContent = 'The passwords don’t match.'; return; }
      close(v);
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
      else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    }
    okBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
    document.addEventListener('keydown', onKey, true);
  });
}

/**
 * Download dialog with an OPTIONAL "encrypt with a password" checkbox. One button →
 * plain or encrypted. Resolves { mode:'plain' } | { mode:'encrypted', password } | null.
 */
export function downloadDialog(opts = {}) {
  const { title = 'Download your plan', minLength = 6 } = opts;
  injectStyle();
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'uid-overlay';
    const card = document.createElement('div');
    card.className = 'uid-card';
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');

    const h = document.createElement('h2'); h.className = 'uid-title'; h.textContent = title; card.appendChild(h);
    const msg = document.createElement('p'); msg.className = 'uid-msg';
    msg.textContent = 'The file lives on your device — nothing leaves your browser. You can optionally lock it with a password.';
    card.appendChild(msg);

    const checkLabel = document.createElement('label'); checkLabel.className = 'uid-check';
    const check = document.createElement('input'); check.type = 'checkbox';
    const checkText = document.createElement('span');
    checkText.innerHTML = '🔒 Encrypt this file with a password<span class="uid-check-sub">The file becomes unreadable without it — and there’s no recovery. (Your plan holds no seed words.)</span>';
    checkLabel.appendChild(check); checkLabel.appendChild(checkText); card.appendChild(checkLabel);

    const pw = document.createElement('input'); pw.type = 'password'; pw.className = 'uid-input'; pw.placeholder = `Password (min ${minLength} characters)`; pw.autocomplete = 'new-password'; pw.hidden = true;
    const pw2 = document.createElement('input'); pw2.type = 'password'; pw2.className = 'uid-input'; pw2.placeholder = 'Confirm password'; pw2.autocomplete = 'new-password'; pw2.hidden = true;
    card.appendChild(pw); card.appendChild(pw2);
    const err = document.createElement('p'); err.className = 'uid-err'; card.appendChild(err);

    const actions = document.createElement('div'); actions.className = 'uid-actions';
    const cancelBtn = document.createElement('button'); cancelBtn.type = 'button'; cancelBtn.className = 'uid-btn uid-cancel'; cancelBtn.textContent = 'Cancel';
    const okBtn = document.createElement('button'); okBtn.type = 'button'; okBtn.className = 'uid-btn uid-confirm'; okBtn.textContent = 'Download';
    actions.appendChild(cancelBtn); actions.appendChild(okBtn); card.appendChild(actions);
    overlay.appendChild(card); document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const prevFocus = document.activeElement;
    check.addEventListener('change', () => {
      pw.hidden = pw2.hidden = !check.checked;
      err.textContent = '';
      if (check.checked) { pw.focus(); }
    });

    function close(result) {
      overlay.classList.remove('show');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => { overlay.remove(); if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} } }, 180);
      resolve(result);
    }
    function submit() {
      if (!check.checked) { close({ mode: 'plain' }); return; }
      if (pw.value.length < minLength) { err.textContent = `Use at least ${minLength} characters.`; return; }
      if (pw.value !== pw2.value) { err.textContent = 'The passwords don’t match.'; return; }
      close({ mode: 'encrypted', password: pw.value });
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(null); }
      else if (e.key === 'Enter') { e.preventDefault(); submit(); }
    }
    okBtn.addEventListener('click', submit);
    cancelBtn.addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
    document.addEventListener('keydown', onKey, true);
  });
}
