import { getPublicClient } from './supabase-public.js';
import { getAdminClient } from './supabase-admin.js';

export async function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return null;
  const supabase = getPublicClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function getAdminProfile(userId) {
  if (!userId) return null;
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id, role, nom_affichage, actif')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function requireAdmin(req, minRole = 'ADMIN') {
  const user = await getUserFromToken(req);
  if (!user) return { user: null, profile: null, error: 'unauthorized' };
  const profile = await getAdminProfile(user.id);
  if (!profile || !profile.actif) return { user, profile: null, error: 'forbidden' };
  const order = { ADMIN: 1, MASTER: 2, SUPER_MASTER: 3 };
  if ((order[profile.role] || 0) < (order[minRole] || 0)) return { user, profile, error: 'forbidden' };
  return { user, profile, error: null };
}
