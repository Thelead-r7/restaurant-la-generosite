/* =========================================================
   Chez Tantie — js/i18n.js
   Bilingue FR (défaut) / Nouchi
   Fallback sur fr.json si clé absente dans nouchi.json.
   Expose : window.ctApplyLang(lang)
   ========================================================= */

(function () {
  'use strict';

  var LS_KEY = 'ct_lang';
  var DICT = { fr: null, nouchi: null };
  var currentLang = 'fr';
  var warned = false;

  /* ---------- Utilitaires ---------- */

  function readStoredLang() {
    try {
      var v = localStorage.getItem(LS_KEY);
      return (v === 'fr' || v === 'nouchi') ? v : 'fr';
    } catch (e) {
      return 'fr';
    }
  }

  function storeLang(lang) {
    try { localStorage.setItem(LS_KEY, lang); } catch (e) {}
  }

  /**
   * Récupère la valeur traduite pour une clé donnée.
   * Fallback : nouchi -> fr -> chaîne vide.
   */
  function t(key) {
    var dict = DICT[currentLang];
    if (dict && Object.prototype.hasOwnProperty.call(dict, key) && dict[key] !== '') {
      return dict[key];
    }
    if (DICT.fr && Object.prototype.hasOwnProperty.call(DICT.fr, key)) {
      return DICT.fr[key];
    }
    return '';
  }

  /* ---------- Application au DOM ---------- */

  function applyTextNodes() {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var key = el.getAttribute('data-i18n');
      if (!key) continue;
      var val = t(key);
      if (val === '') continue;

      // Si l'élément n'a pas d'enfants éléments, textContent suffit
      el.textContent = val;
    }
  }

  function applyAttrNodes() {
    // Syntaxe : data-i18n-attr="placeholder:resa.nom"
    // Supporte plusieurs paires séparées par ";"
    var nodes = document.querySelectorAll('[data-i18n-attr]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var spec = el.getAttribute('data-i18n-attr');
      if (!spec) continue;

      var pairs = spec.split(';');
      for (var j = 0; j < pairs.length; j++) {
        var pair = pairs[j].trim();
        if (!pair) continue;
        var sep = pair.indexOf(':');
        if (sep === -1) continue;

        var attr = pair.slice(0, sep).trim();
        var key  = pair.slice(sep + 1).trim();
        if (!attr || !key) continue;

        var val = t(key);
        if (val === '') continue;

        el.setAttribute(attr, val);
      }
    }
  }

  function updateLangToggle() {
    var btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.textContent = (currentLang === 'fr') ? 'FR' : 'NOUCHI';
    btn.setAttribute(
      'aria-label',
      (currentLang === 'fr')
        ? 'Langue actuelle : Français. Basculer en Nouchi.'
        : 'Langue actuelle : Nouchi. Basculer en Français.'
    );
    // Indique la langue au document (utile pour CSS ciblé plus tard)
    document.documentElement.setAttribute('lang', currentLang === 'nouchi' ? 'fr-CI' : 'fr');
  }

  function refresh() {
    applyTextNodes();
    applyAttrNodes();
    updateLangToggle();
  }

  /* ---------- Changement de langue ---------- */

  /**
   * Change la langue courante, applique les traductions, sauvegarde.
   * @param {string} lang 'fr' ou 'nouchi'
   */
  function ctApplyLang(lang) {
    if (lang !== 'fr' && lang !== 'nouchi') lang = 'fr';
    currentLang = lang;
    storeLang(lang);
    refresh();
  }

  /* ---------- Chargement des dictionnaires ---------- */

  function fetchJSON(path) {
    return fetch(path, { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status + ' sur ' + path);
        return res.json();
      });
  }

  function init() {
    currentLang = readStoredLang();

    var frP    = fetchJSON('lang/fr.json');
    var nouP   = fetchJSON('lang/nouchi.json');

    Promise.all([
      frP.catch(function (err) { return { __error: err, __file: 'fr.json' }; }),
      nouP.catch(function (err) { return { __error: err, __file: 'nouchi.json' }; })
    ]).then(function (results) {
      var fr    = results[0];
      var nou   = results[1];

      if (!fr || fr.__error) {
        if (!warned) {
          warned = true;
          console.warn('[i18n] Impossible de charger lang/fr.json — textes HTML conservés.');
        }
      } else {
        DICT.fr = fr;
      }

      if (!nou || nou.__error) {
        if (!warned && DICT.fr) {
          warned = true;
          console.warn('[i18n] Impossible de charger lang/nouchi.json — fallback FR actif.');
        }
      } else {
        DICT.nouchi = nou;
      }

      refresh();

      // Branchement du bouton FR/NOUCHI (peut exister ou non sur la page)
      var btn = document.getElementById('lang-toggle');
      if (btn) {
        btn.addEventListener('click', function () {
          ctApplyLang(currentLang === 'fr' ? 'nouchi' : 'fr');
        });
      }
    });
  }

  /* ---------- Exports ---------- */

  // Seule variable globale autorisée par le brief.
  window.ctApplyLang = ctApplyLang;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
