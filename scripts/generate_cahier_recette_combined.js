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
  HeadingLevel,
  TableOfContents,
  Header,
  Footer,
  PageNumber,
  CheckBox
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
function runBold(text, sizeHalfPt = 24, color = "000000") {
  return new TextRun({ text, bold: true, size: sizeHalfPt, font: "Calibri", color });
}

// Helper for regular run
function runReg(text, sizeHalfPt = 24, color = "000000", italic = false) {
  return new TextRun({ text, size: sizeHalfPt, font: "Calibri", color, italic });
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
// SCENARIO TEST CASES DATA (Combined MVP 1 & MVP 2)
// -------------------------------------------------------------
const scenarios = [
  {
    title: "1. Authentification, Profils & Redirections Multi-Rôles (MVP 1 - F02)",
    description: "Valider le cycle d'authentification, les identifiants et les redirections d'aiguillage de sécurité.",
    steps: [
      {
        id: "TC-1.1",
        action: "Effectuer une demande d'inscription avec une nouvelle adresse email. Attendre la réception de l'e-mail de confirmation et valider le lien.",
        expected: "L'e-mail de confirmation est expédié instantanément et le compte est correctement validé en base Supabase.",
      },
      {
        id: "TC-1.2.a",
        action: "Se connecter avec les identifiants Client : client.investisseur@gmail.com / FavorClient2026!#1.",
        expected: "Connexion réussie. Redirection instantanée vers l'Espace Client (/client) sous restriction RLS.",
      },
      {
        id: "TC-1.2.b",
        action: "Se connecter avec les identifiants Agent : manager.cocody@favorcompany.ci / FavorManager2026!#1.",
        expected: "Connexion réussie. Redirection vers l'Espace Commercial / Gestion et accès au calendrier.",
      },
      {
        id: "TC-1.2.c",
        action: "Se connecter avec les identifiants Admin : admin.juridique@favorcompany.ci / Admin123!.",
        expected: "Connexion et aiguillage réussis. Redirection automatique de l'administrateur vers la console /admin.",
      },
      {
        id: "TC-1.2.d",
        action: "Se connecter avec le compte Super Admin / Tech : admin.general@favorcompany.ci / Admin!.",
        expected: "Connexion réussie. Accès autorisé à l'intégralité du panneau RBAC et des rôles système.",
      },
      {
        id: "TC-1.2.e",
        action: "Tenter de se connecter avec l'email non enregistré koka.jules@gmail.com et le mot de passe Cl007.",
        expected: "Échec de connexion attendu. Le serveur refuse l'authentification et renvoie un message d'erreur clair.",
      },
      {
        id: "TC-1.3",
        action: "Tester le bouton de déconnexion pour chaque rôle puis essayer de forcer l'accès direct aux URLs sécurisées.",
        expected: "Déconnexion instantanée. Redirection vers login. Toute tentative de forçage d'URL après déconnexion est bloquée par le middleware.",
      }
    ]
  },
  {
    title: "2. Vitrine de Prestige, Performance Mobile & Catalogue (MVP 1 - F03 & F04)",
    description: "Valider le responsive de la carte, la performance LCP, l'inscription newsletter et les favoris.",
    steps: [
      {
        id: "TC-2.1",
        action: "Accéder à la carte de recherche des biens sur smartphone et tablette.",
        expected: "Rendu optimal sans débordement. La carte s'adapte sans casser l'ergonomie générale.",
      },
      {
        id: "TC-2.2",
        action: "Saisir un email dans la newsletter depuis un smartphone ou une tablette. (Prendre une capture en cas d'erreur).",
        expected: "Saisie et soumission fluides. Affichage du message de confirmation de succès.",
      },
      {
        id: "TC-2.3",
        action: "Mesurer la vitesse d'affichage en connexion 3G/4G sur mobile (temps de chargement LCP).",
        expected: "LCP inférieur à 2.5 secondes. L'image de secours (Fallback) s'affiche de manière fluide si la vidéo Hero n'a pas fini de charger.",
      },
      {
        id: "TC-2.4",
        action: "Utiliser la recherche textuelle et combiner les filtres (ville, type de bien, prix maximum, transaction).",
        expected: "Les filtres affichent les résultats correspondants sans délai. Des filtres complémentaires suggérés s'affichent correctement.",
      },
      {
        id: "TC-2.5",
        action: "Cliquer sur un bien pour incrémenter les vues et consulter le carrousel en bas.",
        expected: "Le compteur de vues s'incrémente de 1 en base de données. Le carrousel propose des biens similaires de même catégorie.",
      },
      {
        id: "TC-2.6",
        action: "Cliquer sur l'icône de favoris (Cœur) d'un bien sans être authentifié.",
        expected: "Ouverture d'une invite / boîte de dialogue incitant le visiteur à s'authentifier.",
      }
    ]
  },
  {
    title: "3. Réservations, Soft Delete & Paiements Paystack (MVP 1 - F05 & F06 & F07)",
    description: "Valider les verrous atomiques, le soft delete, les paiements Paystack, et la facture PDF R2.",
    steps: [
      {
        id: "TC-3.1",
        action: "Initialiser une réservation de bien (acompte 1/3) par un client.",
        expected: "Réservation créée avec succès au statut en attente. Date d'expiration définie à 3 mois maximum.",
      },
      {
        id: "TC-3.2",
        action: "Simuler la réservation simultanée d'un même bien par deux utilisateurs (concurrence).",
        expected: "Verrouillage atomique efficace. Seule la première requête aboutit, la seconde est rejetée avec erreur.",
      },
      {
        id: "TC-3.2.1",
        action: "Créer manuellement et modifier les dates d'une réservation depuis l'espace administratif.",
        expected: "Mise à jour immédiate. Le nouveau statut de réservation est correctement synchronisé.",
      },
      {
        id: "TC-3.2.2",
        action: "Supprimer une réservation depuis le panneau admin.",
        expected: "Soft Delete validé : la réservation n'est pas détruite physiquement mais marquée avec deleted_at et masquée des listes.",
      },
      {
        id: "TC-3.2.3",
        action: "Déclencher une suppression de réservation ou de bien pour afficher la cartographie d'impact.",
        expected: "Une boîte de dialogue s'ouvre, dressant la liste d'impact des entités enfants liées (visites, factures) avant confirmation.",
      },
      {
        id: "TC-3.3",
        action: "Procéder au paiement de l'acompte Paystack, et observer le flux de retour.",
        expected: "Paiement réussi sur l'interface de test. Redirection fluide vers la page de succès de l'application.",
      },
      {
        id: "TC-3.4",
        action: "Simuler la notification du webhook Paystack avec signature HMAC-SHA512.",
        expected: "Signature validée avec succès. Statut de paiement mis à jour en DB et reflété sur le dashboard admin.",
      },
      {
        id: "TC-3.5",
        action: "Visualiser et télécharger la facture PDF générée pour l'achat.",
        expected: "La facture PDF (stockée sur R2) s'ouvre proprement dans le navigateur et se télécharge sans erreur.",
      }
    ]
  },
  {
    title: "4. Espace Administration, Exports Excel & Espace Client (MVP 1 - F08 & F09)",
    description: "Valider le responsive de la console admin, les formulaires Zod, l'export Excel formaté et l'Espace Client.",
    steps: [
      {
        id: "TC-4.1",
        action: "Accéder au CRUD des biens dans l'administration sur PC, tablette et smartphone.",
        expected: "Responsive parfait. Validation Zod active (les erreurs de saisie s'affichent clairement sans plantage).",
      },
      {
        id: "TC-4.2",
        action: "Exporter les paiements en fichier Excel depuis le dashboard.",
        expected: "Téléchargement immédiat. Le fichier Excel est esthétiquement mis en forme avec des colonnes lisibles et formatées.",
      },
      {
        id: "TC-4.3",
        action: "Modifier le profil de l'utilisateur connecté dans l'Espace Client.",
        expected: "Mise à jour réussie. L'Espace Client n'affiche que les données associées à la session de l'utilisateur (contrainte RLS).",
      },
      {
        id: "TC-4.4",
        action: "Visualiser et télécharger les factures d'acompte depuis l'Espace Client.",
        expected: "Le client peut ouvrir et télécharger ses reçus de paiement sans aucun problème d'autorisation.",
      }
    ]
  },
  {
    title: "5. Sécurité d'Isolation des Permissions & Droits d'Accès (MVP 1 - F10)",
    description: "Tester le cloisonnement strict des privilèges de modification de permissions et le cochage réactif.",
    steps: [
      {
        id: "TC-5.1",
        action: "Se connecter avec le compte Client et tenter de forcer l'accès à la console des rôles.",
        expected: "Accès strictement refusé. Redirection immédiate par le middleware vers l'espace personnel client.",
      },
      {
        id: "TC-5.2",
        action: "Se connecter avec le compte Agent et tenter d'entrer sur la page de gestion des rôles.",
        expected: "Accès strictement refusé. L'agent est bloqué et renvoyé sur la page d'accueil d'administration.",
      },
      {
        id: "TC-5.3",
        action: "Tenter d'envoyer manuellement un POST vers /api/admin/roles avec le compte Client pour forcer les droits.",
        expected: "Rejet immédiat au niveau serveur avec statut HTTP 403 Forbidden. Aucune écriture en base de données n'est tolérée.",
      },
      {
        id: "TC-5.4",
        action: "Se connecter en Super Admin, cocher et décocher des cases de droits d'accès en observant l'interface.",
        expected: "Mise à jour immédiate en base de données. L'interface réagit en temps réel et la case conserve sa couleur or.",
      }
    ]
  },
  {
    title: "6. Gestion Dynamique de l'Équipe & Collaborateurs (MVP 2)",
    description: "Valider l'édition, la réorganisation et l'affichage des collaborateurs.",
    steps: [
      {
        id: "TC-6.1",
        action: "Se connecter en administrateur, se rendre dans l'onglet 'Notre Équipe' du formulaire d'administration.\nCliquer sur 'Ajouter' pour insérer un nouveau collaborateur fictif.",
        expected: "Un nouveau bloc apparaît. L'administrateur peut saisir le Nom, le Poste et la Biographie librement.",
      },
      {
        id: "TC-6.2",
        action: "Uploader une photo de profil pour ce collaborateur fictif via le téléverseur Cloudflare R2.",
        expected: "La photo est chargée et une prévisualisation miniature de celle-ci s'affiche instantanément.",
      },
      {
        id: "TC-6.3",
        action: "Ajouter un second collaborateur puis cliquer sur la flèche 'Haut' ou 'Bas' à côté du premier collaborateur.",
        expected: "L'ordre des collaborateurs est réorganisé instantanément à l'écran. L'ordre est fidèlement enregistré en base de données après clic sur Enregistrer.",
      },
      {
        id: "TC-6.4",
        action: "Supprimer tous les collaborateurs de la configuration de test et enregistrer la section.\nAccéder à la page publique du site vitrine.",
        expected: "La section 'Notre Équipe' est masquée de manière intelligente et transparente pour ne pas afficher une page vide aux clients.",
      }
    ]
  },
  {
    title: "7. Éditeur des Expertises, Informations Libres & Grille responsive (MVP 2)",
    description: "Valider la configuration des services, le nouveau champ libre et le bouton Voir plus.",
    steps: [
      {
        id: "TC-7.1",
        action: "Aller dans l'onglet 'Nos Expertises' de l'administration.\nModifier la description et sélectionner une icône visuelle (ex: Boussole, Immeuble) pour un service.",
        expected: "L'icône sélectionnée s'affiche correctement dans le sélecteur CustomSelect et la description est mise à jour.",
      },
      {
        id: "TC-7.2",
        action: "Saisir du texte dans le nouveau champ libre 'Informations complémentaires' (ex: 'Délais : 3 semaines', 'Tarifs sur devis'). Enregistrer.",
        expected: "La valeur est sauvegardée en base. Sur la page publique, l'information s'affiche sous la description du service, stylisée avec élégance (liseré vertical doré à gauche, texte en italique).",
      },
      {
        id: "TC-7.3",
        action: "Vérifier la grille publique des expertises sur PC.",
        expected: "La grille s'affiche sur deux colonnes (au lieu de 3 auparavant), centrée pour un rendu équilibré de prestige.",
      },
      {
        id: "TC-7.4",
        action: "Ajouter un 5ème service dans la console et enregistrer. Consulter la page publique.",
        expected: "Seuls les 4 premiers services s'affichent par défaut. Un bouton doré 'Voir plus d'expertises' est visible en bas de la section.",
      },
      {
        id: "TC-7.5",
        action: "Cliquer sur le bouton 'Voir plus d'expertises'.",
        expected: "Le 5ème service est révélé de manière fluide. Le libellé du bouton se transforme en 'Voir moins'.",
      }
    ]
  },
  {
    title: "8. Vidéo Hero, Médias du Dashboard & Immunité des Fallbacks (MVP 2)",
    description: "Valider les contrôles médias et la résilience de l'application face aux suppressions.",
    steps: [
      {
        id: "TC-8.1",
        action: "Dans l'onglet 'Hero (En-tête)' de l'administration, uploader une photo de secours (Fallback) pour la vidéo d'en-tête.",
        expected: "L'image est chargée et affichée en miniature. Elle sert d'arrière-plan de secours si la vidéo ne peut pas être chargée par le navigateur du client.",
      },
      {
        id: "TC-8.2",
        action: "Inspecter la zone de la vidéo cinématique dans l'administration.",
        expected: "L'uploader et le bouton de suppression sont verrouillés (disabled/grisés/cursor-not-allowed) pour empêcher toute modification intempestive.",
      },
      {
        id: "TC-8.3",
        action: "Dans une autre section (ex: About), vider entièrement un champ ou supprimer une image de la base de données.",
        expected: "L'application publique ne plante pas. Le système de repli (`||`) intercepte la valeur manquante et charge instantanément l'image ou le texte par défaut du code source.",
      }
    ]
  },
  {
    title: "9. Gestion des Leads CRM (MVP 2 - F11)",
    description: "Valider le cycle de scoring, l'attribution automatique round-robin et la traçabilité des leads.",
    steps: [
      {
        id: "TC-9.1",
        action: "Ajouter des actions au prospect (Lead) : planifier une visite terrain et renseigner un acompte payé.",
        expected: "Le score du lead est recalculé automatiquement en temps réel en passant de 10 à 65 (selon la matrice de scoring).",
      },
      {
        id: "TC-9.2",
        action: "Simuler l'entrée simultanée de 3 nouveaux prospects via le formulaire de contact du site.",
        expected: "Algorithme d'attribution Round-Robin validé. Les 3 leads sont dispatchés équitablement entre les agents actifs.",
      },
      {
        id: "TC-9.3",
        action: "Accéder à la fiche de détails du prospect dans le CRM et consulter l'historique.",
        expected: "Affichage chronologique complet des appels passés, emails envoyés et messages WhatsApp échangés.",
      },
      {
        id: "TC-9.4",
        action: "Déclencher l'archivage ou le rejet d'un lead obsolète depuis le tableau d'administration.",
        expected: "Soft Delete validé : la ligne passe à l'état inactif et est immédiatement masquée du pipeline commercial.",
      }
    ]
  },
  {
    title: "10. Pipeline de Vente Kanban (MVP 2 - F12)",
    description: "Valider la fluidité du Kanban, les notifications associées et le gating des étapes.",
    steps: [
      {
        id: "TC-10.1",
        action: "Glisser un lead de 'Prospect' vers 'Lead Qualifié' par drag & drop sur le tableau Kanban.",
        expected: "Mouvement fluide. L'étape de vente du prospect est instantanément mise à jour en base de données.",
      },
      {
        id: "TC-10.2",
        action: "Vérifier la cloche in-app de l'agent affecté après déplacement de son lead.",
        expected: "Notification instantanée générée via Supabase Realtime sans rafraîchir la page.",
      },
      {
        id: "TC-10.3",
        action: "Tenter de glisser un prospect à l'étape 'Vente Finalisée' alors que le contrat de réservation est manquant.",
        expected: "Blocage systématique (Gating). Le système affiche une invite bloquante exigeant le contrat signé.",
      },
      {
        id: "TC-10.4",
        action: "Consulter l'onglet de traçabilité dans la fiche détaillée du lead.",
        expected: "Affichage de la liste chronologique des transitions d'étapes avec horodatage et identité de l'agent.",
      }
    ]
  },
  {
    title: "11. Gestion des Dossiers Clients & Tâches (MVP 2 - F13)",
    description: "Valider le calcul de progression, les alertes d'échéances et la gestion des blocages.",
    steps: [
      {
        id: "TC-11.1",
        action: "Ajouter 4 tâches dans un dossier client et en marquer 2 comme 'terminée'.",
        expected: "Progression dynamique recalculée automatiquement. Le dossier affiche précisément 50% de complétion.",
      },
      {
        id: "TC-11.2",
        action: "Consulter les tâches sur le tableau de bord d'un agent alors qu'une date limite est dépassée.",
        expected: "Alerte visuelle rouge visible pour signaler le retard de la tâche.",
      },
      {
        id: "TC-11.3",
        action: "Tenter de passer le statut d'une tâche à 'bloquée' sans renseigner le champ commentaire.",
        expected: "Action refusée. L'interface affiche une erreur et exige la saisie d'un motif de blocage.",
      },
      {
        id: "TC-11.4",
        action: "Assigner une tâche transverse à deux collaborateurs simultanément.",
        expected: "La tâche apparaît sur le planning personnel et l'agenda des deux agents concernés.",
      }
    ]
  },
  {
    title: "12. Visites Terrain & Notifications Push PWA (MVP 2 - F14 & F15)",
    description: "Valider la gestion des visites, la synchronisation d'agendas et les push VAPID.",
    steps: [
      {
        id: "TC-12.1",
        action: "Planifier une visite terrain à Yaho sur l'agenda d'un agent.",
        expected: "Le créneau est réservé et le terrain passe automatiquement à l'état indisponible pour cette plage horaire.",
      },
      {
        id: "TC-12.2",
        action: "Exporter le flux iCal de l'agent et l'importer dans un agenda externe.",
        expected: "Le fichier .ics standardisé est généré et importé sans erreur dans Google Calendar ou Outlook.",
      },
      {
        id: "TC-12.3",
        action: "Valider l'abonnement push VAPID du navigateur et attribuer une visite à l'agent.",
        expected: "La notification push native s'affiche sur le bureau de l'ordinateur ou sur smartphone en moins de 2 secondes.",
      }
    ]
  },
  {
    title: "13. Dashboards RH, Statistiques & Reporting KPIs (MVP 2 - F16)",
    description: "Valider l'intégrité des dashboards Recharts, le classement RH d'agents et les exports.",
    steps: [
      {
        id: "TC-13.1",
        action: "Ouvrir l'onglet 'Analytics' pour consulter les graphiques Recharts.",
        expected: "Les graphiques (CA cumulé, répartition par lotissement) s'affichent correctement avec infobulles interactives.",
      },
      {
        id: "TC-13.2",
        action: "Consulter la table comparative des performances des agents commerciaux (conversions, visites).",
        expected: "Les taux de conversion de chaque agent sont calculés fidèlement en temps réel.",
      },
      {
        id: "TC-13.3",
        action: "Exporter un rapport d'activité globale au format PDF ou Excel.",
        expected: "Le document téléchargé est parfaitement mis en forme, les données et en-têtes sont lisibles.",
      }
    ]
  }
];

// -------------------------------------------------------------
// DOCUMENT GENERATION
// -------------------------------------------------------------
const docChildren = [];

// 1. Cover Page
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
      new TextRun({ text: "CAHIER DE RECETTE", bold: true, size: 56, font: "Calibri", color: COLOR_PRIMARY_NAVY }),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new TextRun({ text: "VALIDATION DU MVP 1 & MVP 2", bold: true, size: 32, font: "Calibri", color: COLOR_GOLD_MID }),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 2200 },
    children: [
      runReg("Guide officiel de tests d'acceptation, d'audits de sécurité et de conformité de l'application", 22, COLOR_TEXT_MUTED),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80 },
    children: [
      runBold("Version : ", 20),
      runReg("3.0 (Officielle - Validation Intégrale MVP 1 & MVP 2)", 20),
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 80 },
    children: [
      runBold("Auteur : ", 20),
      runReg("ChefsFavor — IA Tech Lead & Chef de Projet Senior", 20),
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
  new Paragraph({ pageBreakBefore: true, children: [] })
);

// 1.b. Historique des Révisions (Inspired by the Ciprel reference document)
const revColWidths = [1500, 2000, 4360, 1500]; // Sum = 9360 DXA
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [runBold("Historique des Révisions", 28, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      runReg("Ce tableau permet de suivre l'historique des versions et modifications apportées à ce cahier de recette.")
    ]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: revColWidths,
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Version", revColWidths[0]),
          createHeaderCell("Date", revColWidths[1]),
          createHeaderCell("Description des modifications", revColWidths[2]),
          createHeaderCell("Auteur", revColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runReg("1.0", 18)] })], revColWidths[0]),
          createCell([new Paragraph({ children: [runReg("27/05/2026", 18)] })], revColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Création initiale du cahier de recette pour la validation du MVP 1.", 18)] })], revColWidths[2]),
          createCell([new Paragraph({ children: [runReg("ChefsFavor", 18)] })], revColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runReg("2.0", 18)] })], revColWidths[0]),
          createCell([new Paragraph({ children: [runReg("10/06/2026", 18)] })], revColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Mise à jour combinée. Intégration des scénarios du MVP 2 (Gestion d'équipe, expertises, fallbacks).", 18)] })], revColWidths[2]),
          createCell([new Paragraph({ children: [runReg("ChefsFavor", 18)] })], revColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runReg("3.0", 18)] })], revColWidths[0]),
          createCell([new Paragraph({ children: [runReg(new Date().toLocaleDateString('fr-FR'), 18)] })], revColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Intégration finale des scénarios de validation CRM & Analytics du MVP 2 (Pipeline de Leads, Disponibilités terrain, Calendrier iCal, Push PWA, Dashboards RH et Paramètres Globaux).", 18)] })], revColWidths[2]),
          createCell([new Paragraph({ children: [runReg("ChefsFavor", 18)] })], revColWidths[3])
        ]
      })
    ]
  }),
  new Paragraph({ pageBreakBefore: true, children: [] })
);

// 1.c Table of Contents / Sommaire
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [runBold("Sommaire & Table des Matières", 28, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 180 },
    children: [
      runReg("Ce guide de validation combine l'ensemble des scénarios de test et de conformité pour les MVP 1 & MVP 2. Si vous ouvrez ce document sous Microsoft Word, vous pouvez faire un clic droit sur le champ dynamique ci-dessous et sélectionner ", 20),
      runBold("'Mettre à jour les champs' ", 20, COLOR_GOLD_DEEP),
      runReg("pour actualiser les numéros de page exacts.", 20)
    ]
  }),
  new TableOfContents("Sommaire Dynamique", { hyperlink: true, headingStyleRange: "1-3" }),
  new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [runBold("Structure du Cahier de Recette (Sommaire Statique)", 20, COLOR_GOLD_MID)]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Section / Chapitre", 4680),
          createHeaderCell("Contenu & Objectifs de validation", 4680)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("1. Fondations & Historique", 18, COLOR_PRIMARY_NAVY)] })], 4680, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Historique des versions (v1.0 et v2.0 combinée), objectifs généraux de la recette.", 18)] })], 4680)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("2. Acteurs & Liste des Comptes de Test", 18, COLOR_PRIMARY_NAVY)] })], 4680, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Tableau des profils (Client, Agent, Admin), identifiants fictifs de test et méthodes d'activation.", 18)] })], 4680)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("3. Matrice de Sécurité RBAC", 18, COLOR_PRIMARY_NAVY)] })], 4680, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Tableau matriciel complet associant chaque droit/permission granulaire aux différents acteurs.", 18)] })], 4680)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("4. Scénarios d'Acceptation MVP 1", 18, COLOR_PRIMARY_NAVY)] })], 4680, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("5 scénarios détaillés : Authentification, Vitrine interactive, Paiements Paystack, PDF/Excel, UX Mobile, isolation des routes.", 18)] })], 4680)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("5. Scénarios d'Acceptation MVP 2", 18, COLOR_PRIMARY_NAVY)] })], 4680, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("8 scénarios détaillés : Gestion d'équipe R2, Éditeur d'expertises (grille 2 col), Vidéo Hero & fallbacks, Pipeline de Leads CRM, Calendrier iCal, Push PWA, Dashboards RH et Paramètres Globaux.", 18)] })], 4680)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("6. Validation Globale & Signatures", 18, COLOR_PRIMARY_NAVY)] })], 4680, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Fiche finale d'évaluation globale et zones d'approbation et signature pour clôturer la recette.", 18)] })], 4680)
        ]
      })
    ]
  }),
  new Paragraph({ pageBreakBefore: true, children: [] })
);

// 2. Introduction & Guidelines
const accountsColWidths = [1800, 2200, 2300, 3060]; // Sum = 9360 DXA
docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [runBold("Introduction, Rôles de Test & Objectifs", 28, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      runReg("Ce cahier de recette a été conçu pour guider les tests d'acceptation des phases "),
      runBold("MVP 1 & MVP 2"),
      runReg(" de la plateforme Favor Company International. Il permet de s'assurer de l'adéquation fonctionnelle, de la robustesse visuelle et de la sécurité du système avant sa mise en production. Ces tests s'exécutent simplement, sans connaissances techniques préalables, en se connectant avec les profils applicatifs ci-dessous.")
    ]
  }),
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 120 },
    children: [runBold("Comptes de Test Pouvant Être Créés / Utilisés", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 180 },
    children: [
      runReg("Voici la liste complète des comptes de démonstration pré-configurés (seedés) ou pouvant être créés librement au cours des validations :"),
    ]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: accountsColWidths,
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Profil / Rôle", accountsColWidths[0]),
          createHeaderCell("Email de Test Seedé", accountsColWidths[1]),
          createHeaderCell("Méthode de Création", accountsColWidths[2]),
          createHeaderCell("Description des privilèges de base", accountsColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Client", 18, COLOR_PRIMARY_NAVY)] })], accountsColWidths[0], COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("client.investisseur@gmail.com", 18)] })], accountsColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Compte diaspora pré-configuré (ou création libre).", 18)] })], accountsColWidths[2]),
          createCell([new Paragraph({ children: [runReg("Portail public, recherche cartographique interactive, favoris, réservation de biens, paiements Paystack et factures PDF.", 18)] })], accountsColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Agent / Manager", 18, COLOR_PRIMARY_NAVY)] })], accountsColWidths[0], COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("manager.cocody@favorcompany.ci", 18)] })], accountsColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Créé exclusivement par la Direction dans la console Admin.", 18)] })], accountsColWidths[2]),
          createCell([new Paragraph({ children: [runReg("Gestion commerciale, création/édition de fiches de biens (Zod), suivi des dossiers clients, visites terrain et planning iCal.", 18)] })], accountsColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Admin Juridique", 18, COLOR_PRIMARY_NAVY)] })], accountsColWidths[0], COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("admin.juridique@favorcompany.ci", 18)] })], accountsColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Créé via des scripts système sécurisés en base de données.", 18)] })], accountsColWidths[2]),
          createCell([new Paragraph({ children: [runReg("Accès total. Configuration du site vitrine, console de sécurité RBAC (gestion des droits), suivi de la trésorerie et exports Excel.", 18)] })], accountsColWidths[3])
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("Super Admin", 18, COLOR_PRIMARY_NAVY)] })], accountsColWidths[0], COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("admin.general@favorcompany.ci", 18)] })], accountsColWidths[1]),
          createCell([new Paragraph({ children: [runReg("Compte de Direction Générale.", 18)] })], accountsColWidths[2]),
          createCell([new Paragraph({ children: [runReg("Contrôle absolu sur la console d'administration, validation des paiements, gestion des utilisateurs, audit légal et configurations.", 18)] })], accountsColWidths[3])
        ]
      })
    ]
  }),
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [runBold("Périmètre Fonctionnel du MVP 1 (F02 - F10)", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 180 },
    children: [
      runReg("Voici la cartographie des modules fonctionnels livrés et validés dans le cadre du MVP 1 de l'application Favor Company International :")
    ]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 7560],
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Code Feature", 1800),
          createHeaderCell("Description Détaillée du Service Validé", 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F02", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Authentification : Inscription email/mot de passe, validation OTP, Google OAuth, réinitialisation de mot de passe et middleware de sécurité.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F03", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Page d'Accueil : Présentation prestige, scroll effect, grille de biens dynamiques, équipe, avis clients et FAQ accordéon.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F04", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Catalogue & Détails : Liste paginée des biens, recherche textuelle, filtres avancés, carte interactive Leaflet (thème Or & Navy) et suggestion de biens similaires.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F05", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Réservation : Initialisation d'acompte (1/3), durée de validité limitée à 3 mois, et verrou de transaction atomique (concurrence).", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F06", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Paiements Paystack : Liens de paiement dynamiques, webhooks sécurisés par signature HMAC-SHA512 et mise à jour de DB.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F07", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Génération de Factures : Automatisation de la numérotation, conversion PDF, envoi avec pièce jointe via Resend, et stockage Cloudflare R2.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F08", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Admin Dashboard : Statistiques globales de trésorerie, CRUD fiches biens (Zod), uploader R2, et exports financiers (CSV/Excel).", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F09", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Espace Client : Suivi des réservations en temps réel, téléchargement direct des factures R2, et modification sécurisée du profil client.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F10", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Permissions RBAC : Contrôles d'accès granulaires au niveau API et composants (PermissionGate), et console de configuration.", 18)] })], 7560)
        ]
      })
    ]
  }),
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [runBold("Périmètre Fonctionnel du MVP 2 (F11 - F16)", 22, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 180 },
    children: [
      runReg("Voici la cartographie des modules fonctionnels livrés et validés dans le cadre du MVP 2 de l'application Favor Company International :")
    ]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1800, 7560],
    rows: [
      new TableRow({
        children: [
          createHeaderCell("Code Feature", 1800),
          createHeaderCell("Description Détaillée du Service Validé", 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F11", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Gestion des Leads (CRM) : Capture de prospects, scoring automatique de 0 à 100, attribution automatique round-robin aux agents et historique des interactions.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F12", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Pipeline de Vente : Vue Kanban interactive à 8 colonnes (drag & drop), transitions avec alertes temps réel et gating d'étapes.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F13", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Gestion des Dossiers & Tâches : Dossiers clients liés aux biens, progression dynamique calculée en %, alertes de deadlines et gestion obligatoire des blocages.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F14", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Gestion des Visites : Prise de rendez-vous en ligne, calendrier d'indisponibilités agents, rappels de visites et notes post-visites.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F15", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Notifications & Communication : Centre de notifications Realtime in-app, e-mails transactionnels automatiques et relances d'expiration.", 18)] })], 7560)
        ]
      }),
      new TableRow({
        children: [
          createCell([new Paragraph({ children: [runBold("F16", 18, COLOR_PRIMARY_NAVY)] })], 1800, COLOR_ACCENT_BG),
          createCell([new Paragraph({ children: [runReg("Rapports & KPIs : Dashboards analytiques avec graphiques interactifs Recharts (revenus, conversions, parts par lotissement), performance commerciale d'agents et exports.", 18)] })], 7560)
        ]
      })
    ]
  }),
  new Paragraph({ pageBreakBefore: true, children: [] })
);

// 3. Matrice de Droits, Rôles & Accès (RBAC)
const matrixColWidths = [2000, 3760, 1200, 1200, 1200]; // Sum = 9360 DXA

const matrixRows = [
  new TableRow({
    children: [
      createHeaderCell("Code Droit", matrixColWidths[0]),
      createHeaderCell("Description de la permission de sécurité", matrixColWidths[1]),
      createHeaderCell("Admin", matrixColWidths[2]),
      createHeaderCell("Agent", matrixColWidths[3]),
      createHeaderCell("Client", matrixColWidths[4])
    ]
  })
];

const permissionsMatrix = [
  { code: "manage:biens", desc: "Créer, modifier, archiver ou supprimer des biens immobiliers", admin: true, agent: true, client: false },
  { code: "view:biens", desc: "Consulter le catalogue des biens dans l'espace d'administration", admin: true, agent: true, client: false },
  { code: "manage:users", desc: "Gérer les comptes utilisateurs (modification rôles, suppression)", admin: true, agent: false, client: false },
  { code: "view:users", desc: "Consulter la liste de tous les comptes enregistrés", admin: true, agent: false, client: false },
  { code: "manage:reservations", desc: "Valider, rejeter ou modifier les réservations", admin: true, agent: true, client: false },
  { code: "view:reservations", desc: "Consulter la liste des réservations", admin: true, agent: true, client: false },
  { code: "manage:paiements", desc: "Effectuer des remboursements ou annuler des transactions", admin: true, agent: false, client: false },
  { code: "view:paiements", desc: "Voir le grand livre des paiements et rapports de trésorerie", admin: true, agent: false, client: false },
  { code: "manage:config", desc: "Personnaliser le site public (Hero, Collaborateurs, Expertises)", admin: true, agent: false, client: false },
  { code: "manage:leads", desc: "Attribuer et modifier le statut des prospects (leads)", admin: true, agent: true, client: false },
  { code: "view:leads", desc: "Visualiser la liste des prospects (leads)", admin: true, agent: true, client: false },
  { code: "manage:dossiers", desc: "Créer, modifier, affecter des dossiers clients et tâches", admin: true, agent: true, client: false },
  { code: "view:dossiers", desc: "Visualiser les dossiers et tâches associés", admin: true, agent: true, client: false },
  { code: "manage:visites", desc: "Planifier, modifier et annuler les visites de biens", admin: true, agent: true, client: false },
  { code: "view:visites", desc: "Consulter le calendrier général ou individuel des visites", admin: true, agent: true, client: false }
];

permissionsMatrix.forEach(p => {
  matrixRows.push(
    new TableRow({
      children: [
        createCell([new Paragraph({ children: [runBold(p.code, 16, COLOR_PRIMARY_NAVY)] })], matrixColWidths[0], COLOR_ACCENT_BG),
        createCell([new Paragraph({ children: [runReg(p.desc, 16)] })], matrixColWidths[1]),
        createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [p.admin ? runBold("[ X ]", 16, "059669") : runReg("[   ]", 16, "991B1B")] })], matrixColWidths[2]),
        createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [p.agent ? runBold("[ X ]", 16, "059669") : runReg("[   ]", 16, "991B1B")] })], matrixColWidths[3]),
        createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [p.client ? runBold("[ X ]", 16, "059669") : runReg("[   ]", 16, "991B1B")] })], matrixColWidths[4])
      ]
    })
  );
});

docChildren.push(
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 180 },
    children: [runBold("Matrice des Droits & Accès de la Plateforme (RBAC)", 28, COLOR_PRIMARY_NAVY)]
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [
      runReg("Le tableau matriciel ci-dessous détaille l'attribution des droits de sécurité et d'accès pour chaque acteur du projet (Client, Agent, Administrateur). Les contrôles d'accès sont appliqués au niveau serveur (politiques RLS de Supabase) et client (Redirections React).")
    ]
  }),
  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: matrixColWidths,
    rows: matrixRows
  }),
  new Paragraph({ pageBreakBefore: true, children: [] })
);


// 4. Testing Scenarios Table Generation
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
          createCell(
            [new Paragraph({ children: [runBold(st.id, 18, COLOR_PRIMARY_NAVY)] })],
            colWidths[0],
            COLOR_ACCENT_BG
          ),
          createCell(
            [new Paragraph({ children: [runReg(st.action, 18)] })],
            colWidths[1]
          ),
          createCell(
            [new Paragraph({ children: [runReg(st.expected, 18, "000000", false)] })],
            colWidths[2]
          ),
          createCell(
            [
              new Paragraph({
                children: [
                  new CheckBox(),
                  runBold(" Conforme\n"),
                  new CheckBox(),
                  runBold(" Non Conf.")
                ]
              })
            ],
            colWidths[3]
          ),
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
    new Paragraph({ spacing: { before: 180, after: 120 }, children: [runBold(`Fiche d'Évaluation Globale — Scénario ${index + 1}`, 20, COLOR_GOLD_DEEP)] })
  );

  // Evaluation table
  const valLocalColWidths = [2800, 6560]; // Sum = 9360 DXA
  docChildren.push(
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: valLocalColWidths,
      rows: [
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Testé par :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([new Paragraph({ children: [runReg("____________________________________________________________", 18)] })], valLocalColWidths[1])
          ]
        }),
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Date :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([new Paragraph({ children: [runReg("____ / ____ / 2026", 18)] })], valLocalColWidths[1])
          ]
        }),
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Commentaires :", 18, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([
              new Paragraph({ children: [runReg(" ", 18)] }),
              new Paragraph({ children: [runReg(" ", 18)] })
            ], valLocalColWidths[1])
          ]
        }),
        new TableRow({
          children: [
            createCell([new Paragraph({ children: [runBold("Verdict final :", 24, COLOR_PRIMARY_NAVY)] })], valLocalColWidths[0], COLOR_ACCENT_BG),
            createCell([
              new Paragraph({
                children: [
                  new CheckBox(), runBold(" Conforme     ", 24),
                  new CheckBox(), runBold(" Non Conforme     ", 24),
                  new CheckBox(), runBold(" Présence de Bugs (à détailler)", 24)
                ]
              })
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
      runReg("Après avoir exécuté et signé individuellement chaque scénario de test multi-profils ci-dessus, veuillez remplir cette section pour clore définitivement la recette des MVP 1 & MVP 2.")
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
              new Paragraph({ spacing: { before: 200 }, children: [runReg("Nom : ChefsFavor (IA Tech Lead)", 20)] }),
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
          font: "Calibri",
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
        run: { size: 28, bold: true, font: "Calibri", color: COLOR_PRIMARY_NAVY },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, font: "Calibri", color: COLOR_GOLD_DEEP },
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
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Favor Company International — Cahier de Recette MVP 1 & 2", font: "Calibri", size: 16, color: "64748B" })
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: "Calibri", size: 16, color: "64748B" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Calibri", size: 16, color: "64748B" })
            ]
          })
        ]
      })
    },
    children: docChildren
  }]
});

Packer.toBuffer(doc).then((buffer) => {
  const outputPath = path.join(docsDir, 'cahier_de_recette.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`[SUCCESS] cahier_de_recette.docx generated successfully at: ${outputPath}`);
}).catch((err) => {
  console.error('[ERROR] Failed to generate docx:', err);
  process.exit(1);
});
