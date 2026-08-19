# DB_SCHEMA.md — Schéma de Base de Données
## Favor Company International

> **Base :** PostgreSQL (via Supabase)  
> **ORM :** Drizzle ORM  
> **Sécurité :** Row Level Security (RLS) activé sur toutes les tables

---

## 0. Principes de Conception

- **Soft Delete** : Toutes les tables critiques utilisent une colonne `deleted_at: TIMESTAMPTZ`. Aucune suppression physique (`DELETE`) ne doit être effectuée. Les requêtes doivent filtrer `WHERE deleted_at IS NULL`.
- **Audit** : Chaque table inclut `created_at` et `updated_at`.
- **Sécurité** : Chiffrement AES-256-GCM pour les données sensibles (marquées dans le schéma).
- **Intégrité** : Clés étrangères avec `ON DELETE RESTRICT` par défaut pour forcer la gestion via la Radiographie d'Impact.

---

## 1. Utilisateurs & Authentification

```sql
-- Utilisateurs (étend auth.users de Supabase)
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom             TEXT NOT NULL,
  prenom          TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  telephone       TEXT,                    -- Chiffré AES-256
  telephone_whatsapp TEXT,                 -- Chiffré AES-256
  avatar_url      TEXT,
  cni_number      TEXT,                    -- Chiffré AES-256
  adresse         TEXT,
  ville           TEXT,
  pays            TEXT DEFAULT 'CI',
  statut          TEXT DEFAULT 'actif',    -- actif, suspendu, supprimé
  email_verified  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Rôles
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL,        -- super_admin, admin_manager, admin, admin_agent, admin_rh, tech_super_admin, client, partenaire
  label       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Permissions granulaires
CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,        -- ex: biens.modifier, paiements.voir, users.supprimer
  label       TEXT NOT NULL,
  section     TEXT NOT NULL,              -- dashboard, biens, clients, paiements, contrats, etc.
  action      TEXT NOT NULL,              -- voir, modifier, supprimer, exporter, etc.
  description TEXT
);

-- Association Utilisateur ↔ Rôle
CREATE TABLE user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Permissions spécifiques par rôle (granulaires)
CREATE TABLE role_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted       BOOLEAN DEFAULT TRUE,
  UNIQUE(role_id, permission_id)
);

-- Permissions spécifiques par utilisateur (override du rôle)
CREATE TABLE user_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted       BOOLEAN DEFAULT TRUE,
  assigned_by   UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, permission_id)
);
```

---

## 2. Biens Immobiliers

```sql
-- Biens
CREATE TABLE biens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  nom             TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL,  -- terrain, maison, appartement, lotissement
  prix            NUMERIC(15,2) NOT NULL,
  surface         NUMERIC(10,2), -- en m²
  statut          TEXT DEFAULT 'disponible', -- disponible, réservé, vendu, archivé
  localisation    TEXT,
  ville           TEXT,
  quartier        TEXT,
  latitude        NUMERIC(10,8),
  longitude       NUMERIC(11,8),
  nb_vues         INTEGER DEFAULT 0,
  note_moyenne    NUMERIC(3,2) DEFAULT 0,
  nb_avis         INTEGER DEFAULT 0,
  featured        BOOLEAN DEFAULT FALSE,
  meta_titre      TEXT,
  meta_description TEXT,
  mots_cles       TEXT[],
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Images des biens
CREATE TABLE bien_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id     UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  ordre       INTEGER DEFAULT 0,
  type        TEXT DEFAULT 'image', -- image, video
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Documents annexes des biens
CREATE TABLE bien_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id     UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
  nom         TEXT NOT NULL,
  url         TEXT NOT NULL,
  type        TEXT,  -- pdf, word, etc.
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Avis sur les biens
CREATE TABLE avis (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id     UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note        INTEGER CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  statut      TEXT DEFAULT 'en_attente', -- en_attente, approuvé, rejeté
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Favoris
CREATE TABLE favoris (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bien_id     UUID NOT NULL REFERENCES biens(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bien_id)
);

-- Recherches sauvegardées
CREATE TABLE recherches_sauvegardees (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nom         TEXT,
  criteres    JSONB NOT NULL,  -- {type, prix_min, prix_max, ville, zone, surface_min}
  alerte_email BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Réservations & Visites

```sql
-- Réservations de biens
CREATE TABLE reservations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id             UUID NOT NULL REFERENCES biens(id),
  client_id           UUID NOT NULL REFERENCES users(id),
  agent_id            UUID REFERENCES users(id),
  statut              TEXT DEFAULT 'en_attente',
  -- en_attente, confirmée, annulée, expirée, finalisée
  montant_acompte     NUMERIC(15,2),
  date_reservation    TIMESTAMPTZ DEFAULT NOW(),
  date_expiration     TIMESTAMPTZ,  -- +3 mois par défaut
  nb_relances         INTEGER DEFAULT 0,
  derniere_relance    TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Visites
CREATE TABLE visites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bien_id         UUID NOT NULL REFERENCES biens(id),
  client_id       UUID NOT NULL REFERENCES users(id),
  agent_id        UUID REFERENCES users(id),
  date_visite     TIMESTAMPTZ NOT NULL,
  statut          TEXT DEFAULT 'planifiée',
  -- planifiée, confirmée, effectuée, annulée
  type_visite     TEXT DEFAULT 'physique',  -- physique, virtuelle
  est_payante     BOOLEAN DEFAULT FALSE,
  montant         NUMERIC(15,2),
  notes_agent     TEXT,
  notes_client    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Paiements & Facturation

```sql
-- Paiements
CREATE TABLE paiements (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference           TEXT UNIQUE NOT NULL,    -- Référence Paystack
  client_id           UUID NOT NULL REFERENCES users(id),
  bien_id             UUID REFERENCES biens(id),
  reservation_id      UUID REFERENCES reservations(id),
  contrat_id          UUID,                    -- FK vers contrats
  montant             NUMERIC(15,2) NOT NULL,
  montant_total       NUMERIC(15,2),           -- Total du bien
  devise              TEXT DEFAULT 'XOF',
  statut              TEXT DEFAULT 'en_attente',
  -- en_attente, succès, échoué, remboursé
  methode             TEXT,  -- card, mobile_money, orange_money, mtn_momo, wave
  paystack_reference  TEXT,
  paystack_response   JSONB,
  type_paiement       TEXT, -- acompte, partiel, total, remboursement
  echeance            TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Factures
CREATE TABLE factures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero          TEXT UNIQUE NOT NULL,  -- Format: FC-2026-0001
  client_id       UUID NOT NULL REFERENCES users(id),
  bien_id         UUID REFERENCES biens(id),
  paiement_id     UUID REFERENCES paiements(id),
  montant_ht      NUMERIC(15,2),
  taux_tva        NUMERIC(5,2) DEFAULT 0,
  montant_tva     NUMERIC(15,2) DEFAULT 0,
  montant_ttc     NUMERIC(15,2) NOT NULL,
  statut          TEXT DEFAULT 'émise',  -- émise, payée, annulée
  date_emission   TIMESTAMPTZ DEFAULT NOW(),
  date_echeance   TIMESTAMPTZ,
  url_pdf         TEXT,
  numero_fne      TEXT,  -- Numéro FNE ivoirien
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Échelonnement des paiements
CREATE TABLE echeancier (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES users(id),
  bien_id         UUID NOT NULL REFERENCES biens(id),
  montant_total   NUMERIC(15,2) NOT NULL,
  montant_paye    NUMERIC(15,2) DEFAULT 0,
  nb_echeances    INTEGER,
  echeances       JSONB,  -- [{montant, date_echeance, statut, paiement_id}]
  statut          TEXT DEFAULT 'en_cours',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. CRM & Leads

```sql
-- Leads / Prospects
CREATE TABLE leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom             TEXT,
  prenom          TEXT,
  email           TEXT,
  telephone       TEXT,  -- Chiffré
  source          TEXT,  -- site_web, whatsapp, appel, réseaux_sociaux, etc.
  bien_interesse  UUID REFERENCES biens(id),
  statut          TEXT DEFAULT 'nouveau',
  -- nouveau, contacté, qualifié, converti, perdu
  score           INTEGER DEFAULT 0,
  agent_id        UUID REFERENCES users(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Pipeline de vente (8 étapes)
CREATE TABLE pipeline_etapes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  nom         TEXT NOT NULL,
  ordre       INTEGER NOT NULL,
  couleur     TEXT
);

-- Positions dans le pipeline
CREATE TABLE pipeline_positions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID REFERENCES leads(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES users(id),
  etape_id    UUID NOT NULL REFERENCES pipeline_etapes(id),
  agent_id    UUID REFERENCES users(id),
  notes       TEXT,
  date_entree TIMESTAMPTZ DEFAULT NOW(),
  date_sortie TIMESTAMPTZ
);

-- Dossiers clients
CREATE TABLE dossiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES users(id),
  agent_id    UUID REFERENCES users(id),
  bien_id     UUID REFERENCES biens(id),
  titre       TEXT NOT NULL,
  description TEXT,
  statut      TEXT DEFAULT 'ouvert',  -- ouvert, en_cours, bloqué, clos
  progression INTEGER DEFAULT 0,     -- 0 à 100
  priorite    TEXT DEFAULT 'normale', -- basse, normale, haute, urgente
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tâches des dossiers
CREATE TABLE taches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id  UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  titre       TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES users(id),
  statut      TEXT DEFAULT 'à_faire', -- à_faire, en_cours, terminée, bloquée
  priorite    TEXT DEFAULT 'normale',
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Historique des interactions
CREATE TABLE interactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES users(id),
  agent_id    UUID REFERENCES users(id),
  type        TEXT, -- appel, email, whatsapp, visite, réunion
  notes       TEXT,
  resultat    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Contrats & Documents

```sql
-- Contrats
CREATE TABLE contrats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero          TEXT UNIQUE NOT NULL,
  type            TEXT NOT NULL,  -- vente, reservation, location
  client_id       UUID NOT NULL REFERENCES users(id),
  bien_id         UUID NOT NULL REFERENCES biens(id),
  agent_id        UUID REFERENCES users(id),
  contenu_md      TEXT,           -- Contenu en Markdown
  contenu_hash    TEXT,           -- SHA-256 pour vérification intégrité
  statut          TEXT DEFAULT 'brouillon',
  -- brouillon, envoyé, signé, annulé
  url_pdf         TEXT,
  url_docx        TEXT,
  date_envoi      TIMESTAMPTZ,
  date_signature  TIMESTAMPTZ,
  signature_client TEXT,          -- Hash de signature client
  signature_agent  TEXT,          -- Hash de signature agent
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Documents stockés
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom         TEXT NOT NULL,
  type        TEXT,  -- contrat, facture, identité, titre_foncier, acd, autre
  url         TEXT NOT NULL,
  user_id     UUID REFERENCES users(id),
  bien_id     UUID REFERENCES biens(id),
  contrat_id  UUID REFERENCES contrats(id),
  taille      INTEGER,  -- en bytes
  hash        TEXT,    -- Intégrité du fichier
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Formulaires personnalisés
CREATE TABLE formulaires (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre       TEXT NOT NULL,
  description TEXT,
  champs      JSONB NOT NULL,  -- [{id, type, label, requis, options}]
  created_by  UUID REFERENCES users(id),
  statut      TEXT DEFAULT 'actif',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Réponses aux formulaires
CREATE TABLE formulaire_reponses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulaire_id   UUID NOT NULL REFERENCES formulaires(id),
  respondant_id   UUID REFERENCES users(id),
  reponses        JSONB NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. Notifications

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titre       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT,  -- paiement, reservation, contrat, alerte, info
  lu          BOOLEAN DEFAULT FALSE,
  lien        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Partenaires

```sql
CREATE TABLE partenaires (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id),
  nom_agence      TEXT NOT NULL,
  siret           TEXT,
  adresse         TEXT,
  telephone       TEXT,  -- Chiffré
  commission_pct  NUMERIC(5,2) DEFAULT 0,
  statut          TEXT DEFAULT 'actif',
  date_expiration TIMESTAMPTZ,    -- Compte temporaire configurable
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Indexes Critiques

```sql
-- Performance recherche biens
CREATE INDEX idx_biens_statut ON biens(statut);
CREATE INDEX idx_biens_type ON biens(type);
CREATE INDEX idx_biens_ville ON biens(ville);
CREATE INDEX idx_biens_prix ON biens(prix);
CREATE INDEX idx_biens_slug ON biens(slug);
CREATE INDEX idx_biens_created_at ON biens(created_at DESC);

-- Performance réservations
CREATE INDEX idx_reservations_bien_id ON reservations(bien_id);
CREATE INDEX idx_reservations_client_id ON reservations(client_id);
CREATE INDEX idx_reservations_statut ON reservations(statut);
CREATE INDEX idx_reservations_expiration ON reservations(date_expiration);

-- Performance paiements
CREATE INDEX idx_paiements_client_id ON paiements(client_id);
CREATE INDEX idx_paiements_reference ON paiements(reference);
CREATE INDEX idx_paiements_echeance ON paiements(echeance);
CREATE INDEX idx_paiements_paystack_ref ON paiements(paystack_reference);
CREATE INDEX idx_paiements_statut ON paiements(statut);
CREATE INDEX idx_paiements_reservation_id ON paiements(reservation_id);

-- Performance favoris
CREATE INDEX idx_favoris_client_id ON favoris(client_id);
CREATE INDEX idx_favoris_bien_id ON favoris(bien_id);

-- Leads et pipeline
CREATE INDEX idx_leads_agent_id ON leads(agent_id);
CREATE INDEX idx_leads_statut ON leads(statut);
CREATE INDEX idx_pipeline_positions_lead ON pipeline_positions(lead_id);
```

---

## 10. Données de Référence (Seed)

### Rôles initiaux
```sql
INSERT INTO roles (name, label) VALUES
  ('super_admin', 'Super Administrateur'),
  ('admin_manager', 'Admin Manager'),
  ('admin', 'Administrateur Fonctionnel'),
  ('admin_agent', 'Agent de Suivi'),
  ('admin_rh', 'Administrateur RH'),
  ('tech_super_admin', 'Administrateur Technique'),
  ('client', 'Client'),
  ('partenaire', 'Partenaire');
```

### Étapes du pipeline
```sql
INSERT INTO pipeline_etapes (code, nom, ordre, couleur) VALUES
  ('prospect', 'Prospect', 1, '#6B7280'),
  ('qualifie', 'Lead Qualifié', 2, '#3B82F6'),
  ('visite_planifiee', 'Visite Planifiée', 3, '#8B5CF6'),
  ('visite_effectuee', 'Visite Effectuée', 4, '#EC4899'),
  ('negociation', 'Négociation', 5, '#F59E0B'),
  ('offre_acceptee', 'Offre Acceptée', 6, '#10B981'),
  ('contrat_signe', 'Contrat Signé', 7, '#059669'),
  ('vente_finalisee', 'Vente Finalisée', 8, '#065F46');
```
