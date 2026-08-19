# Addendum — Restiction RBAC des Utilisateurs par Agent & Filtre par Agent (26 Juillet 2026)

## 📌 Nouvelles Règles de Sécurité RBAC & Filtrage Implémentées
1. **Cloisonnement Strict par Agent Commercial (`admin_agent`)** :
   - Un Agent Commercial ne voit **que les clients qui lui sont attribués** (via leurs leads ou réservations).
   - Masquage des profils utilisateurs des autres agents.
2. **Protection Hiérarchique des Comptes Administrateurs** :
   - Les comptes `admin` et `admin_manager` ne peuvent **pas voir ni modifier** les comptes `tech_super_admin`.
   - Seuls les rôles `super_admin` et `tech_super_admin` conservent la visibilité globale complète.
3. **Filtre par Agent Commercial (`AdminUsersClient.tsx`)** :
   - Sélecteur déroulant **"👨‍💼 Tous les Agents Commercials"** permettant aux Admins de filtrer la liste des utilisateurs par Agent d'affiliation.
4. **Recherche, Filtres par Statut et Pagination (6 par page)** :
   - Intégrés et uniformisés sur les pages `/admin/reservations`, `/admin/utilisateurs` et `/admin/paiements`.
- **Validation Build** : `npm run build` exécuté avec succès.
