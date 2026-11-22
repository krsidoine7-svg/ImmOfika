-- 0026 — Changement de marque : ImmOfika -> Anyilo (données en base)
-- Domaine officiel : anyilo.com (production) / preprod.anyilo.com (préproduction)
-- À exécuter UNE FOIS par environnement (préproduction d'abord, puis production).
-- Idempotent : relancer le script ne change rien de plus.

BEGIN;

-- 1. Contenus éditoriaux de la page d'accueil
UPDATE public.homepage_configs
SET content = replace(replace(replace(replace(content::text,
      'immofika.ci', 'anyilo.com'),
      'ImmOfika', 'Anyilo'),
      'IMMOFIKA', 'ANYILO'),
      'immofika', 'anyilo')::jsonb
WHERE content::text ILIKE '%immofika%';

-- 2. Paramètres système (identité entreprise, emails, etc.)
UPDATE public.system_settings
SET value = replace(replace(replace(replace(value::text,
      'immofika.ci', 'anyilo.com'),
      'ImmOfika', 'Anyilo'),
      'IMMOFIKA', 'ANYILO'),
      'immofika', 'anyilo')::jsonb,
    updated_at = now()
WHERE value::text ILIKE '%immofika%';

-- 3. Modèles de contrat (libellés uniquement, les fichiers .docx sont à régénérer)
UPDATE public.contract_templates
SET nom = replace(replace(nom, 'ImmOfika', 'Anyilo'), 'IMMOFIKA', 'ANYILO'),
    description = replace(replace(description, 'ImmOfika', 'Anyilo'), 'IMMOFIKA', 'ANYILO')
WHERE nom ILIKE '%immofika%' OR description ILIKE '%immofika%';

-- 4. Organisation interne et notifications existantes
UPDATE public.organizations
SET name = replace(name, 'ImmOfika', 'Anyilo'),
    email = replace(email, '@immofika.ci', '@anyilo.com'),
    description = replace(description, 'ImmOfika', 'Anyilo')
WHERE name ILIKE '%immofika%' OR email ILIKE '%@immofika.ci' OR description ILIKE '%immofika%';

UPDATE public.notifications
SET title = replace(title, 'ImmOfika', 'Anyilo'),
    message = replace(message, 'ImmOfika', 'Anyilo')
WHERE title ILIKE '%immofika%' OR message ILIKE '%immofika%';

-- 5. Comptes internes et comptes de test : emails @immofika.ci -> @anyilo.com
--    (les mots de passe ne changent pas ; les utilisateurs se connectent avec la nouvelle adresse)
UPDATE auth.users
SET email = replace(email, '@immofika.ci', '@anyilo.com'),
    raw_user_meta_data = replace(raw_user_meta_data::text, '@immofika.ci', '@anyilo.com')::jsonb
WHERE email ILIKE '%@immofika.ci';

UPDATE auth.identities
SET identity_data = replace(identity_data::text, '@immofika.ci', '@anyilo.com')::jsonb
WHERE identity_data::text ILIKE '%@immofika.ci%';

UPDATE public.profiles
SET email = replace(email, '@immofika.ci', '@anyilo.com')
WHERE email ILIKE '%@immofika.ci';

COMMIT;
