-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 SEED HOMEPAGE CONFIGS — Données par défaut de la Page d'Accueil
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-10
-- Version : v1.0
-- But     : Charger les textes, images et FAQ d'origine dans homepage_configs
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

INSERT INTO homepage_configs (section, content) VALUES
  (
    'hero',
    '{
      "enabled": true,
      "theme": "white",
      "title_p1": "Trouvez le",
      "title_gold": "bien de vos rêves",
      "title_p2": "en toute",
      "title_badge": "sérénité.",
      "subtitle": "« FAVOR Company Int. : les bienfaits d''un service authentique »",
      "description": "Lotissement, aménagement foncier, études topographiques et construction d''exception. L''expertise et l''intégrité au service de vos ambitions.",
      "cta1_label": "Découvrir les biens",
      "cta1_link": "/biens",
      "cta2_label": "En savoir plus",
      "main_image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
      "badge1_title": "Disponibilité",
      "badge1_value": "24h / 7j",
      "badge2_title": "Accompagnement",
      "badge2_value": "Prestige",
      "video_url": "/video-heros.mp4",
      "video_fallback_image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600",
      "video_title": "Une vision partagée par nos exécutifs.",
      "video_subtitle": "Chaque jour, nos leaders et conseillers redéfinissent l''immobilier d''exception en alliant rigueur, confidentialité absolue et un réseau d''élite mondial.",
      "video_values": [
        {
          "title": "Confidentialité",
          "desc": "Protection absolue et transactions hors-marché hautement sécurisées.",
          "icon": "Shield"
        },
        {
          "title": "Réseau d''Élite",
          "desc": "Accès privilégié aux plus belles propriétés de Côte d''Ivoire.",
          "icon": "Award"
        },
        {
          "title": "Vision Unique",
          "desc": "Un accompagnement patrimonial sur-mesure pour chaque génération.",
          "icon": "Eye"
        }
      ]
    }'::jsonb
  ),
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
  ),
  (
    'about',
    '{
      "enabled": true,
      "theme": "gray",
      "tag": "À propos de nous",
      "title": "Plus qu''un promoteur immobilier agréé, un partenaire de vie.",
      "italic_word": "partenaire",
      "description": "Depuis plus de 15 ans, Favor Company s''est imposée comme une référence de l''immobilier premium. Notre secret ? Une écoute attentive et une compréhension profonde des besoins de nos clients.",
      "experience_years": "15+",
      "experience_label": "Années d''Excellence à Favor",
      "grid_image_1": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400",
      "grid_image_2": "https://images.unsplash.com/photo-1582408921715-18e7806365c1?auto=format&fit=crop&q=80&w=400",
      "grid_image_3": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400",
      "features": [
        {
          "title": "Sécurité Garantie",
          "description": "Toutes nos transactions sont sécurisées et encadrées juridiquement.",
          "icon": "Shield"
        },
        {
          "title": "Vision Stratégique",
          "description": "Nous vous aidons à identifier les meilleures opportunités du marché.",
          "icon": "Target"
        },
        {
          "title": "Valorisation de Patrimoine",
          "description": "Des conseils experts pour faire fructifier vos investissements.",
          "icon": "TrendingUp"
        },
        {
          "title": "Accompagnement Premium",
          "description": "Un interlocuteur unique pour une expérience sans stress.",
          "icon": "CheckCircle2"
        }
      ]
    }'::jsonb
  ),
  (
    'expertise',
    '{
      "enabled": true,
      "theme": "light",
      "tag": "Nos Domaines d''Expertise",
      "title": "Une offre pluridimensionnelle pour un service authentique.",
      "italic_word": "service authentique",
      "description": "FAVOR Company International combine rigueur technique, intégrité commerciale et vision d''avenir pour propulser chacun de vos projets d''aménagement et de commerce.",
      "services": [
        {
          "title": "Le Lotissement",
          "desc": "Création et planification d''espaces de vie harmonieux à travers des plans de lotissement stratégiques et réglementés.",
          "icon": "Grid"
        },
        {
          "title": "Aménagement Foncier",
          "desc": "Valorisation, viabilisation et aménagement technique de vos parcelles pour optimiser leur valeur et leur usage.",
          "icon": "Layers"
        },
        {
          "title": "Topographie",
          "desc": "Études rigoureuses et travaux de topographie de haute précision, relevés géométriques et délimitations certifiées.",
          "icon": "Compass"
        },
        {
          "title": "Gestion Immobilière",
          "desc": "Administration technique, juridique et financière transparente de vos biens résidentiels et commerciaux.",
          "icon": "Building2"
        },
        {
          "title": "Transactions de Biens",
          "desc": "Achat et vente sécurisés de biens meubles et d''immeubles divers, avec un accompagnement juridique complet.",
          "icon": "Scale"
        },
        {
          "title": "Intermédiation",
          "desc": "Négociation commerciale d''élite et intermédiation stratégique pour sécuriser vos investissements majeurs.",
          "icon": "Users"
        },
        {
          "title": "Commerce Général",
          "desc": "Activités d''import-export, distribution de marchandises et solutions d''approvisionnement à l''échelle internationale.",
          "icon": "Globe"
        },
        {
          "title": "Construction",
          "desc": "Réalisation de chantiers de construction résidentiels, commerciaux et industriels dans le respect des standards de qualité.",
          "icon": "Hammer"
        },
        {
          "title": "Matériel de Construction",
          "desc": "Vente et livraison de matériaux et d''équipements de construction haut de gamme pour tous vos travaux.",
          "icon": "Package"
        },
        {
          "title": "Achat & Vente de Terrains",
          "desc": "Sélection exclusive et sécurisée de parcelles de terrain à fort potentiel de valorisation en Côte d''Ivoire.",
          "icon": "Map"
        },
        {
          "title": "Produits Agricoles",
          "desc": "Achat, vente et courtage international de produits agricoles de qualité supérieure (cacao, café, anacarde, etc.).",
          "icon": "Sprout"
        }
      ]
    }'::jsonb
  ),
  (
    'team',
    '{
      "enabled": true,
      "theme": "white",
      "tag": "Notre Équipe",
      "title": "Les experts à votre service.",
      "italic_word": "service",
      "description": "Une équipe passionnée et dévouée pour faire de votre projet immobilier une réussite totale."
    }'::jsonb
  ),
  (
    'testimonials',
    '{
      "enabled": true,
      "theme": "night",
      "tag": "Témoignages",
      "title": "Ce que nos clients disent de nous.",
      "italic_word": "clients",
      "testimonials": [
        {
          "name": "Alexandre Dubois",
          "role": "Propriétaire",
          "text": "Favor Company a vendu mon appartement en moins de deux semaines au prix estimé. Un professionnalisme rare et un accompagnement de tous les instants.",
          "avatar": "https://i.pravatar.cc/150?u=alex",
          "rating": 5
        },
        {
          "name": "Sophie Martin",
          "role": "Acheteuse",
          "text": "Grâce à l''équipe Favor, nous avons trouvé la maison de nos rêves. Elle a tout de suite compris nos besoins et ne nous a proposé que des biens pertinents.",
          "avatar": "https://i.pravatar.cc/150?u=sophie",
          "rating": 5
        },
        {
          "name": "Marc & Julie",
          "role": "Investisseurs",
          "text": "Une équipe à l''écoute qui connaît parfaitement le marché local. Leurs conseils en investissement nous ont permis de réaliser une excellente opération.",
          "avatar": "https://i.pravatar.cc/150?u=marc",
          "rating": 5
        },
        {
          "name": "Isabelle Durand",
          "role": "Locataire",
          "text": "La mise en place de mon bail a été très rapide. Un service irréprochable, je recommande vivement Favor Company.",
          "avatar": "https://i.pravatar.cc/150?u=isa",
          "rating": 4
        }
      ]
    }'::jsonb
  ),
  (
    'faq',
    '{
      "enabled": true,
      "theme": "white",
      "tag": "Questions Fréquentes",
      "title": "Tout ce que vous devez savoir sur vos projets.",
      "italic_word": "vos projets",
      "description": "Vous avez des questions sur l''achat, la vente ou la location ? Nous avons rassemblé ici les réponses aux questions les plus courantes. Si vous ne trouvez pas votre bonheur, contactez-nous !",
      "cta_card_title": "Encore une question ?",
      "cta_card_subtitle": "Notre équipe est disponible pour vous répondre personnellement.",
      "cta_card_button": "Contactez un expert →",
      "faqs": [
        {
          "question": "Quels sont les frais de promotion chez Favor Company ?",
          "answer": "En tant que promoteur immobilier agréé, nos frais de promotion et d''accompagnement sont transparents et compétitifs. Ils sont intégrés à la valeur des lots et incluent l''aménagement foncier, la viabilisation et la sécurisation juridique complète de vos parcelles."
        },
        {
          "question": "Comment se passe l''estimation d''un bien ?",
          "answer": "L''estimation est gratuite et sans engagement. Un de nos experts se déplace chez vous pour analyser les caractéristiques techniques, l''environnement et les tendances du marché afin de vous fournir un prix juste sous 48h."
        },
        {
          "question": "Proposez-vous une gestion locative ?",
          "answer": "Oui, nous proposons un service de gestion locative ''clé en main''. Nous nous occupons de la recherche de locataires, de la rédaction du bail, de l''état des lieux et de la perception des loyers avec une assurance loyers impayés."
        },
        {
          "question": "Quels documents dois-je fournir pour une mise en vente ?",
          "answer": "Les principaux documents sont le titre de propriété, les derniers diagnostics techniques (DPE, etc.), les derniers avis de taxe foncière et, si applicable, les documents de copropriété."
        },
        {
          "question": "Combien de temps prend la vente d''un bien en moyenne ?",
          "answer": "La durée moyenne de vente chez Favor Company est de 45 jours. Ce délai rapide s''explique par notre base de données d''acheteurs qualifiés et notre stratégie de marketing digital ciblée."
        }
      ]
    }'::jsonb
  ),
  (
    'cta',
    '{
      "enabled": true,
      "theme": "white",
      "tag": "Contactez-nous",
      "title": "Prêt à concrétiser votre projet immobilier ?",
      "italic_word": "immobilier",
      "description": "Ne laissez pas votre projet au hasard. Bénéficiez d''une expertise reconnue et d''un accompagnement sur mesure.",
      "button_label": "Voir nos biens pour réserver une visite",
      "button_link": "/biens"
    }'::jsonb
  ),
  (
    'footer',
    '{
      "enabled": true,
      "theme": "white",
      "newsletter_title": "Restez informé des opportunités",
      "newsletter_description": "Recevez nos dernières exclusivités immobilières et nos analyses de marché directement dans votre boîte mail. Pas de spam.",
      "newsletter_badge": "Rejoignez plus de 2 000+ clients prestige",
      "tagline": "« FAVOR Company Int. : les bienfaits d''un service authentique »",
      "description": "Notre expertise et notre rigueur commerciale à votre service.",
      "whatsapp_number": "+225 01 03 13 28 78",
      "whatsapp_link": "https://wa.me/2250103132878",
      "facebook_link": "https://www.facebook.com/share/1MUiXffGM7/",
      "address": "Yahou, immeuble en face de la maison blanche, au 2ieme etage",
      "address_link": "https://maps.google.com/?q=Yahou+immeuble+en+face+de+la+maison+blanche",
      "phone_fixe": "+225 27 24 37 01 55 (Fixe)",
      "phone_mobile": "+225 07 47 63 17 06 (Mobile)",
      "email": "Favorcompanyint@gmail.com"
    }'::jsonb
  )
ON CONFLICT (section) DO UPDATE SET content = EXCLUDED.content;

COMMIT;
