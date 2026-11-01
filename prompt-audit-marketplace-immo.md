# PROMPT — Audit + plan de transformation en marketplace immobilière (Abidjan)

## 0. Règles absolues
- Tu travailles à la racine du projet. **Phase 1 = lecture seule.** Tu ne modifies, ne crées et ne supprimes aucun fichier du projet tant que je n'ai pas validé le plan (seul le rapport d'audit peut être écrit dans `/docs/audit/`).
- **N'invente rien.** Chaque constat doit citer sa source : `chemin/fichier.ts:ligne`. Si tu ne trouves pas une information, écris « non trouvé » ou « non vérifiable », jamais une supposition présentée comme un fait.
- Distingue toujours : ✅ existe et fonctionne / ⚠️ existe mais incomplet ou fragile / ❌ n'existe pas / 🔀 existe mais ne convient pas à une marketplace.
- Avant de commencer, **liste les skills disponibles** et ne charge que ceux utiles à l'étape en cours (ex. frontend-design pour l'UI, un skill de recette/QA pour la phase de test). Ne charge pas tout.
- Détecte les versions réelles dans `package.json` (Next.js, React, Supabase, Tailwind, shadcn/ui, Lucide) et **vérifie les pratiques actuelles dans la documentation officielle** (App Router, Server Components/Actions, `@supabase/ssr`, RLS, Storage, Auth) plutôt que de te fier à ta mémoire.

## 1. Contexte métier
Le projet a été créé pour **un seul client (une société de promotion immobilière)** afin qu'il gère son entreprise en interne. Je veux le transformer en **marketplace publique pour Abidjan** : toute personne qui cherche à acheter, louer ou investir (maison, appartement, local commercial, terrain, programme neuf) doit trouver un bien fiable, avec des annonces vérifiées, en quelques clics.

Problèmes à résoudre : annonces non conformes à la réalité, intermédiaires multiples (démarcheurs), recherches qui durent des mois, manque de confiance, difficulté à trouver selon un budget et un nombre de pièces précis.

Stack : React, Next.js, Supabase, shadcn/ui, Tailwind CSS, Lucide.

## 2. Profils cibles
**Demande**
- Visiteur (non connecté) : consulte annonces, filtres, carte ; doit s'inscrire pour contacter, mettre en favoris ou programmer une visite.
- Acheteur / Locataire : recherches sauvegardées, alertes, contact, visites, dépôt de dossier (pièce d'identité, justificatifs de revenus).

**Offre**
- Propriétaire particulier : publie et gère ses biens, parcours simple, vérification de propriété.
- Agent immobilier indépendant : publie pour des mandants, profil pro (carte pro, zone, avis).
- Agence immobilière : compte entreprise, plusieurs agents, tableau de bord commun, performances, abonnement.
- Promoteur immobilier : programmes neufs (VEFA), lots, plans, phases de livraison.

**Administration**
- Super administrateur : config globale, rôles, paiements, paramètres.
- Modérateur : validation des annonces, signalements, fraude, doublons.
- Support / Gestionnaire de litiges.
- Commercial / Account manager : agences et promoteurs, abonnements, offres sponsorisées.

**Optionnels** : Prestataires de services (déménageurs, artisans, assureurs) ; Photographe / Agent terrain.

## 3. PHASE 1 — Audit de l'existant (lecture seule)

### 3.1 Cartographie technique
- Arborescence, routes (App Router : pages, layouts, route handlers, server actions), middleware.
- Composants, hooks, utilitaires, types, validation (zod ou autre).
- Variables d'environnement utilisées (noms uniquement, jamais les valeurs).
- Dépendances inutiles, dupliquées ou obsolètes.

### 3.2 Base de données et sécurité Supabase
- Lis les migrations / schéma SQL : tables, colonnes, types, clés étrangères, index, contraintes, enums, triggers, fonctions, vues.
- **RLS** : pour chaque table, RLS activée ou non, liste des policies, et cas où une table est exposée sans policy.
- Buckets Storage et leurs policies (photos, documents d'identité, justificatifs : doivent être privés).
- Utilisation de la `service_role` : où, pourquoi, risque d'exposition côté client.
- Types générés Supabase à jour ou non.

### 3.3 Authentification, rôles et permissions
- Méthodes de connexion/inscription existantes (email, téléphone/OTP, OAuth).
- Où et comment le rôle est stocké (table `profiles`, `user_metadata`, `app_metadata`, claims JWT). Signale tout stockage modifiable par l'utilisateur lui-même (faille).
- Comment les routes sont protégées (middleware, layouts, server actions, RLS). Vérifie que la protection ne repose **pas** uniquement sur l'UI.
- Matrice réelle des droits existants : rôle × ressource × action (voir, créer, modifier, supprimer, valider).
- Écarts avec le **principe du moindre privilège** : accès trop larges, rôles « admin » fourre-tout, absence de séparation des tâches.

### 3.4 Flux utilisateur existants
Pour **chaque flux**, pars de la page de connexion ou d'inscription et suis le parcours réel dans le code, écran par écran :
- Inscription → vérification → premier accès → onboarding → première action utile.
- Connexion, mot de passe oublié, déconnexion, changement de rôle.
- Création/édition/publication d'un bien, upload de photos, gestion du statut.
- Recherche, filtres, carte, fiche annonce, favoris, contact, prise de rendez-vous, dépôt de dossier.
- Pour chaque flux : étapes, fichiers concernés, états d'erreur gérés ou non, cas limites, impasses (écran sans sortie), redirections après connexion.

### 3.5 Onboarding par profil
Pour chacun des profils listés en section 2, indique :
1. S'il existe aujourd'hui dans le code (✅/⚠️/❌/🔀).
2. Les informations **actuellement collectées** à l'inscription et à l'onboarding.
3. Les informations **nécessaires** pour que le profil soit complet et utilisable sans problème (ex. : propriétaire → identité + preuve de propriété + téléphone ; agent → carte pro, zone ; agence → raison sociale, RCCM/registre, responsable, agents ; promoteur → RCCM, références de programmes ; acheteur → budget, type de bien, communes, nombre de pièces, contact préféré).
4. Les champs manquants, les validations absentes, la logique de « profil complet » (une annonce ou un contact doit être bloqué si le profil est incomplet).
5. Les documents requis, leur stockage sécurisé et leur circuit de vérification.

### 3.6 Fonctionnalités marketplace
Vérifie l'existence et la qualité de : recherche multicritères (commune/quartier d'Abidjan, budget, pièces, surface, type, achat/location), carte, alertes, favoris, messagerie ou mise en relation, visites, dossiers, avis, signalements, modération, badges « vérifié », abonnements/paiements (Mobile Money : Orange Money, MTN, Wave), SEO des pages annonces, performance, responsive mobile (usage majoritairement mobile), états vides/chargement/erreur.

### 3.7 Incohérences et éléments hors marketplace
Identifie précisément :
- Ce qui est **spécifique au client unique** et ne doit pas être exposé au public (CRM interne, comptabilité, RH, stocks, tableaux de bord internes, données clients, textes ou logos en dur au nom du client).
- Ce qui est mono-tenant et doit devenir multi-annonceurs (isolation des données par propriétaire/agence).
- Incohérences : doublons de tables/composants, noms de rôles différents entre code et base, routes orphelines, champs jamais utilisés, logique dupliquée, code mort.
- Données de test ou secrets présents dans le dépôt.

## 4. Livrables de la Phase 1
Écris dans `/docs/audit/` :
1. `01-cartographie.md` — structure, routes, schéma DB, dépendances.
2. `02-securite-rls-permissions.md` — état RLS, matrice des droits actuelle vs cible (moindre privilège), failles classées Critique / Majeur / Mineur.
3. `03-flux-utilisateur.md` — chaque flux décrit étape par étape, avec problèmes et améliorations.
4. `04-onboarding-par-profil.md` — tableau profil × informations requises/existantes/manquantes.
5. `05-incoherences-et-hors-marketplace.md`.
6. `06-plan-de-transformation.md` — voir section 5.

Termine par un **résumé de 15 lignes maximum** : top 10 des problèmes, ce qui est réutilisable tel quel, et les décisions que tu attends de moi.

## 5. Plan de transformation (étape par étape)
Propose un plan ordonné, chaque étape étant **petite, testable et réversible**, avec : objectif, fichiers/tables touchés, dépendances, risques, critères d'acceptation, estimation d'effort (S/M/L). Ordre attendu :

1. **Sécurité et fondations** : corriger les failles critiques, activer RLS partout, rôles via `app_metadata`/table dédiée non modifiable par l'utilisateur, nettoyage des secrets.
2. **Modèle de données marketplace** : rôles, organisations (agences/promoteurs) et membres, annonces, statuts (brouillon → en modération → publiée → archivée), médias, vérifications, favoris, alertes, visites, dossiers, signalements, avis. Migrations versionnées.
3. **Rôles et permissions (moindre privilège)** : matrice rôle × ressource × action ; policies RLS correspondantes ; garde côté serveur ; tests de permission (chaque rôle ne peut faire que ce qui est prévu, et rien d'autre).
4. **Auth et onboarding par profil** : inscription → choix du profil → formulaire adapté → documents → statut de vérification → accès débloqué par palier. Profil « complet » vérifié côté serveur.
5. **Séparation du back-office client** : isoler ou retirer les modules internes de l'ancien client du périmètre public.
6. **Fonctions publiques** : recherche et filtres, carte, fiche annonce, SEO.
7. **Fonctions connectées** : favoris, alertes, contact/visites, dossier.
8. **Fonctions annonceurs** : publication, tableau de bord, équipe d'agence, programmes neufs.
9. **Administration** : modération, fraude/doublons, litiges, abonnements, offres sponsorisées.
10. **Paiements Mobile Money, notifications (SMS/WhatsApp/email), performance, accessibilité, mobile.**
11. **Recette complète** par profil, du début (connexion/inscription) à la fin de chaque flux.

## 6. Règles d'implémentation (Phase 2, après ma validation)
- Une étape à la fois ; je valide avant de passer à la suivante.
- Aucune logique d'autorisation uniquement côté client : toujours serveur + RLS.
- Moindre privilège par défaut : tout est refusé tant qu'une policy ne l'autorise pas explicitement.
- Valider toutes les entrées côté serveur ; fichiers sensibles dans des buckets privés avec URLs signées.
- Réutiliser les composants shadcn/ui et le design system existants ; icônes Lucide ; Tailwind.
- Après chaque étape : lancer lint, typecheck, build et tests ; résumer ce qui a changé, ce qui reste, les risques.
- En cas de doute ou d'ambiguïté métier, **pose-moi la question** au lieu de deviner.

Commence maintenant par la Phase 1, section 3.1.
