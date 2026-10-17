-- =========================================================
-- Chez Tantie V2 — 0003_triggers.sql
-- Triggers de protection + mise à jour automatique.
-- À exécuter après 0002.
-- =========================================================

-- =========================================================
-- 1) Auto-update de modifie_le sur UPDATE
-- =========================================================
create or replace function public.trg_set_modifie_le()
returns trigger
language plpgsql
as $$
begin
  new.modifie_le = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists trg_categories_modifie_le on categories;
create trigger trg_categories_modifie_le
before update on categories
for each row execute function public.trg_set_modifie_le();

drop trigger if exists trg_plats_modifie_le on plats;
create trigger trg_plats_modifie_le
before update on plats
for each row execute function public.trg_set_modifie_le();

drop trigger if exists trg_config_modifie_le on configuration;
create trigger trg_config_modifie_le
before update on configuration
for each row execute function public.trg_set_modifie_le();

drop trigger if exists trg_images_modifie_le on images;
create trigger trg_images_modifie_le
before update on images
for each row execute function public.trg_set_modifie_le();

drop trigger if exists trg_admin_profiles_modifie_le on admin_profiles;
create trigger trg_admin_profiles_modifie_le
before update on admin_profiles
for each row execute function public.trg_set_modifie_le();

-- =========================================================
-- 2) Invariant : un seul SUPER_MASTER en base
-- =========================================================
create or replace function public.trg_super_master_unique()
returns trigger
language plpgsql
as $$
begin
  if new.role = 'SUPER_MASTER' then
    if exists (
      select 1 from admin_profiles
      where role = 'SUPER_MASTER' and user_id <> new.user_id
    ) then
      raise exception 'Un SUPER_MASTER existe déjà. Création refusée.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_super_master_unique_ins on admin_profiles;
create trigger trg_super_master_unique_ins
before insert on admin_profiles
for each row execute function public.trg_super_master_unique();

-- =========================================================
-- 3) Invariant : SUPER_MASTER ne peut être rétrogradé,
--    désactivé ou supprimé, quel que soit l'appelant.
-- =========================================================
create or replace function public.trg_protect_super_master()
returns trigger
language plpgsql
as $$
declare
  old_role text;
  old_actif boolean;
begin
  -- Ancien état
  if tg_op = 'UPDATE' or tg_op = 'DELETE' then
    old_role := old.role;
    old_actif := old.actif;
  end if;

  -- Empêche la modification du rôle du SUPER_MASTER
  if tg_op = 'UPDATE' and old_role = 'SUPER_MASTER' and new.role <> 'SUPER_MASTER' then
    raise exception 'Impossible de changer le rôle du SUPER_MASTER.';
  end if;

  -- Empêche la désactivation du SUPER_MASTER
  if tg_op = 'UPDATE' and old_role = 'SUPER_MASTER' and new.actif = false then
    raise exception 'Impossible de désactiver le SUPER_MASTER.';
  end if;

  -- Empêche la suppression du SUPER_MASTER
  if tg_op = 'DELETE' and old_role = 'SUPER_MASTER' then
    raise exception 'Impossible de supprimer le SUPER_MASTER.';
  end if;

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists trg_protect_super_master_upd on admin_profiles;
create trigger trg_protect_super_master_upd
before update on admin_profiles
for each row execute function public.trg_protect_super_master();

drop trigger if exists trg_protect_super_master_del on admin_profiles;
create trigger trg_protect_super_master_del
before delete on admin_profiles
for each row execute function public.trg_protect_super_master();

-- =========================================================
-- 4) Invariant : journal_audit est strictement append-only
-- =========================================================
create or replace function public.trg_audit_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception 'journal_audit est en lecture seule (append-only).';
end;
$$;

drop trigger if exists trg_audit_no_update on journal_audit;
create trigger trg_audit_no_update
before update on journal_audit
for each row execute function public.trg_audit_append_only();

drop trigger if exists trg_audit_no_delete on journal_audit;
create trigger trg_audit_no_delete
before delete on journal_audit
for each row execute function public.trg_audit_append_only();
