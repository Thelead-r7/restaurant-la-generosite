/* =========================================================
   Chez Tantie — js/galerie.js
   Filtres + lightbox. Images en HTML. Aucune dépendance.
   ========================================================= */

(function () {
  'use strict';

  var racine = document.getElementById('galerie');
  if (!racine) return;

  var lightbox      = document.getElementById('lightbox');
  var lightboxImg   = document.getElementById('lightbox-img');
  var lightboxPh    = document.getElementById('lightbox-placeholder');
  var lightboxTitre = document.getElementById('lightbox-titre');
  var lightboxDesc  = document.getElementById('lightbox-desc');
  var lightboxClose = document.getElementById('lightbox-close');

  var dernierFocus = null;

  /* ---------- Filtres ---------- */

  function initFiltres() {
    var boutons = document.querySelectorAll('[data-filtre]');
    var items   = racine.querySelectorAll('.galerie-item');
    if (!boutons.length) return;

    function appliquer(valeur) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var cat = it.getAttribute('data-cat') || '';
        var visible = (valeur === 'tout') || (cat === valeur);
        if (visible) it.classList.remove('is-hidden');
        else         it.classList.add('is-hidden');
      }
      for (var k = 0; k < boutons.length; k++) {
        var b = boutons[k];
        b.setAttribute('aria-pressed', b.getAttribute('data-filtre') === valeur ? 'true' : 'false');
      }
    }

    for (var i = 0; i < boutons.length; i++) {
      boutons[i].addEventListener('click', function () {
        appliquer(this.getAttribute('data-filtre') || 'tout');
      });
    }

    // Etat initial : premier bouton actif, filtre = sa valeur
    var initial = boutons[0].getAttribute('data-filtre') || 'tout';
    appliquer(initial);
  }

  /* ---------- Lightbox ---------- */

  function ouvrirLightbox(item) {
    if (!lightbox) return;

    var img   = item.querySelector('img');
    var titre = item.getAttribute('data-titre') || '';
    var desc  = item.getAttribute('data-desc') || '';
    var emoji = item.getAttribute('data-emoji') || '📷';
    var coul  = item.getAttribute('data-couleur') || 'var(--ct-accent)';

    // Reset des deux modes
    if (lightboxImg) { lightboxImg.style.display = 'none'; lightboxImg.removeAttribute('src'); lightboxImg.alt = ''; }
    if (lightboxPh)  { lightboxPh.style.display = 'none'; lightboxPh.textContent = ''; lightboxPh.style.background = ''; }

    if (img && img.getAttribute('src')) {
      if (lightboxImg) {
        lightboxImg.src = img.getAttribute('src');
        lightboxImg.alt = img.getAttribute('alt') || titre;
        lightboxImg.style.display = 'block';
      }
    } else {
      if (lightboxPh) {
        lightboxPh.textContent = emoji;
        lightboxPh.style.background = coul;
        lightboxPh.style.display = 'flex';
      }
    }

    if (lightboxTitre) lightboxTitre.textContent = titre;
    if (lightboxDesc)  lightboxDesc.textContent  = desc;

    dernierFocus = document.activeElement;

    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (lightboxClose) {
      try { lightboxClose.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function fermerLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (dernierFocus && typeof dernierFocus.focus === 'function') {
      try { dernierFocus.focus({ preventScroll: true }); } catch (e) {}
    }
    dernierFocus = null;
  }

  function initLightbox() {
    if (!lightbox) return;

    var items = racine.querySelectorAll('.galerie-item');
    for (var i = 0; i < items.length; i++) {
      items[i].addEventListener('click', function (e) {
        // Si l'item est un lien ou bouton, on empêche la navigation
        e.preventDefault();
        ouvrirLightbox(this);
      });
      // Clavier : Entrée / Espace
      items[i].setAttribute('tabindex', '0');
      items[i].setAttribute('role', 'button');
      items[i].addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ouvrirLightbox(this);
        }
      });
    }

    if (lightboxClose) lightboxClose.addEventListener('click', fermerLightbox);

    // Clic sur l'overlay (hors contenu)
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) fermerLightbox();
    });

    // Échap
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fermerLightbox();
    });
  }

  /* ---------- Init ---------- */

  function init() {
    initFiltres();
    initLightbox();
    if (lightbox) lightbox.setAttribute('aria-hidden', 'true');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
