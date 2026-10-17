-- =========================================================
-- Chez Tantie V2 — 0001_schema.sql
-- Création des tables de base. À exécuter en premier.
-- =========================================================

-- Extensions nécessaires
create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_net";        -- (optionnel, futurs webhooks)

-- =========================================================
-- Table : admin_profiles
-- Liée à auth.users (Supabase Auth). Contient le rôle métier.
-- =========================================================
create table if not exists admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('SUPER_MASTER', 'MASTER', 'ADMIN')),
  nom_affichage text not null default '',
  actif boolean not null default true,
  cree_le timestamptz not null default timezone('utc', now()),
  modifie_le timestamptz not null default timezone('utc', now())
);

create index if not exists idx_admin_profiles_role on admin_profiles(role);

-- =========================================================
-- Table : categories
-- =========================================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom_fr text not null,
  nom_nouchi text,
  emoji text,
  ordre int not null default 0,
  publie boolean not null default true,
  cree_le timestamptz not null default timezone('utc', now()),
  modifie_le timestamptz not null default timezone('utc', now())
);

create index if not exists idx_categories_ordre on categories(ordre);

-- =========================================================
-- Table : plats
-- =========================================================
create table if not exists plats (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  nom_fr text not null,
  nom_nouchi text,
  desc_fr text,
  desc_nouchi text,
  prix int not null check (prix > 0),
  categorie_id uuid not null references categories(id) on delete restrict,
  emoji text,
  image_url text,
  disponible boolean not null default true,
  ordre int not null default 0,
  publie boolean not null default false,
  cree_le timestamptz not null default timezone('utc', now()),
  modifie_le timestamptz not null default timezone('utc', now())
);

create index if not exists idx_plats_categorie on plats(categorie_id);
create index if not exists idx_plats_publie on plats(publie);
create index if not exists idx_plats_ordre on plats(ordre);

-- =========================================================
-- Table : configuration
-- Clé/valeur publique, éditable par les admins.
-- =========================================================
create table if not exists configuration (
  cle text primary key,
  valeur text,
  publie boolean not null default true,
  modifie_le timestamptz not null default timezone('utc', now())
);

-- =========================================================
-- Table : journal_audit
-- Append-only. Aucune modification ni suppression autorisée.
-- =========================================================
create table if not exists journal_audit (
  id bigserial primary key,
  acteur_id uuid references auth.users(id) on delete set null,
  acteur_role text,
  action text not null,
  ressource text,
  ressource_id text,
  resultat text not null check (resultat in ('succes', 'refuse', 'erreur')),
  contexte jsonb,
  ip_hash text,
  cree_le timestamptz not null default timezone('utc', now())
);

create index if not exists idx_audit_acteur on journal_audit(acteur_id);
create index if not exists idx_audit_date on journal_audit(cree_le desc);
create index if not exists idx_audit_action on journal_audit(action);

-- =========================================================
-- Table : images (métadonnées Supabase Storage)
-- =========================================================
create table if not exists images (
  id uuid primary key default gen_random_uuid(),
  storage_path text unique not null,
  alt_fr text not null default '',
  alt_nouchi text,
  categorie text,
  ordre int not null default 0,
  publie boolean not null default false,
  taille_octets int,
  type_mime text,
  cree_le timestamptz not null default timezone('utc', now()),
  modifie_le timestamptz not null default timezone('utc', now())
);

create index if not exists idx_images_categorie on images(categorie);
