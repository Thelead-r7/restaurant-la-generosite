/* =========================================================
   Chez Tantie — js/main.js
   Burger + lien actif + ambiance + bouton WhatsApp (mono-numéro)
   ========================================================= */

(function () {
  'use strict';

  var LS_AMBIANCE = 'ct_ambiance';
  var AMBIANCES_VALIDES = ['calme', 'ambiance', 'fete'];
  var AMBIANCE_DEFAUT = 'ambiance';

  /* ---------- 1) Burger ---------- */
  function initBurger() {
    var burger = document.getElementById('burger');
    var nav    = document.getElementById('site-nav');
    if (!burger || !nav) return;
    function close() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
    function open() { nav.classList.add('is-open'); burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
    function toggle() { nav.classList.contains('is-open') ? close() : open(); }
    burger.addEventListener('click', toggle);
    nav.addEventListener('click', function(e){ if(e.target && e.target.tagName==='A') close(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && nav.classList.contains('is-open')) close(); });
    var mq = window.matchMedia('(min-width: 768px)');
    function h(ev){ if(ev.matches) close(); }
    mq.addEventListener ? mq.addEventListener('change', h) : mq.addListener(h);
  }

  /* ---------- 2) Lien actif ---------- */
  function marquerPageActive() {
    var liens = document.querySelectorAll('#site-nav a[href]');
    if (!liens.length) return;
    var path = window.location.pathname || '';
    var fichier = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    for (var i = 0; i < liens.length; i++) {
      var href = liens[i].getAttribute('href') || '';
      var cible = href.substring(href.lastIndexOf('/') + 1);
      if (cible === fichier) liens[i].setAttribute('aria-current', 'page');
    }
  }

  /* ---------- 3) Ambiance ---------- */
  function lireAmbiance() {
    try { var v = localStorage.getItem(LS_AMBIANCE); if (AMBIANCES_VALIDES.indexOf(v)!==-1) return v; } catch(e){}
    return AMBIANCE_DEFAUT;
  }
  function appliquerAmbiance(a) {
    if (AMBIANCES_VALIDES.indexOf(a)===-1) a = AMBIANCE_DEFAUT;
    var body = document.body;
    body.classList.remove('ambiance-calme','ambiance','ambiance-fete');
    body.classList.add(a==='calme'?'ambiance-calme':a==='fete'?'ambiance-fete':'ambiance');
    var b = document.querySelectorAll('[data-ambiance]');
    for (var i=0;i<b.length;i++) b[i].setAttribute('aria-pressed', b[i].getAttribute('data-ambiance')===a?'true':'false');
    try { localStorage.setItem(LS_AMBIANCE, a); } catch(e){}
  }
  function initAmbiance() {
    var b = document.querySelectorAll('[data-ambiance]');
    for (var i=0;i<b.length;i++) b[i].addEventListener('click', function(){ appliquerAmbiance(this.getAttribute('data-ambiance')); });
    appliquerAmbiance(lireAmbiance());
  }

  /* ---------- 4) WhatsApp (mono-numéro) ---------- */
  function estPlaceholder(num) {
    if (!num || typeof num !== 'string') return true;
    return /X{6,}/i.test(num) || /^225X+/i.test(num);
  }

  function cableBoutonWhatsapp(btn, num, isPlaceholder) {
    if (!btn) return;
    if (isPlaceholder) {
      btn.classList.add('is-placeholder');
      btn.addEventListener('click', function(e){
        e.preventDefault();
        alert("Numéro WhatsApp non configuré pour cette démo.\n\nRemplacer \"whatsapp\" dans data/configuration.json par un vrai numéro (ex : 2250700000000).");
      });
    } else {
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var msg = 'Bonjour Chez Tantie !';
        var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank', 'noopener');
      });
    }
  }

  function initWhatsapp() {
    var fab = document.getElementById('whatsapp-fab');
    var btnContact = document.getElementById('contact-whatsapp');
    if (!fab && !btnContact) return;

    fetch('data/configuration.json', { cache: 'no-cache' })
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(cfg){
        var num = (cfg && typeof cfg.whatsapp === 'string') ? cfg.whatsapp.replace(/\s+/g,'') : '';
        var ph = estPlaceholder(num) || (cfg && cfg.whatsapp_est_placeholder === true);
        cableBoutonWhatsapp(fab, num, ph);
        cableBoutonWhatsapp(btnContact, num, ph);
      })
      .catch(function(){ console.warn('[whatsapp] Config indisponible'); });
  }

  /* ---------- Init ---------- */
  function init() {
    initBurger();
    marquerPageActive();
    initAmbiance();
    initWhatsapp();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
