# Journal de Session (07 Août 2026) : Rédaction Algorithmique du Flux Connexion & Réinitialisation Mot de Passe

## 📌 Horodatage & Contexte
- **Date** : 07 Août 2026 (23:14:45 UTC)
- **Acteur** : Chef de Projet IA (`chefs-favor`)
- **Fichier Impacté** : `FavorCompany_Flux/01_Onboarding_Auth/PROCEDURE_CONNEXION_REINITIALISATION_MOT_DE_PASSE.md` et `.docx`
- **Objet** : Rédaction complète et détaillée en langage naturel du flux d'authentification (FLOW-AUTH-02) sous forme d'algorithme pas à pas, lisible et accessible à tous les intervenants (investisseurs, clients, auditeurs, développeurs).

---

## 🛠️ Modélisation Algorithmique Réalisée

1. **Branche A : Parcours de Connexion Normale**
   - Étape A.1 : Accès à l'écran `/auth/login` & contrôle préalable du cookie de session active (`sb-access-token`). Protection `autoComplete="new-password"`.
   - Étape A.2 : Saisie des identifiants et validation locale des formats.
   - Étape A.3 : Authentification Serveur Supabase Auth (`signInWithPassword`) et messages neutres anti-énumération de comptes.
   - Étape A.4 : Contrôle de sécurité du profil `public.profiles` (`deleted_at` soft delete) et mise à jour de `last_login_at`.
   - Étape A.5 : Aiguillage RBAC (`client` $\rightarrow$ `/client/dashboard`, `agent`/`admin` $\rightarrow$ `/admin/dashboard`), dépôt des cookies HTTP-Only et initialisation PWA WebPush/Sons.

2. **Branche B : Parcours "Mot de Passe Oublié" (OTP)**
   - Étape B.1 : Demande de réinitialisation `/auth/forgot-password`.
   - Étape B.2 : Génération du jeton OTP temporaire (15 min) et envoi de l'email HTML transactionnel (`react-email` / Resend).
   - Étape B.3 : Validation du lien sécurisé et ouverture de `/auth/reset-password`.
   - Étape B.4 : Saisie du nouveau mot de passe (règles de complexité 8+ car, majuscule, chiffre, symbole), mise à jour Supabase et invalidation de l'OTP.

3. **Branche C : Parcours de Déconnexion (Logout)**
   - Étape C.1 : Déclenchement depuis `NavUser.tsx` ou `ClientHeader.tsx`.
   - Étape C.2 : Exécution de `signOut()`, destruction des cookies et nettoyage des caches locaux.

4. **Conversion DOCX Certifiée**
   - Regénération automatique du document Word `PROCEDURE_CONNEXION_REINITIALISATION_MOT_DE_PASSE.docx`.

---

## 🔒 Sécurité & Protection des Données
- Données sensibles masquées avec placeholders `{{...}}`.
- Aucune donnée confidentielle exposée.
