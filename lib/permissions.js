export const PERMISSIONS = {
  SUPER_MASTER: ['*'],
  MASTER: [
    'plats:read', 'plats:write',
    'categories:read', 'categories:write',
    'images:read', 'images:write',
    'configuration:read', 'configuration:write',
    'publication:publish',
    'audit:read',
    'comptes:read', 'comptes:write_admin',
  ],
  ADMIN: [
    'plats:read', 'plats:write',
    'categories:read',
    'images:read', 'images:write',
    'configuration:read',
    'audit:read_own',
  ],
};

export function hasPermission(role, permission) {
  if (!role) return false;
  const perms = PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  const [cat] = permission.split(':');
  if (perms.includes(`${cat}:*`)) return true;
  return false;
}
