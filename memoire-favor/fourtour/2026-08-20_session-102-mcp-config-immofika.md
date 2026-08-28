# Session 102 — Configuration MCP (Model Context Protocol) Étape par Étape

**Date :** 20 Août 2026

## 🎯 Objectif
Mettre en place la configuration des serveurs **MCP (Model Context Protocol)** pour la plateforme **ImmOfika**, permettant à l'IA d'interagir directement et en toute sécurité avec la base de données Supabase / PostgreSQL, le système de fichiers du projet, et le dépôt GitHub.

## 🛠️ Actions Réalisées
1. **Fichier de Configuration `.agents/mcp_config.json`** :
   - Déclaration des 4 serveurs MCP :
     - `supabase` (`@supabase/mcp-server-supabase`)
     - `postgres` (`@modelcontextprotocol/server-postgres`)
     - `filesystem` (`@modelcontextprotocol/server-filesystem`)
     - `github` (`@modelcontextprotocol/server-github`)
   - Référencement sécurisé des variables d'environnement (`DATABASE_URL`, `SUPABASE_ACCESS_TOKEN`).
2. **Documentation & Prompts** :
   - Rédaction du guide [`PROMPTS/MCP_IMMOFIKA.md`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOPRO/PROMPTS/MCP_IMMOFIKA.md).
3. **Sécurité & Masquage** :
   - Masquage des identifiants sensibles via des placeholders `{{...}}`.
