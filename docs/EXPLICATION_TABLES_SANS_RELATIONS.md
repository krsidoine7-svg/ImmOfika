# Explication de l'Architecture de la Base de Données

## Pourquoi certaines tables n'ont pas de relations (clés étrangères) ?

Dans le cadre du projet **Favor Company International**, certaines tables n'ont pas de liaisons directes (clés étrangères) avec d'autres tables de la base de données (telles que `users` ou `profiles`). Ce choix de conception est volontaire et répond à des exigences de flexibilité, de conformité RGPD, et de performance système.

---

### 1. Table `analytics_events` (Événements Analytiques)

* **Rôle** : Enregistrer le trafic, le temps d'attention et le terminal des visiteurs.
* **Pourquoi pas de clé étrangère ?**
  Le tracker d'analytiques doit collecter le trafic de **tous les visiteurs**, y compris les prospects non connectés (anonymes) qui naviguent sur la vitrine publique du site. 
  Si une clé étrangère pointant vers la table `users` était obligatoire :
  * Il serait impossible d'enregistrer les données de navigation d'un utilisateur anonyme.
  * L'application planterait pour les visiteurs non connectés.
* **Alternative** : Nous utilisons des identifiants anonymes générés côté client (`visitor_id` et `session_id` sous forme de texte) pour corréler les sessions sans violer l'indépendance de la table.

---

### 2. Table `cookie_consents` (Consentements RGPD)

* **Rôle** : Stocker le choix de l'utilisateur vis-à-vis du dépôt de cookies (Acceptation / Refus).
* **Pourquoi pas de clé étrangère ?**
  * **Anonymat dès l'arrivée** : Le bandeau de cookies apparaît dès la première visite sur le site, bien avant qu'un compte ne soit créé.
  * **Conformité RGPD** : Les réglementations exigent que le consentement puisse être enregistré de manière totalement anonyme, sans être associé nominativement à l'identité réelle d'un utilisateur (adresse mail, nom, etc.), tant que ce dernier n'a pas explicitement consenti à être identifié.

---

### 3. Table `system_settings` (Paramètres Système Globaux)

* **Rôle** : Stocker des paires Clé-Valeur (`key`, `value` au format JSONB) pour les configurations de la plateforme (ex: ID du Pixel Facebook, Google Analytics, état de maintenance).
* **Pourquoi pas de clé étrangère ?**
  Ces configurations représentent des **variables globales applicatives**. Elles n'appartiennent à aucun utilisateur, bien immobilier ou transaction financière en particulier. Conceptuellement, ces variables appartiennent à l'application dans son ensemble, d'où l'absence totale de relation.

---

### 4. Table `team_members` (Membres de l'Équipe)

* **Rôle** : Présentation marketing des collaborateurs de Favor Company sur la page d'accueil vitrine.
* **Pourquoi pas de clé étrangère ?**
  * **Flexibilité** : Tous les collaborateurs ou partenaires externes présentés dans la section "Notre Équipe" n'ont pas forcément besoin d'un compte utilisateur ou d'un profil d'accès dans l'application.
  * **Découplage** : En évitant une clé étrangère obligatoire vers la table `profiles`, la direction peut ajouter, modifier, trier (via la colonne `order`) ou retirer des fiches de collaborateurs librement, sans impacter la sécurité ou l'existence de leurs comptes d'accès réels.

---

### 5. Table `todos` (Tâches de Démo/Test)

* **Rôle** : Tâches de test basiques.
* **Pourquoi pas de clé étrangère ?**
  Cette table a été générée lors de l'initialisation technique du projet pour valider les connexions Drizzle ORM et PostgreSQL. Elle n'est reliée à aucun module métier de l'application.

---

## Conclusion
Concevoir une base de données ne consiste pas à relier toutes les tables entre elles à tout prix. Laisser ces tables indépendantes garantit :
1. Une **immunité aux plantages** lors des visites publiques anonymes.
2. Le respect des règles de la **vie privée (RGPD)**.
3. Un **découplage optimal** facilitant les évolutions futures.
