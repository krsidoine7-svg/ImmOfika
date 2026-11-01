Tester et sécuriser de manière approfondie la plateforme SaaS Immobilière ImmOfika (Next.js 16, Supabase PostgreSQL, Paystack, Facturation FNE DGI, RBAC 6 rôles, Modération Anti-fraude). Mettre en place les suites de tests automatisés, réaliser l'audit de sécurité complet et corriger directement les failles et bugs identifiés.

Integrity mode: development

## Requirements

### R1. Suites de tests automatisés
Mettre en place et exécuter une suite de tests unitaires et d'intégration couvrant la logique métier critique (facturation FNE DGI, flux de paiement Paystack, règles de modération anti-fraude). Les tests doivent fonctionner de manière autonome à l'aide de mocks locaux et de jeux de données isolés.

### R2. Audit et vérification de sécurité
Auditer et tester la sécurité applicative de la plateforme, incluant la conformité stricte du contrôle d'accès RBAC (6 rôles), la protection des endpoints sensibles, la validation et l'assainissement des entrées/sorties, et la gestion sécurisée des secrets et variables d'environnement.

### R3. Remédiation du code
Corriger directement dans le code source de l'application toutes les vulnérabilités de sécurité et anomalies détectées lors des tests et audits, en assurant la non-régression des fonctionnalités existantes.

## Acceptance Criteria

### Tests automatisés
- [ ] La suite de tests unitaires et d'intégration s'exécute localement avec des mocks sans dépendance réseau ou externe.
- [ ] 100% des tests automatisés s'exécutent avec succès (0 échec).
- [ ] Les scénarios nominaux et d'erreur pour la facturation FNE DGI, Paystack et la modération anti-fraude sont couverts.

### Sécurité et conformité RBAC
- [ ] Les permissions et restrictions des 6 rôles RBAC sont vérifiées et appliquées sur tous les endpoints et actions sensibles.
- [ ] La validation des entrées et l'assainissement des sorties bloquent les injections et entrées invalides.
- [ ] Aucun secret, token d'authentification ou clé privée n'est exposé côté client ou dans les dépôts de code.
- [ ] Toutes les vulnérabilités de sécurité identifiées sont résolues dans le code.
