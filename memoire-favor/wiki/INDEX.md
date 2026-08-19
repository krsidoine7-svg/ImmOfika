<!-- Dernière mise à jour : 07 Août 2026 -->

# INDEX.md — Table des Matières du Wiki
## Favor Company International — Mémoire Externe

> Point d'entrée unique du wiki. Tous les fichiers sont listés ici avec leur description.  
> Mettre à jour à chaque ajout d'un nouveau fichier.

---

## 🗂️ Navigation Rapide

| Je cherche... | Je vais dans... |
|---|---|
| Vision et objectifs du projet | [projet/vision.md](#projet) |
| Architecture technique | [projet/architecture.md](#projet) |
| État d'avancement (roadmap) | [projet/roadmap.md](#projet) |
| Une décision technique | [decisions/decisions-technique.md](#decisions) |
| Une décision business | [decisions/decisions-business.md](#decisions) |
| Un bug TypeScript | [erreurs/typescript.md](#erreurs) |
| Un bug Supabase / RLS | [erreurs/supabase.md](#erreurs) |
| Un bug Paystack | [erreurs/paystack.md](#erreurs) |
| Un bug Next.js | [erreurs/nextjs.md](#erreurs) |
| Un pattern backend validé | [bonnes-pratiques/patterns-backend.md](#bonnes-pratiques) |
| Un pattern frontend validé | [bonnes-pratiques/patterns-frontend.md](#bonnes-pratiques) |
| La doc Supabase du projet | [stack/supabase.md](#stack) |
| La doc Paystack du projet | [stack/paystack.md](#stack) |
| Le résumé d'une session | [sessions/](#sessions) |
| Le style de travail | [personnes/profil-travail.md](#personnes) |

---

## 📁 projet/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `projet/vision.md` | Objectifs business, cible, valeur ajoutée | Mai 2026 |
| `projet/architecture.md` | Architecture technique macro du projet | Mai 2026 |
| `projet/roadmap.md` | MVP_1 → MVP_4, features et statuts | Mai 2026 |
| `projet/rbac.md` | Rôles, permissions, RBAC granulaire | Mai 2026 |
| `projet/services.md` | Services proposés par Favor Company | Mai 2026 |
| `projet/flux_et_onboarding.md` | Cartographie complète des flux, onboarding et procédures détaillées | Juillet 2026 |

**Relations :** Ces fichiers sont la source de vérité du projet. Ils sont liés aux decisions/ et à la roadmap dans TASKS.md.

---

## 📋 decisions/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `decisions/decisions-technique.md` | Choix stack, ORM, patterns, outils | — |
| `decisions/decisions-business.md` | Processus métier, pricing, fonctionnel | — |
| `decisions/decisions-securite.md` | Choix sécurité, chiffrement, politique | — |
| `decisions/decisions-ui.md` | Choix design system, couleurs, composants | — |

**Format de chaque décision :**
```
Date | Décision | Contexte | Raison | Alternative rejetée | Liens
```

---

## 🐛 erreurs/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `erreurs/typescript.md` | Erreurs TypeScript et solutions | — |
| `erreurs/supabase.md` | Erreurs Supabase, RLS, Auth | — |
| `erreurs/paystack.md` | Erreurs Paystack, webhooks, paiements | — |
| `erreurs/nextjs.md` | Erreurs Next.js, build, routing | — |
| `erreurs/drizzle.md` | Erreurs Drizzle ORM, migrations | — |
| `erreurs/general.md` | Autres erreurs non catégorisées | — |

**Relations :** Chaque bug résolu dans erreurs/ a une référence vers la session fourtour où il a été résolu.

---

## ✅ bonnes-pratiques/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `bonnes-pratiques/patterns-backend.md` | Server Actions, webhooks, auth | — |
| `bonnes-pratiques/patterns-frontend.md` | Composants, UI, responsive | — |
| `bonnes-pratiques/patterns-db.md` | Drizzle, RLS, migrations | Mai 2026 |
| `bonnes-pratiques/patterns-securite.md` | Chiffrement AES, validation, OWASP | — |
| `bonnes-pratiques/patterns-paiement.md` | Paystack, webhooks, idempotence | — |
| `bonnes-pratiques/workflow-git.md` | Branches, commits, CI/CD | Mai 2026 |

---

## 🛠️ stack/

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `stack/nextjs.md` | Patterns Next.js App Router utilisés | — |
| `stack/supabase.md` | Config Supabase, RLS, Realtime | — |
| `stack/paystack.md` | Intégration Paystack CI | — |
| `stack/drizzle.md` | Schéma, migrations, queries Drizzle | — |
| `stack/tailwind-shadcn.md` | Design tokens, composants shadcn/ui | — |
| `stack/cloudflare-r2.md` | Upload, URLs signées, R2 | — |
| `stack/resend.md` | Templates emails, envoi transactionnel | — |

---

## 📅 sessions/

| Fichier | Description |
|---|---|
| `sessions/2026-05-10.md` | Session 001 — Setup projet + documentation |
| `sessions/2026-05-16.md` | Session 002 — GitHub réel + workflow Git |
| `sessions/2026-05-16_soir.md` | Session 003 — Architecture RLS & Paystack |
| `sessions/2026-05-17.md` | Session 004 — Perfectionnement UI/UX Hybride & Clean Code |
| `sessions/2026-05-18.md` | Session 005 — Finitions F05 & Build Production |
| `sessions/2026-05-25.md` | Session 006 — Finalisation & Livraison du MVP-1 |
| `sessions/2026-05-25_soir.md` | Session 007 — Correctif Déconnexion, Traduction, Responsiveness & Performance |
| `sessions/2026-05-25_nuit.md` | Session 008 — Consolidation de la Mémoire et Directives IA |
| `sessions/2026-05-27.md` | Session 009-018 — Gestion des Biens & Intégration PDF/Excel |
| `sessions/2026-06-04.md` | Session 027-031 — CRM, Pipeline de Vente & Suivi des Leads |
| `sessions/2026-06-05.md` | Session 032-035 — Agenda iCal, Disponibilités & Soft Delete |
| `sessions/2026-06-10.md` | Session 036 — Configuration Dynamique Page d'Accueil |
| `sessions/2026-06-11.md` | Session 049-053 — Routines de build, audit de sécurité et linting |
| `sessions/2026-06-29.md` | Session 054-055 — Tests de charge Locust |
| `sessions/2026-07-04.md` | Session 057 & 059 — Dashboard, modération & PWA |
| `sessions/2026-07-07.md` | Session 060 — Résolution HMR local et implémentation complète des notifications push PWA & VAPID |
| `sessions/2026-07-08.md` | Session 061-063 — Résolution du bug de redirection Supervision & Modération, droits 'admin' et onboarding |
| `sessions/2026-07-09.md` | Session 064 — Intégration de la résilience Google OAuth, refonte complète des Paramètres Globaux en version mono-page |
| `sessions/2026-07-11.md` | Session 065 — Audit de sécurité, veille CVE-14, corrections lint/build Next.js, cahier de recette v3.0 et découpage git |
| `sessions/2026-07-12.md` | Session 066 — Consolidation typographique Calibri, cloche de pagination simple, et intégration des scénarios réels CRM/Onboardings |
| `sessions/2026-08-07.md` | Session 067 — Connexion de la Base de Données au Catalogue Public & Ajustements UI (Hero, Pagination, Lenis) |

**Relations :** Chaque résumé de session pointe vers le fichier fourtour correspondant.

---

## 👤 personnes/

> ⚠️ AUCUNE donnée personnelle identifiable. Uniquement le profil de travail.

| Fichier | Description | Dernière MAJ |
|---|---|---|
| `personnes/profil-travail.md` | Style de travail, préférences, rythme | — |
| `personnes/preferences-techniques.md` | Outils préférés, façon de coder | — |
| `personnes/contexte-projet.md` | Contexte business (anonymisé) | — |

---

## 🔗 Relations entre les sections

```
projet/architecture.md
    ↕ lié à
decisions/decisions-technique.md
    ↕ lié à
stack/*.md (détails d'implémentation)
    ↕ lié à
bonnes-pratiques/*.md (patterns validés)
    ↕ lié à
erreurs/*.md (bugs rencontrés en appliquant ces patterns)
    ↕ tous référencent
sessions/*.md → fourtour/*.md (journal source)
```

---

## 📝 Comment maintenir cet index

À chaque création d'un nouveau fichier dans le wiki :
1. Ajouter une ligne dans le tableau de la section correspondante
2. Décrire brièvement le contenu du fichier
3. Mettre à jour la date
4. Vérifier si des relations existent avec d'autres fichiers → les documenter

---

*Index créé : Mai 2026 | Mis à jour : automatiquement à chaque session*
