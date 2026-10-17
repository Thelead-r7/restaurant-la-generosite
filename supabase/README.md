# Chez Tantie V2 — Configuration Supabase

**Procédure à exécuter une seule fois**, dans l'ordre.  
Durée estimée : 15 minutes.

---

## 1. Créer le projet Supabase

1. Aller sur https://supabase.com/dashboard
2. Se connecter avec le compte GitHub `Thelead-r7`
3. **New project**
4. Remplir :
   - **Name** : `chez-tantie`
   - **Database Password** : générer un mot de passe fort, **le noter dans un endroit sûr** (il servira uniquement pour accès SQL direct, pas pour l'app)
   - **Region** : `Europe West (Ireland)` ou la plus proche disponible
   - **Pricing Plan** : **Free**
5. **Create new project** — attendre ~2 minutes

⚠️ **Ne pas fournir de carte bancaire.** Le plan Free n'en demande pas.

---

## 2. Récupérer les 3 clés

Une fois le projet créé : **Settings → API**

Noter ces 3 valeurs :

| Variable | Emplacement | Visibilité |
|---|---|---|
| `SUPABASE_URL` | Project URL | Publique |
| `SUPABASE_ANON_KEY` | anon / public | Publique |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role / secret | **SECRÈTE** |

⚠️ La clé `service_role` **ne doit jamais** apparaître dans le code frontend ni dans un commit Git.

---

## 3. Désactiver la confirmation téléphonique

**Authentication → Providers → Phone**

- **Enable Phone provider** : ✅ activé
- **Confirm phone number** : ❌ **désactivé** (crucial — pas de SMS)

**Authentication → Settings → Auth Providers**

- **Confirm email** : ❌ désactivé
- **Confirm phone** : ❌ désactivé

---

## 4. Exécuter les 4 migrations SQL

**SQL Editor → New query**  
Exécuter **dans l'ordre**, une migration à la fois. Attendre "Success" entre chaque.

1. Copier tout le contenu de `migrations/0001_schema.sql` → Run
2. Copier tout le contenu de `migrations/0002_rls.sql` → Run
3. Copier tout le contenu de `migrations/0003_triggers.sql` → Run
4. Copier tout le contenu de `migrations/0004_seed.sql` → Run

**Vérification** (SQL Editor) :

```sql
select count(*) as nb_categories from categories;
select count(*) as nb_plats from plats;
select count(*) as nb_config from configuration;EOF
