# MCP_IMMOFIKA.md — Model Context Protocol pour ImmOfika
## ImmOfika International

> **MCP (Model Context Protocol) :** Protocole standardisé qui permet à l'IA d'accéder aux données et outils externes en temps réel pendant le développement.  
> **Usage :** Connecter l'assistant IA à la base de données Supabase / PostgreSQL, aux fichiers locaux du projet et à GitHub.

---

## 1. Vue d'Ensemble de l'Architecture MCP

```
                     [ ASSISTANT IA (ANTIGRAVITY) ]
                                   │
                                   ▼
                    [ Protocole MCP (.agents/mcp_config.json) ]
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  MCP Filesystem  │      │   MCP Supabase   │      │    MCP GitHub    │
│ (Lecture / Écrit)│      │  (DB PostgreSQL) │      │ (Commits & PRs)  │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

---

## 2. Configuration du Fichier `.agents/mcp_config.json`

Le fichier de configuration MCP de l'espace de travail s'appuie sur la structure suivante :

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "{{SUPABASE_ACCESS_TOKEN}}"
      }
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "${DATABASE_URL}"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "{{GITHUB_PERSONAL_ACCESS_TOKEN}}"
      }
    }
  }
}
```

---

## 3. Prompts MCP Optimisés pour ImmOfika

### A. Analyse & Résolution de Bugs
```
[Avec MCP Filesystem]

J'ai une erreur sur la soumission du générateur de formulaires Tally.
Lis le fichier src/components/formulaires/FormRenderer.tsx
et le fichier src/app/api/formulaires/submit/route.ts.
Identifie le problème et propose la correction sans régression.
```

### B. Exploration de la Base de Données
```
[Avec MCP Supabase / Postgres]

Consulte le schéma des tables 'biens', 'formulaires' et 'formulaire_reponses'.
Compte le nombre de réponses enregistrées pour le formulaire actif
et génère une requête de statistiques d'utilisation.
```

### C. Audit de Sécurité & Conformité
```
[Avec MCP Filesystem + Supabase]

Lis src/lib/db/schema.ts et vérifie que toutes les tables sensibles
(biens, formulaires, formulaire_reponses) disposent des règles Row Level Security (RLS).
```

---

## 4. Règles de Sécurité MCP
1. **Séparation des clés** : Utiliser des placeholders ou des variables d'environnement (`.env.local`) pour éviter tout commit de clés secrètes sur GitHub.
2. **Droits d'accès** : Accès en lecture seule sur les tables de production en phase de développement.
3. **Journalisation** : Tracer toutes les interactions importantes dans `memoire-favor/fourtour/`.

---

*MCP_IMMOFIKA.md v1.0 — ImmOfika International — Août 2026*
