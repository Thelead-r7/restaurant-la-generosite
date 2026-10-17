import { getUserFromToken, getAdminProfile } from '../../lib/auth.js';
import { ok, badRequest, unauthorized, serverError } from '../../lib/reponse.js';
import { writeAudit } from '../../lib/audit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return badRequest(res, 'Méthode non autorisée (POST attendu)');
  let user, profile;
  try {
    user = await getUserFromToken(req);
    if (!user) return unauthorized(res, 'Non connecté');
    profile = await getAdminProfile(user.id);
  } catch { return serverError(res, 'Erreur vérification'); }

  await writeAudit({
    acteur_id: user.id, acteur_role: profile?.role || null,
    action: 'logout', ressource: 'auth', resultat: 'succes',
  });
  return ok(res, { message: 'Déconnecté' });
}
