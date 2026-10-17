import { getPublicClient } from '../../lib/supabase-public.js';
import { getAdminClient } from '../../lib/supabase-admin.js';
import { ok, badRequest, unauthorized, forbidden, tooManyRequests, serverError, parseBody } from '../../lib/reponse.js';
import { normalizePhone, isValidE164, isValidPassword } from '../../lib/validation.js';
import { writeAudit, hashIp } from '../../lib/audit.js';

async function checkRateLimit(phone) {
  try {
    const supabase = getAdminClient();
    const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('journal_audit')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'login_failed')
      .gte('cree_le', since)
      .filter('contexte->>phone', 'eq', phone);
    return (count || 0) >= 8;
  } catch { return false; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return badRequest(res, 'Méthode non autorisée (POST attendu)');

  const body = parseBody(req);
  if (!body.phone || !body.password) return badRequest(res, 'Champs requis : phone, password');

  const phone = normalizePhone(body.phone);
  if (!isValidE164(phone)) return badRequest(res, 'Format téléphone invalide (E.164, ex: +2250700000000)');
  if (!isValidPassword(body.password)) return badRequest(res, 'Mot de passe trop court (8 min)');

  const ipHash = hashIp(req);

  if (await checkRateLimit(phone)) {
    await writeAudit({ action: 'login_rate_limited', ressource: 'auth', resultat: 'refuse', contexte: { phone }, ip_hash: ipHash });
    return tooManyRequests(res, 'Trop de tentatives. Réessayez dans 15 minutes.');
  }

  let authData, authError;
  try {
    const publicClient = getPublicClient();
    const result = await publicClient.auth.signInWithPassword({ phone, password });
    authData = result.data; authError = result.error;
  } catch (err) {
    return serverError(res, 'Erreur connexion Supabase');
  }

  if (authError || !authData?.user || !authData?.session) {
    await writeAudit({
      action: 'login_failed', ressource: 'auth', resultat: 'refuse',
      contexte: { phone, raison: authError?.message || 'inconnu' }, ip_hash: ipHash,
    });
    return unauthorized(res, 'Identifiants invalides');
  }

  let profile;
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('admin_profiles')
      .select('role, actif, nom_affichage')
      .eq('user_id', authData.user.id)
      .maybeSingle();
    if (error) throw error;
    profile = data;
  } catch { return serverError(res, 'Erreur lecture profil'); }

  if (!profile || !profile.actif) {
    await writeAudit({ acteur_id: authData.user.id, action: 'login_refused_no_profile', ressource: 'auth', resultat: 'refuse', ip_hash: ipHash });
    return forbidden(res, 'Compte non autorisé ou désactivé');
  }

  await writeAudit({
    acteur_id: authData.user.id, acteur_role: profile.role,
    action: 'login_success', ressource: 'auth', resultat: 'succes', ip_hash: ipHash,
  });

  return ok(res, {
    user: { id: authData.user.id, phone: authData.user.phone, role: profile.role, nom_affichage: profile.nom_affichage },
    session: {
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
    },
  });
}
