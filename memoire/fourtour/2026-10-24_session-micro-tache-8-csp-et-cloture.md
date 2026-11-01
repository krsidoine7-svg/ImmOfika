# Session du 24/10/2026 : Micro-tâche 8 — Content-Security-Policy & Sécurisation Staff 2FA

## Contexte
Clôture du plan de sécurisation de la marketplace ImmOfika : implémentation de l'en-tête HTTP Content-Security-Policy (CSP) et consolidation de la politique de sécurité pour le personnel d'administration.

## Actions Réalisées
1. **Intégration de la Content-Security-Policy (`next.config.ts`)** :
   - Définition d'une politique CSP stricte :
     * `default-src 'self'`
     * `script-src` : whitelist Paystack (`js.paystack.co`), Google APIs, unsafe-inline pour l'hydratation.
     * `connect-src` : whitelist Supabase (`*.supabase.co`, websocket `wss://*.supabase.co`), Paystack API (`api.paystack.co`, `standard.paystack.co`), Cloudflare R2 (`*.r2.dev`, `pub-*.r2.dev`).
     * `img-src` : Supabase, Cloudflare R2, Unsplash, Google APIs.
     * `frame-src` : Paystack Checkout.
     * `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`.
2. **Double Authentification Staff (2FA)** :
   - Interface de configuration des paramètres de sécurité activable dans l'administration (`/admin/parametres/securite`) avec paramètre `require2FA`.
3. **Validation finale de l'ensemble du projet** :
   - Cache Next.js régénéré.
   - `npx tsc --noEmit` s'est terminé avec un code de sortie 0 (zéro erreur).
