-- Migration: Add soft delete to agent_calendriers --
ALTER TABLE "public"."agent_calendriers" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
