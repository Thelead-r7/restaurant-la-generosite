/* =========================================================
   Chez Tantie — js/reservation.js
   Validation + ouverture WhatsApp (wa.me). Aucun backend.
   ========================================================= */

(function () {
  'use strict';

  var form = document.getElementById('form-reservation');
  if (!form) return;

  var champNom    = document.getElementById('resa-nom');
  var champTel    = document.getElementById('resa-tel');
  var champDate   = document.getElementById('resa-date');
  var champHeure  = document.getElementById('resa-heure');
  var champPers   = document.getElementById('resa-personnes');
  var champMsg    = document.getElementById('resa-message');
  var zoneStatut  = document.getElementById('resa-statut');

  var CFG = null; // configuration.json chargée

  /* ---------- Utilitaires ---------- */

  function messageErreur(champ, texte) {
    if (!champ) return;
    var id = champ.id + '-erreur';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('span');
      el.id = id;
      el.className = 'champ-erreur';
      el.setAttribute('role', 'alert');
      // Insère juste après le champ
      if (champ.parentNode) champ.parentNode.insertBefore(el, champ.nextSibling);
    }
    el.textContent = texte || '';
    if (texte) {
      champ.setAttribute('aria-invalid', 'true');
      champ.setAttribute('aria-describedby', id);
    } else {
      champ.removeAttribute('aria-invalid');
      champ.removeAttribute('aria-describedby');
    }
  }

  function effacerErreur(champ) { messageErreur(champ, ''); }

  function setStatut(texte, estErreur) {
    if (!zoneStatut) return;
    zoneStatut.textContent = texte || '';
    zoneStatut.classList.toggle('is-erreur', !!estErreur);
    zoneStatut.classList.toggle('is-succes', !!texte && !estErreur);
  }

  function aujourdhuiISO() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var j = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + j;
  }

  function telValide(v) {
    if (!v) return false;
    var chiffres = v.replace(/[\s\-\+\.\(\)]/g, '');
    return /^\d{8,15}$/.test(chiffres);
  }

  /* ---------- Validation ---------- */

  function valider() {
    var ok = true;

    // Nom
    var nom = (champNom && champNom.value ? champNom.value.trim() : '');
    if (nom.length < 2) {
      messageErreur(champNom, 'Indiquez votre nom (2 caractères minimum).');
      ok = false;
    } else effacerErreur(champNom);

    // Téléphone
    var tel = (champTel && champTel.value ? champTel.value.trim() : '');
    if (!telValide(tel)) {
      messageErreur(champTel, 'Numéro invalide. 8 à 15 chiffres attendus.');
      ok = false;
    } else effacerErreur(champTel);

    // Date
    var date = (champDate && champDate.value ? champDate.value : '');
    if (!date) {
      messageErreur(champDate, 'Choisissez une date.');
      ok = false;
    } else if (date < aujourdhuiISO()) {
      messageErreur(champDate, 'La date ne peut pas être dans le passé.');
      ok = false;
    } else effacerErreur(champDate);

    // Heure
    var heure = (champHeure && champHeure.value ? champHeure.value : '');
    if (!heure) {
      messageErreur(champHeure, 'Choisissez une heure.');
      ok = false;
    } else effacerErreur(champHeure);

    // Personnes
    var pers = parseInt(champPers && champPers.value ? champPers.value : '', 10);
    if (isNaN(pers) || pers < 1 || pers > 30) {
      messageErreur(champPers, 'Indiquez un nombre entre 1 et 30.');
      ok = false;
    } else effacerErreur(champPers);

    // Message : pas de contrainte de longueur imposée ici (facultatif)

    return ok;
  }

  /* ---------- Construction du message WhatsApp ---------- */

  function construireMessage() {
    var nom   = (champNom.value || '').trim();
    var tel   = (champTel.value || '').trim();
    var date  = champDate.value || '';
    var heure = champHeure.value || '';
    var pers  = champPers.value || '';
    var msg   = (champMsg && champMsg.value) ? champMsg.value.trim() : '';

    var lignes = [
      'Bonjour Chez Tantie !',
      'Je souhaite réserver une table.',
      '',
      'Nom : ' + nom,
      'Téléphone : ' + tel,
      'Date : ' + date,
      'Heure : ' + heure,
      'Personnes : ' + pers
    ];
    if (msg) lignes.push('Message : ' + msg);

    return lignes.join('\n');
  }

  /* ---------- Envoi ---------- */

  function numeroPlaceholder(num, cfg) {
    if (!num || typeof num !== 'string') return true;
    if (cfg && cfg.whatsapp_est_placeholder === true) return true;
    if (/X{6,}/i.test(num)) return true;
    if (/^225X+/i.test(num)) return true;
    return false;
  }

  function envoyer(e) {
    if (e) e.preventDefault();
    setStatut('', false);

    if (!valider()) {
      setStatut('Merci de corriger les champs en rouge.', true);
      // Focus sur le premier champ en erreur
      var premier = form.querySelector('[aria-invalid="true"]');
      if (premier && typeof premier.focus === 'function') {
        try { premier.focus({ preventScroll: false }); } catch (err) {}
      }
      return;
    }

    var num = (CFG && typeof CFG.whatsapp === 'string') ? CFG.whatsapp.replace(/\s+/g, '') : '';

    if (numeroPlaceholder(num, CFG)) {
      alert(
        "Numéro WhatsApp non configuré pour cette démo.\n\n" +
        "Remplacer \"whatsapp\" dans data/configuration.json " +
        "par un vrai numéro au format international (ex : 2250700000000), " +
        "puis décocher \"whatsapp_est_placeholder\"."
      );
      setStatut("Envoi impossible : numéro WhatsApp non configuré (démo).", true);
      return;
    }

    var texte = construireMessage();
    var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(texte);

    setStatut('Ouverture de WhatsApp…', false);

    var w = window.open(url, '_blank', 'noopener');
    if (!w) {
      // Bloqueur de popup
      setStatut("Autorisez les fenêtres pop-up pour envoyer sur WhatsApp, ou cliquez à nouveau.", true);
    }
  }

  /* ---------- Init ---------- */

  function init() {
    // Charge la configuration
    fetch('data/configuration.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (cfg) { CFG = cfg; })
      .catch(function () { CFG = null; });

    // Préremplit la date du jour dans l'attribut min
    if (champDate) champDate.min = aujourdhuiISO();

    // Efface les erreurs à la saisie
    [champNom, champTel, champDate, champHeure, champPers].forEach(function (c) {
      if (!c) return;
      c.addEventListener('input', function () { effacerErreur(c); });
      c.addEventListener('change', function () { effacerErreur(c); });
    });

    form.addEventListener('submit', envoyer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
