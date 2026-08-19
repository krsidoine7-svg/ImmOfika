# Patterns Base de Données — Favor Company International

## 1. Soft Delete

Toutes les tables critiques (biens, clients, agents, paiements, factures) doivent implémenter le Soft Delete.

### Schéma Drizzle
```typescript
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ... autres colonnes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // Soft Delete
});
```

### Requête standard
```typescript
const activeAgents = await db
  .select()
  .from(agents)
  .where(isNull(agents.deletedAt));
```

### Suppression (Action)
```typescript
export async function deleteAgent(id: string) {
  // 1. Faire la Radiographie d'Impact
  // 2. Si OK, faire le Soft Delete
  await db
    .update(agents)
    .set({ deletedAt: new Date() })
    .where(eq(agents.id, id));
}
```

---

## 2. Sécurité RLS (Supabase)

Le Soft Delete doit être intégré aux politiques RLS pour que les données "supprimées" ne soient jamais renvoyées par l'API cliente.

```sql
CREATE POLICY "Les agents voient uniquement les clients non supprimés"
ON clients
FOR SELECT
USING (deleted_at IS NULL);
```

---

## 3. Chiffrement (AES-256-GCM)

Les données sensibles (téléphone, CNI, numéros de compte) doivent être chiffrées avant insertion.

```typescript
import { encrypt, decrypt } from "@/lib/security";

// Insertion
const encryptedPhone = encrypt(rawPhone);
// ...
```

---

## 4. Indexation Physique & Performance

Pour garantir des performances de classe mondiale (réduction de latence de plus de 95% lors des requêtes complexes et jointures), toute table PostgreSQL du projet doit avoir des index physiques explicites sur ses colonnes de recherche et clés étrangères :

- **Clés étrangères** : `client_id`, `bien_id`, `reservation_id` doivent impérativement être indexées.
- **Identifiants uniques de recherche** : Le `slug` de la table `biens` ou la `reference` / `paystack_reference` dans `paiements`.
- **Statuts filtrés et tris** : Le `statut` (biens, réservations, paiements) et `created_at` (tri DESC).

### Exemple de script d'indexation
```sql
CREATE INDEX IF NOT EXISTS idx_biens_slug ON biens(slug);
CREATE INDEX IF NOT EXISTS idx_reservations_client_id ON reservations(client_id);
CREATE INDEX IF NOT EXISTS idx_paiements_paystack_ref ON paiements(paystack_reference);
```

---

## 5. Gestion des Migrations et des Données Mockées (Protocole Manuel)

Pour toute modification ou ajout dans la base de données :

### Tables Réelles (Schéma & Structure)
1. **Drizzle Schema** : Définir ou mettre à jour les schémas Drizzle dans `src/lib/db/schema.ts`.
2. **Génération SQL** : Exécuter la commande de génération de migration (ex: `npm run db:generate`) pour créer le fichier SQL.
3. **Pas d'Exécution Automatique** : Ne **JAMAIS** exécuter directement les requêtes de structure de table ou de politiques RLS sur la base de données distante ou Supabase via un script automatique de migration.
4. **Rangement & Trace** : Écrire ces requêtes dans un fichier SQL et le mettre dans le dossier des migrations (ex: `supabase/migrations/`) pour garder une trace historique.
5. **Validation par l'Utilisateur** : L'utilisateur récupère lui-même le code SQL dans le fichier pour le copier-coller et l'exécuter dans Supabase.

### Données Mockées & Simulation (Tables de Test)
1. **Génération SQL** : Générer le code SQL pour simuler des informations ou insérer des données de test.
2. **Rangement** : Mettre ce code SQL dans un fichier (ex: dans `INFO_MOCKER/` ou `db/`) pour garder une trace propre.
3. **Application Manuelle** : Ne pas exécuter de script d'application automatique. L'utilisateur copiera et collera lui-même le contenu SQL du fichier dans Supabase. Cela facilite le suivi et la suppression ultérieure des données de test.

---
*Dernière mise à jour : Juin 2026*

