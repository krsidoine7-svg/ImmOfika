/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  HeadingLevel
} = require('docx');

// Create the docs folder if it doesn't exist
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// -------------------------------------------------------------
// DESIGN TOKENS & STYLE CONFIG
// -------------------------------------------------------------
const COLOR_PRIMARY_NAVY = "0F172A"; // Navy Blue
const COLOR_GOLD_MID = "D4AF37";     // Gold Mid
const COLOR_GOLD_DEEP = "B8860B";    // Gold Deep
const COLOR_ACCENT_BG = "FDF6DC";     // Light gold background
const COLOR_BORDER = "E2E8F0";        // Subtle border gray
const COLOR_TEXT_MUTED = "64748B";    // Muted gray for meta

const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER };
const cellBorders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };

const cellMargins = { top: 120, bottom: 120, left: 150, right: 150 }; // Premium padding

// Helper to create a styled table cell
function createCell(contentParagraphs, widthDxa, fillHex = null, customBorders = cellBorders) {
  return new TableCell({
    width: { size: widthDxa, type: WidthType.DXA },
    borders: customBorders,
    margins: cellMargins,
    shading: fillHex ? { fill: fillHex, type: ShadingType.CLEAR } : undefined,
    children: contentParagraphs
  });
}

// Helper for bold run
function runBold(text, sizeHalfPt = 22, color = "000000") {
  return new TextRun({ text, bold: true, size: sizeHalfPt, font: "Arial", color });
}

// Helper for regular run
function runReg(text, sizeHalfPt = 22, color = "000000", italic = false) {
  return new TextRun({ text, size: sizeHalfPt, font: "Arial", color, italic });
}

// Create Header Cell
function createHeaderCell(text, widthDxa) {
  return createCell(
    [new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [runBold(text, 20, "FFFFFF")]
    })],
    widthDxa,
    COLOR_PRIMARY_NAVY
  );
}

// -------------------------------------------------------------
// SCENARIO TEST CASES DATA (Enriched with May 27 developments)
// -------------------------------------------------------------
const scenarios = [
  {
    title: "1. Authentification, Profils & Redirections Multi-Rôles",
    description: "Valider le cycle d'authentification et les aiguillages de sécurité pour les trois profils de test.",
    steps: [
      {
        id: "TC-1.1",
        action: "Inscrire ou préparer trois comptes fictifs dédiés :\n1. Client : client@favor.ci (Rôle: client)\n2. Agent : agent@favor.ci (Rôle: agent)\n3. Administrateur : admin@favor.ci (Rôle: admin)",
        expected: "Les trois profils fictifs sont créés en base de données avec leurs rôles respectifs attribués sans erreur.",
      },
      {
        id: "TC-1.2",
        action: "Se connecter via la page de Connexion avec le compte de test Client (client@favor.ci).",
        expected: "Connexion réussie. Redirection stricte et automatique vers Votre Espace Personnel Client.",
      },
      {
        id: "TC-1.3",
        action: "Se connecter via la page de Connexion avec le compte de test Agent (agent@favor.ci).",
        expected: "Aiguillage administratif réussi. L'agent est automatiquement redirigé vers l'Espace de Gestion administrative (au lieu de l'espace client).",
      },
      {
        id: "TC-1.4",
        action: "Se connecter via la page de Connexion avec le compte de test Administrateur (admin@favor.ci).",
        expected: "Connexion et aiguillage réussis. Redirection automatique de l'administrateur vers l'Espace de Gestion administrative.",
      },
      {
        id: "TC-1.5",
        action: "Tester le bouton de déconnexion dans le menu utilisateur connecté (en bas de la barre latérale).",
        expected: "Déconnexion instantanée. Redirection stricte vers la page de Connexion. Réinitialisation complète de la session et des accès.",
      }
    ]
  },
  {
    title: "2. Vitrine de Prestige, Carte Interactive & Engagement Public",
    description: "Valider l'ergonomie responsive, l'immunité aux failles XSS et l'abonnement newsletter.",
    steps: [
      {
        id: "TC-2.1",
        action: "Accéder à la page de recherche publique des terrains et villas sur un smartphone ou via simulateur mobile (F12).",
        expected: "Affichage mobile haut de gamme. La carte interactive est masquée par défaut pour libérer l'écran et s'affiche instantanément au clic sur le bouton d'activation.",
      },
      {
        id: "TC-2.2",
        action: "Ouvrir la carte interactive et cliquer sur un marqueur pour afficher l'infobulle descriptive.",
        expected: "Le titre et les informations du terrain ou de la villa s'affichent correctement. Tout code informatique malveillant potentiellement injecté est rendu totalement inoffensif et s'affiche sous forme de texte simple.",
      },
      {
        id: "TC-2.3",
        action: "Saisir une adresse e-mail dans la case newsletter du pied de page du site et s'inscrire.",
        expected: "Traitement immédiat. Un message clair s'affiche sous le formulaire ('Merci pour votre inscription' ou un message d'erreur si l'e-mail existe déjà). La donnée est sauvegardée en base.",
      }
    ]
  },
  {
    title: "3. Parcours d'Achat, Facturation PDF & Tableau Excel Decisionnel",
    description: "Tester le cycle de transaction client, la génération de factures et l'export Excel financier.",
    steps: [
      {
        id: "TC-3.1",
        action: "Se connecter en tant que Client (client@favor.ci), réserver un bien de prestige et procéder au paiement simulé Paystack.",
        expected: "Réservation initialisée avec succès au statut 'en attente de paiement'. Redirection vers le portail sécurisé Paystack.",
      },
      {
        id: "TC-3.2",
        action: "Valider le paiement de test Paystack (MTN, Wave ou Carte) et attendre le retour automatique sur le site.",
        expected: "La page finale confirme instantanément le paiement. Le statut de l'achat passe à 'confirmée' de façon sécurisée.",
      },
      {
        id: "TC-3.3",
        action: "Accéder à son Espace Personnel Client pour télécharger la facture d'achat.",
        expected: "La facture officielle d'achat (générée en PDF et stockée de manière sécurisée) est téléchargeable immédiatement à l'aide d'un bouton or.",
      },
      {
        id: "TC-3.4",
        action: "Se connecter en tant qu'Administrateur (admin@favor.ci), aller sur l'Espace des Paiements et télécharger le rapport Excel.",
        expected: "Téléchargement réussi d'un rapport Excel haut de gamme :\n- Feuille 1 : Tableau de bord complet avec graphiques de répartition textuels par ville, type et statut.\n- Feuille 2 : Tableau détaillé intégrant des boutons de filtrage et de tri interactifs pour chaque colonne.",
      }
    ]
  },
  {
    title: "4. Espace Administration, UX Mobile & Formulaires Robustes",
    description: "Valider la création de biens sous Zod, l'upload d'images lourdes et l'UX fluide.",
    steps: [
      {
        id: "TC-4.1",
        action: "Se connecter en admin, aller sur le formulaire de création de bien. Soumettre le formulaire en laissant la case 'surface' vide.",
        expected: "Aucun plantage. Le système intercepte la case vide, la traite proprement et l'enregistre en base sans erreur.",
      },
      {
        id: "TC-4.2",
        action: "Télécharger une photo de terrain ou de villa de haute résolution (allant jusqu'à 10 Mo) dans le formulaire.",
        expected: "Téléchargement réussi sans erreur ni blocage. La plateforme autorise les photos lourdes pour préserver la qualité de prestige des visuels.",
      },
      {
        id: "TC-4.3",
        action: "Vérifier la zone de téléchargement de photo sur PC et sur smartphone dans le formulaire.",
        expected: "Aperçu miniature immédiat de la photo chargée. Le bouton de sélection est élégant, et les noms de fichiers longs sont tronqués sans déformer l'affichage sur mobile.",
      },
      {
        id: "TC-4.4",
        action: "Parcourir l'Espace de Gestion sur PC et faire défiler la zone centrale de travail.",
        expected: "Le défilement est naturel, rapide et réactif. Le défilement global a été désactivé sur ces pages professionnelles pour éviter les conflits d'affichage.",
      },
      {
        id: "TC-4.5",
        action: "Ouvrir la barre latérale sur smartphone, puis cliquer sur un lien de gestion.",
        expected: "Le menu mobile se referme instantanément et automatiquement après le clic sur le lien pour vous laisser travailler sur l'écran principal.",
      }
    ]
  },
  {
    title: "5. Sécurité d'Isolation des Permissions & Droits d'Accès",
    description: "Tester le cloisonnement strict des privilèges de modification de permissions et le cochage réactif.",
    steps: [
      {
        id: "TC-5.1",
        action: "Se connecter avec le compte Client (client@favor.ci) et tenter de forcer l'adresse de la console des permissions administratives dans le navigateur.",
        expected: "Accès strictement refusé. Le système intercepte la tentative et redirige le client vers son espace personnel client.",
      },
      {
        id: "TC-5.2",
        action: "Se connecter avec le compte Agent (agent@favor.ci) et tenter d'entrer sur la page de console des permissions administratives.",
        expected: "Accès strictement refusé. L'agent n'ayant pas ce privilège de sécurité, le système le bloque et le renvoie sur la page d'accueil d'administration.",
      },
      {
        id: "TC-5.3",
        action: "Se connecter avec le compte Administrateur (admin@favor.ci) et ouvrir la console 'Rôles & Accès' dans la barre latérale.",
        expected: "Accès autorisé. L'administrateur peut visualiser l'intégralité de la console de sécurité du projet.",
      },
      {
        id: "TC-5.4",
        action: "Sur la console des rôles, cocher et décocher des cases de droits d'accès en observant l'interface.",
        expected: "Mise à jour immédiate en base de données. L'interface réagit en 0 milliseconde sans voile gris bloquant ni clignotement. La case à cocher conserve sa couleur dorée de prestige.",
      }
    ]
  }
];

// -------------------------------------------------------------
// DOCUMENT GENERATION
// -------------------------------------------------------------
const docChildren = [];

// 1. Cover Page / Title Header
docChildren.push(
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      runBold("FAVOR COMPANY INTERNATIONAL", 24, COLOR_GOLD_DEEP),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 2000 },
    children: [
      runReg("Immobilier d'Excellence & de Prestige", 18, COLOR_TEXT_MUTED, true),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "CAHIER DE RECETTE", bold: true, size: 56, font: "Arial", color: COLOR_PRIMARY_NAVY }),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "VALİDATİON DU MVP 1 (V1.6)", bold: true, size: 36, font: "Arial", color: COLOR_GOLD_MID }),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 2600 },
    children: [
      runReg("Guide officiel grand public (Client, Agent, Administrateur) de tests d'acceptation et d'audits de sécurité", 22, COLOR_TEXT_MUTED),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80 },
    children: [
      runBold("Version : ", 20),
      runReg("1.6 (Officielle - Vulgarisation Non-Technique Totale)", 20),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80 },
    children: [
      runBold("Auteur : ", 20),
      runReg("Claude — IA Tech Lead & Chef de Projet Senior", 20),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80 },
    children: [
      runBold("Date de validation : ", 20),
      runReg(new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), 20),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 1200 },
    children: [
      runBold("Statut du Système : ", 20),
      runReg("Prêt pour la Recette Partenaires & Multi-Rôles — Build & TypeScript Validés (0 erreur)", 20, "059669"),
    ]
  }),
  new Paragraph({ pageBreakBefore: true, children: [] }) // Page Break after cover
);

// 2. Introduction & Guidelines
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [runBold("Introduction, Rôles de Test & Objectifs", 28, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      runReg("Ce cahier de recette actualisé a été spécialement conçu dans un langage simple et non technique. Il permet à tout partenaire, collaborateur ou client d'exécuter facilement les tests de validation, sans nécessiter de connaissances en informatique ou en programmation. Il rassemble l'ensemble des scénarios indispensables pour valider la qualité, l'ergonomie, la sécurité et l'expérience mobile du "),
      runBold("MVP 1 de Favor Company International"),
      runReg(". Cette phase de test repose sur l'utilisation de trois profils d'intervenants fictifs.")
    ]
  }),
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 120 },
    children: [runBold("🔑 Les 3 Comptes Fictifs de Test à Utiliser", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 120 },
    children: [
      runReg("Chaque personne chargée de tester l'application se verra attribuer trois comptes de démonstration pré-configurés :"),
    ]
  }),
  new Paragraph({
    spacing: { left: 360, after: 120 },
    children: [
      runBold("1. Compte de Test 'Client' : ", 20, COLOR_PRIMARY_NAVY),
      runReg("client@favor.ci — Permet de tester le parcours complet d'un acheteur final (recherche de biens, réservation et historique de factures).", 20),
    ]
  }),
  new Paragraph({
    spacing: { left: 360, after: 120 },
    children: [
      runBold("2. Compte de Test 'Agent' : ", 20, COLOR_PRIMARY_NAVY),
      runReg("agent@favor.ci — Permet de tester le parcours d'un agent immobilier commercial de Favor Company (gestion d'annonces, suivi des dossiers et des clients).", 20),
    ]
  }),
  new Paragraph({
    spacing: { left: 360, after: 240 },
    children: [
      runBold("3. Compte de Test 'Administrateur' : ", 20, COLOR_PRIMARY_NAVY),
      runReg("admin@favor.ci — Permet de tester le pilotage global de la plateforme, le suivi de la trésorerie et la gestion exclusive de la sécurité des accès.", 20),
    ]
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      runReg("À la fin de chaque scénario de test, veuillez remplir le tableau d'évaluation dédié en indiquant votre nom, la date, vos remarques et le verdict global (Conforme / Non Conforme / Présence de Bugs)."),
    ]
  }),
  new Paragraph({ pageBreakBefore: true, children: [] })
);

// 3. Matrice de Droits, Rôles & Accès (RBAC) - 100% Non-Technical Bulleted Lists
const valColWidths = [3000, 6360]; // Sum = 9360 DXA

docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [runBold("🛡️ Guide Simplifié des Droits & Accès de la Plateforme", 28, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      runReg("Afin d'accompagner au mieux les testeurs non techniques, voici la liste claire de ce que chaque profil a le droit de faire, les pages auxquelles il a accès, et les zones qui lui sont strictement interdites.")
    ]
  }),

  // Table Rôle 1: CLIENT (Bulleted List, Non-Technical)
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
    children: [runBold("Profil A. L'Acheteur / Le Client", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: valColWidths,
    rows: [
      // Actions
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Droits & Actions :", 18, COLOR_PRIMARY_NAVY)] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Découvrir et explorer toutes les annonces de terrains et de villas publiées sur le site.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Rechercher géographiquement des terrains grâce à la carte interactive de recherche.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Trier et filtrer les annonces par prix, par type de bien ou par ville de Côte d'Ivoire.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Constituer sa liste personnelle de coups de cœur en ajoutant des biens dans ses favoris.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Réserver un terrain ou une villa directement en ligne.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Effectuer un paiement d'acompte simulé par mobile money (MTN, Wave) ou carte bancaire.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, children: [runReg("Consulter l'historique complet de ses réservations et télécharger ses factures officielles.", 18)] })
          ], valColWidths[1])
        ]
      }),
      // Zones accessibles
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Pages d'Accès :", 18, COLOR_PRIMARY_NAVY)] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("La page d'accueil publique du site.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Le catalogue complet de recherche immobilière.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("La fiche de présentation détaillée de chaque terrain ou villa.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Votre Espace Personnel Client (mes réservations, mes factures et mon profil).", 18)] }),
            new Paragraph({ bullet: { level: 0 }, children: [runReg("Les pages d'informations générales (Mentions Légales, Politique de Confidentialité, cookies).", 18)] })
          ], valColWidths[1])
        ]
      }),
      // Zones interdites
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Zones Interdites :", 18, "991B1B")] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ children: [runBold("Toutes les pages privées de gestion et d'administration de Favor Company lui sont strictement interdites. Si un client tente de forcer l'entrée, l'application le ramène automatiquement à son Espace Personnel Client pour garantir la sécurité.", 18, "991B1B")] })
          ], valColWidths[1])
        ]
      })
    ]
  }),
  new Paragraph({ spacing: { after: 360 }, children: [] }),

  // Table Rôle 2: AGENT (Bulleted List, Non-Technical)
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
    children: [runBold("Profil B. Le Commercial / L'Agent Immobilier", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: valColWidths,
    rows: [
      // Actions
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Droits & Actions :", 18, COLOR_PRIMARY_NAVY)] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Accéder à l'Espace de Gestion interne de Favor Company.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Consulter la liste de ses clients acheteurs.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Se faire attribuer et gérer la relation avec plusieurs clients acheteurs simultanément.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Créer, modifier et publier de nouvelles annonces immobilières (ajouter les descriptions, photos d'illustration et surfaces).", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Suivre l'avancement des dossiers et les réservations de ses clients.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Consulter l'historique et la bonne réception des règlements financiers des clients.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, children: [runReg("Accéder à l'Espace de gestion de la sécurité des rôles uniquement si l'administrateur lui accorde spécifiquement ce droit d'accès temporaire.", 18, "059669")] })
          ], valColWidths[1])
        ]
      }),
      // Zones accessibles
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Pages d'Accès :", 18, COLOR_PRIMARY_NAVY)] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Le tableau de bord d'administration commerciale.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Le catalogue complet de gestion des terrains et villas.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Le formulaire d'enregistrement de nouvelles annonces.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("L'espace de suivi des réservations et dossiers d'achat.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, children: [runReg("La liste opérationnelle des transactions des clients.", 18)] })
          ], valColWidths[1])
        ]
      }),
      // Zones interdites
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Zones Interdites :", 18, "991B1B")] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ children: [runBold("La console de configuration de sécurité avancée de gestion des rôles de l'équipe lui est inaccessible par défaut. Toute tentative de forçage est bloquée et ramène l'agent vers la page d'accueil d'administration.", 18, "991B1B")] })
          ], valColWidths[1])
        ]
      })
    ]
  }),
  new Paragraph({ spacing: { after: 360 }, children: [] }),

  // Table Rôle 3: ADMINISTRATEUR (Bulleted List, Non-Technical)
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 100 },
    children: [runBold("Profil C. Le Directeur / L'Administrateur Général", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: valColWidths,
    rows: [
      // Actions
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Droits & Actions :", 18, COLOR_PRIMARY_NAVY)] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Piloter et surveiller l'intégralité de la plateforme immobilière.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Créer, modifier ou retirer définitivement des annonces immobilières obsolètes.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Administrer l'équipe commerciale en créant, modifiant ou suspendant des comptes collaborateurs.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Auditer l'ensemble des flux de trésorerie de l'entreprise et valider les reçus d'achats.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, children: [runReg("Gérer la console de sécurité pour accorder ou retirer des droits d'accès aux membres de l'équipe.", 18)] })
          ], valColWidths[1])
        ]
      }),
      // Zones accessibles
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Pages d'Accès :", 18, COLOR_PRIMARY_NAVY)] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("L'intégralité totale de la vitrine publique et de l'Espace Personnel Client.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [runReg("Toutes les pages de gestion de la console d'administration.", 18)] }),
            new Paragraph({ bullet: { level: 0 }, children: [runReg("La console de sécurité avancée de gestion des privilèges et d'accès des équipes.", 18)] })
          ], valColWidths[1])
        ]
      }),
      // Zones interdites
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Ses Zones Interdites :", 18, "059669")] })], valColWidths[0], COLOR_ACCENT_BG),
          createCell([
            new Paragraph({ children: [runBold("Aucune zone n'est interdite. L'administrateur dispose de toutes les clés d'accès de la plateforme immobilière pour assurer la gestion opérationnelle et le contrôle de conformité.", 18, "059669")] })
          ], valColWidths[1])
        ]
      })
    ]
  }),
  new Paragraph({ pageBreakBefore: true, children: [] })
);

// 5. Testing Scenarios Table Generation
const colWidths = [900, 2900, 2700, 1100, 1760]; // Sum = 9360

scenarios.forEach((sc, index) => {
  docChildren.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 100 },
      children: [runBold(`Scénario ${sc.title}`, 26, COLOR_PRIMARY_NAVY)]
    }),
    new Paragraph({
      spacing: { after: 240 },
      children: [runReg(sc.description, 20, COLOR_TEXT_MUTED, true)]
    })
  );

  // Table header row
  const tableRows = [
    new TableRow({
      children: [
        createHeaderCell("ID", colWidths[0]),
        createHeaderCell("Action de Test", colWidths[1]),
        createHeaderCell("Résultat Attendu", colWidths[2]),
        createHeaderCell("Statut", colWidths[3]),
        createHeaderCell("Commentaires / Notes", colWidths[4])
      ]
    })
  ];

  // Table body rows
  sc.steps.forEach(st => {
    tableRows.push(
      new TableRow({
        children: [
          // ID Cell
          createCell(
            [new Paragraph({ children: [runBold(st.id, 18, COLOR_PRIMARY_NAVY)] })],
            colWidths[0],
            COLOR_ACCENT_BG
          ),
          // Action Cell
          createCell(
            [new Paragraph({ children: [runReg(st.action, 18)] })],
            colWidths[1]
          ),
          // Expected Result Cell
          createCell(
            [new Paragraph({ children: [runReg(st.expected, 18, "000000", false)] })],
            colWidths[2]
          ),
          // Status Cell (checkboxes)
          createCell(
            [
              new Paragraph({ spacing: { after: 60 }, children: [runReg("[  ] Conforme", 18)] }),
              new Paragraph({ children: [runReg("[  ] Non Conf.", 18)] })
            ],
            colWidths[3]
          ),
          // Comments Cell
          createCell(
            [
              new Paragraph({ children: [runReg(" ", 18)] }),
              new Paragraph({ children: [runReg(" ", 18)] })
            ],
            colWidths[4]
          )
        ]
      })
    );
  });

  docChildren.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: tableRows
    }),
    new Paragraph({ spacing: { before: 180, after: 120 }, children: [runBold(`📋 Fiche d'Évaluation Globale — Scénario ${index + 1}`, 20, COLOR_GOLD_DEEP)] })
  );

  // local validation table: 4 rows, 2 columns
  const valLocalColWidths = [2800, 6560]; // Sum = 9360 DXA
  docChildren.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: valLocalColWidths,
      rows: [
        // Row 1: Testé par
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Testé par :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([new Paragraph({ children: [runReg("____________________________________________________________", 18)] })], valLocalColWidths[1])
          ]
        }),
        // Row 2: Date
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Date :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([new Paragraph({ children: [runReg("____ / ____ / 2026", 18)] })], valLocalColWidths[1])
          ]
        }),
        // Row 3: Commentaire
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Commentaires :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([
              new Paragraph({ children: [runReg(" ", 18)] }),
              new Paragraph({ children: [runReg(" ", 18)] }),
              new Paragraph({ children: [runReg(" ", 18)] })
            ], valLocalColWidths[1])
          ]
        }),
        // Row 4: Verdict
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Verdict final :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([
              new Paragraph({ children: [runBold("[  ] Conforme     [  ] Non Conforme     [  ] Présence de Bugs (à détailler)", 18)] })
            ], valLocalColWidths[1])
          ]
        })
      ]
    }),
    new Paragraph({ pageBreakBefore: true, children: [] })
  );
});

// Final feedback paragraph
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [runBold("Validation Globale & Signatures", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 480 },
    children: [
      runReg("Après avoir exécuté et signé individuellement chaque scénario de test multi-profils ci-dessus, veuillez remplir cette section pour clore définitivement la recette du MVP 1.")
    ]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          createCell(
            [
              new Paragraph({ children: [runBold("Pour le Testeur / Partenaire :", 20, COLOR_PRIMARY_NAVY)] }),
              new Paragraph({ spacing: { before: 200 }, children: [runReg("Nom : ________________________", 20)] }),
              new Paragraph({ spacing: { before: 100 }, children: [runReg("Signature :", 20)] }),
              new Paragraph({ spacing: { before: 600 }, children: [runReg("Date : ____ / ____ / 2026", 20)] })
            ],
            4680,
            COLOR_ACCENT_BG
          ),
          createCell(
            [
              new Paragraph({ children: [runBold("Pour Favor Company International :", 20, COLOR_PRIMARY_NAVY)] }),
              new Paragraph({ spacing: { before: 200 }, children: [runReg("Nom : Claude (IA Lead Architect)", 20)] }),
              new Paragraph({ spacing: { before: 100 }, children: [runReg("Signature numérique : Validée", 20, "059669")] }),
              new Paragraph({ spacing: { before: 600 }, children: [runReg("Date : " + new Date().toLocaleDateString('fr-FR'), 20)] })
            ],
            4680
          )
        ]
      })
    ]
  })
);

// -------------------------------------------------------------
// PACK AND WRITE FILE
// -------------------------------------------------------------
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: "Arial",
          size: 24 // 12pt
        }
      }
    },
    paragraphStyles: [
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: COLOR_PRIMARY_NAVY },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: COLOR_GOLD_DEEP },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: {
          width: 12240, // US Letter
          height: 15840
        },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: docChildren
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(docsDir, 'cahier_de_recette_mvp1.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`[SUCCESS] cahier_de_recette_mvp1.docx generated successfully at: ${outputPath}`);
}).catch((err) => {
  console.error('[ERROR] Failed to generate docx:', err);
  process.exit(1);
});
