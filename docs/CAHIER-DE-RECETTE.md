# Cahier de Recette Fonctionnelle, Securite et FNE — ImmOfika

## 1. Informations generales et Contexte Metier

| Element | Valeur |
| :--- | :--- |
| Plateforme | ImmOfika (Immobilier et Promotion Agreee) |
| Entreprise / Organisation | ImmOfika SARL — Agence et Promoteur Immobilier Agree |
| Secteur d'activite | PropTech & Promotion Immobiliere Agreee (Cote d'Ivoire, OHADA, FNE Arrete 0337) |
| Environnement de test | Production / Staging |
| URL du site | https://immofika.ci |
| Version testee | 2.4.0 (RBAC Robuste & FNE Integree) |
| Date | 31 Octobre 2026 |
| Perimetre | Portail public, vitrine, espace client, espace bailleur, console super admin, certification FNE, securite RBAC |

### Resume executif du projet
ImmOfika est une plateforme SaaS immobiliere et de promotion agreee en Cote d'Ivoire. Elle permet la commercialisation securisee de terrains avec Arrete de Concession Definitive (ACD) et de programmes neufs, la reservation en ligne avec acompte d'un tiers, la planification de visites sur site geolocalisees, la facturation normalisee electronique (FNE) conforme aux exigences de la DGI et la gouvernance stricte des acces selon le principe du moindre privilege via une matrice RBAC a 8 niveaux hierarchiques.

---

## 2. Consignes aux testeurs

Ce cahier de recette permet de tester et valider methodiquement chaque fonctionnalite du site ImmOfika.

### Consignes de test :
- Suivre scrupuleusement les etapes decrites dans chaque scenario pas-a-pas.
- Renseigner la colonne Validation : cocher OK si le resultat est conforme, ou NA si non applicable.
- A la fin de chaque module, remplir obligatoirement le Tableau de Validation avec votre nom, la date et vos remarques eventuelles, puis cocher Conforme ou Non Conforme.
- Legende des priorites : P1 critique (bloque la mise en service), P2 important, P3 mineur.
- Les tests marques « A EXECUTER UNIQUEMENT EN STAGING » ont un effet reel (paiement, envoi, suppression) : ne pas les lancer en production.

### Procedure obligatoire en cas d'anomalie ou de bug :
> Si une etape echoue ou presente une anomalie :
> 1. Faire une capture d'ecran nette montrant l'ecran et le message d'erreur.
> 2. Noter la reference exacte du test (exemple : Module 1 - Test 1.2).
> 3. Consigner l'incident dans le document de suivi BUGS_ET_AMELIORATIONS.docx avec la capture.

---

## 3. Repertoire des comptes de test et Matrice d'habilitations

Ce tableau unifie presente chaque profil d'utilisateur avec ses identifiants reels de test et la liste exhaustive de toutes ses habilitations autorisees sur la plateforme :

| Profil / Role | Identifiants de connexion reels | Droits et Actions autorisees (Ce que ce profil peut faire) |
| :--- | :--- | :--- |
| **Directeur General (Super Admin)** - Role : super_admin / tech_super_admin - Niveau 8 | Nom : Kouassi Jean-Baptiste - Email : admin.general@immofika.ci - Pass : Admin! - Tel : +225 0701020304 | - Creer, modifier, archiver et supprimer n'importe quel bien immobilier - Moderer l'ensemble des annonces de la plateforme - Consulter et gerer l'annuaire de tous les utilisateurs - Gerer et attribuer les roles dans la console /admin/roles - Consulter le journal d'audit immuable /admin/audit - Certifier les factures normalisees FNE DGI et generer des avoirs - Configurer les passerelles et cles marchandes Paystack - Supprimer definitivement des comptes (conformite RGPD/APDP) - Gerer les sauvegardes et la maintenance de la base de donnees |
| **Directrice Juridique (Admin)** - Role : admin - Niveau 7 | Nom : Me Kone Aminata - Email : admin.juridique@immofika.ci - Pass : Admin123! - Tel : +225 0705060708 | - Consulter l'integralite du catalogue de biens - Moderer et valider les annonces en attente - Traiter les signalements et litiges utilisateurs - Consulter les coordonnees de contact direct des usagers - Suspendre ou bloquer temporairement un utilisateur - Valider les paiements et certifier les factures FNE DGI - Consulter les statistiques d'audience et le journal d'audit - Restrictions : pas d'acces a la modification des roles (/admin/roles verrouille) - pas de suppression definitive de biens ni de comptes |
| **Agent Commercial Terrain (Cocody)** - Role : agent / commercial - Niveau 4 | Nom : Bamba Sekou - Email : manager.cocody@immofika.ci - Pass : ImmOfikaManager2026!#1 - Tel : +225 0501020304 | - Consulter le catalogue des biens et verifier les disponibilites - Gerer et qualifier son portefeuille de prospects et leads - Planifier, confirmer et realiser les visites sur site - Mettre a jour les comptes-rendus de visite terrain - Suivre les dossiers clients et reservations d'acompte - Gerer son agenda commercial et exporter son flux iCal Google Calendar - Restrictions : aucun acces aux interfaces d'administration - pas de droit de moderation - pas de suppression de biens |
| **Agent Commercial Terrain (Zone 4)** - Role : agent / commercial - Niveau 4 | Nom : Diallo Fatou - Email : manager.zone4@immofika.ci - Pass : ImmOfikaManager2026!#2 - Tel : +225 0505060708 | - Consulter le catalogue des biens du secteur Marcory / Zone 4 - Prendre en charge les demandes de visite entrantes - Planifier et valider les visites sur site - Qualifier les prospects et convertir les opportunites - Traiter les dossiers de reservation et d'acompte - Synchroniser son planning de disponibilite commercial - Restrictions identiques : aucune fonction d'administration ou de moderation |
| **Proprietaire Bailleur** - Role : proprietaire - Niveau 3 | Nom : Kouame Proprietaire - Email : proprietaire.test@immofika.ci - Pass : ImmOfikaBailleur2026!#1 - Tel : +225 0102030405 | - Publier des annonces de biens selon le quota de son abonnement - Modifier et mettre a jour ses propres annonces (:own) - Archiver ou retirer ses propres biens de la vitrine (:own) - Gerer ses residences et ensembles immobiliers prives - Consulter les messages et demandes de visite sur ses biens - Laisser des avis certifies et signaler des abus - Restrictions : gestion strictement limitee a ses propres biens (:own) - aucun acces aux biens des tiers ni aux menus d'administration |
| **Client Investisseur (Diaspora)** - Role : client - Niveau 2 | Nom : Diop Aboubacar - Email : client.investisseur@gmail.com - Pass : ImmOfikaClient2026!#1 - Tel : +33 601020304 | - Consulter l'ensemble du catalogue public des biens - Utiliser les filtres de recherche avances (titre ACD, commune, budget) - Enregistrer et gerer ses biens favoris dans son compte - Initier la reservation d'un bien avec paiement securise de l'acompte 1/3 - Suivre l'avancement de son dossier d'acquisition - Telecharger ses factures normalisees FNE certifiees avec QR code - Demander un creneau de visite sur site - Deposer un avis verifie apres visite - Signaler un contenu ou une annonce abusive - Restrictions : acces strictement refuse a toute route d'administration (/admin, /admin/roles, /admin/biens) |
| **Client Particulier** - Role : client - Niveau 2 | Nom : Kassi Marie-Laure - Email : client.particulier@yahoo.fr - Pass : ImmOfikaClient2026!#2 - Tel : +225 0101020304 | - Rechercher des logements et terrains disponibles - Enregistrer ses favoris personnels - Envoyer une demande de contact ou d'information a un commercial - Programmer un rendez-vous de visite sur site - Reserver un bien avec reglement d'acompte - Consulter ses recus et factures certifiees - Restrictions identiques : aucune autorisation sur les espaces d'administration |
| **Client Entreprise (B2B)** - Role : client - Niveau 2 | Nom : Societe Afrique Invest SARL - Email : client.societe@afrique-invest.com - Pass : ImmOfikaClient2026!#3 - Tel : +225 0105060708 | - Consulter les opportunites foncieres et commerciales - Gerer les acquisitions multi-lots d'entreprise - Effectuer les paiements d'acomptes corporate - Telecharger les factures normalisees FNE certifiees DGI au nom de la societe - Restrictions identiques : pas d'acces aux fonctionnalites d'administration |
| **Visiteur Public non connecte** - Role : visiteur - Niveau 1 | Nom : Visiteur Anonyme - Email : Non applicable - Pass : Non applicable - Tel : Non applicable | - Consulter librement la page d'accueil et les vitrines de programmes - Rechercher des biens selon les criteres publics - Visualiser les fiches descriptives detaillees et galeries photos - Envoyer un message via le formulaire de contact general - Consulter les mentions legales et la politique de confidentialite - Restrictions : redirection automatique vers /auth/login lors de toute tentative d'acces a un espace prive (/admin, /client, /dashboard) |

---

## Module 1 : Authentification et Securite d'Acces

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 1.1 | P1 | Connexion reussie Super Admin | 1. Aller sur https://immofika.ci/login 2. Saisir l'email admin.general@immofika.ci 3. Saisir le mot de passe Admin! 4. Cliquer sur le bouton « Se connecter » | Connexion immediate et redirection automatique vers le tableau de bord /admin. | [ ] OK [ ] NA |
| 1.2 | P1 | Rejet de connexion compte inexistant en base | 1. Aller sur https://immofika.ci/login 2. Saisir une adresse non inscrite toto@fika.com (ou inconnu.test@immofika.ci) 3. Saisir le mot de passe MotDePasseSecur1234! 4. Cliquer sur « Se connecter » | Rejet strict et immediat par le serveur avec affichage du message « Adresse e-mail ou mot de passe incorrect », aucune session ouverte, traçabilite dans les logs d'audit. Prouve que seuls les comptes crees en base peuvent acceder. | [ ] OK [ ] NA |
| 1.3 | P1 | Echec de connexion mot de passe errone sur compte existant | 1. Aller sur https://immofika.ci/login 2. Saisir admin.general@immofika.ci 3. Saisir un faux mot de passe FauxMotDePasse2026! 4. Cliquer sur « Se connecter » | La connexion est refusee avec affichage du message « Adresse e-mail ou mot de passe incorrect » sans reveler si le mot de passe seul est faux. | [ ] OK [ ] NA |
| 1.4 | P2 | Connexion reussie Commercial | 1. Aller sur https://immofika.ci/login 2. Saisir manager.cocody@immofika.ci 3. Saisir ImmOfikaManager2026!#1 4. Cliquer sur « Se connecter » | Connexion reussie et acces direct a la gestion du catalogue commercial. | [ ] OK [ ] NA |
| 1.5 | P1 | Connexion reussie Client | 1. Aller sur https://immofika.ci/login 2. Saisir client.investisseur@gmail.com 3. Saisir ImmOfikaClient2026!#1 4. Valider le formulaire | Connexion reussie et redirection automatique vers l'espace client /client/dashboard. | [ ] OK [ ] NA |
| 1.6 | P2 | Deconnexion de session | 1. Depuis le menu de navigation, cliquer sur le profil utilisateur 2. Cliquer sur « Se deconnecter » | Session detruite. L'utilisateur est renvoye sur /login et l'appui sur le bouton retour du navigateur ne reaffiche pas les donnees privees. | [ ] OK [ ] NA |
| 1.7 | P1 | Mot de passe oublie et limitation anti-abus | 1. Aller sur https://immofika.ci/auth/forgot-password 2. Saisir l'adresse client.particulier@yahoo.fr 3. Cliquer 4 fois consecutives sur envoyer en moins de 30 secondes | Des la 4e demande, le serveur bloque la requete avec le message « Trop de tentatives depuis votre adresse IP. Veuillez patienter 15 minutes avant de reessayer ». | [ ] OK [ ] NA |
| 1.8 | P1 | Blocage anti-brute-force code OTP | 1. Aller sur https://immofika.ci/auth/verify-otp 2. Saisir le numéro +225 0701020304 3. Saisir 5 fois de suite un code errone 000000 | Au 5e echec consecutif, le systeme affiche « Nombre maximal de tentatives atteint. Votre acces est temporairement bloque pendant 10 minutes ». | [ ] OK [ ] NA |

### Validation du Module 1
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 2 : Vitrine Publique, Navigation et Recherche

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 2.1 | P2 | Affichage vitrine par catégorie | 1. Ouvrir la page d'accueil https://immofika.ci 2. Faire défiler jusqu'à la vitrine des biens | L'onglet « Toutes les catégories » est actif par défaut et présente les catégories Maisons, Résidences, Appartements, Terrains avec 3 à 6 annonces par bloc. | [ ] OK [ ] NA |
| 2.2 | P2 | Navigation « Voir plus » par univers | 1. Sur la page d'accueil https://immofika.ci, faire défiler jusqu'au bloc Appartements 2. Cliquer sur le bouton « Voir plus » | Redirection immédiate vers le catalogue complet /biens filtré sur la catégorie choisie. | [ ] OK [ ] NA |
| 2.3 | P1 | Recherche géolocalisée « Près de chez vous » | 1. Sur la vitrine https://immofika.ci, cliquer sur l'onglet « Près de chez vous » 2. Autoriser la localisation du navigateur | Les annonces sont réorganisées par ordre de proximité kilométrique par rapport à votre position actuelle. | [ ] OK [ ] NA |
| 2.4 | P1 | Recherche infructueuse avec critères inexistants | 1. Aller sur le catalogue https://immofika.ci/biens 2. Taper dans la barre de recherche « VilleInexistante999 » et valider | Aucun bien ne s'affiche et le message « Aucun bien ne correspond à vos critères de recherche » est visible. | [ ] OK [ ] NA |

### Validation du Module 2
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 3 : Espace Bailleur et Publication d'Annonces

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 3.1 | P1 | Dépôt d'annonce par un propriétaire | 1. Se connecter avec manager.cocody@immofika.ci 2. Aller sur /dashboard/bailleur/nouveau 3. Renseigner le titre « Villa Duplex 5 Pièces Cocody Angré » 4. Fixer le loyer à 850 000 FCFA et valider | L'annonce est enregistrée avec le statut « En attente de modération » et visible dans l'espace bailleur. | [ ] OK [ ] NA |
| 3.2 | P2 | Modification de sa propre annonce (:own) | 1. Dans /dashboard/bailleur, ouvrir la villa créée 2. Modifier le prix à 900 000 FCFA 3. Cliquer sur « Enregistrer les modifications » | Les modifications sont enregistrées immédiatement pour le propriétaire du bien. | [ ] OK [ ] NA |
| 3.3 | P1 | Rejet de formulaire d'annonce incomplet | 1. Aller sur /dashboard/bailleur/nouveau 2. Laisser le titre et le prix vides 3. Cliquer sur le bouton « Publier l'annonce » | Le formulaire bloque la soumission et surligne en rouge les champs obligatoires manquants. | [ ] OK [ ] NA |

### Validation du Module 3
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 4 : Modération et Back-Office Admin

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 4.1 | P1 | Approbation d'une annonce soumise | 1. Se connecter avec admin.juridique@immofika.ci 2. Aller sur /admin/moderation 3. Sélectionner une annonce en attente 4. Cliquer sur « Approuver et publier » | Le statut passe à « Publié » et le bien devient immédiatement visible sur le catalogue public. | [ ] OK [ ] NA |
| 4.2 | P1 | Rejet motivé d'une annonce non conforme | 1. Dans /admin/moderation, sélectionner une annonce sans photo légale 2. Cliquer sur « Rejeter » 3. Saisir le motif « Photos non conformes ou floues » et valider | L'annonce est rejetée et un email explicatif automatique est envoyé au bailleur. | [ ] OK [ ] NA |
| 4.3 | P1 | Refus d'accès à la modération pour un client | 1. Se connecter avec client.particulier@yahoo.fr 2. Tenter d'ouvrir directement l'adresse https://immofika.ci/admin/moderation | Redirection immédiate vers /unauthorized avec journalisation de l'accès refusé dans la table audit_logs. | [ ] OK [ ] NA |

### Validation du Module 4
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 5 : Matrice des Rôles et Permissions RBAC

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 5.1 | P1 | Consultation de la matrice /admin/roles | 1. Se connecter avec admin.general@immofika.ci 2. Naviguer vers /admin/roles | Affichage de la matrice complète des 7 rôles et des 34 permissions officielles avec filtres par catégorie. | [ ] OK [ ] NA |
| 5.2 | P1 | Réinitialisation par défaut d'un rôle | 1. Sur la colonne du rôle SUPPORT, cliquer sur le bouton circulaire « Réinitialiser par défaut » 2. Confirmer dans la boîte de dialogue | Les permissions du rôle SUPPORT sont immédiatement restaurées à leurs valeurs minimales d'origine. | [ ] OK [ ] NA |
| 5.3 | P1 | Refus de modification de son propre rôle | 1. Se connecter avec admin.general@immofika.ci 2. Tenter de décocher une case sur la colonne « SUPER_ADMIN » | La case est cadenassée et inactive. Une tentative forcée renvoie l'erreur « Vous ne pouvez pas modifier les permissions de votre propre rôle ». | [ ] OK [ ] NA |

### Validation du Module 5
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 6 : Paiements Paystack, Acomptes et KYC

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 6.1 | P1 | Initialisation d'acompte légal Paystack | 1. Connecté en client, choisir un appartement disponible 2. Cliquer sur « Réserver ce bien » 3. Valider le versement de l'acompte de 100 000 FCFA | Redirection vers la passerelle sécurisée Paystack CI avec choix Mobile Money (Wave, Orange, MTN) ou Carte. | [ ] OK [ ] NA |
| 6.2 | P1 | Échec ou annulation de paiement Paystack | 1. Sur le guichet de paiement Paystack, observer les options 2. Cliquer sur « Annuler la transaction » | Retour automatique sur /client/reservations avec affichage du message « Le paiement a été interrompu ». | [ ] OK [ ] NA |
| 6.3 | P1 | Validation de paiement et webhook serveur | 1. Depuis la console de test Paystack, déclencher l'événement « charge.success » 2. Vérifier la réception sur /api/webhooks/paystack | Le statut de la réservation passe à « Payé / Confirmé » et la facture PDF est générée automatiquement. | [ ] OK [ ] NA |
| 6.4 | P2 | Dépôt de pièce d'identité KYC | 1. Dans /client/profil, section « Vérification KYC » 2. Téléverser une copie de Carte Nationale d'Identité au format JPEG 3. Cliquer sur le bouton « Transmettre mon dossier » | Le document est transmis avec succès et le statut du dossier passe à « En cours de vérification ». | [ ] OK [ ] NA |

### Validation du Module 6
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 7 : Journal d'Audit et Sécurité Avancée

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 7.1 | P1 | Consultation du registre d'audit /admin/audit | 1. Se connecter avec admin.general@immofika.ci 2. Ouvrir la page https://immofika.ci/admin/audit | Le registre immuable liste les événements horodatés à la seconde près avec adresse IP, acteur et action. | [ ] OK [ ] NA |
| 7.2 | P1 | Traçabilité des alertes de sécurité | 1. Sur https://immofika.ci/admin/audit, observer le filtre 2. Filtrer sur les actions « security. » | Présence des événements de sécurité bloqués comme security.rate_limit_exceeded ou security.login_brute_force_blocked. | [ ] OK [ ] NA |
| 7.3 | P1 | Interception Middleware et callbackUrl | 1. Sans être connecté, ouvrir l'URL directe https://immofika.ci/admin 2. Observer l'adresse dans la barre du navigateur | Redirection immédiate vers /auth/login?callbackUrl=%2Fadmin par le middleware sans afficher le contenu privé. | [ ] OK [ ] NA |
| 7.4 | P1 | Rate Limiting serveur de connexion | 1. Sur /auth/login, saisir 5 faux mots de passe consécutifs pour le même compte 2. Cliquer une 6e fois sur connexion | Blocage serveur de 15 minutes avec affichage du message « Trop de tentatives. Compte temporairement verrouillé ». | [ ] OK [ ] NA |
| 7.5 | P1 | Politique de mot de passe à l'inscription | 1. Aller sur /auth/register 2. Saisir le mot de passe simple « 12345 » | Rejet par le validateur serveur avec affichage des critères requis : 10 caractères, majuscule, chiffre et symbole. | [ ] OK [ ] NA |
| 7.6 | P1 | Sécurité binaire de l'avatar | 1. Dans /client/profil, ouvrir le sélecteur d'avatar 2. Tenter d'envoyer un faux fichier image (fichier texte nommé « image.png ») | Rejet immédiat par contrôle binaire des magic bytes avec message « Format d'image invalide ou corrompu ». | [ ] OK [ ] NA |
| 7.7 | P1 | Audit des accès refusés et Cache no-store | 1. Connecté en client, tenter d'ouvrir https://immofika.ci/admin 2. Vérifier les en-têtes réseau du navigateur | Redirection vers /unauthorized, journalisation de access.denied et présence de l'en-tête Cache-Control: no-store. | [ ] OK [ ] NA |

### Validation du Module 7
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 8 : Garde-fous RBAC Hybride et Moindre Privilège Strict

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 8.1 | P1 | Blocage permission sensible pour ADMIN | 1. Se connecter avec admin.juridique@immofika.ci 2. Tenter d'accorder la permission sensible paiement:configurer à un rôle inférieur | La case est grisée dans l'interface et le serveur lève une exception 403 « Seul un Super Administrateur peut accorder une permission sensible ». | [ ] OK [ ] NA |
| 8.2 | P1 | Règle du miroir pour l'administrateur | 1. Se connecter avec l'administrateur admin.juridique@immofika.ci 2. Tenter d'accorder au rôle « LOGISTIQUE » une permission non possédée | Blocage serveur par assertActorPossessesPermission avec le message « Un Administrateur ne peut accorder que des permissions qu'il possède lui-même ». | [ ] OK [ ] NA |
| 8.3 | P1 | Interdiction d'auto-modification de droits | 1. Connecté avec admin.juridique@immofika.ci, ouvrir /admin/roles 2. Tenter de modifier les privilèges de son propre compte | Blocage strict côté serveur par assertNotModifyingSelf avec le message « Il est strictement interdit de modifier ses propres rôles ou privilèges ». | [ ] OK [ ] NA |
| 8.4 | P1 | Verrouillage absolu du rôle SUPER_ADMIN | 1. Connecté en administrateur, cibler le rôle « SUPER_ADMIN » 2. Tenter de modifier ses attributions par une requête directe | Rejet immédiat avec le message « Le rôle SUPER_ADMIN est strictement verrouillé. Ses permissions ne peuvent pas être modifiées ». | [ ] OK [ ] NA |
| 8.5 | P1 | Protection du Dernier SUPER_ADMIN | 1. Dans /admin/utilisateurs, sélectionner l'utilisateur unique admin.general@immofika.ci 2. Cliquer sur « Désactiver le compte » | Rejet strict par assertNotLastSuperAdmin avec le message « Impossible de supprimer, suspendre ou rétrograder le DERNIER Super Administrateur ». | [ ] OK [ ] NA |
| 8.6 | P1 | Plafond Multi-Rôles limité à 2 | 1. Dans /admin/roles, onglet Attribution, sélectionner un utilisateur ayant déjà 2 rôles 2. Tenter de lui assigner un 3e rôle | Blocage immédiat dans le formulaire avec le message « Plafond atteint : un utilisateur ne peut pas cumuler plus de 2 rôles actifs ». | [ ] OK [ ] NA |
| 8.7 | P1 | Séparation des tâches et rôles incompatibles | 1. Dans /admin/roles, sélectionner un utilisateur ayant le rôle « COMPTA » 2. Tenter de lui ajouter le rôle « LOGISTIQUE » | Rejet immédiat par checkRoleCompatibility avec le message « Incompatibilité de fonctions. Les rôles COMPTA et LOGISTIQUE ne peuvent pas être cumulés ». | [ ] OK [ ] NA |
| 8.8 | P1 | Contrôle de portée :own anti-IDOR | 1. Connecté avec client.particulier@yahoo.fr, appeler la fonction exiger 2. Tenter de lire le profil privé d'un autre utilisateur | Blocage 403 immédiat avec le message « Vous ne pouvez agir que sur vos propres ressources (:own) » et journalisation anti-IDOR. | [ ] OK [ ] NA |

### Validation du Module 8
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 9 : Facturation Normalisée Électronique (FNE) et DGI Côte d'Ivoire

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 9.1 | P1 | Certification automatique FNE d'un paiement | 1. Valider le règlement d'un acompte Paystack de 1 180 000 FCFA 2. Vérifier la ligne correspondante dans la table paiements | Génération automatique d'un numéro officiel FNE au format 2034567A260000000001 (Art. 5) et statut fne_statut passé à « certifie ». | [ ] OK [ ] NA |
| 9.2 | P1 | Présence du Sticker Électronique officiel sur la facture | 1. Télécharger la facture PDF « FNE_2034567A260000000001.pdf » sur https://immofika.ci 2. Ouvrir le document PDF | Présence simultanée des 3 éléments officiels (Art. 4) : visuel officiel FNE DGI, QR Code scannable de certification et numéro de série ininterrompu. | [ ] OK [ ] NA |
| 9.3 | P1 | Scannabilité du QR Code de contrôle DGI | 1. Scanner le QR Code de la facture avec l'application appareil photo d'un smartphone 2. Ouvrir l'URL détectée « https://fne.dgi.gouv.ci/v/2034567A260000000001 » | Le lien pointe vers l'URL officielle https://fne.dgi.gouv.ci/v/2034567A260000000001 avec l'empreinte cryptographique de vérification. | [ ] OK [ ] NA |
| 9.4 | P1 | Mentions fiscales obligatoires de l'Arrêté 0337 | 1. Ouvrir le document PDF « FNE_2034567A260000000001.pdf » 2. Examiner l'en-tête de l'émetteur « ImmOfika » et le décompte | Présence obligatoire du NCC 2034567A, du Régime fiscal RNI, du Centre des Impôts de Cocody, du RCCM, de la ventilation HT (1 000 000 FCFA) et de la TVA 18% (180 000 FCFA). | [ ] OK [ ] NA |
| 9.5 | P1 | Émission d'une Facture d'Avoir FNE avec préfixe A | 1. Dans /admin/paiements, cliquer sur le bouton « Avoir » pour un paiement payé 2. Saisir le motif « Remboursement d'acompte suite désistement » et valider | Émission immédiate d'une facture d'avoir officielle préfixée A (ex: A2034567A260000000001), liée à la facture d'origine et statut passé à « rembourse ». | [ ] OK [ ] NA |
| 9.6 | P1 | Scellement et signature électronique SHA-256 | 1. Ouvrir la table paiements dans la base de données 2. Examiner la colonne « fne_signature » pour la facture certifiée | Présence d'une empreinte hexadécimale SHA-256 de 64 caractères garantissant l'intégrité et la non-répudiation des données fiscales. | [ ] OK [ ] NA |
| 9.7 | P1 | Rejet de certification sur paiement inexistant | 1. Appeler l'action serveur certifierPaiementManuelAction 2. Fournir un identifiant aléatoire de paiement inexistant « 00000000-0000-0000-0000-000000000000 » | Rejet immédiat avec levée d'exception « Paiement introuvable pour certification FNE » sans incrément de la séquence fiscale. | [ ] OK [ ] NA |

### Validation du Module 9
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 10 : Parcours de Bout en Bout Multi-Rôles

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 10.1 | P1 | Parcours complet Acquéreur Particulier à Facture FNE | 1. Se connecter avec client.investisseur@gmail.com 2. Sélectionner une villa dans le catalogue 3. Réserver avec acompte Paystack 4. Télécharger la facture FNE certifiée | Réservation confirmée, paiement encaissé, FNE certifiée avec QR Code scannable et email de confirmation reçu avec pièce jointe. | [ ] OK [ ] NA |
| 10.2 | P1 | Parcours Annulation et Génération d'Avoir FNE | 1. Se connecter avec admin.general@immofika.ci 2. Aller dans /admin/paiements 3. Cliquer sur « Avoir » sur la réservation précédente 4. Télécharger la facture d'avoir | Facture d'avoir préfixée A générée, statut passé à remboursé et audit tracé dans fne.credit_note_generated. | [ ] OK [ ] NA |
| 10.3 | P1 | Parcours Entreprise B2B avec numéro de compte contribuable | 1. Se connecter avec client.societe@afrique-invest.com 2. Réserver un local commercial en renseignant le NCC client « 9876543Z » 3. Télécharger la facture FNE générée | La facture FNE certifiée mentionne expressément le NCC du client professionnel conformément à l'article 6-3 de l'Arrêté 0337. | [ ] OK [ ] NA |

### Validation du Module 10
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 11 : Promoteurs & Agences en Vedette (Sponsoring & Kill Switch)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 11.1 | P1 | Désactivation et réactivation du module par le Super Admin | 1. Se connecter avec l'e-mail « admin.general@immofika.ci » 2. Naviguer vers l'URL « /admin/configuration » puis ouvrir l'onglet « Promoteurs Vedettes » 3. Désactiver le switch maître et cliquer sur « Enregistrer » 4. Vérifier la page d'accueil « / » et l'URL « /admin/vitrine » 5. Réactiver le switch maître et cliquer sur « Enregistrer » | Lorsque désactivé, la section disparaît totalement de la page d'accueil et la route « /admin/vitrine » affiche un bandeau d'alerte « Module Vitrine & En Vedette Désactivé ». À la réactivation, la section réapparaît immédiatement sur la page d'accueil. | [ ] OK [ ] NA |
| 11.2 | P1 | Mise en relation directe WhatsApp et Appel téléphonique | 1. Se rendre sur la page d'accueil « / » 2. Repérer la carte du promoteur certifié « SCPI Riviera Standing » 3. Cliquer sur le bouton vert « WhatsApp » 4. Cliquer sur le bouton noir « Appeler » | Le clic WhatsApp ouvre « https://wa.me/2250701020304 » avec le texte pré-rempli « Bonjour, je vous contacte depuis la plateforme ImmOfika ». Le clic appel déclenche le protocole « tel:+2250701020304 ». | [ ] OK [ ] NA |
| 11.3 | P2 | Configuration de la vitrine et coordonnées par l'Agent / Promoteur | 1. Se connecter avec l'e-mail « manager.cocody@immofika.ci » 2. Cliquer sur « Ma Vitrine en Vedette » dans la barre latérale vers « /admin/vitrine » 3. Renseigner le numéro WhatsApp « 2250501020304 » et cliquer sur « Enregistrer mes coordonnées » 4. Cliquer sur « Tester mon WhatsApp » | Notification toast « Coordonnées de vitrine enregistrées avec succès ! » affichée et redirection directe vers l'URL WhatsApp de test avec les nouvelles coordonnées. | [ ] OK [ ] NA |
| 11.4 | P1 | Cas limite : Tentative d'enregistrement avec numéro WhatsApp invalide | 1. Se connecter avec « manager.cocody@immofika.ci » sur « /admin/vitrine » 2. Vider le champ « Numéro WhatsApp » ou saisir des caractères alphabétiques invalides 3. Vérifier le bouton de test direct | Le système nettoie automatiquement la saisie pour ne conserver que les chiffres et empêche la génération d'un lien brisé vers l'API WhatsApp. | [ ] OK [ ] NA |

### Validation du Module 11
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 12 : Sécurité Fondations & Protection RLS (Étape 1 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 12.1 | P1 | Blocage absolu de l auto-promotion du rôle utilisateur | 1. Se connecter avec le compte client « client.particulier@yahoo.fr » 2. Tenter d exécuter une requête SQL ou API modifiant la colonne « role » du profil vers « admin » 3. Vérifier le message de rejet serveur | L opération est rejetée par une exception SQL avec le code d erreur « 42501 » et le libellé « Tentative d élévation de privilège interdite : la modification du rôle est réservée aux administrateurs. » Le rôle reste « client ». | [ ] OK [ ] NA |
| 12.2 | P1 | Étanchéité et protection RLS sur la table user_roles | 1. Se connecter avec le compte client « client.investisseur@gmail.com » 2. Tenter de lire ou d insérer des rôles d autres utilisateurs via la table « user_roles » 3. Vérifier les données retournées | La politique RLS « user_roles_read_own_or_admin » bloque la visibilité des autres comptes et « user_roles_admin_manage » interdit toute insertion directe. | [ ] OK [ ] NA |
| 12.3 | P1 | Filtrage strict des annonces dans le catalogue public | 1. Créer une annonce de test avec un compte bailleur avec le statut « en_attente » 2. Effectuer une requête sur l URL publique « /api/biens » 3. Examiner la liste des biens retournés | L annonce en attente n apparaît pas dans la liste publique car le filtre serveur « statut_moderation = valide » écarte automatiquement tout bien non approuvé. | [ ] OK [ ] NA |
| 12.4 | P1 | Cas limite : Tentative d accès à une route technique supprimée | 1. Tenter d ouvrir l URL « /test-supabase » depuis le navigateur 2. Observer la réponse du serveur Next.js | Le serveur renvoie immédiatement une page d erreur 404 « Page introuvable », attestant de la suppression effective de la surface d attaque. | [ ] OK [ ] NA |

### Validation du Module 12
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 13 : Modèle de Données Marketplace (Organisations, Alertes, Dossiers & Signalements)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 13.1 | P1 | Création et vérification d une organisation agence ou promoteur | 1. Se connecter avec le compte Super Admin « admin.general@immofika.ci » 2. Créer une organisation « Agence Cocody Prestige » avec son RCCM et numéro d agrément 3. Vérifier la lecture publique de l organisation | L organisation est enregistrée dans la table « organizations », son statut est vérifié et les internautes peuvent consulter sa fiche publique. | [ ] OK [ ] NA |
| 13.2 | P1 | Enregistrement d une alerte de recherche avec filtres Abidjan | 1. Se connecter avec le compte client « client.investisseur@gmail.com » 2. Enregistrer une alerte sur « Cocody Riviera » pour une villa 4 pièces avec budget 150 000 000 FCFA 3. Vérifier la table « recherches_alertes » | L alerte est enregistrée avec les critères JSON conformes, active, et strictement isolée au compte client connecté par la politique RLS. | [ ] OK [ ] NA |
| 13.3 | P1 | Dépôt sécurisé d un dossier candidat locataire | 1. Se connecter avec le compte client « client.particulier@yahoo.fr » 2. Soumettre un dossier candidat avec profession et justificatif d identité 3. Vérifier le stockage du chemin du document | Le dossier passe au statut « soumis » avec les métadonnées de revenu, et le document est stocké dans le répertoire sécurisé « private/dossiers/ ». | [ ] OK [ ] NA |
| 13.4 | P1 | Cas limite : Tentative de signalement abusif sans authentification | 1. Déconnecter la session utilisateur 2. Tenter d envoyer un signalement d annonce sur la table « signalements » sans session valide 3. Observer la réponse de la base de données | L insertion est rejetée par la politique RLS « signalements_create_connected » imposant obligatoirement un utilisateur connecté pour déposer un signalement. | [ ] OK [ ] NA |

### Validation du Module 13
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 14 : Matrice RBAC Immobilière Pure & Moindre Privilège (Étape 3 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 14.1 | P1 | Rejet d accès à la création d annonce pour un client | 1. Se connecter avec le compte client « client.investisseur@gmail.com » 2. Tenter d accéder à la route « /admin/biens/new » ou d exécuter « createBienAction » 3. Vérifier le blocage serveur | L accès est immédiatement rejeté par une redirection « /unauthorized » ou une exception serveur « Action non autorisée pour ce profil ». | [ ] OK [ ] NA |
| 14.2 | P1 | Autorisation de publication d annonce pour un propriétaire | 1. Se connecter avec le compte propriétaire « manager.cocody@immofika.ci » 2. Créer une nouvelle annonce sur « /admin/biens/new » 3. Vérifier le statut de l annonce créée | L annonce est enregistrée avec succès avec « owner_id » rattaché et le statut « en_attente » prêt pour examen par la modération. | [ ] OK [ ] NA |
| 14.3 | P1 | Accès restreint à la file de modération des annonces | 1. Se connecter avec le compte « admin.general@immofika.ci » 2. Naviguer vers « /admin/moderation » 3. Examiner la liste des annonces en attente et valider une annonce | La file des annonces en attente s affiche, le modérateur peut approuver ou rejeter avec motif obligatoire et persistance instantanée. | [ ] OK [ ] NA |
| 14.4 | P1 | Cas limite : Tentative d accès aux réglages système sensibles par un Admin | 1. Se connecter avec le compte « admin.juridique@immofika.ci » (niveau 7) 2. Tenter de modifier la permission sensible « reglages:systeme » ou « paiement:configurer » 3. Observer le refus d autorisation | L opération est bloquée avec le message « Seul un Super Administrateur peut accorder ou révoquer une permission sensible ». | [ ] OK [ ] NA |

### Validation du Module 14
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 15 : Authentification Multi-Profils & Onboarding Gating (Étape 4 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 15.1 | P1 | Inscription avec sélection de profil marketplace sur /auth/register | 1. Naviguer sur « /auth/register » 2. Choisir le profil « Promoteur Agréé » 3. Renseigner email et mot de passe conforme puis valider le formulaire | L inscription est enregistrée avec le rôle « promoteur », « is_onboarded » à faux, et un lien de confirmation est expédié sans faille. | [ ] OK [ ] NA |
| 15.2 | P1 | Redirection forcée Gating Onboarding vers /auth/onboarding | 1. Se connecter avec un compte venant de confirmer son email dont « is_onboarded » est faux 2. Tenter d accéder directement à « /dashboard/bailleur » ou « /client/dashboard » 3. Observer la redirection Edge / Proxy | Le proxy intercepte la requête privée et redirige immédiatement l utilisateur vers « /auth/onboarding » jusqu à validation complète de son profil. | [ ] OK [ ] NA |
| 15.3 | P1 | Finalisation de l onboarding Acheteur ou Locataire | 1. Être sur « /auth/onboarding » avec le rôle « client » 2. Saisir nom, prénom, numéro de téléphone (+225) et commune d intérêt 3. Soumettre le formulaire | Les données sont enregistrées, le compte passe à « is_onboarded = true », une alerte de recherche est créée et le client est redirigé sur son tableau de bord. | [ ] OK [ ] NA |
| 15.4 | P1 | Cas limite : Finalisation de l onboarding Agence ou Promoteur sans RCCM | 1. Être sur « /auth/onboarding » avec le rôle « agence » ou « promoteur » 2. Renseigner la raison sociale mais laisser le champ RCCM vide ou incomplet 3. Tenter de soumettre le formulaire | La soumission est bloquée avec le message d erreur « Le numéro de Registre de Commerce (RCCM) est obligatoire », empêchant la création d organisation fantôme. | [ ] OK [ ] NA |

### Validation du Module 15
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 16 : Isolation Back-Office & Découplage CRM Leads / Tally (Étape 5 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 16.1 | P1 | Absence des routes obsolètes de CRM leads dans le back-office | 1. Se connecter avec un compte administrateur 2. Tenter d accéder à « /admin/leads » ou « /admin/formulaires » 3. Examiner la réponse du serveur | L accès renvoie un statut 404 de route inexistante et les entrées ont été retirées de la barre latérale de navigation. | [ ] OK [ ] NA |
| 16.2 | P1 | Prise de rendez-vous de visite découplée du CRM | 1. Naviguer sur la fiche d un bien immobilier 2. Soumettre une demande de visite en ligne avec date et créneau 3. Vérifier l enregistrement dans la table « visites » | La visite est enregistrée avec succès avec son statut « planifiee », rattachée au bien et au compte utilisateur, sans dépendre d aucune table leads. | [ ] OK [ ] NA |
| 16.3 | P1 | Transmission de message de contact sécurisé | 1. Ouvrir le formulaire de contact rapide sur une annonce 2. Saisir nom, téléphone (+225) et message 3. Soumettre le formulaire | Le message est validé par « envoyerMessageContactAction », journalisé dans l audit trail et transmis sans persistance dans un pipeline leads CRM. | [ ] OK [ ] NA |
| 16.4 | P1 | Cas limite : Tentative de soumission par un robot avec champ honeypot | 1. Simuler l envoi d un message de contact avec le champ masqué « website_hp » renseigné 2. Observer le comportement de la Server Action 3. Vérifier l absence d impact en base de données | L action feint le succès pour tromper le bot spammeur sans effectuer aucune écriture en base de données ni déclencher d alerte inutile. | [ ] OK [ ] NA |

### Validation du Module 16
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 17 : Recherche Multicritères Abidjan, Fiches Biens & Cartographie Marketplace (Étape 6 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 17.1 | P1 | Filtrage multicritères par commune d'Abidjan et type de bien | 1. Naviguer sur « /biens » 2. Sélectionner la commune « Cocody » dans la barre de recherche ou la liste des communes 3. Choisir le type « Villa » 4. Lancer la recherche | La liste des annonces est instantanément filtrée pour ne présenter que les villas localisées à Cocody avec le compteur de résultats exact. | [ ] OK [ ] NA |
| 17.2 | P1 | Affichage et validation des badges de titres fonciers légaux | 1. Parcourir les annonces du catalogue ou ouvrir une fiche détaillée « /biens/[slug] » 2. Examiner la présence des badges de sécurisation juridique (ACD, CMP, Titre Foncier) 3. Survoler ou cliquer sur le badge | Le badge officiel apparaît avec son niveau de garantie (maximale ou haute) et la mention légale de conformité MCLU. | [ ] OK [ ] NA |
| 17.3 | P1 | Bascule vers la carte interactive et géolocalisation des biens | 1. Sur « /biens », cliquer sur le bouton de bascule « Carte » 2. Observer le rendu de la carte centrée sur Abidjan 3. Cliquer sur un marqueur de prix | La carte Leaflet/OpenStreetMap affiche les repères géographiques avec les prix en FCFA et le popup détaillé permettant d accéder directement à la fiche du bien. | [ ] OK [ ] NA |
| 17.4 | P1 | Cas limite : Recherche avec critères contradictoires et réinitialisation | 1. Saisir un budget maximal de 5 000 000 FCFA pour une villa à vendre à Cocody 2. Constater l absence de résultat 3. Cliquer sur le bouton « Réinitialiser tout » | L écran affiche un état vide courtois sans erreur JavaScript et le bouton de réinitialisation restaure instantanément l intégralité du catalogue. | [ ] OK [ ] NA |

### Validation du Module 17
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 18 : Espaces Clients Connectés : Alertes Sauvegardées & Dossier Candidat (Étape 7 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 18.1 | P1 | Création et activation d une alerte immobilière géolocalisée | 1. Se connecter avec un compte client 2. Accéder à « /client/alertes » 3. Cliquer sur « Créer une alerte », sélectionner Cocody, type villa, budget max 200M FCFA et cocher ACD garanti 4. Enregistrer l alerte et confirmer | La liste des alertes affiche la nouvelle recherche enregistrée dans « recherches_alertes », avec le statut actif et un lien vers les annonces correspondantes. | [ ] OK [ ] NA |
| 18.2 | P1 | Désactivation et suppression d alerte avec contrôle d étanchéité | 1. Sur « /client/alertes », cliquer sur l interrupteur pour désactiver l alerte 2. Vérifier la persistance du statut inactif 3. Cliquer sur le bouton de suppression | L alerte est désactivée puis supprimée de la base de données avec contrôle strict de propriété (Anti-IDOR). | [ ] OK [ ] NA |
| 18.3 | P1 | Renseignement et calcul dynamique de complétude du dossier candidat | 1. Accéder à « /client/dossier » 2. Renseigner la profession, l employeur et un revenu net mensuel 3. Renseigner la pièce d identité CNI 4. Observer la jauge de complétude | La jauge calcule automatiquement le score de solvabilité (ex: 60%) et sauvegarde le brouillon dans « dossiers_candidats ». | [ ] OK [ ] NA |
| 18.4 | P1 | Cas limite : Rejet de soumission d un dossier candidat trop incomplet | 1. Créer un nouveau dossier avec uniquement le type de projet sans profession ni justificatif (score inférieur à 40%) 2. Tenter de cliquer sur « Soumettre mon dossier » 3. Examiner la réponse du serveur | Le bouton est désactivé ou l action serveur renvoie une erreur explicite exigeant au moins la profession, le revenu et une CNI valide avant toute certification. | [ ] OK [ ] NA |

### Validation du Module 18
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 19 : Tableaux de Bord Annonceurs : Propriétaires, Agences & Promoteurs (Étape 8 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 19.1 | P1 | Consultation du parc de biens et agrégation des KPIs par profil | 1. Se connecter avec un compte bailleur ou promoteur 2. Accéder à « /dashboard/bailleur » 3. Examiner la bannière d accueil et les 4 compteurs de performance | Le tableau de bord affiche le statut exact du compte (Promoteur Agréé, Agence, Particulier), le nombre de biens en ligne, en modération et les vues cumulées. | [ ] OK [ ] NA |
| 19.2 | P1 | Consultation des dossiers candidats et solvabilité sur les annonces | 1. Sur « /dashboard/bailleur », cliquer sur l onglet « Candidatures & Réservations » 2. Examiner la liste des demandes reçues 3. Consulter les revenus mensuels et la profession déclarée | Le bailleur accède en lecture aux dossiers candidats des usagers ayant postulé sur ses annonces sans pouvoir accéder aux dossiers de biens tiers. | [ ] OK [ ] NA |
| 19.3 | P1 | Rattachement d un négociateur collaborateur à l organisation | 1. Se connecter avec le compte gérant d une agence immobilière 2. Ouvrir l onglet « Organisation & Équipe » 3. Cliquer sur « Rattacher un négociateur », saisir un email existant et valider | Le collaborateur est rattaché dans « organization_members », apparaît dans la liste de l équipe et hérite des mandats de l agence. | [ ] OK [ ] NA |
| 19.4 | P1 | Cas limite : Rejet d invitation pour un compte e-mail inexistant en base | 1. Ouvrir le formulaire de rattachement de collaborateur 2. Saisir une adresse e-mail non inscrite « collaborateur.inconnu@test.ci » 3. Soumettre le formulaire | L action renvoie un message d erreur explicite invitant le collaborateur à créer son compte avant tout rattachement sans créer d enregistrement orphelin. | [ ] OK [ ] NA |

### Validation du Module 19
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 20 : Console de Modération & Bouclier Anti-Fraude Abidjan (Étape 9 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 20.1 | P1 | Signalement communautaire d une annonce suspecte ou pirate | 1. Se rendre sur la fiche publique d une annonce « /biens/[slug] » 2. Cliquer sur « Signaler un abus ou faux titre foncier » 3. Sélectionner le motif démarcheur pirate ou faux prix et saisir une description détaillée 4. Valider le formulaire de signalement | La modale confirme la prise en compte, l enregistrement est créé dans la table « signalements » et transmis à la file de modération administrative. | [ ] OK [ ] NA |
| 20.2 | P1 | Consultation et arbitrage d un signalement par le modérateur | 1. Se connecter avec un compte modérateur ou administrateur 2. Accéder à « /admin/moderation » et ouvrir l onglet « Signalements & Fraude » 3. Sélectionner un signalement à traiter et cliquer sur « Arbitrer » 4. Choisir « Valider le retrait », saisir le motif motivé et confirmer | Le statut du signalement passe à « traite », l annonce est automatiquement dépubliée avec statut de modération « rejete » et motif notifié. | [ ] OK [ ] NA |
| 20.3 | P1 | Contrôle et visa de conformité du titre foncier MCLU | 1. Accéder à « /admin/biens » et ouvrir l annonce en attente de modération 2. Vérifier le titre de propriété « ACD » et l arrêté ministériel 3. Cliquer sur « Valider le Titre Foncier » et confirmer | Le statut de modération du bien passe à « valide », le badge de sécurisation juridique est activé et l annonce devient visible sur la vitrine publique. | [ ] OK [ ] NA |
| 20.4 | P1 | Cas limite : Détection automatique de doublon pirate avec écart de prix supérieur à 25% | 1. Sélectionner une annonce ciblée par un signalement 2. Cliquer sur « Scan doublons » pour déclencher l analyse d écart suspect 3. Observer le compte-rendu d analyse comparative | Le système identifie et liste les annonces concurrentes clonées dans la même commune présentant un écart de prix supérieur à 25% ou un titre strictement identique. | [ ] OK [ ] NA |

### Validation du Module 20
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## Module 21 : Paiements Paystack, Acomptes Légaux & Notifications Multi-Canaux (Étape 10 Marketplace)

| N° | Priorité | Intitulé du Test | Scénario pas-à-pas | Résultat attendu | Validation |
| :---: | :---: | :--- | :--- | :--- | :---: |
| 21.1 | P1 | Calcul et exigibilité de l acompte légal de réservation selon la transaction | 1. Initier une réservation sur un bien en vente à 100M FCFA sur « /biens » 2. Vérifier le montant d acompte calculé 3. Réitérer sur une location à 500k FCFA par mois | Le serveur calcule rigoureusement 10% d acompte légal en vente (10M FCFA) et 1 mois de caution en location (500k FCFA) sans permettre de saisie arbitraire inférieure. | [ ] OK [ ] NA |
| 21.2 | P1 | Sécurité Webhook Paystack avec contrôle de signature HMAC-SHA512 | 1. Émettre un webhook simulé vers « /api/webhooks/paystack » avec signature HMAC-SHA512 valide 2. Vérifier la prise en compte 3. Émettre un webhook avec signature falsifiée | La transaction valide met à jour le statut du paiement en « paye », tandis que la requête falsifiée est immédiatement bloquée avec un code HTTP 401 et consigne une alerte de falsification. | [ ] OK [ ] NA |
| 21.3 | P1 | Verrouillage automatique du bien et notification séquestre au propriétaire | 1. Confirmer le paiement intégral de l acompte légal via le webhook Paystack 2. Consulter le statut de l annonce dans « /biens » 3. Consulter les notifications du compte propriétaire dans « /dashboard/bailleur » | L annonce bascule automatiquement au statut « reserve », la réservation passe à « confirme » et le propriétaire reçoit une notification de consignation de l acompte. | [ ] OK [ ] NA |
| 21.4 | P1 | Cas limite : Diffusion ciblée des alertes lors de la validation d un bien | 1. Avec un compte client, créer une alerte active pour « Cocody » et type « villa » 2. Avec un modérateur, valider une nouvelle annonce correspondant exactement à ces critères 3. Consulter le centre de notifications de l acquéreur sur « /client/dashboard » | L usager reçoit une alerte in-app immédiate l informant qu un nouveau bien à Cocody correspond à sa veille sauvegardée avec lien direct vers la fiche de l annonce. | [ ] OK [ ] NA |

### Validation du Module 21
| Nom du Testeur | Date du Test | Commentaires et Remarques |
| :--- | :--- | :--- |
| | | |
| **Décision finale :** | [ ] **Conforme** | [ ] **Non Conforme** |

---

## 4. Matrice de Couverture des Tests

| Réf. Module | Périmètre Fonctionnel | Total Tests | Dont Priorité P1 | Dont Priorité P2 | Taux de Couverture |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Module 1 | Authentification, Sécurité et OTP | 8 | 6 | 2 | 100% |
| Module 2 | Vitrine Publique, Recherche et GPS | 4 | 2 | 2 | 100% |
| Module 3 | Espace Bailleur et Publication d'Annonces | 3 | 2 | 1 | 100% |
| Module 4 | Modération et Back-Office Admin | 3 | 3 | 0 | 100% |
| Module 5 | Matrice des Rôles et Permissions RBAC | 3 | 2 | 1 | 100% |
| Module 6 | Paiements Paystack, Acomptes et KYC | 4 | 4 | 0 | 100% |
| Module 7 | Journal d'Audit et Sécurité Avancée | 7 | 7 | 0 | 100% |
| Module 8 | Garde-fous RBAC Hybride et Moindre Privilège | 8 | 8 | 0 | 100% |
| Module 9 | Facturation Normalisée Électronique (FNE - DGI) | 7 | 7 | 0 | 100% |
| Module 10 | Parcours de Bout en Bout Multi-Rôles | 3 | 3 | 0 | 100% |
| Module 11 | Promoteurs & Agences en Vedette (Sponsoring & Kill Switch) | 4 | 3 | 1 | 100% |
| Module 12 | Sécurité Fondations & Protection RLS (Étape 1 Marketplace) | 4 | 4 | 0 | 100% |
| Module 13 | Modèle de Données Marketplace (Organisations, Alertes, Dossiers & Signalements) | 4 | 4 | 0 | 100% |
| Module 14 | Matrice RBAC Immobilière Pure & Moindre Privilège (Étape 3 Marketplace) | 4 | 4 | 0 | 100% |
| Module 15 | Authentification Multi-Profils & Onboarding Gating (Étape 4 Marketplace) | 4 | 4 | 0 | 100% |
| Module 16 | Isolation Back-Office & Découplage CRM Leads / Tally (Étape 5 Marketplace) | 4 | 4 | 0 | 100% |
| Module 17 | Recherche Multicritères Abidjan, Fiches Biens & Cartographie Marketplace (Étape 6 Marketplace) | 4 | 4 | 0 | 100% |
| Module 18 | Espaces Clients Connectés : Alertes Sauvegardées & Dossier Candidat (Étape 7 Marketplace) | 4 | 4 | 0 | 100% |
| Module 19 | Tableaux de Bord Annonceurs : Propriétaires, Agences & Promoteurs (Étape 8 Marketplace) | 4 | 4 | 0 | 100% |
| Module 20 | Console de Modération & Bouclier Anti-Fraude Abidjan (Étape 9 Marketplace) | 4 | 4 | 0 | 100% |
| Module 21 | Paiements Paystack, Acomptes Légaux & Notifications Multi-Canaux (Étape 10 Marketplace) | 4 | 4 | 0 | 100% |
| TOTAL | Ensemble de la Plateforme ImmOfika | 94 | 87 | 7 | 100% |

---

## 5. Annexe : Écarts et Recommandations Sectorielles (Informatif)

Cette annexe liste les fonctionnalités standards de l'immobilier haut de gamme qui ne sont pas encore présentes dans la version courante (v2.2) et qui sont recommandées pour la roadmap future :
1. Signature électronique certifiée des baux : Intégrer un tiers certificateur qualifié (eIDAS / norme locale) pour signer les contrats de location directement en ligne.
2. Visites virtuelles 360° / 3D : Intégrer un lecteur Matterport ou WebGL pour la visite immersive des biens sans déplacement physique.
3. Quittance automatique mensuelle : Génération et expédition automatique par email de la quittance de loyer dès validation du paiement récurrent Paystack.
