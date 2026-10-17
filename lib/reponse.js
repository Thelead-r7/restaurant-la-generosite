export function json(res, status, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json(data);
}
export const ok              = (res, d) => json(res, 200, d);
export const created         = (res, d) => json(res, 201, d);
export const badRequest      = (res, m) => json(res, 400, { error: m || 'Requête invalide' });
export const unauthorized    = (res, m) => json(res, 401, { error: m || 'Non autorisé' });
export const forbidden       = (res, m) => json(res, 403, { error: m || 'Interdit' });
export const notFound        = (res, m) => json(res, 404, { error: m || 'Introuvable' });
export const serverError     = (res, m) => json(res, 500, { error: m || 'Erreur serveur' });
export const tooManyRequests = (res, m) => json(res, 429, { error: m || 'Trop de requêtes' });

export function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}
