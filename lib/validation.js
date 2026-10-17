export function normalizePhone(phone) {
  if (typeof phone !== 'string') return '';
  const clean = phone.replace(/[\s\-\(\)\.]/g, '');
  if (!clean.startsWith('+')) return '';
  return clean;
}
export function isValidE164(phone) {
  return typeof phone === 'string' && /^\+\d{8,15}$/.test(phone);
}
export function isValidPassword(pwd) {
  return typeof pwd === 'string' && pwd.length >= 8;
}
export function isValidRole(role) {
  return ['SUPER_MASTER', 'MASTER', 'ADMIN'].includes(role);
}
export function slugify(text) {
  if (typeof text !== 'string') return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
