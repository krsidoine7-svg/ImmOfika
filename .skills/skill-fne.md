---
name: skill-fne
description: >
  Assistant expert sur la Facture Normalisée Électronique (FNE) de Côte d'Ivoire, mis en place par la Direction Générale des Impôts (DGI). Utilise ce skill dès que l'utilisateur mentionne la FNE, le RNE, la facturation électronique en Côte d'Ivoire, la plateforme fne.dgi.gouv.ci, les stickers électroniques, la DGI, l'arrêté 0337, l'obligation de facture normalisée, l'interfaçage API FNE, le TERNE, ou toute question fiscale liée à la facturation en Côte d'Ivoire — même si l'utilisateur ne dit pas explicitement "FNE". Couvre : cadre légal, champ d'application, procédures, inscription/connexion à la plateforme, génération de factures, intégration API, contacts DGI, et tout problème opérationnel lié à la FNE.
---

# Skill FNE — Facture Normalisée Électronique (Côte d'Ivoire)

Ce skill fournit une expertise complète sur le système de Facturation Normalisée Électronique (FNE) de la République de Côte d'Ivoire, tel que défini par la DGI.

---

## Comportement attendu

- Répondre en **français** (langue officielle de la DGI)
- Être **précis et pratique** : l'utilisateur est souvent un comptable, un responsable informatique ou un entrepreneur qui doit agir
- Citer les articles de loi ou arrêtés quand c'est pertinent
- En cas de question sur un délai ou une date, préciser le régime d'imposition concerné
- Pour les questions techniques API, donner des exemples de requêtes JSON si utile
- Toujours terminer par les **contacts utiles** si la question implique une démarche auprès de la DGI

---

## Contacts utiles (à rappeler si nécessaire)

| Désignation | Contact |
|---|---|
| Portail FNE | https://fne.dgi.gouv.ci |
| Assistance téléphonique | 25 21 01 86 60 (option 4) |
| Informations générales | infos.fne@dgi.gouv.ci |
| Support technique / incidents | support.fne@dgi.gouv.ci |

---

# Référence Juridique — FNE Côte d'Ivoire

## 1. Textes de référence

| Texte | Objet |
|---|---|
| Loi de Finances n° 2018-984 du 28 déc. 2018 – Art. 15 annexe fiscale | Autorisation de mise en place de la facturation électronique |
| Loi de Finances n° 2024-1109 du 18 déc. 2024 – Art. 6 annexe fiscale | Extension de la FNE à **tous les contribuables** |
| **Arrêté n° 0337** MFB/DGI/DLCD/SDL/bke du **09 mai 2025** | Modalités de mise en œuvre du système de facturation normalisée électronique |
| Articles **384, 385 et suivants du CGI** | Base légale de la facturation normalisée |
| Articles **144 et suivants du LPF** | Procédures fiscales liées à la facturation |

---

## 2. Champ d'application

### Personnes visées (Art. 2 de l'arrêté)

La FNE s'applique à **toutes les entreprises, personnes physiques ou morales**, quel que soit leur régime d'imposition, sauf cas limitativement prévus par les dispositions légales en vigueur.

Sont notamment concernés : les pharmacies, les compagnies aériennes, les banques et les compagnies d'assurances.

### Opérations concernées

Avant l'annexe fiscale 2025 : seuls les opérateurs livrant des biens ou services **par voie électronique** étaient assujettis.

Depuis 2025 : l'obligation s'applique à **tous les opérateurs économiques** qui exercent des activités et opèrent des transactions commerciales, que celles-ci soient ou non exercées par voie électronique.

> L'exercice par voie électronique s'entend de l'utilisation d'appareils mobiles, ordinateurs, etc. dans les relations commerciales entre le vendeur et son client.

### Seuil pour les régimes forfaitaires (Art. 7 de l'arrêté)

Pour les entreprises soumises à un **régime forfaitaire**, l'obligation ne s'applique que pour les achats d'une valeur **égale ou supérieure à 5 000 francs CFA**.

> Ce seuil **ne s'applique pas** aux opérations entre professionnels.

---

## 3. Dates d'entrée en vigueur (Art. 8 de l'arrêté)

| Régime | Date limite |
|---|---|
| Régime Normal d'Imposition (**RNI**) | Au plus tard le **1er juin 2025** |
| Régime Simplifié d'Imposition (**RSI**) | Au plus tard le **1er juillet 2025** |
| Régime des Microentreprises (**RME**) | Au plus tard le **1er août 2025** |
| Régime de l'Entrepreneur (taxe communale / d'État) | Au plus tard le **1er septembre 2025** |

---

## 4. Les trois procédures de facturation (Art. 3 de l'arrêté)

### Procédure 1 — Droit commun (Plateforme FNE directe)
Génération des FNE par **utilisation directe** de la plateforme dédiée mise en place par l'Administration fiscale.

**Destinataires :** entreprises au régime réel (RNI/RSI).

### Procédure 2 — Exception (Interfaçage API)
Génération de la FNE par **voie d'interfaçage direct** entre la plateforme FNE et les systèmes informatisés de facturation de l'entreprise.

- S'applique **sur option** de l'entreprise
- Nécessite un **accord préalable** du Directeur général des Impôts

### Procédure 3 — Terminaux TPE/TERNE
Génération des **Reçus Normalisés Électroniques (RNE)** via des **Terminaux d'Emission de Reçus Normalisés Électroniques (TERNE)** ou terminaux de paiement électronique (TPE).

**Destinataires :**
- Entreprises relevant d'un régime **forfaitaire**
- Entreprises de **ventes à rayons multiples** dont les opérations au détail donnent lieu à des tickets de caisse

---

## 5. Mentions obligatoires d'une FNE (Art. 6 de l'arrêté)

1. Identification précise du redevable : raison sociale, noms, adresse, numéro d'immatriculation au registre de commerce, références bancaires, numéro de compte contribuable, identifiant unique, régime d'imposition, service des Impôts de rattachement
2. Identification du client : noms, raison sociale, adresses
3. Numéro de compte contribuable du client (pour acquisitions à titre professionnel)
4. Numéro d'ordre de la FNE
5. Date et heure d'émission
6. Désignation détaillée des articles vendus ou services rendus
7. Prix des biens livrés ou services rendus
8. Taux de la taxe pratiqués
9. Total payé et mode de règlement

---

## 6. Le sticker électronique (Art. 4 de l'arrêté)

Les FNE et RNE générés par la plateforme sont certifiés par une **signature électronique** constituant le sticker. Il se matérialise par **trois éléments distincts et simultanés** :

| Élément | Description |
|---|---|
| **Visuel FNE** | Logo officiel de la Facture Normalisée Électronique |
| **QR Code** | Code de certification scannable — affiche les mêmes informations que la facture |
| **Format de numérotation** | Séquence unique selon l'article 5 de l'arrêté |

> Le QR Code **n'apparaît pas** sur les factures pro-forma.

---

## 7. Format de numérotation (Art. 5 de l'arrêté)

```
[Préfixe] + NCC + Année d'édition + Séquence annuelle ininterrompue
```

| Type | Préfixe | Exemple |
|---|---|---|
| Facture de vente | *(aucun)* | `9500015F25000000071` |
| Facture d'avoir | `A` | `A9500015F25000000071` |
| Facture proforma | `P` | `P9500015F25000000071` |
| Bordereau d'achat | `B` | `B9500015F25000000071` |

---

## 8. Sanctions

### Contrôle (Art. 13 bis LPF)
Un contrôle **"sortie magasin"** des factures peut être effectué par tout agent de l'Administration fiscale ayant au moins le grade de contrôleur des Impôts, dûment mandaté.

### Fraude (Art. 171 bis LPF)
Toute manœuvre tendant à **déconnecter volontairement** les installations relatives à la FNE est assimilée à une **résistance à l'impôt** et engage la responsabilité pénale.

### Tarifs de sécurisation (Art. 10 de l'arrêté)
Les tarifs applicables au titre de la sécurisation de la facture et du reçu normalisés électroniques sont **fixés d'accord partie** par la DGI et ses partenaires techniques.

---

## 9. Portée de la mesure

À compter de l'entrée en vigueur de l'annexe fiscale 2025, les opérateurs économiques **ne sont plus autorisés** à délivrer des factures normalisées sur support papier dans le cadre de leurs activités professionnelles.

> **Dans l'attente de la mise en œuvre effective, la facture normalisée sur support papier continue d'être utilisée.**

---

# Référence Plateforme — FNE fne.dgi.gouv.ci

**URL officielle :** https://fne.dgi.gouv.ci

---

## 1. Configuration requise

Utiliser la **dernière version** du navigateur installé sur l'ordinateur pour garantir un fonctionnement optimal.

---

## 2. Inscription à la plateforme FNE

### Étape 1 — Accès au portail
Rendez-vous sur https://fne.dgi.gouv.ci et cliquez sur **"Pour vous connecter ou vous inscrire, cliquez ici"**.

### Étape 2 — Démarrer l'inscription
Cliquez sur **"Inscrivez-vous"**.

### Étape 3 — Formulaire d'identification
- **NCC** : Numéro de Compte Contribuable
- **NTD** : Numéro de Télédéclarant

### Étape 4 — Formulaire de création de compte
Informations du gestionnaire principal :
- Email, téléphone

Informations du siège :
- Nom et raison sociale, email, téléphone, localité, adresse, commune, quartier
- Régime d'imposition, centre d'impôts / poste comptable, DRAN, RCCM
- Nom du propriétaire du local professionnel, NCC du propriétaire, téléphone

Localisation du siège (l'un des trois) :
- Section + parcelle
- Lot + ilot
- Latitude + longitude

> ⚠️ Cette règle de localisation s'applique aussi aux établissements secondaires.

### Étape 5 — Informations techniques sur la facturation
- Solution logicielle de facturation (Oui/Non + nom, ex : Sage)
- Caisse enregistreuse (Oui/Non)
- Terminal de paiement électronique (Oui/Non + nombre)
- Autre moyen de facturation (Oui/Non)

### Étape 6 — Vérification et soumission
Vérifier toutes les informations, cocher les CGU, cliquer sur **"Soumettre"**.

> ⚠️ Une erreur sur l'email du gestionnaire bloque l'accès. Il faudra adresser une demande de réinitialisation avec : DFE de l'entreprise + copie CNI.

### Étape 7 — Confirmation par mail
Le gestionnaire reçoit un mail contenant le **nom d'utilisateur et le mot de passe provisoires**.

---

## 3. Connexion à la plateforme FNE

### Étape 1 — Saisir les identifiants
> Pour le gestionnaire principal, le **nom d'utilisateur = NCC de l'entreprise**.

### Étape 2 — Code OTP
Un code OTP est envoyé par mail à chaque tentative de connexion (double authentification). Saisir le code reçu.

### Étape 3 — Changer le mot de passe (première connexion)
Le mot de passe doit contenir **au minimum 12 caractères** avec :
- Au moins 1 chiffre
- Au moins 1 lettre majuscule
- Au moins 1 lettre minuscule
- Au moins 1 caractère spécial (`$`, `&`, `@`, etc.)

### Étape 4 — Se reconnecter avec le nouveau mot de passe

---

## 4. Configuration de l'espace FNE

### 4.1 Paramétrage général

Dans le menu **Paramétrage**, configurer :

| Élément | Description |
|---|---|
| Logo | Apparaîtra sur toutes les factures |
| Seuil d'alerte stickers | Notification quand le solde est bas |
| Timbre de quittance | Si coché : coût supporté par le client payant en espèces. Si non coché : frais à la charge de l'entreprise auprès de la DGI |
| Bordereau d'achat de produits agricoles | Cocher si vous délivrez ce type de bordereau |
| Interfaçage | Connexion avec une solution de facturation tierce |
| Pied de page / Message commercial | Texte libre affiché sur les factures |

### 4.2 Création d'établissements secondaires

Cliquer sur **"+ Nouvel établissement"**, remplir le formulaire, cliquer sur **"Créer"**.

Actions disponibles sur chaque établissement :
- ✏️ Modifier
- 🗑️ Supprimer
- ⊗ Désactiver

### 4.3 Création des points de vente

Un **point de vente = une caisse**. Si N caisses → créer N points de vente. Chaque point de vente est lié à un établissement.

Cliquer sur **"+ Nouveau point de vente"**, définir :
- Nom de la caisse
- Établissement de rattachement
- Type d'outil : **Application FNE** ou **TPE**

### 4.4 Gestion des utilisateurs

Géré par le **gestionnaire principal**, qui définit les habilitations de chaque utilisateur. Chaque utilisateur est rattaché à un établissement et à un point de vente.

Après création, l'utilisateur reçoit un mail avec un lien pour créer ses accès. Mot de passe : 12 caractères minimum, mêmes règles que le gestionnaire principal.

---

## 5. Menus de la plateforme

| Menu | Description |
|---|---|
| **Tableau de bord** | Vue d'ensemble des activités de facturation |
| **Gestion des stickers** | Achat et suivi des stickers |
| **Gestion des reçus et factures** | Émission et réception de factures/reçus |
| **Clients et fournisseurs** | Listes des clients et fournisseurs |
| **Paramétrage** | Configuration de l'espace |
| **Gestion des utilisateurs** | Création et gestion des accès |
| **Nomenclature** | Import de la liste des produits |

### Tableau de bord — Indicateurs disponibles

**Filtres :** Période (défaut : 14 derniers jours) / Établissements / Client NCC

**Indicateurs :**
- Factures et reçus réceptionnés / émis
- Factures de vente, d'avoir, proforma, bordereaux d'achat (quantité + montant)
- Totaux HT, TVA, autres taxes, remises, TTC, timbre fiscal
- Suivi stickers : solde crédit, achat crédit, crédit consommé, nombre consommés
- Timbres de quittance (quantité + montant)

---

## 6. Gestion des stickers

### Achat de stickers

1. Cliquer sur **"Achat de stickers +"**
2. Saisir le **montant**
3. Renseigner les informations de paiement (facultatif)
4. Choisir le mode de paiement : **Mobile Money** ou **Carte bancaire**
5. Sélectionner l'opérateur réseau + saisir le numéro de téléphone
6. Cliquer sur **"Passer la commande"**

> ⚠️ L'achat par carte de crédit n'est pas encore fonctionnel.
> Aucun frais supplémentaire n'est appliqué quel que soit le montant.
> Le solde sticker diminue à chaque génération de facture ou de reçu.

---

## 7. Génération d'une facture

### 7.1 Accès

Dans **Gestion des reçus et factures → Reçus et factures émis**, cliquer sur **"Générer la facture +"**.

### 7.2 Partie 1 — Générer la facture

**Type de facture :** `Vente` / `Proforma` / `Bordereau d'achat`

**Mode de paiement :** Carte bancaire / Chèque / Espèces / Mobile money / Virement / À terme

**Type de facturation :**

| Code | Client |
|---|---|
| B2B | Entreprise locale (avec NCC) |
| B2C | Consommateur final |
| B2F | Client international |
| B2G | Institution gouvernementale |

**Option RNE :** cocher pour relier la facture à un reçu existant (saisir le numéro du reçu). Ne sera pas comptabilisée comme double facture.

### 7.3 Partie 2 — Informations du client

| Type | Champs requis |
|---|---|
| B2B | NCC du client (nom/téléphone/email s'auto-remplissent si déjà inscrit) |
| B2C / B2F / B2G | Nom, téléphone, email obligatoires |

> Si le client B2B est en **cessation d'activité**, un avertissement s'affiche. Possibilité de continuer ou d'interrompre.

### 7.4 Partie 3 — Ajouter un article

| Champ | Description |
|---|---|
| Quantité | Quantité à vendre |
| Référence | Code unique du produit |
| Désignation | Nom du produit |
| Unité | Unité de mesure |
| Prix unitaire HT | Prix hors taxe |
| Remise | Réduction en % sur l'article |
| Taux d'imposition | Type de TVA applicable |

**Taux de TVA disponibles :**

| Libellé | Taux |
|---|---|
| TVA exo export | Sur HT |
| TVA exonérée légale | 0% |
| TVA réduite | 9% |
| TVA normale | 18% |
| TVA exonérée conventionnelle | 0% |

Pour des taxes supplémentaires : cliquer sur **"+ Ajouter d'Autres taxes"** (nom + pourcentage).
Pour plusieurs articles : cliquer sur **"+ Ajouter un article"**.

### 7.5 Partie 4 — Remise globale

Saisir le pourcentage de remise sur le **total HT global**.

### 7.6 Partie 5 — Taxes sur total TTC

Ajouter une taxe globale au total TTC (nom + taux).

### 7.7 Partie 6 — Résumé de la facture

Affiche : sous-totaux par taxe, Total HT, Remise, Total TVA, Total TTC, Autres taxes, **Net à payer**.

### 7.8 Boutons d'action

| Bouton | Effet |
|---|---|
| **Sauvegarder la facture** | Conserve sans signer — pas de QR Code ni numéro de série |
| **Générer la facture** | Signe et certifie — QR Code + numéro de série + logo FNE |

> Dès génération, le client reçoit **automatiquement** la facture dans son espace FNE (si professionnel).

### 7.9 Actions après émission

- 👁️ **Aperçu** de la facture / reçu / bordereau
- ↩️ **Avoir** sur une vente
- ⬇️ **Télécharger** la facture / reçu / bordereau

---

## 8. Génération d'une facture d'avoir

S'effectue à partir d'une facture de vente existante, en **3 étapes** :

1. Cliquer sur le bouton **retour ↩** de la facture concernée
2. Cliquer sur **"Sélectionner l'article"**
3. Renseigner la **quantité à rembourser** → cliquer sur **"Générer la facture"**

> Le seul élément modifiable dans une facture d'avoir est la **quantité**.

---

## 9. Nomenclature (catalogue produits)

Permet d'importer la liste de tous vos produits (noms, références, désignations, PU HT, taux d'imposition).

Télécharger le modèle via **"Télécharger le fichier d'exemple"** puis importer le fichier complété.

| Nom | Prix | Unité | Taux d'imposition | Désignation | Référence |
|---|---|---|---|---|---|
| ELECTRONIQUE | 265 000 | Pcs | TVA normale 18% | REDMI 15 PRO | REF009 |

---

## 10. Composition d'une FNE

- En-tête émetteur (raison sociale, NCC, régime, centre des impôts, RCCM, adresse, téléphone, email, nom vendeur, PDV, date et heure)
- Logo de l'entreprise
- **3 éléments du sticker** : QR Code + logo FNE + numéro séquentiel
- Informations du récepteur (client)
- Détails de la vente (articles, quantités, PU HT, taxes, remises)
- Résumé financier (Total HT / TVA / TTC / Net à payer)
- Mode de paiement

## 11. Composition d'une RNE

1. Visuel FNE (logo)
2. Numéro de reçu en série annuelle ininterrompue
3. QR Code de certification
4. Informations du vendeur (nom, terminal, NCC, adresse)
5. Informations du client payeur (NCC, RCCM)
6. Montant de la vente
7. Mode de paiement

---

# Référence API — Interfaçage FNE par API

**Source :** Procédure d'interfaçage des entreprises par API – DGI, Mai 2025

---

## 1. Contexte et objet

Les entreprises disposant de leur propre système informatisé de facturation (ERP, logiciel comptable) peuvent, **sur option**, générer leurs factures dans leur système et les faire **certifier par la plateforme FNE via API**.

Cette procédure nécessite un **accord préalable du Directeur général des Impôts**.

---

## 2. Prérequis techniques

Le logiciel de l'entreprise doit :

- Supporter les requêtes **HTTP (RESTful API)**
- Gérer des données **JSON**
- Supporter l'authentification via **OAuth 2.0** ou certificat d'authentification
- Disposer d'une **connexion internet stable et sécurisée**

---

## 3. Procédure d'interfaçage — Étapes

| Étape | Responsable | Action |
|---|---|---|
| 1 | Entreprise | Inscription sur la plateforme FNE de **l'environnement test** : `http://54.247.95.108` |
| 2 | Entreprise | Configuration et paramétrage de l'environnement de test |
| 3 | Entreprise | Développement de l'interfaçage avec l'API |
| 4 | Entreprise | Tests de génération des factures (vente, avoir, bordereau) |
| 5 | Entreprise | Transmission des spécimens de factures à la DGI via `support.fne@dgi.gouv.ci` |
| 6 | DGI | Réception, analyse et validation de la conformité (fonds et forme) |
| 7 | DGI | Transmission de l'**URL de production** + validation de la clé API |
| 8 | Entreprise | Récupération de la **clé API** dans l'onglet Paramétrage (visible uniquement par le gestionnaire principal) |

---

## 4. URLs

| Environnement | URL |
|---|---|
| **Test** | `http://54.247.95.108/ws` |
| **Production** | Transmise par la DGI après validation |

---

## 5. Authentification

Toutes les requêtes nécessitent un **Bearer Token** :

```http
Authorization: Bearer <valeur_de_la_clé_API>
```

La clé API est disponible dans la section **Paramétrage** de l'espace FNE, onglet **API Key**.

> Les requêtes non autorisées retournent le code HTTP **401 Unauthorized**.

---

## 6. Format des données

```http
Content-Type: application/json
Accept: application/json
```

Toutes les demandes et réponses sont au format **JSON**. Toute requête POST sans corps retourne le code **400**.

---

## 7. Les trois endpoints disponibles

| API | Endpoint | Méthode |
|---|---|---|
| Certification facture de vente | `/external/invoices/sign` | POST |
| Certification bordereau d'achat | `/external/invoices/sign` | POST |
| Certification facture d'avoir | `/external/invoices/{id}/refund` | POST |

---

## 8. API #1 — Certification de facture de vente

**Endpoint :** `POST $url/external/invoices/sign`

### Paramètres principaux

| Paramètre | Format | Obligatoire | Description |
|---|---|---|---|
| `invoiceType` | string | O | Type : `sale` |
| `paymentMethod` | string | O | Méthode de paiement (voir lexique) |
| `template` | string | O | `B2B`, `B2C`, `B2F`, `B2G` |
| `isRne` | boolean | O | Facture liée à un reçu ? `true` / `false` |
| `rne` | string | Si `isRne=true` | Numéro du reçu |
| `clientNcc` | string | Si B2B | NCC du client |
| `clientCompanyName` | string | O | Nom du client |
| `clientPhone` | int | O | Téléphone du client |
| `clientEmail` | string | O | Email du client |
| `clientSellerName` | string | N | Nom du vendeur |
| `pointOfSale` | string | O | Nom du point de vente |
| `establishment` | string | O | Nom de l'établissement |
| `commercialMessage` | string | N | Message commercial |
| `footer` | string | N | Message pied de page |
| `foreignCurrency` | string | O si B2F | Devise étrangère |
| `foreignCurrencyRate` | number | O si B2F | Taux de change |
| `items` | Array | O | Liste des articles |
| `discount` | number | N | Remise globale sur total HT |

### Paramètres par article (`items`)

| Paramètre | Format | Obligatoire | Description |
|---|---|---|---|
| `taxes` | string | O | Type de TVA : `TVA`, `TVAB`, `TVAC`, `TVAD` |
| `customTaxes` | Array | N | Autres taxes spécifiques |
| `reference` | string | N | Référence de l'article |
| `description` | string | O | Désignation de l'article |
| `quantity` | number | O | Quantité |
| `amount` | number | O | Prix unitaire HT |
| `discount` | number | N | Remise sur article |
| `measurementUnit` | string | N | Unité de mesure |

### Exemple de requête

```json
{
  "invoiceType": "sale",
  "paymentMethod": "mobile-money",
  "template": "B2B",
  "clientNcc": "9502363N",
  "clientCompanyName": "KPMG COTE D'IVOIRE",
  "clientPhone": "0709080765",
  "clientEmail": "info@kpmg.ci",
  "pointOfSale": "CAISSE_1",
  "establishment": "SIEGE",
  "items": [
    {
      "taxes": ["TVA"],
      "description": "Sac de riz 25kg",
      "quantity": 10,
      "amount": 15000,
      "discount": 5,
      "measurementUnit": "sac"
    }
  ],
  "discount": 0
}
```

### Réponse en cas de succès (Code 200)

```json
{
  "ncc": "9606123E",
  "reference": "9606123E25000000019",
  "token": "http://54.247.95.108/fr/verification/019465c1-...",
  "warning": false,
  "balance_sticker": 179,
  "invoice": { }
}
```

| Paramètre | Description |
|---|---|
| `ncc` | Identifiant contribuable |
| `reference` | Numéro de la facture générée |
| `token` | URL à convertir en QR Code |
| `warning` | Alerte si stock de stickers faible |
| `balance_sticker` | Solde restant de stickers |
| `invoice` | Objet complet de la facture générée |

---

## 9. API #2 — Certification de facture d'avoir

**Endpoint :** `POST $url/external/invoices/{id}/refund`

L'`id` de la facture d'origine est récupéré dans la réponse de la certification initiale (champ `invoice.id`).

### Corps de la requête

```json
{
  "items": [
    {
      "id": "id_de_l_article_original",
      "quantity": 5
    }
  ]
}
```

### Réponse succès (Code 201)

```json
{
  "ncc": "9606123E",
  "reference": "A9606123E2500000006",
  "token": "http://54.247.95.108/fr/verification/...",
  "warning": false,
  "balance_sticker": 178
}
```

---

## 10. API #3 — Certification de bordereau d'achat de produits agricoles

**Endpoint :** `POST $url/external/invoices/sign`

Identique à l'API #1 avec `"invoiceType": "purchase"`. Les articles **ne comportent pas de champ taxes**.

### Exemple de requête

```json
{
  "invoiceType": "purchase",
  "paymentMethod": "mobile-money",
  "template": "B2B",
  "clientCompanyName": "COOPERATIVE DU GRAND OUEST",
  "clientPhone": "0709080765",
  "clientEmail": "info@cgo.ci",
  "pointOfSale": "CAISSE_1",
  "establishment": "SIEGE",
  "items": [
    {
      "description": "Cacao brut premier choix",
      "quantity": 2000,
      "amount": 2200,
      "measurementUnit": "kg"
    }
  ]
}
```

---

## 11. Lexique des valeurs de paramètres

### `invoiceType`

| Valeur | Description |
|---|---|
| `sale` | Facture de vente |
| `purchase` | Bordereau d'achat de produits agricoles |

### `paymentMethod`

| Valeur | Description |
|---|---|
| `cash` | Espèces |
| `card` | Carte bancaire |
| `check` | Chèque |
| `mobile-money` | Mobile money |
| `transfer` | Virement bancaire |
| `deferred` | À terme |

### `template`

| Valeur | Description |
|---|---|
| `B2B` | Client = entreprise ou professionnel avec NCC |
| `B2C` | Client = particulier |
| `B2F` | Client = international |
| `B2G` | Client = institution gouvernementale |

### `taxes`

| Valeur | Description |
|---|---|
| `TVA` | TVA normale 18% |
| `TVAB` | TVA réduite 9% |
| `TVAC` | TVA exonérée conventionnelle 0% |
| `TVAD` | TVA exonérée légale 0% (TEE et RME) |

### `foreignCurrency`

`XOF`, `USD`, `EUR`, `JPY`, `CAD`, `GBP`, `AUD`, `CNH`, `CHF`, `HKD`, `NZD`

---

## 12. Codes d'erreur

| Code | Description |
|---|---|
| `200` / `201` | Succès |
| `400` | Erreur dans la requête |
| `401` | Erreur d'authentification (clé API invalide) |
| `500` | Endpoint non disponible (erreur serveur) |

### Exemple erreur 400

```json
{
  "message": "Point of sale is not valid",
  "error": "bad_request",
  "statusCode": 400
}
```

### Exemple erreur 401

```json
{
  "message": "Invalid API Key",
  "error": "unauthorized_exception",
  "statusCode": 401
}
```

---

## 13. Bonnes pratiques

- Effectuer des **tests unitaires** sur les cas de validation et d'erreur avant la mise en production
- Valider l'envoi et la réception des données sur la plateforme FNE test
- Assurer une **surveillance des transactions API** en production pour détecter les anomalies
- Mettre en place une gestion des logs et des erreurs
- Pour toute assistance : **support.fne@dgi.gouv.ci**
