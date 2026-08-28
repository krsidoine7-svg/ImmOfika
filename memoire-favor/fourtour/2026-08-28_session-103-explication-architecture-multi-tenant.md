# Journal de Session — 28 Août 2026

## 📌 Sujet & Demande Utilisateur
Explications architecturales et stratégiques sur la duplication de projet vs l'architecture Multi-Tenant (SaaS) avec gestion RBAC (Roles & Permissions) pour ImmOfika.

## 📝 Actions & Réponses
1. **Clarification du modèle de déploiement** :
   - Explication de l'architecture dupliquée par instance (Marque blanche) avec fichiers `.env.local` et [`src/config/site.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOPRO/src/config/site.ts) distincts par client.
   - Explication du modèle Multi-Tenant SaaS unifié (1 seule instance, isolation par `organization_id`).

2. **Détail du système RBAC Multi-Tenant** :
   - Explication de l'isolation étanche par Row Level Security (RLS) Supabase.
   - Structuration des rôles au sein d'une organisation : Admin (Owner), Manager, Agent, Client.
   - Proposition du schéma Drizzle/SQL pour `organizations` et `organization_members`.

## 🔒 Sécurité & Conformité
Toutes les variables d'environnement respectent les placeholders et la sécurité du projet (`{{DATABASE_URL}}`, `{{SUPABASE_KEY}}`).
