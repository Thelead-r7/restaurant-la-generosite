import { requireAdmin } from '../../lib/auth.js';
import { ok, badRequest, unauthorized, forbidden, serverError } from '../../lib/reponse.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return badRequest(res, 'Méthode non autorisée (GET attendu)');

  let result;
  try { result = await requireAdmin(req, 'ADMIN'); }
  catch { return serverError(res, 'Erreur vérification session'); }

  if (result.error === 'unauthorized') return unauthorized(res, 'Non connecté');
  if (result.error === 'forbidden')    return forbidden(res, 'Compte non autorisé ou désactivé');

  return ok(res, {
    user: {
      id: result.user.id, phone: result.user.phone,
      role: result.profile.role, nom_affichage: result.profile.nom_affichage,
    },
  });
}
