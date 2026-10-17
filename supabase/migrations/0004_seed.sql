-- =========================================================
-- Chez Tantie V2 — 0004_seed.sql
-- Données de base : catégories, plats, configuration.
-- Idempotent (ON CONFLICT DO NOTHING).
-- À exécuter après 0003.
-- =========================================================

-- ---------- Catégories ----------
insert into categories (code, nom_fr, nom_nouchi, emoji, ordre, publie) values
  ('entrees',         'Entrées',         'Entrées',         '🥟', 1, true),
  ('plats',           'Plats',           'Plats',           '🍗', 2, true),
  ('grillades',       'Grillades',       'Grillades',       '🔥', 3, true),
  ('accompagnements', 'Accompagnements', 'Accompagnements', '🍟', 4, true),
  ('boissons',        'Boissons',        'Boissons',        '🍺', 5, true),
  ('desserts',        'Desserts',        'Desserts',        '🍦', 6, true)
on conflict (code) do nothing;

-- ---------- Plats (24 du MVP) ----------
with data(code, nom_fr, nom_nouchi, desc_fr, desc_nouchi, prix, cat_code, emoji, ordre) as (
  values
    ('p001', 'Alloco',             'Alloco',        'Bananes plantains frites',                    '', 500,  'entrees',         '🍌', 1),
    ('p002', 'Gbofloto',           'Gbofloto',      'Beignets sucrés moelleux',                    '', 200,  'entrees',         '🍩', 2),
    ('p003', 'Beignets haricots',  '',              'Pâte de haricots frite, sauce piment',        '', 300,  'entrees',         '🥟', 3),
    ('p010', 'Sauce graine',       '',              'Sauce de noix de palme, viande ou poisson',   '', 1500, 'plats',           '🥘', 1),
    ('p011', 'Kedjenou de poulet', '',              'Poulet mijoté aux légumes, à l''étouffée',    '', 2500, 'plats',           '🍗', 2),
    ('p012', 'Riz gras',           '',              'Riz cuisiné à la tomate et aux épices',       '', 1200, 'plats',           '🍚', 3),
    ('p013', 'Attiéké poisson',    'Attiéké poisson','Semoule de manioc, poisson frit, sauce',     '', 2000, 'plats',           '🐟', 4),
    ('p020', 'Poulet braisé',      '',              'Poulet entier braisé, attiéké ou alloco',     '', 3000, 'grillades',       '🔥', 1),
    ('p021', 'Poisson braisé',     '',              'Bar entier braisé, sauce tomate piment',      '', 2500, 'grillades',       '🐟', 2),
    ('p022', 'Brochettes de bœuf', '',              'Brochettes marinées grillées',                '', 1000, 'grillades',       '🍢', 3),
    ('p030', 'Attiéké nature',     'Attiéké',       'Semoule de manioc',                           '', 500,  'accompagnements', '🥣', 1),
    ('p031', 'Riz blanc',          '',              'Riz parfumé',                                 '', 500,  'accompagnements', '🍚', 2),
    ('p032', 'Frites d''igname',   '',              'Igname frite croustillante',                  '', 700,  'accompagnements', '🍟', 3),
    ('p033', 'Foutou banane',      'Foutou',        'Foutou de banane plantain',                   '', 800,  'accompagnements', '🍌', 4),
    ('p040', 'Bissap',             '',              'Infusion d''hibiscus glacée',                 '', 500,  'boissons',        '🍹', 1),
    ('p041', 'Gnamakoudji',        'Gnamakou',      'Jus de gingembre frais',                      '', 500,  'boissons',        '🍵', 2),
    ('p042', 'Jus de baobab',      'Pain de singe', 'Jus de fruit de baobab',                      '', 500,  'boissons',        '🥤', 3),
    ('p043', 'Bière locale',       '',              'Bière blonde servie fraîche',                 '', 1000, 'boissons',        '🍺', 4),
    ('p044', 'Sucrerie',           '',              'Soda au choix',                               '', 700,  'boissons',        '🥤', 5),
    ('p045', 'Eau minérale',       '',              'Bouteille 50cl',                              '', 300,  'boissons',        '💧', 6),
    ('p050', 'Dèguè',              'Dèguè',         'Yaourt, mil, vanille',                        '', 700,  'desserts',        '🥛', 1),
    ('p051', 'Ananas frais',       '',              'Ananas découpé',                              '', 500,  'desserts',        '🍍', 2),
    ('p052', 'Mangue fraîche',     '',              'Mangue mûre découpée',                        '', 500,  'desserts',        '🥭', 3),
    ('p053', 'Glace coco',         '',              'Glace artisanale à la noix de coco',          '', 800,  'desserts',        '🍦', 4)
)
insert into plats (code, nom_fr, nom_nouchi, desc_fr, desc_nouchi, prix, categorie_id, emoji, ordre, publie)
select d.code, d.nom_fr, d.nom_nouchi, d.desc_fr, d.desc_nouchi, d.prix, c.id, d.emoji, d.ordre, true
from data d
join categories c on c.code = d.cat_code
on conflict (code) do nothing;

-- ---------- Configuration initiale ----------
insert into configuration (cle, valeur, publie) values
  ('nom_site',                 'Chez Tantie',                                      true),
  ('slogan_fr',                'Le goût du pays, au coin de la rue.',              true),
  ('slogan_nouchi',            'Ici c''est doux dèh, y a pas deux !',              true),
  ('whatsapp',                 '225XXXXXXXXXX',                                    true),
  ('whatsapp_est_placeholder', 'true',                                             true),
  ('adresse',                  'Exemple : Rue des Jardins, Cocody, Abidjan',       true),
  ('horaires',                 'Exemple : Tous les jours de 11h à 23h',            true),
  ('email',                    'exemple@cheztantie.ci',                            true)
on conflict (cle) do nothing;
