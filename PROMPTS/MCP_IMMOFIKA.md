# MCP_IMMOFIKA.md — Model Context Protocol
## ImmOfika International

> **MCP :** Protocole qui permet à l'IA d'accéder à des outils et sources de données externes en temps réel  
> **Usage :** Connecter l'IA à la base de données, aux fichiers du projet, et aux APIs tierces pendant le développement

---

## 1. Qu'est-ce que MCP ?

MCP (Model Context Protocol) est un standard ouvert qui permet à un assistant IA de :
- Lire et écrire des fichiers locaux
- Interroger des bases de données
- Appeler des APIs
- Utiliser des outils de développement

En pratique pour ImmOfika : l'IA peut lire ton code, ta DB Supabase, tes fichiers de config, et t'aider de façon beaucoup plus précise et contextualisée.

---

## 2. Serveurs MCP Recommandés pour ce Projet

### MCP Filesystem (Fichiers locaux)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/chemin/vers/immofika"
      ]
    }
  }
}
```
**Usage :** L'IA peut lire et modifier tes fichiers directement. Elle peut analyser ton code, trouver des bugs, et mettre à jour les fichiers.

### MCP Supabase
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```
**Usage :** L'IA peut interroger ta base de données Supabase, voir les tables, les données, et t'aider à écrire des queries.

### MCP GitHub
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxx"
      }
    }
  }
}
```
**Usage :** L'IA peut lire les issues GitHub, les PRs, et t'aider à gérer ton projet.

### MCP PostgreSQL Direct
```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:password@host:5432/immofika_db"
      ]
    }
  }
}
```
**Usage :** L'IA peut écrire et exécuter des queries SQL directement sur ta DB.

---

## 3. Configuration Claude Desktop

Fichier de configuration : `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac)

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/ton-nom/projets/immofika"
      ]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_xxxxxxxxxxxxxxxxxxxx"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxx"
      }
    }
  }
}
```

---

## 4. Prompts MCP Optimisés pour ImmOfika

### Analyser un bug avec accès aux fichiers
```
[Avec MCP Filesystem activé]

J'ai une erreur sur la page de réservation.
Lis le fichier src/app/(public)/biens/[slug]/page.tsx
et le fichier src/app/actions/reservations.ts.
Trouve pourquoi la réservation ne fonctionne pas
et propose un fix.
```

### Explorer la DB Supabase
```
[Avec MCP Supabase activé]

Montre-moi le contenu de la table 'biens'
et dis-moi combien de biens ont le statut 'disponible'.
```

### Créer une migration depuis le contexte
```
[Avec MCP Filesystem + Supabase]

Lis mon fichier src/lib/db/schema.ts.
Compare le schéma avec la structure actuelle de la DB.
Génère la migration Drizzle pour synchroniser les deux.
```

### Review de code avec contexte complet
```
[Avec MCP Filesystem]

Lis les fichiers suivants :
- src/app/api/webhooks/paystack/route.ts
- src/lib/paystack/client.ts
- SECURITY.md

Fais une review de sécurité complète du webhook Paystack
et vérifie qu'on respecte toutes les bonnes pratiques
listées dans SECURITY.md.
```

---

## 5. Architecture MCP ImmOfika (Futur)

Pour une utilisation avancée en production, voici comment MCP pourrait s'intégrer dans la plateforme :

```
Client (Browser)
     │
     ▼
Next.js API Route (/api/ai/chat)
     │
     ▼
MCP Client (dans le serveur)
     │
     ├──▶ MCP Supabase Server → DB ImmOfika
     │         └── Liste des biens disponibles
     │         └── Statuts des réservations
     │         └── Historique client
     │
     ├──▶ MCP Cloudflare Server → Documents
     │         └── Contrats PDF
     │         └── Images des biens
     │
     └──▶ LLM (Claude/GPT-4o) + Contexte assemblé
               └── Réponse au client
```

### Exemple — Chatbot avec MCP (production)
```typescript
// src/app/api/ai/chat/route.ts
import { MCPClient } from '@modelcontextprotocol/sdk/client'

export async function POST(request: Request) {
  const { message, userId } = await request.json()

  // 1. MCP récupère les données pertinentes depuis Supabase
  const mcpClient = new MCPClient(/* config */)
  
  const biensDisponibles = await mcpClient.callTool('supabase', {
    query: "SELECT nom, prix, ville, type FROM biens WHERE statut = 'disponible' LIMIT 10"
  })

  const historiqueClient = await mcpClient.callTool('supabase', {
    query: `SELECT * FROM reservations WHERE client_id = '${userId}' ORDER BY created_at DESC LIMIT 5`
  })

  // 2. Assembler le contexte
  const contexte = `
Biens disponibles :
${JSON.stringify(biensDisponibles, null, 2)}

Historique du client :
${JSON.stringify(historiqueClient, null, 2)}
  `

  // 3. Appeler le LLM avec le contexte
  const response = await callLLM(message, contexte)

  return Response.json({ response })
}
```

---

## 6. Sécurité MCP

### Règles absolues
- **JAMAIS** exposer les tokens MCP côté client
- **JAMAIS** donner accès en écriture à la DB de production via MCP pendant le développement
- **TOUJOURS** utiliser un token Supabase avec les permissions minimales requises
- Créer un token MCP dédié (pas celui utilisé dans l'app)

### Permissions recommandées pour le token MCP dev
```sql
-- Token MCP : lecture seule sur les tables non-sensibles
GRANT SELECT ON biens TO mcp_dev_user;
GRANT SELECT ON visites TO mcp_dev_user;
-- Pas d'accès aux tables users, paiements, contrats en développement
```

---

## 7. Ressources

- Documentation officielle MCP : https://modelcontextprotocol.io
- Serveurs MCP disponibles : https://github.com/modelcontextprotocol/servers
- MCP Supabase : https://supabase.com/docs/guides/getting-started/mcp
- Claude + MCP : https://docs.anthropic.com/en/docs/build-with-claude/mcp
- Créer un serveur MCP custom : https://learn.microsoft.com/fr-fr/microsoft-copilot-studio/mcp-create-new-server

---

*MCP_IMMOFIKA.md v1.0 — Mai 2026*
