# ImmOfika — Guide Complet Utilisateur & Administrateur

> **Plateforme Immobilière & Promotion Agréée**  
> **Version du document** : 2.0  
> **Date de mise à jour** : 25 Octobre 2026  
> **Statut de validation** : Certifié conforme RBAC & Cybersécurité OWASP  

---

## 1. Introduction & Présentation de la Plateforme

**ImmOfika** est une solution logicielle SaaS haut de gamme dédiée à la gestion, la promotion et la transaction immobilière certifiée. Elle met en relation directe et sécurisée les locataires, acquéreurs, propriétaires-bailleurs, agences immobilières et promoteurs agréés.

### 🎨 Charte & Principes Fondamentaux
* **Couleurs officielles** : Vert Émeraude Menthe (`#10B981`, `#059669`, `#ECFDF5`) & Blanc Pur (`#FFFFFF`).
* **Design** : Épuré, moderne, réactif sur smartphone, tablette et grand écran.
* **Sécurité par conception (Security by Design)** : Refus d'accès par défaut, vérification de chaque action côté serveur, zéro confiance aux données transmises par le navigateur, journalisation immuable de tous les événements sensibles.

---

## 2. Architecture des Rôles & Matrice des Permissions (RBAC)

La plateforme repose sur un système de contrôle d'accès fondé sur les rôles (**RBAC** : *Role-Based Access Control*). Chaque compte utilisateur est rattaché à l'un des 8 profils hiérarchiques suivants :

| Niveau | Rôle Technique | Titre Français | Description & Périmètre d'Action |
| :---: | :--- | :--- | :--- |
| **8** | `super_admin` | **Super Administrateur** | Accès universel absolu, gestion de la matrice des rôles, configuration système et audit. |
| **7** | `admin` | **Administrateur** | Gestion opérationnelle complète de la plateforme, gestion des utilisateurs, validation des paiements. |
| **6** | `moderateur` | **Modérateur de Contenu** | Examen, approbation et rejet motivé des annonces immobilières soumises par les bailleurs. |
| **5** | `comptable` | **Comptable / Finance** | Consultation financière, vérification des transactions Paystack, export des rapports comptables. |
| **4** | `support` | **Chargé de Support Client** | Traitement des demandes d'assistance, suivi des réclamations et médiation des litiges. |
| **3** | `commercial` | **Agent Commercial** | Suivi du portefeuille clients, gestion des rendez-vous et qualification des contacts (leads). |
| **2** | `bailleur` | **Propriétaire / Promoteur** | Publication d'annonces, gestion de son parc de biens propres, suivi des réservations et loyers. |
| **1** | `client` | **Locataire / Acquéreur** | Recherche géolocalisée d'annonces, réservation avec acompte légal, messagerie et dépôt KYC. |

### 2.1 Modèle Multi-Organisations (Agences Immobilières & Promoteurs Agréés)
La marketplace supporte nativement les entités professionnelles morales à Abidjan :
* **Table « organizations »** : Fiche d entreprise certifiée comportant raison sociale, sigle, numéro RCCM officiel, compte contribuable (NCC / DGI), numéro d agrément ministériel (MCLU), commune d implantation et coordonnées de contact.
* **Membres & Collaborateurs (« organization_members »)** : Rattachement de négociateurs, assistants et gérants avec ségrégation stricte des mandats et biens immobiliers par cabinet.
* **Alertes & Candidatures (« recherches_alertes », « dossiers_candidats »)** : Sauvegarde des critères géographiques et transmission de dossiers solvables chiffrés.
* **Signalements Communautaires (« signalements »)** : Outil de dénonciation des annonces douteuses, arnaques de démarcheurs ou fausses photos, traité par la modération.

### 2.2 Matrice des Permissions Immobilières Pure (Moindre Privilège Strict)
Les privilèges du système sont exclusivement calibrés pour les transactions immobilières :
* **Gestion des Annonces** : « annonce:voir_publiques » (public), « annonce:creer:own » (propriétaires et agences), « annonce:moderer » (modérateurs et administrateurs), « annonce:supprimer:own » (propriétaires).
* **Parcours Candidat & Alertes** : « dossier:deposer:own » (candidats locataires/acheteurs), « recherche_alerte:gerer:own » (acheteurs), « dossier:consulter:mandataire » (agences et bailleurs recevant une candidature).
* **Organisations & Cabinets** : « organisation:gerer_profil:own », « organisation:inviter_membres:own » (gérants d agences et promoteurs).
* **Modération & Anti-Fraude** : « signalement:creer » (utilisateurs connectés), « signalement:traiter » (modérateurs), « avis:moderer » (modérateurs).
* **Permissions Sensibles 🔒** : « paiement:configurer », « reglages:systeme », « sauvegarde:gerer » (réservées exclusivement au Super Administrateur).

### 2.3 Purge Définitive du CRM Monoclient & Découplage Marketplace
Dans le cadre de la transition d'un outil mono-agence vers une marketplace ouverte et multi-acteurs :
* **Suppression des tables CRM et Tally** : Les tables `leads`, `lead_interactions`, `formulaires` et `formulaire_reponses` ont été définitivement supprimées via la migration `0024_drop_crm_leads_and_tally.sql`.
* **Prises de Rendez-vous Marketplace Libres** : Le module `visites` est désormais directement rattaché aux profils d'utilisateurs (`client_id`), libéré de toute dépendance à un pipeline de prospection mono-agence.
* **Formulaires de Contact Direct & Sécurisés** : La prise de contact sur les annonces s'effectue via l'action serveur `envoyerMessageContactAction` munie d'un piège à robots (honeypot OWASP) et d'une limitation de débit (rate limiting) par adresse IP. Les demandes sont transmises en direct aux annonceurs respectifs (particuliers, agences, promoteurs).
* **Épuration de la Console d'Administration** : Les menus obsolètes « CRM Leads » (`/admin/leads`) et « Formulaires Tally » (`/admin/formulaires`) ont été totalement retirés de la barre latérale et du catalogue de permissions.

### 🔒 Les Permissions Sensibles Verrouillées
Pour garantir la souveraineté du système, certaines permissions critiques sont **verrouillées nativement** et ne peuvent pas être déléguées par accident :
* `roles:manage` (Modifier la matrice des rôles) : Réservé exclusivement au rôle `super_admin`.
* `system:config` (Paramètres techniques du serveur) : Réservé exclusivement au rôle `super_admin`.
* Protection du dernier Super Admin : Il est techniquement impossible de révoquer ou de supprimer le dernier Super Administrateur de la plateforme.

---

## 3. Connexion, Comptes & Sécurité

### 3.1 Création de Compte & Sélection du Profil Marketplace
1. Cliquez sur le bouton **« Créer un compte »** ou naviguez sur /auth/register.
2. Sélectionnez visuellement votre profil marketplace parmi les 4 catégories officielles :
   * **Acheteur / Locataire** (client) : Recherche de biens d exception, demande de visites, alertes automatiques et dépôt de dossier candidat.
   * **Propriétaire Particulier** (proprietaire) : Publication directe de biens, engagement sur les titres de propriété et encaissement direct.
   * **Agence Immobilière** (gence) : Vitrine professionnelle, gestion des collaborateurs et portefeuille de mandats d agence.
   * **Promoteur Agréé** (promoteur) : Commercialisation de programmes neufs VEFA et lotissements validés par le Ministère (MCLU).
3. Renseignez un mot de passe sécurisé (au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial).
4. Validez votre compte par le lien d activation ou via Google SSO avec transmission immédiate du rôle choisi.

### 3.2 Parcours d Onboarding Obligatoire (Gating Edge & Proxy)
Afin de préserver la confiance et la qualité des transactions sur la marketplace, tout compte non finalisé est intercepté par le sas d onboarding (/auth/onboarding) :
* **Gating Edge / Proxy** : Aucune route privée (/client, /dashboard, /admin) n est accessible tant que is_onboarded est à faux.
* **Formulaire Client (Acheteur/Locataire)** : Renseignement du nom complet, téléphone (+225 joignable), commune d intérêt à Abidjan et intention de projet (achat/location).
* **Formulaire Propriétaire Particulier** : Coordonnées complètes, type de pièce officielle (CNI, Passeport) et engagement sur l authenticité des titres fonciers.
* **Formulaire Professionnel (Agence / Promoteur)** : Dénomination officielle, numéro RCCM, compte contribuable NCC DGI, numéro d agrément officiel MCLU (obligatoire pour promoteurs), coordonnées du siège et standard WhatsApp.
* **Génération automatique de l Organisation** : L onboarding professionnel crée automatiquement la structure dans la table « organizations », enregistre l utilisateur comme gérant dans « organization_members », puis débloque l accès au tableau de bord bailleur.

### 3.2 Mot de Passe Oublié & Bouclier Anti-Abus
Si vous avez oublié votre mot de passe :
1. Sur la page de connexion, cliquez sur **« Mot de passe oublié ? »**.
2. Renseignez l'adresse email de votre compte.
3. Un email contenant un lien de réinitialisation sécurisé vous est immédiatement adressé.
> 🛡️ **Protection de sécurité active** : Afin de bloquer les attaques par saturation, le serveur applique une limitation stricte de **3 demandes maximum par 15 minutes** pour votre connexion Internet, et **2 demandes par 15 minutes** pour une même adresse email.

### 3.4 Protection Anti-Élévation de Privilège & Étanchéité RLS
Conformément aux exigences de cybersécurité les plus strictes :
* **Verrouillage SQL du rôle** : La table « profiles » est protégée par un trigger PostgreSQL « protect_profile_role_update ». Tout utilisateur standard tentant de modifier son rôle (par exemple pour devenir administrateur) voit sa requête immédiatement bloquée par une exception SQL 42501.
* **RLS active à 100%** : L'ensemble des tables de la base de données (notamment « user_roles » et « default_role_permissions ») sont scellées par Row Level Security.
* **Protection du catalogue public** : L'API de biens « /api/biens » filtre obligatoirement « statut_moderation = valide », garantissant qu'aucune annonce en attente ou rejetée ne puisse être exposée aux visiteurs.

### 3.3 Protection Anti-Brute-Force sur le Code OTP
Lorsque vous saisissez un code de validation SMS/Email :
* Vous disposez de **5 tentatives maximum**.
* En cas de 5 codes erronés consécutifs, l'accès est temporairement verrouillé pendant **10 minutes** pour vous protéger contre toute tentative de piratage par devinette automatisée.

---

## 4. Guide Utilisateur : Locataires & Acheteurs (Clients)

### 4.1 Recherche Multicritères, Cartographie & Titres Fonciers Garantis (Abidjan)
Le portail public offre une expérience de recherche immobilière haut de gamme et sécurisée, adaptée aux réalités du marché abidjanais :
* **Recherche Multicritères Spécifique à Abidjan** :
  - **Communes phares** : Filtre rapide par commune (Cocody, Marcory, Plateau, Yopougon, Koumassi, Treichville, Port-Bouët, Bingerville, Grand-Bassam, Songon, Anyama...).
  - **Typologies de biens** : Villas et duplex, appartements de standing, terrains viabilisés, immeubles de rapport, bureaux et commerces.
  - **Paliers de budget intelligents** : Adaptés automatiquement selon le type de transaction (FCFA/mois pour la location, millions de FCFA pour la vente).
  - **Filtres avancés** : Nombre de pièces minimum, fourchette de surface (m²), équipements (piscine, parking privatif, sécurité 24/7, meublé).
* **Sécurisation Foncière & Titres de Propriété Légaux (MCLU)** :
  - **Badge ACD Garanti** : Pleine propriété immatriculée auprès du Ministère de la Construction, du Logement et de l'Urbanisme (titre suprême incontestable).
  - **Badge Certifié CMP** : Certificat de Mutation de Propriété validé par la Conservation Foncière.
  - **Titre Foncier & Baux Emphytéotiques** : Distinction claire du statut foncier pour sécuriser les investissements de la diaspora et des acquéreurs locaux.
  - **Filtre rapide « Titres Garantis (ACD/CMP) »** : Permet en un clic d'isoler uniquement les biens bénéficiant d'une garantie juridique maximale.
* **Cartographie Interactive d'Abidjan (Leaflet / OpenStreetMap)** :
  - **Bascule Grille / Carte** : Visualisez l'ensemble des annonces sur un plan interactif d'Abidjan centré sur les communes recherchées.
  - **Marqueurs de prix dynamiques** : Repères visuels indiquant directement le montant en FCFA sur la carte, avec popup enrichi (photo, caractéristiques, lien direct).
* **Badges des Annonceurs Agréés & Prise de Contact Directe** :
  - **Promoteur Agréé MCLU** : Mentionne l'agrément ministériel officiel et le numéro d'enregistrement.
  - **Agence Immobilière Agréée** et **Particulier Vérifié**.
  - **Bouton WhatsApp Direct** : Ouvre une conversation WhatsApp pré-remplie mentionnant la référence exacte de l'annonce et le prix.
  - **Bouton Appel Direct** : Raccordement téléphonique direct au standard commercial de l'annonceur.
* **Vitrine par Catégories** : Depuis la page d'accueil, consultez les 4 univers majeurs :
  1. *Maisons à louer*
  2. *Résidences meublées à louer*
  3. *Appartements à vendre*
  4. *Terrains & Parcelles à vendre*
* **Bouton « Voir plus »** : Chaque univers présente les 3 à 6 annonces les plus récentes, avec un bouton menant au catalogue complet filtré sur cette catégorie.
* **Recherche GPS « Près de chez vous »** : En autorisant la localisation de votre navigateur, ImmOfika trie automatiquement les annonces par ordre de proximité kilométrique.

### 4.2 Recherches Sauvegardées & Alertes Automatiques (/client/alertes)
L'espace client permet de créer et d'administrer des alertes immobilières personnalisées :
* **Critères géographiques précis** : Sélection de la commune d'Abidjan (Cocody, Marcory, Plateau, Yopougon, Bingerville...), type de transaction (Achat/Location), type de bien (Villa, Appartement, Terrain...) et plafond budgétaire en FCFA.
* **Option Titres Garantis ACD exclusivement** : Permet aux acquéreurs et à la diaspora de filtrer automatiquement les annonces pour n'être notifiés que des opportunités à la pleine propriété incontestable.
* **Gestion et commutation instantanée** :
  - **Interrupteur Marche/Arrêt** : Met en pause ou réactive une alerte sans perdre ses critères.
  - **Accès direct aux résultats** : Lien direct ouvrant le catalogue filtré sur les critères enregistrés.
  - **Suppression sécurisée** : Protection stricte par identifiant utilisateur (Anti-IDOR).

### 4.3 Dossier Candidat Numérique & Solvabilité Chiffrée (/client/dossier)
Pour accélérer les démarches locatives et d'acquisition, le client dispose d'un passeport de solvabilité numérique :
* **Informations professionnelles et financières** : Renseignement du métier, employeur, nature du projet (location/achat) et revenu net mensuel en FCFA.
* **Justificatifs chiffrés et scellés** :
  - CNI ou Passeport officiel en cours de validité.
  - 3 derniers bulletins de paie ou bilans financiers.
  - Attestation d'emploi ou extrait RCCM.
  - Quittance de loyer précédente.
* **Jauge dynamique de complétude** : Score de solvabilité calculé en temps réel (0% à 100%) selon les pièces fournies. Un seuil minimal de 40% est obligatoire pour soumettre le dossier à certification.
* **Confidentialité absolue (RLS)** : Vos justificatifs sont chiffrés et accessibles uniquement aux bailleurs et agences auprès desquels vous avez expressément candidaté.

### 4.4 Réservation d'un Bien & Acompte Légal Garanti (Mobile Money & Séquestre)
Pour verrouiller un bien immobilier et engager formellement la procédure notariale ou contractuelle :
1. Sur la fiche détaillée du bien, cliquez sur **« Réserver avec acompte légal »**.
2. **Calcul du montant légal selon la transaction** :
   * **Acquisition / Vente** : Acompte d'engagement légal de **10% du prix total** séquestré en compte certifié jusqu'à l'acte authentique notarié.
   * **Location** : Caution équivalente à **1 mois de loyer mensuel**.
   * Le serveur vérifie et impose strictement ce seuil minimal : aucun paiement partiel ou sous-évalué ne peut être validé.
3. **Paiement Multi-Canaux Paystack** :
   * **Mobile Money** : Wave, Orange Money, MTN MoMo, Moov Money.
   * **Cartes Bancaires** : Visa, Mastercard.
   * La transaction est scellée par signature cryptographique **HMAC-SHA512** empêchant toute interception ou falsification man-in-the-middle.
   * Dès confirmation, le bien bascule automatiquement au statut **« Réservé »**, générant une facture normalisée et préparant le projet de contrat d'acquisition.

### 4.5 Notifications Multi-Canaux & Veille Immobilière en Temps Réel
ImmOfika intègre un pipeline de notifications instantané (In-App et Email transactionnel) pour tous les acteurs :
* **Acomptes consignés** : Notification conjointe de l'acquéreur, du propriétaire annonceur et du service comptable dès validation du webhook Paystack.
* **Résultat de modération** : Information immédiate du diffuseur en cas d'approbation (visa ACD accordé) ou de refus motivé.
* **Arbitrage des signalements** : Notification de prise en charge pour les usagers vigilants ayant dénoncé une annonce suspecte.
* **Alertes de nouveaux biens** : Détection et dispatching automatique vers les acquéreurs dont les critères enregistrés correspondent à une annonce venant d'être validée.

### 4.6 Dépôt du Dossier d'Identité (KYC)
Pour louer ou acheter, vous devez transmettre une pièce d'identité officielle valide (CNI, Passeport, Attestation) :
1. Rendez-vous dans votre espace : **Mon Profil > Mes Documents KYC**.
2. Téléversez votre document.
> 🛡️ **Règles de sécurité des fichiers** :
> * Taille maximale acceptée : **5 Mo** par fichier.
> * Formats autorisés : **PDF, JPEG, PNG** exclusivement.
> * Tout fichier dont l'extension est trompeuse ou contenant un script déguisé est automatiquement détecté et rejeté par l'analyse binaire du serveur.

---

## 5. Guide Bailleur & Promoteur Agréé

### 5.1 Tableaux de Bord Annonceurs par Profil (/dashboard/bailleur)
Accessible depuis l'URL : `/dashboard/bailleur`, cet espace s'adapte automatiquement à votre profil d'acteur marketplace :
* **Profil Particulier Propriétaire** :
  - Suivi en temps réel de votre parc de biens propres (`owner_id = user.id`).
  - Compteurs synthétiques : Biens en ligne, Annonces en cours d'examen par la modération, Vues cumulées.
  - Lien direct vers la publication rapide d'une nouvelle offre.
* **Profil Agence Immobilière Partenaire** :
  - Visualisation centralisée de l'ensemble des mandats du cabinet (`organization_id`).
  - Onglet **« Organisation & Équipe »** : Dénomination légale, RCCM, compte contribuable NCC DGI, commune du siège.
  - **Rattachement de collaborateurs** : Possibilité pour le gérant d'inviter et d'assigner des négociateurs ou assistants commerciaux avec gestion des droits associés.
* **Profil Promoteur Immobilier Agréé (MCLU)** :
  - Badge de certification ministérielle et mise en avant du numéro d'agrément officiel (`agrement_numero`).
  - Pilotage des programmes neufs en VEFA et des parcelles viabilisées avec ACD garanti.
* **Onglet « Candidatures & Réservations Reçues »** :
  - Registre des dossiers candidats transmis par les clients sur vos biens.
  - Consultation de la solvabilité déclarée (profession, employeur, revenus mensuels nets en FCFA).
  - Prise de contact direct en un clic via WhatsApp ou appel téléphonique.

### 5.2 Publication d'une Nouvelle Annonce
1. Cliquez sur le bouton **« Déposer une annonce »**.
2. Remplissez le formulaire étape par étape :
   * **Informations générales** : Type de bien, catégorie (location / vente), titre attractif, description claire.
   * **Conditions financières** : Prix loyer mensuel ou prix de vente total, charges éventuelles.
   * **Localisation précise** : Ville, commune, quartier, coordonnées GPS (position sur la carte).
   * **Photographies & Médias** : Téléversez des photos nettes en haute définition (stockage sécurisé Cloudflare R2 haute vitesse).
3. Cliquez sur **« Soumettre pour modération »**.

### 5.3 Le Cycle de Modération
Pour préserver la crédibilité de la plateforme et lutter contre les arnaques :
* Toute annonce soumise prend le statut : `en_attente`.
* Elle est examinée sous 24h par l'équipe de modération ImmOfika.
* Si le dossier est complet : l'annonce passe au statut `approuve` et devient visible publiquement.
* En cas de non-conformité : l'annonce passe au statut `rejete`. Le modérateur vous indique obligatoirement un **motif clair de rejet** pour vous permettre de corriger votre annonce et de la soumettre à nouveau.

### 5.4 Espace Vitrine & Promotion en Vedette (`/admin/vitrine`)
Les agences partenaires et promoteurs immobiliers agréés bénéficiant de l'option de visibilité sponsorisée disposent d'un espace dédié pour paramétrer leur vitrine :
1. Rendez-vous dans le menu latéral **« Ma Vitrine en Vedette »** (`/admin/vitrine`).
2. Renseignez et maintenez à jour vos canaux directs de contact :
   * **Numéro WhatsApp Direct** (au format international, ex: `2250701020304`) : Ce numéro génère automatiquement un bouton WhatsApp sur la page d'accueil permettant aux acquéreurs de démarrer une discussion instantanée pré-remplie sans intermédiaire.
   * **Téléphone Fixe / Mobile Professionnel** : Pour la mise en relation téléphonique directe (`tel:`).
   * **Commune & Quartier d'Implantation** (ex: *Cocody Riviera 3*, *Marcory Zone 4*).
   * **Courte Présentation / Bio** mettant en valeur vos réalisations, votre label agréé ou vos programmes neufs en cours.
3. **Bouton de Test Instantané** : Vérifiez d'un clic l'ouverture et le fonctionnement de votre lien WhatsApp avant publication.
> ℹ️ *Remarque de gouvernance* : Si le Super Administrateur a temporairement suspendu la section des partenaires vedettes, un bandeau d'information bienveillant vous avertit sur cette page que la diffusion publique est en pause administrative.

---

## 6. Guide Administrateur & Équipe Interne (Back-Office)

L'espace d'administration est accessible à l'adresse : `/admin`. Il est protégé par un contrôle d'autorisation serveur strict.

### 6.1 Console de Modération & Bouclier Anti-Fraude Abidjan (`/admin/moderation` & `/admin/biens`)
ImmOfika déploie un dispositif de modération et de veille anti-fraude rigoureux pour assainir le marché immobilier ivoirien :

1. **File d'Arbitrage des Signalements Communautaires** (`/admin/moderation`) :
   * Les acquéreurs et locataires peuvent dénoncer tout comportement suspect depuis la fiche d'un bien (démarcheur pirate sans mandat, faux prix d'appel, photos trompeuses ou bien déjà vendu).
   * Les modérateurs et administrateurs examinent chaque alerte et disposent de deux actions souveraines :
     - **« Valider le retrait »** : Retrait immédiat de l'annonce du catalogue public, passage du bien au statut de modération `rejete` et notification du motif légal au diffuseur.
     - **« Classer sans suite »** : Maintien de l'annonce si le signalement n'est pas fondé avec traçabilité administrative de la décision.
2. **Visa Foncière & Vérification des Titres de Propriété (MCLU)** :
   * Contrôle rigoureux de la nature juridique déclarée : Arrêté de Concession Définitive (ACD), Certificat de Mutation Propriété (CMP), Titre Foncier notarié ou Bail Emphytéotique.
   * Attribution du badge officiel de garantie juridique dès validation par l'équipe de modération.
3. **Détecteur Anti-Fraude & Doublons Suspects** :
   * Analyse comparative instantanée des annonces géolocalisées dans la même commune.
   * Détection automatique des démarquages pirates pratiqués par de faux intermédiaires (écart de prix suspect > 25% ou clone de titre).

### 6.2 Matrice Dynamique des Rôles & Permissions (`/admin/roles`)
Cet écran de pointe permet au Super Administrateur de piloter l'ensemble des privilèges de la plateforme :
1. **Grille interactive Rôles x Permissions** :
   * Chaque ligne représente un des 8 rôles.
   * Chaque colonne représente une action du système (`biens:create`, `users:manage`, `audit:read`, etc.).
   * Cochez ou décochez une case pour accorder ou révoquer un droit en temps réel.
2. **Indicateurs de sécurité** :
   * 🔒 **Cadenas** : Indique une permission sensible ou une règle native non modifiable.
3. **Bouton « Réinitialiser par défaut »** :
   * Présent sur chaque carte de rôle.
   * Permet de restaurer en 1 clic les permissions officielles d'origine du rôle en cas d'erreur de manipulation.

### 6.3 Journal d'Audit & Traçabilité (`/admin/audit`)
ImmOfika intègre un registre d'audit légal immuable (non modifiable, non supprimable) :
* Chaque modification de permissions, rejet d'annonce, paiement initié ou incident de sécurité y est horodaté à la seconde près.
* **Alertes de sécurité consultables** :
  * `security.webhook_tampering` : Tentative de notification de paiement frauduleuse.
  * `security.rate_limit_exceeded` : Tentatives excessives de mot de passe oublié.
  * `security.otp_brute_force_blocked` : Tentatives de piratage d'un code OTP bloquées.
* Des filtres par utilisateur, date et type d'action facilitent les enquêtes de conformité.

### 6.4 Gestion des Promoteurs en Vedette & Interrupteur Général (Kill-Switch) (`/admin/configuration`)
La section **« Promoteurs Vedettes »** sur la page d'accueil met en avant les acteurs agréés ayant souscrit un partenariat ou une redevance de sponsoring :
1. **Interrupteur Général Maître (Kill Switch)** :
   * Le Super Administrateur peut **activer ou désactiver d'un seul clic** l'intégralité de la section publique.
   * **Désactivé** : La section disparaît immédiatement de la page d'accueil sans casser le design ni laisser d'espace vide. L'onglet `/admin/vitrine` des promoteurs informe que la fonctionnalité est en pause administrative.
   * **Activé** : La section s'affiche immédiatement entre les catégories de biens et la section de réassurance légale.
2. **Gestion du Contenu & Partenaires Sponsorisés** :
   * Titre, sous-titre et badge personnalisables (ex: *« Partenaires Officiels & Promoteurs Agréés »*).
   * Liste des partenaires sponsorisés avec : nom de la société, badge officiel, numéro d'agrément ministériel, commune, courte description, logo, bouton WhatsApp et bouton d'appel direct.
   * Ajout, modification ou suppression d'un partenaire avec persistance instantanée via `updateHomepageSectionAction`.

---

## 7. Foire Aux Questions (FAQ) & Dépannage

### ❓ Que faire si mon compte est bloqué pendant 10 minutes lors de la saisie d'un code OTP ?
> Il s'agit d'une sécurité automatique suite à 5 tentatives erronées. Patientez 10 minutes complètes sans faire de nouvelle demande, puis recommencez avec le dernier code reçu par SMS.

### ❓ Pourquoi mon document d'identité KYC est-il rejeté au téléversement ?
> Assurez-vous que :
> 1. Le document pèse moins de **5 Mo**.
> 2. Le format est strictement un fichier **PDF, JPG ou PNG**.
> 3. L'image est lisible et non compressée par une application tierce qui altérerait sa structure.

### ❓ Pourquoi le bouton de réservation n'accepte-t-il pas un montant personnalisé inférieur ?
> Le système applique strictement la loi sur l'acompte de réservation immobilier minimum (10% de la valeur). Il est techniquement impossible pour le navigateur ou un tiers de contourner ce seuil serveur.

### ❓ Qui contacter en cas d'urgence technique ?
> Contactez le support officiel de la plateforme à l'adresse configurée dans `src/config/site.ts` ou via le module de messagerie interne.


### 6.4 Sécurisation Avancée & Protection des Données (OWASP Top 10)
ImmOfika applique les plus hauts standards de sécurité bancaire et applicative :
* **Filtrage Middleware Global (`src/middleware.ts`)** : Tout visiteur non authentifié est stoppé dès l'entrée réseau avant même le chargement des pages privées (`/admin`, `/client`, `/dashboard`).
* **Protection Anti-Force Brute Serveur** : Le serveur limite les tentatives de connexion à 5 échecs par tranche de 15 minutes par adresse IP et par e-mail. Le blocage est inaltérable même en rechargeant la page.
* **Politique de Mots de Passe Renforcée** : L'inscription exige au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial, avec contrôle Zod côté serveur et guide visuel dynamique.
* **Sécurisation Binaire des Avatars** : La photo de profil est bridée à 2 Mo avec validation binaire des *magic bytes* (JPEG, PNG, WebP) pour interdire tout fichier corrompu ou script exécutable.
* **Isolation et Non-Mise en Cache** : Les sections privées injectent les en-têtes HTTP `Cache-Control: no-store, no-cache, must-revalidate` et la directive `force-dynamic` pour empêcher la rétention de données personnelles par les proxys et CDN.
* **Alertes d'Audit Supplémentaires** :
  * `auth.login_failed` : Échec de connexion avec saisie de faux identifiants.
  * `security.login_brute_force_blocked` : Blocage automatique de 15 minutes déclenché.
  * `access.denied` : Tentative d'accès non autorisé à une section restreinte.


---

## 8. Système RBAC Hybride & Moindre Privilège Strict (v2.1)

### 8.1 Principes Directeurs
1. **Refus par défaut (Default Deny)** : Toute action ou permission non explicitement accordée à l'un des rôles actifs de l'utilisateur est rejetée par défaut (erreur 403).
2. **Fonction Centrale `exiger(permissionCode, ressource?)`** :
   - Vérifie la session active (renvoie 401 si non connecté).
   - Vérifie que le compte n'est pas suspendu (renvoie 403 si suspendu).
   - Effectue l'union des permissions issues des rôles non expirés du compte.
   - Contrôle la portée `:own` (propriété stricte anti-IDOR) par rapport à `:all` (vision globale réservée aux administrateurs).
   - Met en cache les droits pendant 60 secondes en mémoire, avec **invalidation immédiate** à chaque modification (`invaliderCachePermissions()`).

### 8.2 Les 12 Garde-fous Serveur Immuables
- **Garde-fou #1 : SUPER_ADMIN verrouillé** : Ses permissions ne peuvent pas être modifiées, même par un autre administrateur.
- **Garde-fou #2 : Règle du Miroir** : Un Administrateur ne peut accorder que des permissions qu'il possède lui-même.
- **Garde-fou #3 : Anti-escalade Hiérarchique** : Modification autorisée uniquement pour les rôles de niveau strictement inférieur.
- **Garde-fou #4 & #5 : Permissions Sensibles 🔒** : Réservées au Super Admin uniquement (`sauvegarde:gerer`, `paiement:configurer`, `reglages:systeme`, `produit:supprimer_definitif`). Alerte email instantanée expédiée à tous les Super Administrateurs à chaque altération.
- **Garde-fou #6 : Interdiction d'auto-modification** : Il est strictement impossible de modifier ses propres rôles ou privilèges.
- **Garde-fou #7 : Protection du Dernier Super Admin** : Impossible de supprimer, désactiver ou rétrograder le dernier Super Administrateur de la plateforme.
- **Garde-fou #8 : Rôles Système Protégés** : Les rôles système par défaut ne peuvent pas être supprimés (bouton de réinitialisation minimale disponible).
- **Garde-fou #9 : Plafond Multi-Rôles** : Limité à un maximum de 2 rôles cumulés par compte utilisateur.
- **Garde-fou #10 : Séparation des Tâches (Rôles Incompatibles)** : Cumuls strictement interdits : `COMPTA + LOGISTIQUE`, `COMPTA + CATALOGUE`, `SUPPORT + COMPTA`, `ADMIN + SUPER_ADMIN`.
- **Garde-fou #11 : Attributions Temporaires** : Prise en charge d'une date d'expiration (`expiresAt`) avec invalidation automatique après échéance.
- **Garde-fou #12 : Traçabilité Complète** : Tout octroi, révocation ou refus d'accès est tracé dans le journal d'audit immuable avec adresse IP et acteur.

### 8.3 Console d'Administration `/admin/roles`
L'écran d'administration offre trois onglets opérationnels :
- **Matrice des Permissions** : Visualisation matricielle avec cases à cocher optimistes et grisées selon les privilèges de l'acteur, et bouton de réinitialisation par rôle.
- **Attribution des Rôles (Multi-Rôles)** : Formulaire d'attribution avec validation d'incompatibilité et plafond de 2 rôles en temps réel, sélecteur d'expiration et liste des rôles actifs.
- **Journal d'Audit RBAC** : Registre horodaté des 50 dernières actions de sécurité avec détails JSON et IP.


---

## 9. Facturation Normalisée Électronique (FNE — DGI Côte d'Ivoire / Arrêté 0337)

### 9.1 Cadre Légal & Réglementaire
Conformément à l'**Arrêté n° 0337 MFB/DGI du 09 mai 2025** et aux articles 384 et 385 du Code Général des Impôts (CGI), ImmOfika applique la facturation électronique obligatoire pour toutes les transactions et encaissements :
- **Identification Fiscale Officielle** :
  - **NCC (Numéro de Compte Contribuable)** : `2034567A`
  - **Régime d'Imposition** : Régime Normal d'Imposition (RNI)
  - **Centre des Impôts de Rattachement** : DGI - Centre des Impôts de Cocody
  - **RCCM** : `CI-ABJ-2024-B-14285`
  - **TVA Applicable** : 18% (Taux normal légal de la République de Côte d'Ivoire)

### 9.2 Le Sticker Électronique & QR Code (Art. 4)
Chaque facture générée comporte simultanément les trois éléments du sticker officiel :
1. **Visuel Officiel FNE** : Badge fiscal « CERTIFIÉ DGI - CI (FNE) ».
2. **QR Code Vectoriel Haute Définition** : Code de certification scannable par le contrôleur des impôts et le client, pointant directement vers `https://fne.dgi.gouv.ci/v/[NuméroFNE]`.
3. **Format de Numérotation Séquentiel (Art. 5)** :
   $$\text{Numéro} = [\text{Préfixe}] + \text{NCC} + \text{Année (2 car.)} + \text{Séquence annuelle ininterrompue (10 car.)}$$
   - Facture de vente (acompte, loyer) : `2034567A260000000001` (sans préfixe)
   - Facture d'avoir (remboursement, annulation) : `A2034567A26000000001` (préfixe `A`)
   - Facture proforma : `P2034567A26000000001` (préfixe `P`)

### 9.3 Gestion Comptable dans le Back-Office (`/admin/paiements`)
- **Badge de Certification FNE** : Indique instantanément si le paiement a reçu son visa fiscal DGI.
- **Téléchargement FNE PDF** : Permet de télécharger le PDF certifié intégrant le sticker électronique et la ventilation fiscale complète.
- **Bouton « Avoir »** : Permet à un utilisateur avec permission comptable d'émettre un avoir officiel FNE préfixé `A` en cas de litige ou désistement.
