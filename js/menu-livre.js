/* =========================================================
   Chez Tantie — js/menu-livre.js
   Livre animé : couverture + 6 pages de catégories.
   Charge data/plats.json. Navigation boutons + swipe.
   Fallback statique si fetch échoue ou reduced-motion.
   ========================================================= */

(function () {
  'use strict';

  var root = document.getElementById('menu-livre');
  if (!root) return;

  /* ---------- Références DOM (peuvent être null au 1er passage) ---------- */
  var couverture  = document.getElementById('livre-couverture');
  var boutonOuvrir= document.getElementById('livre-ouvrir');
  var zonePages   = document.getElementById('livre-pages');
  var boutonPrev  = document.getElementById('livre-prev');
  var boutonNext  = document.getElementById('livre-next');
  var indicateur  = document.getElementById('livre-indicateur');

  /* ---------- État ---------- */
  var CATEGORIES = [];
  var PLATS = [];
  var INDEX = 0;
  var TOTAL = 0;
  var ANIM_REDUITES = false;

  /* ---------- Utilitaires ---------- */

  // Formate un entier en FCFA avec séparateur d'espace fine insécable.
  function formatPrix(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '';
    var s = String(Math.round(n));
    // Regroupe par milliers : "1500" -> "1 500"
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
    return s + ' FCFA';
  }

  // Choisit la meilleure valeur selon la langue courante, sinon fallback.
  function pickLang(obj, base) {
    var lang = 'fr';
    try {
      var l = localStorage.getItem('ct_lang');
      if (l === 'nouchi') lang = 'nouchi';
    } catch (e) {}
    if (lang === 'nouchi') {
      var vN = obj[base + '_nouchi'];
      if (typeof vN === 'string' && vN.trim() !== '') return vN;
    }
    var vF = obj[base + '_fr'];
    return (typeof vF === 'string') ? vF : '';
  }

  /* ---------- Rendu des plats d'une catégorie ---------- */

  function platsDeCategorie(catId) {
    var out = [];
    for (var i = 0; i < PLATS.length; i++) {
      if (PLATS[i].categorie === catId) out.push(PLATS[i]);
    }
    return out;
  }

  function creerCartePlat(plat) {
    var carte = document.createElement('article');
    carte.className = 'plat';
    if (plat.disponible === false) carte.classList.add('is-indisponible');

    // Emoji ou image
    var visuel = document.createElement('div');
    visuel.className = 'plat-visuel';
    if (plat.image) {
      var img = document.createElement('img');
      img.src = plat.image;
      img.alt = '';
      img.loading = 'lazy';
      visuel.appendChild(img);
    } else {
      var em = document.createElement('span');
      em.className = 'plat-emoji';
      em.setAttribute('aria-hidden', 'true');
      em.textContent = plat.emoji || '🍽️';
      visuel.appendChild(em);
    }

    // Bloc texte
    var corps = document.createElement('div');
    corps.className = 'plat-corps';

    var nom = document.createElement('h3');
    nom.className = 'plat-nom';
    nom.textContent = pickLang(plat, 'nom');

    var desc = document.createElement('p');
    desc.className = 'plat-desc';
    desc.textContent = pickLang(plat, 'desc');

    var pied = document.createElement('div');
    pied.className = 'plat-pied';

    var prix = document.createElement('span');
    prix.className = 'plat-prix';
    prix.textContent = formatPrix(plat.prix);

    pied.appendChild(prix);

    if (plat.disponible === false) {
      var flag = document.createElement('span');
      flag.className = 'plat-flag';
      flag.textContent = 'Indisponible';
      pied.appendChild(flag);
    }

    corps.appendChild(nom);
    if (desc.textContent) corps.appendChild(desc);
    corps.appendChild(pied);

    carte.appendChild(visuel);
    carte.appendChild(corps);
    return carte;
  }

  function creerPageCategorie(cat) {
    var page = document.createElement('section');
    page.className = 'livre-page';
    page.setAttribute('data-cat', cat.id);

    var entete = document.createElement('header');
    entete.className = 'livre-page-entete';

    var em = document.createElement('span');
    em.className = 'livre-page-emoji';
    em.setAttribute('aria-hidden', 'true');
    em.textContent = cat.emoji || '🍽️';

    var titre = document.createElement('h2');
    titre.className = 'livre-page-titre';
    titre.textContent = cat.id; // sera remplacé par le HTML statique via i18n si besoin
    // On met un label lisible (majuscule initiale)
    titre.textContent = cat.id.charAt(0).toUpperCase() + cat.id.slice(1);

    entete.appendChild(em);
    entete.appendChild(titre);

    var liste = document.createElement('div');
    liste.className = 'livre-page-liste';

    var plats = platsDeCategorie(cat.id);
    if (!plats.length) {
      var vide = document.createElement('p');
      vide.className = 'livre-vide';
      vide.textContent = 'Aucun plat dans cette catégorie pour le moment.';
      liste.appendChild(vide);
    } else {
      for (var i = 0; i < plats.length; i++) {
        liste.appendChild(creerCartePlat(plats[i]));
      }
    }

    page.appendChild(entete);
    page.appendChild(liste);
    return page;
  }

  /* ---------- Construction du livre ---------- */

  function construire() {
    if (!zonePages) return;

    // Nettoie (utile si on reconstruit)
    while (zonePages.firstChild) zonePages.removeChild(zonePages.firstChild);

    for (var i = 0; i < CATEGORIES.length; i++) {
      zonePages.appendChild(creerPageCategorie(CATEGORIES[i]));
    }

    TOTAL = CATEGORIES.length;
    INDEX = 0;
    afficherPage(0, false);
  }

  /* ---------- Navigation ---------- */

  function afficherPage(i, avecAnim) {
    if (!zonePages) return;
    if (i < 0) i = 0;
    if (i > TOTAL - 1) i = TOTAL - 1;
    if (i === INDEX && zonePages.children.length && avecAnim !== false) {
      // Rien à faire : déjà sur la page
    }
    INDEX = i;

    var pages = zonePages.children;
    for (var k = 0; k < pages.length; k++) {
      var p = pages[k];
      if (k === i) {
        p.classList.add('is-active');
        p.removeAttribute('aria-hidden');
      } else {
        p.classList.remove('is-active');
        p.setAttribute('aria-hidden', 'true');
      }
    }

    if (boutonPrev) boutonPrev.disabled = (i === 0);
    if (boutonNext) boutonNext.disabled = (i === TOTAL - 1);
    if (indicateur) {
      indicateur.textContent = (i + 1) + ' / ' + TOTAL;
    }
  }

  function suivant() { afficherPage(INDEX + 1, true); }
  function precedent() { afficherPage(INDEX - 1, true); }

  /* ---------- Ouverture de la couverture ---------- */

  function ouvrirLivre() {
    if (!root) return;
    root.classList.add('is-open');
    if (couverture) couverture.setAttribute('aria-hidden', 'true');
    if (zonePages) zonePages.removeAttribute('aria-hidden');
    // Après ouverture, place le focus sur la première page pour l'a11y
    var active = zonePages && zonePages.children[INDEX];
    if (active) {
      active.setAttribute('tabindex', '-1');
      try { active.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  /* ---------- Swipe tactile ---------- */

  function initSwipe() {
    if (!zonePages) return;
    var x0 = 0, y0 = 0, t0 = 0;

    zonePages.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      t0 = Date.now();
    }, { passive: true });

    zonePages.addEventListener('touchend', function (e) {
      if (!e.changedTouches || !e.changedTouches.length) return;
      var x1 = e.changedTouches[0].clientX;
      var y1 = e.changedTouches[0].clientY;
      var dt = Date.now() - t0;
      var dx = x1 - x0;
      var dy = y1 - y0;

      // Rejette si geste vertical dominant ou trop lent
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (dt > 800) return;
      if (Math.abs(dx) < 40) return;

      if (dx < 0) suivant(); else precedent();
    }, { passive: true });
  }

  /* ---------- Clavier ---------- */

  function initClavier() {
    document.addEventListener('keydown', function (e) {
      if (!root.classList.contains('is-open')) return;
      if (e.key === 'ArrowRight') { suivant(); }
      else if (e.key === 'ArrowLeft') { precedent(); }
    });
  }

  /* ---------- Fallback statique (fetch échoué) ---------- */

  function afficherFallback() {
    if (!root) return;
    // On vide et on remplace par un message clair
    while (root.firstChild) root.removeChild(root.firstChild);

    var box = document.createElement('div');
    box.className = 'livre-erreur';

    var h = document.createElement('h2');
    h.textContent = 'Menu momentanément indisponible';

    var p = document.createElement('p');
    p.textContent = "Impossible de charger les plats pour l'instant. Réessayez plus tard.";

    box.appendChild(h);
    box.appendChild(p);
    root.appendChild(box);
  }

  /* ---------- Initialisation ---------- */

  function init() {
    ANIM_REDUITES = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (ANIM_REDUITES) root.classList.add('anim-reduite');

    fetch('data/plats.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !Array.isArray(data.categories) || !Array.isArray(data.plats)) {
          throw new Error('Structure de plats.json invalide');
        }

        CATEGORIES = data.categories.slice().sort(function (a, b) {
          return (a.ordre || 0) - (b.ordre || 0);
        });
        PLATS = data.plats;

        construire();

        if (boutonOuvrir) boutonOuvrir.addEventListener('click', ouvrirLivre);
        if (boutonPrev)   boutonPrev.addEventListener('click', precedent);
        if (boutonNext)   boutonNext.addEventListener('click', suivant);

        initSwipe();
        initClavier();
      })
      .catch(function (err) {
        console.error('[menu-livre]', err && err.message ? err.message : err);
        afficherFallback();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
