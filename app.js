// State
let currentType = 'Plat';
let currentServe = 'Servir chaud';
let qrInstance = null;
let currentFormatId = 'plat8';
let currentBackgroundMode = 'auto';
let selectedHistoryId = '';

const LS_KEYS = {
  history: 'lfc_label_history_v1',
  draft: 'lfc_label_draft_v1',
  selectedId: 'lfc_label_selected_id_v1',
  format: 'lfc_label_format_v1',
  bgMode: 'lfc_label_bgmode_v1'
};

const LABEL_FORMATS = [
  {
    id: 'plat8',
    label: 'Rond Plat Ø8cm',
    css: { widthPx: 560, heightPx: 560, radius: '50%', borderWidthPx: 6 },
    print: { width: '80mm', height: '80mm', radius: '50%' },
    defaultBg: 'plat8'
  },
  {
    id: 'tapas6',
    label: 'Rond Tapas Ø6cm',
    css: { widthPx: 420, heightPx: 420, radius: '50%', borderWidthPx: 6 },
    print: { width: '60mm', height: '60mm', radius: '50%' },
    defaultBg: 'tapas6'
  },
  {
    id: 'rect90x55',
    label: 'Rectangulaire 90×55mm',
    css: { widthPx: 720, heightPx: 440, radius: '18px', borderWidthPx: 5 },
    print: { width: '90mm', height: '55mm', radius: '8mm' },
    defaultBg: 'rect'
  }
];

const BACKGROUNDS = [
  { id: 'auto', label: 'Auto (selon format)' },
  { id: 'none', label: 'Aucun' },
  { id: 'plat8', label: 'Fond plat Ø8 (PNG/SVG)' , url: "url('assets/backgrounds/plat-8cm.png')" },
  { id: 'tapas6', label: 'Fond tapas Ø6 (PNG/SVG)' , url: "url('assets/backgrounds/tapas-6cm.png')" },
  { id: 'rect', label: 'Fond rectangulaire (PNG/SVG)', url: "url('assets/backgrounds/rect-90x55.png')" },
  { id: 'plat8_bio', label: 'Fond plat Ø8 BIO', url: "url('assets/backgrounds/plat-8cm-bio.png')" },
  { id: 'tapas6_bio', label: 'Fond tapas Ø6 BIO', url: "url('assets/backgrounds/tapas-6cm-bio.png')" }
];

function safeJSONParse(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}

function makeId() {
  return 'dish_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function loadHistory() {
  const raw = localStorage.getItem(LS_KEYS.history);
  const items = safeJSONParse(raw, []);
  return Array.isArray(items) ? items : [];
}

function saveHistory(items) {
  localStorage.setItem(LS_KEYS.history, JSON.stringify(items));
}

function getSelectedBackgroundMode() {
  return document.getElementById('bg-select')?.value || 'auto';
}

function setType(type, btn) {
  document.querySelectorAll('#type-buttons button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentType = type;
  const customInput = document.getElementById('custom-type');
  customInput.style.display = (type === '') ? 'block' : 'none';
  update();
}

function setServe(mode, btn) {
  document.querySelectorAll('#serve-buttons button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentServe = mode;
  update();
}

function val(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function checked(id) {
  return document.getElementById(id)?.checked;
}

function update() {
  // Product name
  const name = val('product-name') || 'NOM DU PLAT';
  document.getElementById('lbl-product-name').textContent = name.toUpperCase();

  // Tagline
  const tg = val('tagline') || 'LOCAL, DE SAISON ET FAIT MAISON';
  document.getElementById('lbl-tagline').textContent = tg.toUpperCase();

  // Type badge
  const customType = val('custom-type');
  const type = (currentType === '' ? customType : currentType) || 'Plat';
  document.getElementById('lbl-type-badge').textContent = type.toUpperCase();

  // Ingredients
  const ing = val('ingredients') || '–';
  document.getElementById('lbl-ingredients').textContent = ing;

  // Nutrition
  const kj = val('kj');
  const kcal = val('kcal');
  const prot = val('proteins');
  const carbs = val('carbs');
  const fats = val('fats');
  const weight = val('weight');
  let nutr = '';
  if (kj || kcal) nutr += `Énergie : ${kj || '?'}kJ / ${kcal || '?'}kcal`;
  if (prot) nutr += ` — Protéines : ${prot}g`;
  if (carbs) nutr += ` — Glucides : ${carbs}g`;
  if (fats) nutr += ` — Lipides : ${fats}g`;
  document.getElementById('lbl-nutrition').textContent = nutr || '–';

  // Storage
  const temp = val('storage-temp');
  const after = val('storage-after');
  let storageText = '';
  if (temp) storageText += `À conserver ${temp.toLowerCase()}. `;
  if (after) storageText += `Après ouverture, consommer ${after.toLowerCase()}. `;
  if (weight) storageText += `Poids net ${weight}g`;
  document.getElementById('lbl-storage').textContent = storageText || '–';

  // Allergens
  document.getElementById('lbl-allergens').textContent = val('allergens') || '';

  // Dates & lot
  const bbRaw = val('best-before');
  let bbFormatted = '00/00/0000';
  if (bbRaw) {
    const d = new Date(bbRaw);
    bbFormatted = d.toLocaleDateString('fr-FR');
  }
  document.getElementById('lbl-best-before').textContent = bbFormatted;
  document.getElementById('lbl-lot').textContent = val('lot') ? `LOT ${val('lot')}` : 'LOT N°00000';

  // Serving
  document.getElementById('lbl-serve-mode').textContent = currentServe;
  const bm = val('bain-marie');
  const mc = val('micro');
  document.getElementById('lbl-bm').textContent = bm ? `BM ${bm} min.` : '';
  document.getElementById('lbl-micro').textContent = mc ? `Micro ${mc} min.` : '';
  document.getElementById('lbl-bm').style.display = bm ? 'inline' : 'none';
  document.getElementById('lbl-micro').style.display = mc ? 'inline' : 'none';

  // Bio badges
  const bioBadges = document.getElementById('lbl-bio-badges');
  // Affichage AB piloté par le switch de fond BIO (et non plus par un toggle séparé)
  bioBadges.style.display = checked('bg-bio') ? 'flex' : 'none';

  // Auto-save draft
  persistDraft();
}

function updateQR() {
  const url = val('qr-url') || 'https://lafabuleusecantine.fr';
  const container = document.getElementById('qr-container');
  container.innerHTML = '';
  try {
    new QRCode(container, {
      text: url,
      width: 70,
      height: 70,
      colorDark: '#5a1a8a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  } catch(e) {
    container.innerHTML = '<div style="font-size:0.5rem;color:#888">QR indisponible</div>';
  }

  // Auto-save draft (QR change)
  persistDraft();
}

function getFormState() {
  return {
    meta: { version: 1, savedAt: new Date().toISOString() },
    formatId: currentFormatId,
    bgMode: currentBackgroundMode,
    type: currentType,
    customType: val('custom-type'),
    serve: currentServe,
    fields: {
      productName: val('product-name'),
      tagline: val('tagline'),
      ingredients: val('ingredients'),
      kj: val('kj'),
      kcal: val('kcal'),
      proteins: val('proteins'),
      carbs: val('carbs'),
      fats: val('fats'),
      weight: val('weight'),
      bainMarie: val('bain-marie'),
      micro: val('micro'),
      storageTemp: val('storage-temp'),
      storageAfter: val('storage-after'),
      allergens: val('allergens'),
      bestBefore: val('best-before'),
      lot: val('lot'),
      qrUrl: val('qr-url')
    },
    toggles: {
      bgEnabled: !!checked('bg-enabled'),
      bgBio: !!checked('bg-bio')
    }
  };
}

function applyFormState(state) {
  if (!state || typeof state !== 'object') return;

  // Format & BG first (so preview matches while setting content)
  if (state.formatId) setFormat(state.formatId, { persist: false });
  if (state.bgMode) setBackgroundMode(state.bgMode, { persist: false });
  if (typeof state?.toggles?.bgEnabled === 'boolean') {
    document.getElementById('bg-enabled').checked = state.toggles.bgEnabled;
  }
  applyBackgroundCSS();

  // Type buttons
  if (typeof state.type === 'string') {
    currentType = state.type;
    document.querySelectorAll('#type-buttons button').forEach(b => {
      const t = b.getAttribute('data-type');
      b.classList.toggle('active', t === currentType);
    });
    const customInput = document.getElementById('custom-type');
    customInput.style.display = (currentType === '') ? 'block' : 'none';
  }
  if (typeof state.customType === 'string') document.getElementById('custom-type').value = state.customType;

  // Serve buttons
  if (typeof state.serve === 'string') {
    currentServe = state.serve;
    document.querySelectorAll('#serve-buttons button').forEach(b => {
      const m = b.getAttribute('data-serve');
      b.classList.toggle('active', m === currentServe);
    });
  }

  // Fields
  const f = state.fields || {};
  const setV = (id, v) => { if (typeof v === 'string') document.getElementById(id).value = v; };
  setV('product-name', f.productName ?? '');
  setV('tagline', f.tagline ?? '');
  setV('ingredients', f.ingredients ?? '');
  setV('kj', f.kj ?? '');
  setV('kcal', f.kcal ?? '');
  setV('proteins', f.proteins ?? '');
  setV('carbs', f.carbs ?? '');
  setV('fats', f.fats ?? '');
  setV('weight', f.weight ?? '');
  setV('bain-marie', f.bainMarie ?? '');
  setV('micro', f.micro ?? '');
  setV('storage-temp', f.storageTemp ?? '');
  setV('storage-after', f.storageAfter ?? '');
  setV('allergens', f.allergens ?? '');
  setV('best-before', f.bestBefore ?? '');
  setV('lot', f.lot ?? '');
  setV('qr-url', f.qrUrl ?? '');

  // Toggles
  const t = state.toggles || {};
  if (typeof t.bgEnabled === 'boolean' && document.getElementById('bg-enabled')) {
    document.getElementById('bg-enabled').checked = t.bgEnabled;
  }
  if (typeof t.bgBio === 'boolean' && document.getElementById('bg-bio')) {
    document.getElementById('bg-bio').checked = t.bgBio;
  }

  updateQR();
  update();
}

function persistDraft() {
  const draft = getFormState();
  localStorage.setItem(LS_KEYS.draft, JSON.stringify(draft));
  localStorage.setItem(LS_KEYS.format, currentFormatId);
  localStorage.setItem(LS_KEYS.bgMode, currentBackgroundMode);
  localStorage.setItem(LS_KEYS.selectedId, selectedHistoryId || '');
}

function loadDraft() {
  const draft = safeJSONParse(localStorage.getItem(LS_KEYS.draft), null);
  return draft;
}

function formatLabelForHistoryItem(item) {
  const name = (item?.state?.fields?.productName || 'Sans nom').trim() || 'Sans nom';
  const type = (item?.state?.type === '' ? (item?.state?.customType || '') : item?.state?.type) || '';
  const fmt = LABEL_FORMATS.find(f => f.id === item?.state?.formatId)?.label || '';
  const date = item?.state?.meta?.savedAt ? new Date(item.state.meta.savedAt).toLocaleDateString('fr-FR') : '';
  const left = [name, type && type.toUpperCase()].filter(Boolean).join(' · ');
  const right = [fmt, date].filter(Boolean).join(' · ');
  return right ? `${left} — ${right}` : left;
}

function rebuildHistorySelect() {
  const sel = document.getElementById('history-select');
  const items = loadHistory();

  sel.innerHTML = '';
  const optDraft = document.createElement('option');
  optDraft.value = '';
  optDraft.textContent = '— Brouillon (auto) —';
  sel.appendChild(optDraft);

  for (const item of items) {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = formatLabelForHistoryItem(item);
    sel.appendChild(opt);
  }

  sel.value = selectedHistoryId || '';
}

function onSelectHistory(id) {
  selectedHistoryId = id || '';
  const items = loadHistory();
  const found = items.find(x => x.id === selectedHistoryId);
  if (found?.state) {
    applyFormState(found.state);
  } else {
    const draft = loadDraft();
    if (draft) applyFormState(draft);
  }
  persistDraft();
}

function saveToHistory() {
  const items = loadHistory();
  const state = getFormState();

  // If currently selected history item, update it; otherwise create new
  if (selectedHistoryId) {
    const idx = items.findIndex(x => x.id === selectedHistoryId);
    if (idx >= 0) items[idx] = { ...items[idx], state };
    else items.unshift({ id: selectedHistoryId, state });
  } else {
    selectedHistoryId = makeId();
    items.unshift({ id: selectedHistoryId, state });
  }

  // Keep history reasonably sized
  const MAX = 60;
  if (items.length > MAX) items.length = MAX;

  saveHistory(items);
  rebuildHistorySelect();
  persistDraft();
}

function deleteFromHistory() {
  if (!selectedHistoryId) return;
  const items = loadHistory().filter(x => x.id !== selectedHistoryId);
  saveHistory(items);
  selectedHistoryId = '';
  rebuildHistorySelect();
  persistDraft();
}

function duplicateDish() {
  const items = loadHistory();
  const state = getFormState();
  const copy =
    (typeof structuredClone === 'function')
      ? structuredClone(state)
      : safeJSONParse(JSON.stringify(state), state);
  const baseName = (copy?.fields?.productName || '').trim();
  copy.fields.productName = baseName ? `${baseName} (variante)` : 'Nouveau plat (variante)';
  copy.meta = copy.meta || { version: 1 };
  copy.meta.savedAt = new Date().toISOString();

  const newId = makeId();
  items.unshift({ id: newId, state: copy });
  selectedHistoryId = newId;
  saveHistory(items);
  rebuildHistorySelect();
  applyFormState(copy);
  persistDraft();
}

function newDish() {
  selectedHistoryId = '';
  // Minimal reset: clear key fields, keep defaults like temp/allergens
  document.getElementById('product-name').value = '';
  document.getElementById('ingredients').value = '';
  document.getElementById('kj').value = '';
  document.getElementById('kcal').value = '';
  document.getElementById('proteins').value = '';
  document.getElementById('carbs').value = '';
  document.getElementById('fats').value = '';
  document.getElementById('weight').value = '';
  document.getElementById('best-before').value = '';
  document.getElementById('lot').value = '';
  // Restore common defaults
  document.getElementById('bain-marie').value = '10';
  document.getElementById('micro').value = '5';
  updateQR();
  update();
  rebuildHistorySelect();
  persistDraft();
}

function setFormat(formatId, opts = { persist: true }) {
  const fmt = LABEL_FORMATS.find(f => f.id === formatId) || LABEL_FORMATS[0];
  currentFormatId = fmt.id;

  document.documentElement.style.setProperty('--label-width', fmt.css.widthPx + 'px');
  document.documentElement.style.setProperty('--label-height', fmt.css.heightPx + 'px');
  document.documentElement.style.setProperty('--label-radius', fmt.css.radius);
  document.documentElement.style.setProperty('--label-border-width', fmt.css.borderWidthPx + 'px');
  document.documentElement.style.setProperty('--label-print-width', fmt.print.width);
  document.documentElement.style.setProperty('--label-print-height', fmt.print.height);
  document.documentElement.style.setProperty('--label-print-radius', fmt.print.radius);

  const preview = document.getElementById('label-preview');
  preview.setAttribute('data-format', fmt.id);

  // Auto background selection based on format (unless user forced explicit)
  if (currentBackgroundMode === 'auto') {
    applyBackgroundCSS();
  }

  if (opts?.persist !== false) persistDraft();
}

function setBackgroundMode(mode, opts = { persist: true }) {
  currentBackgroundMode = mode || 'auto';
  const sel = document.getElementById('bg-select');
  if (sel) sel.value = currentBackgroundMode;
  applyBackgroundCSS();
  if (opts?.persist !== false) persistDraft();
}

function applyBackgroundCSS() {
  const enabled = !!checked('bg-enabled');
  const isBioLabel = !!checked('bg-bio');
  const preview = document.getElementById('label-preview');
  if (!enabled) {
    document.documentElement.style.setProperty('--label-bg-image', 'none');
    document.documentElement.style.setProperty('--label-border-width', LABEL_FORMATS.find(f => f.id === currentFormatId)?.css.borderWidthPx + 'px');
    preview?.classList.remove('real-background-active');
    return;
  }

  let bg = BACKGROUNDS.find(b => b.id === currentBackgroundMode);
  if (!bg) bg = BACKGROUNDS[0];

  if (bg.id === 'none') {
    document.documentElement.style.setProperty('--label-bg-image', 'none');
    document.documentElement.style.setProperty('--label-border-width', LABEL_FORMATS.find(f => f.id === currentFormatId)?.css.borderWidthPx + 'px');
    preview?.classList.remove('real-background-active');
    return;
  }

  if (bg.id === 'auto') {
    const fmt = LABEL_FORMATS.find(f => f.id === currentFormatId) || LABEL_FORMATS[0];
    let targetId = fmt.defaultBg;
    if (isBioLabel) {
      const bioCandidate = fmt.defaultBg + '_bio';
      if (BACKGROUNDS.some(b => b.id === bioCandidate)) targetId = bioCandidate;
    }
    const autoBg = BACKGROUNDS.find(b => b.id === targetId) || BACKGROUNDS.find(b => b.id === 'none');
    document.documentElement.style.setProperty('--label-bg-image', autoBg?.url || 'none');
    if (autoBg && autoBg.id !== 'none') {
      document.documentElement.style.setProperty('--label-border-width', '0px');
      preview?.classList.add('real-background-active');
    } else {
      document.documentElement.style.setProperty('--label-border-width', fmt.css.borderWidthPx + 'px');
      preview?.classList.remove('real-background-active');
    }
    return;
  }

  document.documentElement.style.setProperty('--label-bg-image', bg.url || 'none');
  if (bg.url) {
    document.documentElement.style.setProperty('--label-border-width', '0px');
    preview?.classList.add('real-background-active');
  } else {
    document.documentElement.style.setProperty('--label-border-width', LABEL_FORMATS.find(f => f.id === currentFormatId)?.css.borderWidthPx + 'px');
    preview?.classList.remove('real-background-active');
  }
}

// ─── DEV CALIBRATION ────────────────────────────────────────────────────────
let devMode = false;
let calibrationConfig = {};

function toggleDevMode() {
  devMode = !devMode;
  const btns = document.querySelectorAll('button[onclick="toggleDevMode()"]');
  btns.forEach(b => b.textContent = devMode ? 'Désactiver le mode calibration' : 'Activer le mode calibration');
  const preview = document.getElementById('label-preview');
  if (!preview) return;
  preview.classList.toggle('dev-mode', devMode);

  const els = preview.querySelectorAll('[data-draggable="1"]');
  els.forEach(el => {
    if (devMode) {
      prepareDraggable(el);
    }
  });
}

function prepareDraggable(el) {
  if (el.dataset._draggableReady) return;
  const container = document.getElementById('label-preview');
  if (!container) return;
  const cRect = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();

  const top = r.top - cRect.top;
  const left = r.left - cRect.left;

  // Spans need to behave like boxes when absolutely positioned (right column text)
  const tag = (el.tagName || '').toLowerCase();
  if (tag === 'span') {
    el.style.display = 'block';
    el.style.whiteSpace = 'pre-wrap';
  }

  el.style.position = 'absolute';
  el.style.top = top + 'px';
  el.style.left = left + 'px';
  el.style.width = r.width + 'px';

  const key = el.dataset.key || el.id || '';
  if (key) {
    if (!calibrationConfig[currentFormatId]) calibrationConfig[currentFormatId] = {};
    calibrationConfig[currentFormatId][key] = { top, left, width: r.width };
  }

  let dragging = false;
  let startX = 0, startY = 0, startTop = 0, startLeft = 0;

  el.addEventListener('mousedown', e => {
    if (!devMode) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startTop = parseFloat(el.style.top || '0');
    startLeft = parseFloat(el.style.left || '0');
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging || !devMode) return;
    const dy = e.clientY - startY;
    const dx = e.clientX - startX;
    const newTop = startTop + dy;
    const newLeft = startLeft + dx;
    el.style.top = newTop + 'px';
    el.style.left = newLeft + 'px';
    const keyMove = el.dataset.key || el.id || '';
    if (keyMove) {
      if (!calibrationConfig[currentFormatId]) calibrationConfig[currentFormatId] = {};
      calibrationConfig[currentFormatId][keyMove] = { top: newTop, left: newLeft, width: parseFloat(el.style.width || r.width) };
    }
  });

  window.addEventListener('mouseup', () => {
    dragging = false;
  });

  el.dataset._draggableReady = '1';
}

function copyCalibrationConfig() {
  const out = document.getElementById('dev-config-output');
  const payload = {
    formats: calibrationConfig,
    currentFormat: currentFormatId
  };
  const json = JSON.stringify(payload, null, 2);
  out.value = json;
  out.focus();
  out.select();
  try {
    document.execCommand('copy');
  } catch (_) {
    // ignore
  }
}

async function exportPNG() {
  const el = document.getElementById('label-preview');
  if (!el || typeof html2canvas !== 'function') {
    alert('html2canvas indisponible. Vérifie ta connexion (CDN) ou la balise <script>.');
    return;
  }

  try {
    await (document.fonts?.ready ?? Promise.resolve());
    // ensure background applied
    applyBackgroundCSS();

    const scale = Math.max(2, Math.min(5, (window.devicePixelRatio || 2) * 2));
    const canvas = await html2canvas(el, {
      backgroundColor: '#ffffff',
      scale,
      useCORS: true
    });

    const name = (val('product-name') || 'etiquette')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/-+/g, '-')
      .replace(/(^-|-$)/g, '')
      .toLowerCase();

    const filename = `${name || 'etiquette'}-${currentFormatId}.png`;

    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = filename;
    a.click();
  } catch (e) {
    console.error(e);
    alert("Export PNG impossible. Si tu ouvres le fichier en 'file://', certaines images de fond peuvent être bloquées. Lance plutôt un mini-serveur local (voir README).");
  }
}

function saveHTML() {
  const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'etiquette-' + (val('product-name') || 'bocal').replace(/\s+/g, '-').toLowerCase() + '.html';
  a.click();
}

// Init
window.addEventListener('load', () => {
  // Fill selects
  const fmtSel = document.getElementById('format-select');
  fmtSel.innerHTML = LABEL_FORMATS.map(f => `<option value="${f.id}">${f.label}</option>`).join('');
  const bgSel = document.getElementById('bg-select');
  bgSel.innerHTML = BACKGROUNDS.map(b => `<option value="${b.id}">${b.label}</option>`).join('');

  // Set default bain-marie and micro
  document.getElementById('bain-marie').value = '10';
  document.getElementById('micro').value = '5';
  document.getElementById('ingredients').value = 'Nouilles chinoises au blé (50%) - Légumes (12%) : Poireaux, choux, oignons, épinards, navets, panais - Huile de pépin, huile de sésame, ail, gingembre, graines de lin, coriandre - Pancetta de veau (20%)';
  document.getElementById('product-name').value = 'Wok Asiatique et Pancetta de Veau';
  document.getElementById('kj').value = '2456';
  document.getElementById('kcal').value = '486';
  document.getElementById('proteins').value = '21.2';
  document.getElementById('carbs').value = '15';
  document.getElementById('fats').value = '8';
  document.getElementById('weight').value = '300';
  document.getElementById('lot').value = 'N°00000';

  // Load persisted settings/draft/history selection
  selectedHistoryId = localStorage.getItem(LS_KEYS.selectedId) || '';
  currentFormatId = localStorage.getItem(LS_KEYS.format) || 'plat8';
  currentBackgroundMode = localStorage.getItem(LS_KEYS.bgMode) || 'auto';

  setFormat(currentFormatId, { persist: false });
  setBackgroundMode(currentBackgroundMode, { persist: false });

  rebuildHistorySelect();

  const draft = loadDraft();
  if (draft) {
    applyFormState(draft);
  } else {
    updateQR();
    update();
    persistDraft();
  }
});

