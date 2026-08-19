# 🔐 Répertoire des Comptes Officiels & Identifiants
## Favor Company International — Promoteur Immobilier Agréé
**Date de génération :** 4 Juillet 2026  
**Environnement :** Production / Staging Supabase  
**Sécurité :** Mots de passe chiffrés en base (bcrypt/pgcrypto). À conserver en lieu sûr.

---

## 👑 1. Direction & Administrateurs (Rôle : `admin`)
*Accès total à la console Super Admin, validation des paiements, gestion des utilisateurs, audit légal et configurations FNE/OHADA.*

| Nom & Fonction | Email de connexion | Mot de passe | Téléphone | Rôle DB |
| :--- | :--- | :--- | :--- | :--- |
| **Kouassi Jean-Baptiste**<br>*(Directeur Général)* | `admin.general@favorcompany.ci` | `Admin!` | +225 0701020304 | `tech_super_admin` |
| **Me Koné Aminata**<br>*(Directrice Juridique & Conformité OHADA)* | `admin.juridique@favorcompany.ci` | `Admin123!` | +225 0705060708 | `admin` |

---

## 👔 2. Managers & Agents Commerciaux (Rôle : `agent`)
*Accès au dashboard agent, gestion du catalogue immobilier, suivi des visites sur site, export iCal et accompagnement client.*

| Nom & Secteur attribué | Email de connexion | Mot de passe | Téléphone | Rôle DB |
| :--- | :--- | :--- | :--- | :--- |
| **Bamba Sékou**<br>*(Responsable Agence Cocody Riviera)* | `manager.cocody@favorcompany.ci` | `FavorManager2026!#1` | +225 0501020304 | `agent` |
| **Diallo Fatou**<br>*(Responsable Agence Zone 4 & Marcory)* | `manager.zone4@favorcompany.ci` | `FavorManager2026!#2` | +225 0505060708 | `agent` |
| **Touré Yacouba**<br>*(Responsable Projets Balnéaires Assinie)* | `manager.assinie@favorcompany.ci` | `FavorManager2026!#3` | +225 0509101112 | `agent` |
| **N'Guessan Aya**<br>*(Responsable Lotissements Bingerville)* | `manager.bingerville@favorcompany.ci` | `FavorManager2026!#4` | +225 0513141516 | `agent` |
| **Yao Koffi**<br>*(Responsable Régional Yamoussoukro)* | `manager.yamoussoukro@favorcompany.ci` | `FavorManager2026!#5` | +225 0517181920 | `agent` |

---

## 👤 3. Clients & Investisseurs (Rôle : `client`)
*Accès à l'espace client, réservation en ligne (acompte 1/3), suivi du dossier ACD, factures normalisées FNE et calendrier des visites.*

| Nom & Profil | Email de connexion | Mot de passe | Téléphone | Rôle DB |
| :--- | :--- | :--- | :--- | :--- |
| **Diop Aboubacar**<br>*(Investisseur Diaspora - Paris)* | `client.investisseur@gmail.com` | `FavorClient2026!#1` | +33 601020304 | `client` |
| **Kassi Marie-Laure**<br>*(Particulier - Résidence Cocody)* | `client.particulier@yahoo.fr` | `FavorClient2026!#2` | +225 0101020304 | `client` |
| **Société Afrique Invest SARL**<br>*(Client Entreprise / B2B)* | `client.societe@afrique-invest.com` | `FavorClient2026!#3` | +225 0105060708 | `client` |

---

## 💡 Guide de Connexion et Test
1. **Accès au site :** Rendez-vous sur la page de connexion (`/login` ou `/auth/signin`).
2. **Saisie :** Entrez l'un des e-mails ci-dessus et le mot de passe associé.
3. **Redirection automatique :**
   - Un compte **`admin`** est redirigé vers `/admin` (Tableau de bord Super Admin).
   - Un compte **`agent`** (Manager) a accès à la gestion des biens et au planning `/admin/visites` et son flux iCal `/api/agenda/[id]/export.ics`.
   - Un compte **`client`** a accès à `/client` ou `/mon-compte` pour voir ses favoris et réservations.

---
> [!IMPORTANT]
> **Rappel de Sécurité (Directives Globales) :**  
> Conformément au statut de **Promoteur Immobilier Agréé**, ces identifiants donnent accès à des données à caractère personnel protégées par la loi ivoirienne n° 2013-450. En cas de départ d'un collaborateur ou d'audit de sécurité, les mots de passe doivent être réinitialisés depuis la console Supabase.
