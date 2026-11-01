# Addendum — Mise à jour Exhaustive du Manuel avec Toutes les Ramifications & Liens des Flux (26 Juillet 2026)

## 📌 Modifications Consignées
- **Ajout des 6 Variantes & Ramifications Metier** :
  - **Variante 1A** : Échec / Interruption Paiement Paystack ➔ Relances auto Cron à 24h & 48h.
  - **Variante 1B** : Annulation Post-Paiement ➔ Application stricte de la retenue des 10% (acompte gardé pour frais, remboursements des échéances ultérieures seules).
  - **Variante 2A** : Tentative d'importation format non-PDF ➔ Rejet strict `application/pdf`.
  - **Variante 2B** : Omission d'une des 3 zones obligatoires ➔ Bouton d'envoi verrouillé avec message d'erreur.
  - **Variante 3A** : Expiration du token de signature (> 7j) ➔ Écran d'expiration + Demande nouveau lien.
  - **Variante 3B** : Demande de modification client ➔ Notification temps réel agent & passage en `en_revision_agent`.
- **Ajout des Liens vers les 5 Autres Flux Interconnectés** :
  1. `01_Onboarding_Auth/Procedure_Auth_OTP.md` (Authentification)
  2. `02_KYC_Verification/Procedure_Verification_KYC.md` (Vérification CNI/Passeport)
  3. `03_Reservations_Paiements/Procedure_Choix_Bien_Paystack.md` (Choix de bien & Acompte)
  4. `04_Gestion_Biens_Offres/Procedure_Attribution_Agent.md` (Attribution & Dossier Agent)
  5. `05_Notifications_Relances/Procedure_Cron_Relances.md` (Cron Relances)
- **Conversion Word (.docx)** : Régénérée et validée avec succès via `python .skills/skillFlow/scripts/md_to_docx.py`.
