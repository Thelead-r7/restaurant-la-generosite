import { getAdminClient } from './supabase-admin.js';

export async function writeAudit({
  acteur_id = null, acteur_role = null,
  action, ressource = null, ressource_id = null,
  resultat = 'succes', contexte = null, ip_hash = null,
}) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.from('journal_audit').insert({
      acteur_id, acteur_role, action, ressource, ressource_id,
      resultat, contexte, ip_hash,
    });
    if (error) console.error('[audit]', error.message);
  } catch (err) {
    console.error('[audit]', err.message);
  }
}

export function hashIp(req) {
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  let h = 0;
  for (let i = 0; i < ip.length; i++) h = ((h << 5) - h + ip.charCodeAt(i)) | 0;
  return 'ip_' + Math.abs(h).toString(16);
}
