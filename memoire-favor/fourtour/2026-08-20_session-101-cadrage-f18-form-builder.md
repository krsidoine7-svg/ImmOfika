# Session 101 — Cadrage & Planification F18 (Générateur de Formulaires Tally)

## 🎯 Objectif
Planifier et définir la structure technique de la fonctionnalité **F18 — Générateur de Formulaires (style Tally)** pour la plateforme ImmOfika.

## 🛠️ Décisions Techniques Validées
1. **Tables de données** :
   - `formulaires` : Stocke le titre, le slug unique, la configuration des champs JSONB, le statut (`actif`/`archive`) et l'email de notification admin.
   - `formulaire_reponses` : Stocke les valeurs soumises (JSONB), les fichiers téléversés, et les métadonnées de l'émetteur.
2. **Interface d'administration** (`/admin/formulaires`) :
   - Constructeur Drag & Drop moderne Tally-style avec palette de 12 types de champs.
   - Éditeur de propriétés (label, placeholder, requis, options, type & taille max de fichier).
   - Onglet d'aperçu en direct.
3. **Rendu Client & Partage** (`/f/[slug]`) :
   - Validation dynamique Zod + `react-hook-form`.
   - Support des 12 types de champs + Téléversement de fichier sur S3/Supabase Storage.
4. **Notifications & Exports** :
   - Notification admin en direct (Resend Email + In-app notification).
   - Export des réponses sous formats Excel (.xlsx) et CSV.
   - Envoi du lien par email à un destinataire directement depuis l'Admin.

## 🔒 Masquage & Sécurité
- Données d'accès masquées via `{{SUPABASE_URL}}`, `{{DATABASE_URL}}`, `{{RESEND_API_KEY}}`.
