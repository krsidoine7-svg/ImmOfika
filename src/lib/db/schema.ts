import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  decimal,
  pgEnum,
  jsonb,
  index,
} from 'drizzle-orm/pg-core'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const bienTypeEnum = pgEnum('bien_type', [
  'terrain',
  'villa',
  'appartement',
  'bureau',
  'commerce',
  'entrepot',
])

export const bienStatutEnum = pgEnum('bien_statut', [
  'disponible',
  'reserve',
  'vendu',
  'loue',
])

export const bienTransactionEnum = pgEnum('bien_transaction', [
  'vente',
  'location',
])

// ─── Tables ───────────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('client').notNull(), // 'admin', 'client', 'agent', 'suspended'
  suspensionReason: text('suspension_reason'), // Motif légal de suspension / bannissement
  kycDocUrl: text('kyc_doc_url'), // Fichier KYC (CNI, Passeport...)
  kycDocType: text('kyc_doc_type'), // Type de pièce (CNI, Passeport...)
  kycStatus: text('kyc_status').default('none').notNull(), // none, pending, verified
  kycRejectionReason: text('kyc_rejection_reason'), // Motif du rejet KYC par l'agent
  isOnboarded: boolean('is_onboarded').default(false).notNull(), // Onboarding profil complété
  organizationId: uuid('organization_id'), // Agence ou Promoteur rattaché le cas échéant
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})



// ─── RBAC (Roles & Permissions Avancé) ─────────────────────────────────────────
export const roles = pgTable('roles', {
  name: text('name').primaryKey(), // 'visiteur', 'client', 'proprietaire', 'agence', 'moderateur', 'support', 'admin', 'super_admin'
  label: text('label'),
  hierarchyLevel: integer('hierarchy_level').default(1).notNull(), // 1: visiteur, 2: client, 3: proprio, 4: agence, 5: moderateur, 6: support, 7: admin, 8: super_admin
  isSystem: boolean('is_system').default(true).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(), // true = permissions non modifiables 🔒 (SUPER_ADMIN)
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const permissions = pgTable('permissions', {
  code: text('code').primaryKey(), // ex: 'annonce:voir_publiques', 'reglages:systeme'
  label: text('label'),
  resource: text('resource'),      // 'annonce', 'profil', 'role', 'paiement'...
  action: text('action'),          // 'voir', 'creer', 'modifier', 'supprimer', 'gerer'...
  scope: text('scope'),            // 'own' ou 'all'
  isSensitive: boolean('is_sensitive').default(false).notNull(), // true = réservé SUPER_ADMIN 🔒
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rolePermissions = pgTable('role_permissions', {
  roleName: text('role_name').notNull().references(() => roles.name, { onDelete: 'cascade' }),
  permissionCode: text('permission_code').notNull().references(() => permissions.code, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_role_permissions_role').on(table.roleName),
  index('idx_role_permissions_code').on(table.permissionCode),
])

export const defaultRolePermissions = pgTable('default_role_permissions', {
  roleName: text('role_name').notNull().references(() => roles.name, { onDelete: 'cascade' }),
  permissionCode: text('permission_code').notNull().references(() => permissions.code, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_default_role_permissions_role').on(table.roleName),
  index('idx_default_role_permissions_code').on(table.permissionCode),
])

export const userRoles = pgTable('user_roles', {
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  roleName: text('role_name').notNull().references(() => roles.name, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  assignedBy: uuid('assigned_by').references(() => profiles.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at'), // Expiration optionnelle du rôle
}, (table) => [
  index('idx_user_roles_user').on(table.userId),
  index('idx_user_roles_role').on(table.roleName),
])

// ─── Organisations (Agences Immobilières & Promoteurs Agréés) ────────────────
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').default('agence').notNull(), // 'agence', 'promoteur'
  rccm: text('rccm'),                            // Numéro RCCM (ex: CI-ABJ-2024-B-...)
  ncc: text('ncc'),                              // Compte Contribuable DGI
  agrementNumero: text('agrement_numero'),       // Numéro d'agrément officiel MCLU
  logoUrl: text('logo_url'),
  description: text('description'),
  telephone: text('telephone'),
  email: text('email'),
  whatsapp: text('whatsapp'),
  ville: text('ville').default('Abidjan').notNull(),
  commune: text('commune'),                      // Cocody, Marcory, Plateau...
  adresse: text('adresse'),
  verifiedAt: timestamp('verified_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_organizations_slug').on(table.slug),
  index('idx_organizations_type').on(table.type),
])

export const organizationMembers = pgTable('organization_members', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  roleInOrg: text('role_in_org').default('negociateur').notNull(), // 'gerant', 'negociateur', 'assistant'
  assignedAt: timestamp('assigned_at').defaultNow().notNull(),
}, (table) => [
  index('idx_org_members_user').on(table.userId),
  index('idx_org_members_org').on(table.organizationId),
])

// ─── Tables principales ───────────────────────────────────────────────────────
export const biens = pgTable('biens', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  titre: text('titre').notNull(),
  description: text('description').notNull(),
  prix: decimal('prix', { precision: 14, scale: 2 }).notNull(),
  type: text('type').notNull(),         // terrain, villa, appartement, bureau...
  transaction: text('transaction').notNull(), // vente, location
  statut: text('statut').default('disponible').notNull(), // disponible, reserve, vendu, loue

  // Organisation / Annonceur Pro
  organizationId: uuid('organization_id').references(() => organizations.id, { onDelete: 'set null' }),

  // Localisation
  ville: text('ville').notNull(),
  quartier: text('quartier'),
  adresse: text('adresse'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),

  // Caractéristiques
  surface: decimal('surface', { precision: 10, scale: 2 }), // en m²
  pieces: integer('pieces'),                                // Nombre de pièces
  chambres: integer('chambres'),
  sallesDeBain: integer('salles_de_bain'),
  etages: integer('etages'),
  anneeConstruction: integer('annee_construction'),
  chargesComprises: boolean('charges_comprises').default(false),
  parking: boolean('parking').default(false),
  piscine: boolean('piscine').default(false),
  jardin: boolean('jardin').default(false),
  meuble: boolean('meuble').default(false),
  gardiennage: boolean('gardiennage').default(false),

  // Médias
  mainImageUrl: text('main_image_url'),
  videoUrl: text('video_url'),
  pdfAnnexeUrl: text('pdf_annexe_url'),

  // Titres & Sécurisation Foncière
  preuveProprieteUrl: text('preuve_propriete_url'),         // Justificatif de propriété (ACD, CMP, Mandat)
  typeTitrePropriete: text('type_titre_propriete'),         // 'acd', 'cmp', 'arrete', 'mandat'

  // Méta
  vues: integer('vues').default(0).notNull(),
  agentId: uuid('agent_id'),           // FK vers profiles
  ownerId: uuid('owner_id').references(() => profiles.id, { onDelete: 'set null' }), // Propriétaire / Agence / Promoteur
  statutModeration: text('statut_moderation').default('valide').notNull(), // 'en_attente', 'valide', 'rejete'
  motifRejet: text('motif_rejet'),     // Motif si refus de validation
  featuredUntil: timestamp('featured_until'), // mise en avant jusqu'à

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

// Images additionnelles d'un bien
export const bienImages = pgTable('bien_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  bienId: uuid('bien_id').notNull(), // FK vers biens
  url: text('url').notNull(),
  caption: text('caption'),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Favoris des clients
export const favoris = pgTable('favoris', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull(), // FK vers profiles
  bienId: uuid('bien_id').notNull(),     // FK vers biens
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Réservations
export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  bienId: uuid('bien_id').notNull(),
  clientId: uuid('client_id').notNull(),
  statut: text('statut').default('en_attente').notNull(), // en_attente, confirme, expire, annule
  dateExpiration: timestamp('date_expiration').notNull(),
  notes: text('notes'),
  relancesCount: integer('relances_count').default(0).notNull(),
  
  // Suivi de Contrat & Signature Client (Promoteur Immobilier Agréé)
  contratScanneUrl: text('contrat_scanne_url'),
  contratGenereUrl: text('contrat_genere_url'),
  contratGenereNom: text('contrat_genere_nom'),
  contratStatut: text('contrat_statut').default('non_genere').notNull(), // non_genere, en_attente_generation, genere, transmis_client, signe_client, valide_agent, rejete_agent
  contratRejetRaison: text('contrat_rejet_raison'),
  signatureClientUrl: text('signature_client_url'),
  signedAt: timestamp('signed_at'),
  signatureToken: text('signature_token'),
  agrementNumero: text('agrement_numero'),
  notaireNom: text('notaire_nom'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

// Paiements
export const paiements = pgTable('paiements', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').notNull(),
  clientId: uuid('client_id').notNull(),
  montant: decimal('montant', { precision: 14, scale: 2 }).notNull(),
  devise: text('devise').default('XOF').notNull(),
  statut: text('statut').default('en_attente').notNull(), // en_attente, paye, rembourse, echoue
  typePaiement: text('type_paiement').default('acompte').notNull(), // acompte, partiel, total
  paystackReference: text('paystack_reference').unique(),
  paystackChannel: text('paystack_channel'), // mobile_money, card, bank_transfer
  factureNumero: text('facture_numero').unique(),
  factureUrl: text('facture_url'),
  paidAt: timestamp('paid_at'),

  // Facture Normalisée Électronique (FNE - DGI Côte d'Ivoire / Arrêté 0337)
  fneNumero: text('fne_numero').unique(), // ex: 2034567A260000000001
  fneType: text('fne_type').default('VENTE').notNull(), // VENTE, AVOIR, PROFORMA, BORDEREAU
  fneQrData: text('fne_qr_data'), // Données du QR Code de certification scannable
  fneSignature: text('fne_signature'), // Signature électronique de sécurisation
  fneStatut: text('fne_statut').default('non_certifie').notNull(), // non_certifie, certifie, annule
  fneCertifieLe: timestamp('fne_certifie_le', { withTimezone: true }),
  fneOriginalId: uuid('fne_original_id'), // Lien vers la facture originale si avoir

  // Suivi Reçus Multi-Tranches
  recuNumero: text('recu_numero'),
  recuUrl: text('recu_url'),
  cumulPaye: decimal('cumul_paye', { precision: 14, scale: 2 }),
  resteAPayer: decimal('reste_a_payer', { precision: 14, scale: 2 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

// Historique des relances
export const reservationRelances = pgTable('reservation_relances', {
  id: uuid('id').primaryKey().defaultRandom(),
  reservationId: uuid('reservation_id').notNull(),
  numeroRelance: integer('numero_relance').notNull(), // 1, 2 ou 3
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
  emailDestinateur: text('email_destinateur').notNull(),
})

// Abonnés à la newsletter
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  unsubscribedAt: timestamp('unsubscribed_at'),
})

// ─── Dossiers Clients & Tâches (F13) ──────────────────────────────────────────

export const dossiers = pgTable('dossiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => profiles.id, { onDelete: 'set null' }),
  bienId: uuid('bien_id').references(() => biens.id, { onDelete: 'set null' }),
  titre: text('titre').notNull(),
  description: text('description'),
  statut: text('statut').default('ouvert').notNull(), // 'ouvert', 'en_cours', 'bloque', 'clos'
  progression: integer('progression').default(0).notNull(), // 0 à 100
  priorite: text('priorite').default('normale').notNull(), // 'basse', 'normale', 'haute', 'urgente'
  deadline: timestamp('deadline'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

export const taches = pgTable('taches', {
  id: uuid('id').primaryKey().defaultRandom(),
  dossierId: uuid('dossier_id').notNull().references(() => dossiers.id, { onDelete: 'cascade' }),
  titre: text('titre').notNull(),
  description: text('description'),
  assigneeId: uuid('assignee_id').references(() => profiles.id, { onDelete: 'set null' }),
  statut: text('statut').default('a_faire').notNull(), // 'a_faire', 'en_cours', 'terminee', 'bloquee'
  priorite: text('priorite').default('normale').notNull(), // 'basse', 'normale', 'haute', 'urgente'
  deadline: timestamp('deadline'),
  bloqueCommentaire: text('bloque_commentaire'), // Commentaire obligatoire si statut = 'bloquee'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

export const visites = pgTable('visites', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => profiles.id, { onDelete: 'cascade' }),
  bienId: uuid('bien_id').notNull().references(() => biens.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => profiles.id, { onDelete: 'set null' }),
  dateVisite: timestamp('date_visite').notNull(),
  plageHoraire: text('plage_horaire').default('matin').notNull(), // 'matin' (09h-12h), 'apres_midi' (14h-18h)
  statut: text('statut').default('planifiee').notNull(), // 'planifiee', 'confirmee', 'effectuee', 'annulee', 'client_absent'
  commentaires: text('commentaires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

// Avis & Notation des Visites par le Client
export const visiteAvis = pgTable('visite_avis', {
  id: uuid('id').primaryKey().defaultRandom(),
  visiteId: uuid('visite_id').notNull().references(() => visites.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => profiles.id, { onDelete: 'set null' }),
  note: integer('note').notNull(), // 1 à 5 étoiles
  commentaire: text('commentaire'),
  isPublic: boolean('is_public').default(true).notNull(), // Publication automatique si note >= 4
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // 'reservation', 'paiement', 'visite', 'lead', 'system'
  link: text('link'),
  lu: boolean('lu').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

export const agentCalendriers = pgTable('agent_calendriers', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  icalUrl: text('ical_url').notNull(),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

export const agentIndisponibilites = pgTable('agent_indisponibilites', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  titre: text('titre').notNull(),
  dateDebut: timestamp('date_debut').notNull(),
  dateFin: timestamp('date_fin').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

export const homepageConfigs = pgTable('homepage_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  section: text('section').notNull().unique(), // 'hero', 'about', 'expertise', 'team', 'testimonials', 'faq', 'cta', 'footer'
  content: jsonb('content').notNull(),         // JSON configuration content
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),           // Soft Delete
})

export const cookieConsents = pgTable('cookie_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  consent: text('consent').notNull(), // 'accepted', 'declined'
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  subscription: jsonb('subscription').notNull(),
  preferences: jsonb('preferences').default({
    systemUpdates: true,
    newProperties: true,
    announcements: true,
    transactional: true
  }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => [
  index('idx_push_subscriptions_profile_id').on(table.profileId),
])

export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(), // 'promoter', 'finance', 'automations', 'security'
  value: jsonb('value').notNull(),    // JSON configuration content
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  visitorId: text('visitor_id').notNull(),
  sessionId: text('session_id').notNull(),
  eventType: text('event_type').notNull(), // 'page_view', 'onboarding_step', etc.
  path: text('path').notNull(),            // '/client/dashboard', '/onboarding/step-1', etc.
  details: jsonb('details').notNull(),     // { device: 'mobile', region: 'Lagunes', browser: 'Chrome' }
  duration: integer('duration').default(0).notNull(), // duration in seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_analytics_events_visitor_id').on(table.visitorId),
  index('idx_analytics_events_event_type').on(table.eventType),
  index('idx_analytics_events_path').on(table.path),
])

export const suggestions = pgTable('suggestions', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => profiles.id, { onDelete: 'cascade' }),
  categorie: text('categorie').notNull(),
  message: text('message').notNull(),
  statut: text('statut').default('recue').notNull(), // recue, en_cours, repondue
  reponse: text('reponse'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const bienConfies = pgTable('bien_confies', {
  id: uuid('id').primaryKey().defaultRandom(),
  clientId: uuid('client_id').references(() => profiles.id, { onDelete: 'cascade' }),
  typeService: text('type_service').notNull(), // lotissement, construction, gestion, vente
  ville: text('ville').notNull(),
  quartier: text('quartier'),
  surface: text('surface'),
  titreFoncier: boolean('titre_foncier').default(false).notNull(),
  budget: text('budget'),
  telephone: text('telephone').notNull(),
  statut: text('statut').default('nouveau').notNull(), // nouveau, contacte, clos
  createdAt: timestamp('created_at').defaultNow().notNull(),
})


export const contractTemplates = pgTable('contract_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  nom: text('nom').notNull(),
  description: text('description'),
  type: text('type').default('vente').notNull(),
  fichierUrl: text('fichier_url').notNull(),
  fichierNom: text('fichier_nom').notNull(),
  typeBien: text('type_bien').default('tous').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  variables: jsonb('variables'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ─── F19 : Journalisation & Audit de Sécurité ─────────────────────────────────
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id, { onDelete: 'set null' }),
  userEmail: text('user_email'),
  userRole: text('user_role'),
  action: text('action').notNull(), // ex: 'auth.login', 'auth.failed', 'bien.create', 'bien.moderate', 'access.denied'
  entity: text('entity'),           // ex: 'biens', 'profiles', 'reservations', 'paiements'
  entityId: text('entity_id'),      // ID de l'entité ciblée
  details: jsonb('details'),        // Méta / payload sécurisé
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_audit_logs_user_id').on(table.userId),
  index('idx_audit_logs_action').on(table.action),
  index('idx_audit_logs_created_at').on(table.createdAt),
])

// ─── Types d'acteurs de la marketplace ────────────────────────────────────────
export type UserRole =
  | 'visiteur'
  | 'client'
  | 'proprietaire'
  | 'agence'
  | 'moderateur'
  | 'support'
  | 'admin'
  | 'super_admin'
  // Rôles complémentaires / techniques conservés pour compatibilité :
  | 'tech_super_admin'
  | 'agent'
  | 'promoteur'
  | 'suspended'

export type BienStatutModeration = 'en_attente' | 'valide' | 'rejete'
// ─── Séquences Annuelles FNE (Art. 5 Arrêté 0337) ─────────────────────────────
export const fneSequences = pgTable('fne_sequences', {
  id: uuid('id').primaryKey().defaultRandom(),
  annee: integer('annee').notNull(),
  type: text('type').default('VENTE').notNull(), // VENTE, AVOIR, PROFORMA, BORDEREAU
  derniereSequence: integer('derniere_sequence').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── Recherches Sauvegardées & Alertes Marketplace ───────────────────────────
export const recherchesAlertes = pgTable('recherches_alertes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  titre: text('titre').notNull(),
  criteres: jsonb('criteres').notNull(), // { commune, type, prix_max, pieces, transaction... }
  frequence: text('frequence').default('quotidien').notNull(), // 'immediat', 'quotidien', 'hebdomadaire'
  isActive: boolean('is_active').default(true).notNull(),
  lastNotifiedAt: timestamp('last_notified_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_recherches_alertes_user').on(table.userId),
])

// ─── Dossiers Candidats Locataires & Acquéreurs ──────────────────────────────
export const dossiersCandidats = pgTable('dossiers_candidats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  statut: text('statut').default('brouillon').notNull(), // 'brouillon', 'soumis', 'valide', 'rejete'
  typeProjet: text('type_projet').default('location').notNull(), // 'location', 'achat'
  profession: text('profession'),
  employeur: text('employeur'),
  revenuMensuel: decimal('revenu_mensuel', { precision: 14, scale: 2 }),
  fichiers: jsonb('fichiers').notNull(), // { cni_url, bulletins_salaire_urls, attestation_travail_url }
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_dossiers_candidats_user').on(table.userId),
])

// ─── Signalements d'Annonces & Modération ─────────────────────────────────────
export const signalements = pgTable('signalements', {
  id: uuid('id').primaryKey().defaultRandom(),
  bienId: uuid('bien_id').notNull().references(() => biens.id, { onDelete: 'cascade' }),
  auteurId: uuid('auteur_id').references(() => profiles.id, { onDelete: 'set null' }),
  motif: text('motif').notNull(), // 'faux_prix', 'demarcheur_arnaque', 'bien_deja_vendu', 'photos_trompeuses', 'autre'
  description: text('description'),
  statut: text('statut').default('nouveau').notNull(), // 'nouveau', 'en_cours', 'traite', 'rejete'
  traitePar: uuid('traite_par').references(() => profiles.id, { onDelete: 'set null' }),
  decisionCommentaire: text('decision_commentaire'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_signalements_bien').on(table.bienId),
  index('idx_signalements_statut').on(table.statut),
])
