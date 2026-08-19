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



// ─── RBAC (Roles & Permissions) ────────────────────────────────────────────────
export const roles = pgTable('roles', {
  name: text('name').primaryKey(), // 'admin', 'client', 'agent'
  description: text('description'),
})

export const permissions = pgTable('permissions', {
  code: text('code').primaryKey(), // 'manage:biens', 'view:users', etc.
  description: text('description'),
})

export const rolePermissions = pgTable('role_permissions', {
  roleName: text('role_name').notNull().references(() => roles.name, { onDelete: 'cascade' }),
  permissionCode: text('permission_code').notNull().references(() => permissions.code, { onDelete: 'cascade' }),
})

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

  // Localisation
  ville: text('ville').notNull(),
  quartier: text('quartier'),
  adresse: text('adresse'),
  latitude: decimal('latitude', { precision: 10, scale: 7 }),
  longitude: decimal('longitude', { precision: 10, scale: 7 }),

  // Caractéristiques
  surface: decimal('surface', { precision: 10, scale: 2 }), // en m²
  chambres: integer('chambres'),
  sallesDeBain: integer('salles_de_bain'),
  etages: integer('etages'),
  parking: boolean('parking').default(false),
  piscine: boolean('piscine').default(false),
  jardin: boolean('jardin').default(false),
  meuble: boolean('meuble').default(false),
  gardiennage: boolean('gardiennage').default(false),

  // Médias
  mainImageUrl: text('main_image_url'),
  videoUrl: text('video_url'),
  pdfAnnexeUrl: text('pdf_annexe_url'),

  // Méta
  vues: integer('vues').default(0).notNull(),
  agentId: uuid('agent_id'),           // FK vers profiles
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

// Leads / Prospects du CRM (F11)
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  nom: text('nom'),
  prenom: text('prenom'),
  email: text('email'),
  telephone: text('telephone').notNull(),
  source: text('source').default('site_web').notNull(), // site_web, whatsapp, appel, reseaux_sociaux, referral
  statut: text('statut').default('nouveau').notNull(), // nouveau, contacte, qualifie, converti, perdu
  etape: text('etape').default('prospect').notNull(), // prospect, qualifie, visite_planifiee, visite_effectuee, negociation, offre_acceptee, contrat_signe, vente_finalisee
  score: integer('score').default(0).notNull(), // 0 à 100
  bienInteresse: uuid('bien_interesse').references(() => biens.id, { onDelete: 'set null' }),
  agentId: uuid('agent_id').references(() => profiles.id, { onDelete: 'set null' }),
  visiteConfirmee: boolean('visite_confirmee').default(false).notNull(),
  offreValidee: boolean('offre_validee').default(false).notNull(),
  engagementSigne: boolean('engagement_signe').default(false).notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
})

// Historique des interactions des Leads (F11)
export const leadInteractions = pgTable('lead_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => profiles.id, { onDelete: 'set null' }),
  type: text('type').notNull(), // 'appel', 'email', 'whatsapp', 'note'
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // Soft Delete
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
  leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
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

// ─── Modèles de Contrats Word (.docx) ─────────────────────────────────────────
export const contractTemplates = pgTable('contract_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  nom: text('nom').notNull(),
  description: text('description'),
  typeBien: text('type_bien').default('foncier').notNull(), // foncier, villa, appartement, general
  fichierUrl: text('fichier_url').notNull(),
  fichierNom: text('fichier_nom').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})







