-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 ADD EXPLAINER VIDEO SECTION — Ajout de la Section Vidéo Explicative
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-11
-- Version : v1.3
-- But     : Insérer la configuration initiale de la section vidéo explicative
--           dans la table homepage_configs (Supabase).
-- Note    : Copier-coller et exécuter ce code dans le SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

INSERT INTO homepage_configs (section, content) VALUES
  (
    'explainer_video',
    '{
      "enabled": true,
      "theme": "white",
      "tag": "Présentation Vidéo",
      "title": "Découvrez notre expertise en action.",
      "italic_word": "expertise",
      "description": "En tant que Promoteur Immobilier Agréé, Favor Company International s''engage à vous offrir des projets d''aménagement foncier et de construction d''exception. Regardez notre vidéo explicative pour comprendre notre rigueur et notre accompagnement.",
      "video_url": "/video-heros.mp4",
      "thumbnail_image": "/heros-img.png",
      "points": [
        { "title": "Aménagement Foncier Agréé", "desc": "Des lotissements approuvés officiellement par l''État pour une sécurité juridique totale.", "icon": "Shield" },
        { "title": "Études Topographiques", "desc": "Des travaux géométriques de haute précision réalisés par nos géomètres-experts.", "icon": "Compass" },
        { "title": "Construction de Prestige", "desc": "Des villas d''exception bâties selon les normes de qualité et d''ingénierie les plus strictes.", "icon": "Hammer" }
      ]
    }'::jsonb
  )
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

COMMIT;
