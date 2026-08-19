---
name: immo-ci
description: >
  Spécialiste des documents immobiliers aux normes ivoiriennes (Côte d'Ivoire).
  Utiliser IMMÉDIATEMENT pour tout document lié à l'immobilier en CI : factures,
  contrats de vente, contrats de location, promesses de vente, reçus d'acompte,
  quittances de loyer, mandats de gestion, fiches de bien, attestations de propriété,
  conventions de réservation. Applique automatiquement les normes OHADA, la TVA CI
  (18%), la réglementation foncière ivoirienne, et le format FCFA. Utiliser aussi
  quand l'utilisateur demande un modèle de document pour une agence immobilière
  ivoirienne ou mentionne Abidjan, Côte d'Ivoire, CI, FCFA, titre foncier.
---

# Immo CI — Documents Immobiliers aux Normes Ivoiriennes

Génère des documents légaux et commerciaux conformes aux normes de la
**Côte d'Ivoire** : droit OHADA, fiscalité CI, format FCFA.

---

## CONTEXTE LÉGAL CI

```
Droit applicable      : OHADA (Organisation pour l'Harmonisation en Afrique
                         du Droit des Affaires)
Réglementation foncière: Loi n°98-750 du 23 décembre 1998 (domaine foncier rural)
                         + Code de l'urbanisme CI
TVA standard          : 18%
Devise                : FCFA (Franc CFA - XOF)
Langue officielle     : Français
Tribunal compétent    : Tribunal de Première Instance d'Abidjan (par défaut)
Droit de timbre       : Applicable sur actes de vente (variable)
Conservation foncière : Direction Générale des Impôts (DGI) — Abidjan
```

---

## INFORMATIONS VENDEUR / AGENCE (à remplir ou demander)

```
Toujours inclure dans les documents :
- Raison sociale (ex: Favor Company SARL)
- Forme juridique (SARL, SA, SAS, EI...)
- N° RCCM (Registre du Commerce et du Crédit Mobilier)
- NIF (Numéro Identifiant Fiscal)
- Siège social (adresse complète)
- Téléphone + email
- Représentant légal (gérant) + titre
```

---

## DOCUMENTS DISPONIBLES

### DOC-01 : Facture de Vente Immobilière
### DOC-02 : Reçu / Facture d'Acompte
### DOC-03 : Convention de Réservation
### DOC-04 : Promesse de Vente (Compromis)
### DOC-05 : Contrat de Location
### DOC-06 : Quittance de Loyer
### DOC-07 : Mandat de Vente
### DOC-08 : Mandat de Gestion Locative
### DOC-09 : Fiche Descriptive de Bien
### DOC-10 : Attestation de Disponibilité de Bien

---

## DOC-01 : FACTURE DE VENTE IMMOBILIÈRE

```
STRUCTURE OBLIGATOIRE :

EN-TÊTE
  Logo + Nom de l'agence
  "FACTURE" en titre principal
  N° Facture : FAV-YYYY-XXXXXX (séquentiel, non modifiable)
  Date d'émission : JJ/MM/AAAA
  
INFORMATIONS VENDEUR
  Raison sociale : [Nom agence]
  Forme juridique : [SARL/SA...]
  RCCM : [N° RCCM]
  NIF : [NIF]
  Adresse : [adresse complète]
  Tél : [téléphone]
  
INFORMATIONS ACHETEUR
  Nom & Prénoms (ou Raison sociale)
  CNI / Passeport N° (ou RCCM si entreprise)
  Adresse
  Téléphone / Email

DÉSIGNATION DU BIEN
  Référence interne du bien
  Type (terrain / maison / appartement / lot)
  Superficie : [X] m²
  Localisation exacte : [commune], [quartier], [lot N°]
  Titre foncier N° (si disponible)

TABLEAU FINANCIER
  Désignation          | Quantité | Prix unitaire HT | Montant HT
  [Description bien]   |    1     | [montant] FCFA   | [montant] FCFA
  ─────────────────────────────────────────────────
  Sous-total HT                                      [montant] FCFA
  TVA 18%                                            [montant] FCFA
  ─────────────────────────────────────────────────
  TOTAL TTC                                          [montant] FCFA
  
  Montant en lettres : [montant en toutes lettres] Francs CFA

MODE DE PAIEMENT
  [Orange Money / MTN MoMo / Wave / Virement / Espèces]
  Référence transaction : [ref]

MENTIONS LÉGALES OBLIGATOIRES
  "Conformément aux dispositions du droit OHADA"
  "Document valable comme reçu de paiement"
  "Conservation : 10 ans minimum"

SIGNATURE
  Cachet + signature du représentant légal
  Signature de l'acheteur (et date)
```

**Formule TVA :**
```
Montant HT = Prix TTC / 1.18
TVA        = Montant HT × 0.18
Prix TTC   = Montant HT × 1.18
```

---

## DOC-02 : REÇU D'ACOMPTE

```
TITRE : "REÇU D'ACOMPTE / BORDEREAU DE RÉSERVATION"
N° Reçu : REC-YYYY-XXXXXX

Nous soussignés, [Nom agence], certifions avoir reçu de :
M./Mme [Nom acheteur], CNI N° [XXX]
La somme de : [montant en chiffres] FCFA
(En lettres : [montant en toutes lettres] Francs CFA)

Représentant : [1/3] du prix total de vente

Au titre d'ACOMPTE pour la réservation du bien suivant :
[Description du bien]

Prix total convenu : [montant total] FCFA HTVA
Reste à payer : [montant restant] FCFA HTVA

CONDITIONS DE RÉSERVATION :
- Durée de validité de la réservation : [3 mois]
- Date limite de finalisation : [date]
- En cas de non-finalisation dans ce délai : [politique remboursement]

Mode de paiement : [...]
Référence transaction : [...]
Date et lieu : Abidjan, le [date]
```

---

## DOC-03 : CONVENTION DE RÉSERVATION

```
TITRE : "CONVENTION DE RÉSERVATION IMMOBILIÈRE"

ENTRE LES SOUSSIGNÉS :

LE VENDEUR / L'AGENCE :
[Nom agence], [forme juridique], au capital de [...] FCFA,
immatriculée au RCCM d'Abidjan sous le N° [...],
NIF : [...], ayant son siège social à [...],
représentée par M./Mme [...], en qualité de [gérant/directeur]
Ci-après dénommé "LE VENDEUR"

ET

L'ACQUÉREUR :
M./Mme [...], né(e) le [...] à [...],
de nationalité ivoirienne / [...],
demeurant à [...],
porteur(se) de la CNI N° [...] / Passeport N° [...]
Ci-après dénommé "L'ACQUÉREUR"

IL A ÉTÉ CONVENU CE QUI SUIT :

ARTICLE 1 — OBJET
Le Vendeur s'engage à réserver exclusivement au profit de l'Acquéreur
le bien immobilier suivant :
[Description complète du bien]
[Localisation]
[Superficie]
[Titre foncier si disponible]

ARTICLE 2 — PRIX
Prix de vente total convenu : [montant] FCFA TTC
(TVA incluse au taux de 18%)

ARTICLE 3 — ACOMPTE
En garantie de sa réservation, l'Acquéreur verse ce jour la somme de :
[montant acompte] FCFA correspondant à [1/3] du prix total.

ARTICLE 4 — DURÉE DE RÉSERVATION
La présente réservation est valable pour une durée de [3 mois]
à compter de la date de signature, soit jusqu'au [date limite].

ARTICLE 5 — OBLIGATIONS DU VENDEUR
Pendant la durée de la réservation, le Vendeur s'interdit de proposer
le bien à tout autre acquéreur.

ARTICLE 6 — OBLIGATIONS DE L'ACQUÉREUR
L'Acquéreur s'engage à finaliser l'acquisition avant la date limite
susmentionnée.

ARTICLE 7 — RÉSOLUTION
En cas de non-respect des délais par l'Acquéreur :
[Politique remboursement / non-remboursement selon accord]

ARTICLE 8 — LITIGES
Tout litige sera soumis au Tribunal de Première Instance d'Abidjan.

Fait à Abidjan, le [date], en deux (2) exemplaires originaux.

LE VENDEUR                    L'ACQUÉREUR
[Signature + cachet]          [Signature]
```

---

## DOC-04 : PROMESSE DE VENTE (COMPROMIS)

Structure similaire à la convention de réservation mais avec :
- Clauses suspensives (obtention de financement, vérification titres)
- Délai de réalisation de l'acte authentique
- Clause pénale en cas de défaillance
- Indemnité d'immobilisation (obligatoire)
- Référence au notaire chargé de l'acte authentique

⚠️ **Note légale :** Pour une valeur > 5 000 000 FCFA, recommander
fortement le passage devant notaire pour l'acte authentique définitif.

---

## DOC-05 : CONTRAT DE LOCATION

```
Clauses obligatoires CI :
- Identité complète bailleur et locataire
- Description précise du bien loué
- Durée du bail (1 an renouvelable par défaut)
- Montant du loyer mensuel en FCFA
- Modalités de paiement (date, mode)
- Dépôt de garantie (1 à 2 mois de loyer)
- Charges locatives incluses ou non
- État des lieux d'entrée joint au contrat
- Conditions de résiliation (préavis minimum 1 mois locataire,
  3 mois bailleur sauf faute grave)
- Droit applicable : OHADA + droit ivoirien
```

---

## DOC-06 : QUITTANCE DE LOYER

```
QUITTANCE DE LOYER

Je soussigné(e), [Nom du propriétaire / agence],
déclare avoir reçu de M./Mme [Nom locataire],
la somme de [montant] FCFA

Au titre du loyer du mois de [mois] [année]
pour le logement situé à : [adresse complète]

Loyer de base    : [montant] FCFA
Charges          : [montant] FCFA
TOTAL REÇU       : [montant] FCFA

Mode de paiement : [...]
Date de paiement : [...]

Quittance N° : QUI-YYYY-MM-XXXX
Abidjan, le [date]
Signature du bailleur / représentant
```

---

## DOC-09 : FICHE DESCRIPTIVE DE BIEN

```
BIEN À VENDRE / À LOUER — FAVOR COMPANY

RÉFÉRENCE : [REF-XXXXXX]
TYPE : [Terrain / Maison / Appartement / Lot de lotissement]
STATUT : [Disponible / Réservé / Vendu]

LOCALISATION
  Commune     : [commune]
  Quartier    : [quartier]
  Adresse     : [adresse précise]
  GPS         : [lat, long]

CARACTÉRISTIQUES
  Superficie totale  : [X] m²
  Surface bâtie      : [X] m² (si applicable)
  Nombre de pièces   : [N]
  Nombre de chambres : [N]
  Étage              : [N] (si applicable)
  
DOCUMENTS JURIDIQUES
  Titre foncier N°   : [N] (ou "En cours")
  Permis de construire: [N] (si applicable)
  
PRIX
  Prix de vente : [montant] FCFA TTC
  (soit [X] FCFA/m²)
  Loyer mensuel : [montant] FCFA/mois (si location)
  
CONTACT
  [Nom agence] | [téléphone] | [email]
  [adresse agence]
```

---

## FORMAT FCFA

```javascript
// Formater un montant en FCFA
const formatFCFA = (montant) => {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant)
  // Résultat : "15 000 000 F CFA"
}

// Calcul TVA CI (18%)
const calculTVA = (montantHT) => ({
  ht:  montantHT,
  tva: montantHT * 0.18,
  ttc: montantHT * 1.18
})

// Montant HT depuis TTC
const htDepuisTTC = (montantTTC) => montantTTC / 1.18
```

---

## NUMÉROTATION SÉQUENTIELLE

```
Factures       : FAV-YYYY-XXXXXX   (ex: FAV-2025-000042)
Reçus          : REC-YYYY-XXXXXX   (ex: REC-2025-000015)
Réservations   : RES-YYYYMMDD-XXX  (ex: RES-20250115-007)
Quittances     : QUI-YYYY-MM-XXX   (ex: QUI-2025-03-042)
Contrats       : CTR-YYYY-XXXXXX   (ex: CTR-2025-000003)
Mandats        : MAN-YYYY-XXXXXX   (ex: MAN-2025-000001)
```

---

## PROCESSUS DE GÉNÉRATION

Pour chaque document demandé :

1. **Identifier** le type de document (DOC-0X)
2. **Collecter** les informations manquantes (demander à l'utilisateur)
3. **Calculer** automatiquement la TVA et les montants dérivés
4. **Générer** le document avec toutes les mentions légales CI
5. **Numéroter** selon la séquence appropriée
6. Si possible, **créer le fichier** en Markdown ou PDF
7. **Signaler** si des informations légales critiques manquent
   (RCCM, NIF, titre foncier...)

---

## AVERTISSEMENT LÉGAL

```
⚠️ Les documents générés sont des MODÈLES contractuels.
Pour les transactions supérieures à 5 000 000 FCFA,
recommander systématiquement le recours à un notaire
pour l'acte authentique définitif.

Les modèles respectent les pratiques courantes du marché
immobilier ivoirien et le droit OHADA, mais ne remplacent
pas un conseil juridique professionnel.
```
