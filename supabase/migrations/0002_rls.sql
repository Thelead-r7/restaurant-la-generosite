-- =========================================================
-- Chez Tantie V2 — 0002_rls.sql
-- Activation RLS + politiques d'accès.
-- À exécuter après 0001.
-- =========================================================

-- Fonction utilitaire : rôle de l'utilisateur connecté
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.admin_profiles
     where user_id = auth.uid() and actif = true),
    'ANON'
  );
$$;

-- Fonction utilitaire : est-ce un admin actif ?
create or replace function public.is_admin_actif()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.admin_profiles
    where user_id = auth.uid() and actif = true
  );
$$;

-- =========================================================
-- RLS : admin_profiles
-- =========================================================
alter table admin_profiles enable row level security;

-- Lecture : chacun voit son propre profil, SUPER_MASTER voit tout,
-- MASTER voit les ADMIN.
drop policy if exists profils_select on admin_profiles;
create policy profils_select on admin_profiles
for select
using (
  user_id = auth.uid()
  or public.current_role() = 'SUPER_MASTER'
  or (public.current_role() = 'MASTER' and role = 'ADMIN')
);

-- Insertion : réservée au SUPER_MASTER (via API serveur).
-- Note : le tout premier SUPER_MASTER est créé manuellement via
-- le dashboard Supabase (RLS ne s'applique pas au service_role).
drop policy if exists profils_insert on admin_profiles;
create policy profils_insert on admin_profiles
for insert
with check (public.current_role() = 'SUPER_MASTER');

-- Mise à jour : SUPER_MASTER peut tout, MASTER peut gérer les ADMIN.
drop policy if exists profils_update on admin_profiles;
create policy profils_update on admin_profiles
for update
using (
  public.current_role() = 'SUPER_MASTER'
  or (public.current_role() = 'MASTER' and role = 'ADMIN')
)
with check (
  public.current_role() = 'SUPER_MASTER'
  or (public.current_role() = 'MASTER' and role = 'ADMIN')
);

-- Suppression : SUPER_MASTER uniquement (protection SUPER_MASTER par trigger).
drop policy if exists profils_delete on admin_profiles;
create policy profils_delete on admin_profiles
for delete
using (public.current_role() = 'SUPER_MASTER');

-- =========================================================
-- RLS : categories
-- =========================================================
alter table categories enable row level security;

drop policy if exists categories_select_public on categories;
create policy categories_select_public on categories
for select
using (publie = true or public.is_admin_actif());

drop policy if exists categories_modif_admin on categories;
create policy categories_modif_admin on categories
for all
using (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'))
with check (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'));

-- =========================================================
-- RLS : plats
-- =========================================================
alter table plats enable row level security;

drop policy if exists plats_select_public on plats;
create policy plats_select_public on plats
for select
using (publie = true or public.is_admin_actif());

drop policy if exists plats_modif_admin on plats;
create policy plats_modif_admin on plats
for all
using (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'))
with check (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'));

-- =========================================================
-- RLS : configuration
-- =========================================================
alter table configuration enable row level security;

drop policy if exists config_select_public on configuration;
create policy config_select_public on configuration
for select
using (publie = true or public.is_admin_actif());

drop policy if exists config_modif_admin on configuration;
create policy config_modif_admin on configuration
for all
using (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'))
with check (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'));

-- =========================================================
-- RLS : journal_audit (append-only)
-- =========================================================
alter table journal_audit enable row level security;

-- Lecture : SUPER_MASTER voit tout, MASTER voit tout sauf SUPER_MASTER,
-- ADMIN voit uniquement ses propres actions.
drop policy if exists audit_select on journal_audit;
create policy audit_select on journal_audit
for select
using (
  public.current_role() = 'SUPER_MASTER'
  or (public.current_role() = 'MASTER' and acteur_role != 'SUPER_MASTER')
  or (public.current_role() = 'ADMIN' and acteur_id = auth.uid())
);

-- Insertion : tout admin actif peut écrire son propre log.
drop policy if exists audit_insert on journal_audit;
create policy audit_insert on journal_audit
for insert
with check (public.is_admin_actif() and acteur_id = auth.uid());

-- Aucune politique UPDATE ni DELETE → impossible même pour SUPER_MASTER.
-- (protection supplémentaire par trigger, voir 0003)

-- =========================================================
-- RLS : images
-- =========================================================
alter table images enable row level security;

drop policy if exists images_select_public on images;
create policy images_select_public on images
for select
using (publie = true or public.is_admin_actif());

drop policy if exists images_modif_admin on images;
create policy images_modif_admin on images
for all
using (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'))
with check (public.current_role() in ('SUPER_MASTER', 'MASTER', 'ADMIN'));
