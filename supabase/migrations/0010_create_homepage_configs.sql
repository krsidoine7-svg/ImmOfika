-- Migration: 0010_create_homepage_configs.sql
-- Create table homepage_configs for dynamic home page settings

CREATE TABLE IF NOT EXISTS homepage_configs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section     TEXT UNIQUE NOT NULL, -- 'hero', 'about', 'expertise', 'team', 'testimonials', 'faq', 'cta', 'footer'
  content     JSONB NOT NULL,       -- JSON containing title, subtitle, descriptions, image URLs, visibility, visual themes, lists, etc.
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deleted_at  TIMESTAMPTZ           -- Soft Delete column (project mandate)
);

-- Index on section for rapid lookups
CREATE INDEX IF NOT EXISTS idx_homepage_configs_section ON homepage_configs(section);

-- Enable Row Level Security (RLS)
ALTER TABLE homepage_configs ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Accessible to everyone (anonymous or authenticated)
DROP POLICY IF EXISTS "Allow public read access to homepage configs" ON homepage_configs;
CREATE POLICY "Allow public read access to homepage configs" 
ON homepage_configs FOR SELECT 
USING (deleted_at IS NULL);

-- 2. Write/Manage Policy: Restricted to admin, super_admin, admin_manager, tech_super_admin
DROP POLICY IF EXISTS "Allow admin write access to homepage configs" ON homepage_configs;
CREATE POLICY "Allow admin write access to homepage configs" 
ON homepage_configs FOR ALL
TO authenticated
USING (
  deleted_at IS NULL AND 
  (auth.jwt() ->> 'role' IN ('super_admin', 'admin_manager', 'admin', 'tech_super_admin') 
   OR EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() 
     AND profiles.role IN ('super_admin', 'admin_manager', 'admin', 'tech_super_admin')
   ))
)
WITH CHECK (
  deleted_at IS NULL AND 
  (auth.jwt() ->> 'role' IN ('super_admin', 'admin_manager', 'admin', 'tech_super_admin') 
   OR EXISTS (
     SELECT 1 FROM profiles 
     WHERE profiles.id = auth.uid() 
     AND profiles.role IN ('super_admin', 'admin_manager', 'admin', 'tech_super_admin')
   ))
);

-- 3. Register the new permission and grant it to the admin role
INSERT INTO permissions (code, description) VALUES
  ('manage:config', 'Gérer la configuration de la page d''accueil et du site')
ON CONFLICT (code) DO NOTHING;

INSERT INTO role_permissions (role_name, permission_code) VALUES
  ('admin', 'manage:config')
ON CONFLICT DO NOTHING;

