// Script classique (pas de module) : fonctionne en ligne ET en ouvrant index.html directement (file://).
(function () {
'use strict';
const { LOCALES, DEFAULT_LOCALE, detectLocale, t } = window.FSHS_I18N;

// ---------------------------------------------------------------------------
// Configuration — à modifier ici sans toucher au reste du code.
// ---------------------------------------------------------------------------
const CONFIG = {
  /** Ouverture : 20 novembre 2026, 00:00 heure de Kinshasa (UTC+01:00). Instant absolu, indépendant du fuseau du visiteur. */
  launchAt: '2026-11-20T00:00:00+01:00',
  /** Numéro au format international, sans espaces ni « + » (pour wa.me). */
  whatsappNumber: '243904947476',
  phone: '+243904947476',
  email: 'contact@fondationstarkhold.org',
  /** Réseaux sociaux : une URL vide masque l'icône (et le bloc entier si toutes sont vides). */
  social: {
    x: '',
    linkedin: '',
    facebook: '',
  },
  /** Hôtes sur lesquels le paramètre ?now= (date simulée) est accepté. Jamais en production. */
  devHosts: ['localhost', '127.0.0.1', '[::1]', ''],
  storageKey: 'fshs-locale',
};

const LAUNCH_MS = Date.parse(CONFIG.launchAt);

// ---------------------------------------------------------------------------
// Horloge (avec date simulée ?now= en développement uniquement)
// ---------------------------------------------------------------------------
function clockOffset() {
  if (!CONFIG.devHosts.includes(location.hostname)) return 0;
  const raw = new URLSearchParams(location.search).get('now');
  if (!raw) return 0;
  const simulated = /^\d+$/.test(raw) ? Number(raw) : Date.parse(raw);
  return Number.isFinite(simulated) ? simulated - Date.now() : 0;
}
const offset = clockOffset();
const now = () => Date.now() + offset;

/** Décompose une durée (ms) en jours, heures, minutes, secondes. */
function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

// ---------------------------------------------------------------------------
// Langue
// ---------------------------------------------------------------------------
function readStoredLocale() {
  try {
    const v = localStorage.getItem(CONFIG.storageKey);
    return LOCALES.includes(v) ? v : null;
  } catch {
    return null;
  }
}
function storeLocale(locale) {
  try {
    localStorage.setItem(CONFIG.storageKey, locale);
  } catch {
    /* stockage indisponible (navigation privée, blocage) : on ignore */
  }
}

let locale = readStoredLocale() || detectLocale(navigator.languages || [navigator.language]);
let live = false;

function applyLocale() {
  document.documentElement.lang = locale;
  document.title = t(locale, 'meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t(locale, 'meta.description'));
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(locale, el.dataset.i18n);
  for (const el of document.querySelectorAll('[data-i18n-aria]')) el.setAttribute('aria-label', t(locale, el.dataset.i18nAria));
  for (const btn of document.querySelectorAll('[data-locale]')) btn.setAttribute('aria-pressed', String(btn.dataset.locale === locale));

  const wa = document.getElementById('cta-whatsapp');
  if (wa) wa.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(t(locale, 'contact.whatsappMessage'))}`;

  if (live) showLive(false);
  lastAnnouncedMinute = -1; // ré-annonce dans la nouvelle langue au prochain tic
}

function setupLocaleSwitch() {
  for (const btn of document.querySelectorAll('[data-locale]')) {
    btn.addEventListener('click', () => {
      if (btn.dataset.locale === locale) return;
      locale = btn.dataset.locale;
      storeLocale(locale);
      applyLocale();
      tick();
    });
  }
}

// ---------------------------------------------------------------------------
// Liens de contact et réseaux
// ---------------------------------------------------------------------------
function setupLinks() {
  const call = document.getElementById('cta-call');
  if (call) call.href = `tel:${CONFIG.phone}`;
  const mail = document.getElementById('cta-email');
  if (mail) mail.href = `mailto:${CONFIG.email}`;

  const list = document.getElementById('social');
  if (!list) return;
  let visible = 0;
  for (const li of list.querySelectorAll('[data-network]')) {
    const url = (CONFIG.social[li.dataset.network] || '').trim();
    li.hidden = !url;
    if (url) {
      li.querySelector('a').href = url;
      visible += 1;
    }
  }
  const block = document.getElementById('social-block');
  if (block) block.hidden = visible === 0;
}

// ---------------------------------------------------------------------------
// Compte à rebours
// ---------------------------------------------------------------------------
const pad = (n) => String(n).padStart(2, '0');
let lastAnnouncedMinute = -1;
let timer = 0;

function showLive(announce) {
  live = true;
  document.body.classList.add('is-live');
  const title = document.getElementById('hero-title');
  if (title) title.textContent = t(locale, 'live.title');
  const date = document.getElementById('hero-date');
  if (date) date.textContent = t(locale, 'live.text');
  const panel = document.getElementById('live');
  const countdown = document.getElementById('countdown');
  if (panel) panel.hidden = false;
  if (countdown) countdown.hidden = true;
  if (announce) {
    const region = document.getElementById('countdown-status');
    if (region) region.textContent = t(locale, 'live.title');
  }
}

function tick() {
  const remaining = LAUNCH_MS - now();
  if (remaining <= 0) {
    clearTimeout(timer);
    if (!live) showLive(true);
    return;
  }
  const { d, h, m, s } = splitDuration(remaining);
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el && el.textContent !== v) el.textContent = v;
  };
  set('cd-d', pad(d));
  set('cd-h', pad(h));
  set('cd-m', pad(m));
  set('cd-s', pad(s));

  // Lecteurs d'écran : au plus une annonce par minute.
  const minuteKey = d * 1440 + h * 60 + m;
  if (minuteKey !== lastAnnouncedMinute) {
    lastAnnouncedMinute = minuteKey;
    const region = document.getElementById('countdown-status');
    if (region) region.textContent = t(locale, 'countdown.live', { d, h, m });
  }

  clearTimeout(timer);
  // Recalé sur la seconde suivante pour éviter la dérive de setInterval.
  timer = setTimeout(tick, 1000 - (now() % 1000) + 5);
}

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------
if (!LOCALES.includes(locale)) locale = DEFAULT_LOCALE;
setupLinks();
setupLocaleSwitch();
applyLocale();
tick();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') tick();
});
document.documentElement.classList.add('js');
})();
