-- 0027 — Refonte de l'accueil « à l'essentiel »
-- Les sections À propos, Expertises, Vidéo, Témoignages, Équipe, Hero, FAQ et CTA
-- ne sont plus configurables : leur contenu est désormais dans le code
-- (sans avis, chiffres ni partenaires inventés).
-- On supprime leurs anciennes configurations et les faux partenaires en vedette.

BEGIN;

DELETE FROM public.homepage_configs
WHERE section IN ('hero', 'about', 'expertise', 'team', 'testimonials', 'faq', 'cta', 'explainer_video');

-- Partenaires « en vedette » : la liste ne contenait que des exemples fictifs
UPDATE public.homepage_configs
SET content = jsonb_set(content, '{partners}', '[]'::jsonb)
WHERE section = 'featured_partners';

-- Pied de page : retrait du faux chiffre « 2 000+ clients »
UPDATE public.homepage_configs
SET content = content - 'newsletter_badge'
WHERE section = 'footer';

COMMIT;
