/* =========================================================
   Chez Tantie — js/main.js
   Burger mobile + lien actif + sélecteur d'ambiance + boutons WhatsApp.
   Autonome. Aucune dépendance.
   ========================================================= */

(function () {
  'use strict';

  var LS_AMBIANCE = 'ct_ambiance';
  var AMBIANCES_VALIDES = ['calme', 'ambiance', 'fete'];
  var AMBIANCE_DEFAUT = 'ambiance';

  /* =========================================================
     1) MENU BURGER
     ========================================================= */

  function initBurger() {
    var burger = document.getElementById('burger');
    var nav    = document.getElementById('site-nav');
    if (!burger || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    function open() {
      nav.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function toggle() {
      if (nav.classList.contains('is-open')) close(); else open();
    }

    burger.addEventListener('click', toggle);

    nav.addEventListener('click', function (e) {
      var t = e.target;
      if (t && t.tagName === 'A') close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });

    var mq = window.matchMedia('(min-width: 768px)');
    function handleMQ(ev) { if (ev.matches) close(); }
    if (mq.addEventListener) mq.addEventListener('change', handleMQ);
    else if (mq.addListener) mq.addListener(handleMQ);
  }

  /* =========================================================
     2) LIEN ACTIF DANS LE HEADER
     ========================================================= */

  function marquerPageActive() {
    var liens = document.querySelectorAll('#site-nav a[href]');
    if (!liens.length) return;

    var path = window.location.pathname || '';
    var fichier = path.substring(path.lastIndexOf('/') + 1);

    if (fichier === '' || fichier === '/') fichier = 'index.html';
    if (fichier === 'le-restaurant') fichier = 'index.html';

    for (var i = 0; i < liens.length; i++) {
      var href = liens[i].getAttribute('href') || '';
      var cible = href.substring(href.lastIndexOf('/') + 1);
      if (cible === fichier) {
        liens[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* =========================================================
     3) SÉLECTEUR D'AMBIANCE
     ========================================================= */

  function lireAmbianceStockee() {
    try {
      var v = localStorage.getItem(LS_AMBIANCE);
      if (AMBIANCES_VALIDES.indexOf(v) !== -1) return v;
    } catch (e) {}
    return AMBIANCE_DEFAUT;
  }

  function stockerAmbiance(a) {
    try { localStorage.setItem(LS_AMBIANCE, a); } catch (e) {}
  }

  function appliquerAmbiance(a) {
    if (AMBIANCES_VALIDES.indexOf(a) === -1) a = AMBIANCE_DEFAUT;

    var body = document.body;
    body.classList.remove('ambiance-calme', 'ambiance', 'ambiance-fete');
    if (a === 'calme')    body.classList.add('ambiance-calme');
    else if (a === 'fete') body.classList.add('ambiance-fete');
    else                   body.classList.add('ambiance');

    var boutons = document.querySelectorAll('[data-ambiance]');
    for (var i = 0; i < boutons.length; i++) {
      var b = boutons[i];
      var val = b.getAttribute('data-ambiance');
      b.setAttribute('aria-pressed', val === a ? 'true' : 'false');
    }

    stockerAmbiance(a);
  }

  function initAmbiance() {
    var boutons = document.querySelectorAll('[data-ambiance]');
    if (boutons.length) {
      for (var i = 0; i < boutons.length; i++) {
        boutons[i].addEventListener('click', function () {
          var val = this.getAttribute('data-ambiance');
          appliquerAmbiance(val);
        });
      }
    }
    appliquerAmbiance(lireAmbianceStockee());
  }

  /* =========================================================
     4) BOUTONS WHATSAPP (FAB + bouton page contact)
     ========================================================= */

  function numeroEstPlaceholder(num) {
    if (!num || typeof num !== 'string') return true;
    return /X{6,}/i.test(num) || /^225X+/i.test(num);
  }

  function cableBoutonWhatsapp(btn, num, estPlaceholder) {
    if (!btn) return;

    if (estPlaceholder) {
      btn.classList.add('is-placeholder');
      btn.setAttribute('aria-label', 'Numéro WhatsApp non configuré (démo)');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        alert(
          "Numéro WhatsApp non configuré pour cette démo.\n\n" +
          "Remplacer \"whatsapp\" dans data/configuration.json " +
          "par un vrai numéro au format international (ex : 2250700000000)."
        );
      });
    } else {
      var msg = 'Bonjour Chez Tantie !';
      btn.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
      btn.target = '_blank';
      btn.rel = 'noopener';
    }
  }

  function initWhatsapp() {
    var fab = document.getElementById('whatsapp-fab');
    var btnContact = document.getElementById('contact-whatsapp');
    if (!fab && !btnContact) return;

    fetch('data/configuration.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (cfg) {
        var num = (cfg && typeof cfg.whatsapp === 'string') ? cfg.whatsapp.replace(/\s+/g, '') : '';
        var placeholder = numeroEstPlaceholder(num) || (cfg && cfg.whatsapp_est_placeholder === true);

        cableBoutonWhatsapp(fab, num, placeholder);
        cableBoutonWhatsapp(btnContact, num, placeholder);
      })
      .catch(function () {
        if (fab) {
          fab.classList.add('is-placeholder');
          fab.addEventListener('click', function (e) {
            e.preventDefault();
            alert("Impossible de charger la configuration WhatsApp pour l'instant.");
          });
        }
        if (btnContact) {
          btnContact.classList.add('is-placeholder');
          btnContact.addEventListener('click', function (e) {
            e.preventDefault();
            alert("Impossible de charger la configuration WhatsApp pour l'instant.");
          });
        }
      });
  }

  /* =========================================================
     INITIALISATION
     ========================================================= */

  function init() {
    initBurger();
    marquerPageActive();
    initAmbiance();
    initWhatsapp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
