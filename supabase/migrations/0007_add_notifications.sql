-- Custom SQL migration file, put your code below! --
CREATE TABLE IF NOT EXISTS "public"."notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "type" text NOT NULL, -- 'reservation', 'paiement', 'visite', 'lead', 'system'
  "link" text,
  "lu" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "deleted_at" timestamp
);

-- Index pour accélérer les recherches de notifications par utilisateur
CREATE INDEX IF NOT EXISTS "notifications_user_idx" ON "public"."notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "public"."notifications" ("created_at" DESC);

-- RLS (Row Level Security) sur la table notifications
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : les utilisateurs ne peuvent voir que leurs propres notifications
CREATE POLICY "Les utilisateurs voient leurs propres notifications"
  ON "public"."notifications"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs modifient leurs propres notifications"
  ON "public"."notifications"
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Activer Supabase Realtime pour la table notifications
ALTER PUBLICATION supabase_realtime ADD TABLE "public"."notifications";
