# Journal de Session — 24 Octobre 2026 (Santé Supabase & Keep-Alive Anti-Veille)

## 📌 Sujet & Demande Utilisateur
1. Mise en place d'un système complet de surveillance et de maintien actif (Keep-Alive) pour Supabase dans le dashboard d'administration ImmOfika afin d'éviter la mise en veille automatique (pause Free Tier 7 jours) qui bloque l'authentification et l'accès au site.
2. Conception de composants soignés, carrés avec bordures fines (pas trop arrondis) intégrés dans un nouvel onglet dédié `/admin/systeme` et dans le menu latéral `app-sidebar.tsx`.
3. Configuration de l'intervalle d'auto-ping par défaut sur **chaque 2 jours** (48 heures), avec persistance locale et support des crons 24/7 (Vercel Cron, GitHub Actions, Webhooks externes).
4. Précision sur la provenance de la valeur d'URL (`NEXT_PUBLIC_APP_URL` issue de `.env.local`) et ajout d'un sélecteur Production Vercel vs Local.

## 🛠️ Actions & Réalisations
1. **Moteur de Ping & Keep-Alive (`src/lib/services/supabaseKeepAlive.ts`)** :
   - Exécution directe d'une requête SQL PostgreSQL (`SELECT 1, NOW()`) via Drizzle/Postgres.js pour réveiller le compute Supabase.
   - Requête HEAD sur l'API PostgREST (`profiles`).
   - Vérification de l'endpoint Auth GoTrue (`/auth/v1/health`).
   - Calcul de la latence en millisecondes et conservation en mémoire partagée des 50 derniers pings.

2. **Routes API & Server Actions** :
   - [`src/app/api/health/supabase/route.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/app/api/health/supabase/route.ts) : Diagnostic et déclenchement de test.
   - [`src/app/api/cron/keepalive/route.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/app/api/cron/keepalive/route.ts) : Endpoint webhook automatisé pour Vercel Cron, GitHub Actions ou UptimeRobot.
   - [`src/app/actions/keepalive.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/app/actions/keepalive.ts) : Actions serveur sécurisées avec `requireAdminAccess()`.

3. **Interface Utilisateur Dédiée (`/admin/systeme`)** :
   - Page créée : [`src/app/(admin)/admin/systeme/page.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/app/(admin)/admin/systeme/page.tsx).
   - Composant client : [`src/components/admin/SupabaseHealthClient.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/components/admin/SupabaseHealthClient.tsx).
   - Design spécifique : coins sobres (`rounded-md` / `rounded-sm`), bordures fines (`border-slate-200`), cartes techniques carrées pour PostgreSQL, Latence, PostgREST et Auth.
   - Compte à rebours dynamique formaté (jours, heures, minutes, secondes) calculé par rapport à l'intervalle de 2 jours (2880 min) et persisté dans `localStorage`.
   - Boutons de sélection d'intervalle : 2 jours (Conseillé), 24h, 12h, 1h, 10 min.
   - Sélecteur de domaine Webhook (Production Vercel vs Local) avec champ personnalisable (textes d'aide superflus retirés pour une interface épurée).

4. **Intégrations Complémentaires** :
   - Onglet ajouté dans la barre latérale [`src/components/app-sidebar.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/components/app-sidebar.tsx) : "Santé Supabase (Anti-Veille)".
   - Widget rapide inséré dans le tableau de bord principal [`src/components/admin/DashboardClient.tsx`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/components/admin/DashboardClient.tsx) via `SupabaseQuickStatus.tsx`.
   - Configuration Vercel Cron [`vercel.json`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/vercel.json) : fréquence `"0 0 */2 * *"`.
   - Workflow GitHub Actions [`.github/workflows/supabase-keepalive.yml`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/.github/workflows/supabase-keepalive.yml) : cron planifié chaque 2 jours.

## 🔒 Sécurité & Masquage
Toutes les variables sensibles (`DATABASE_URL`, `SUPABASE_KEY`) restent masquées et protégées par placeholders.
