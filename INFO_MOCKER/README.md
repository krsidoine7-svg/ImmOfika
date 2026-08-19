# 📦 INFO_MOCKER — Données de Test Favor Company International

> Données mockées réalistes pour le développement et les tests de l'application CRM immobilier.

## 📂 Structure

```
INFO_MOCKER/
├── README.md                          ← Ce fichier
├── seed_all_mock_data.sql             ← Script SQL complet à exécuter en une seule fois
└── info_mocker_trace.sql              ← Table de traçabilité des injections de données
```

## 🚀 Utilisation

### 1. Créer la table de traçabilité
```bash
psql -U postgres -d favorci -f INFO_MOCKER/info_mocker_trace.sql
```

### 2. Injecter les données mockées
```bash
psql -U postgres -d favorci -f INFO_MOCKER/seed_all_mock_data.sql
```

### ⚠️ IMPORTANT
- Ces données sont **uniquement pour le développement/test**
- Ne JAMAIS exécuter en production
- Les UUIDs sont fixes pour permettre les références croisées entre tables
- Toutes les données personnelles sont **fictives** (noms, emails, téléphones)

## 📊 Données incluses

| Table | Nombre | Description |
|---|---|---|
| `profiles` | 8 | 1 admin, 3 agents, 4 clients |
| `biens` | 10 | Villas, terrains, appartements à Abidjan |
| `leads` | 15 | Prospects à différentes étapes du pipeline |
| `lead_interactions` | 20 | Historique d'interactions CRM |
| `reservations` | 5 | Réservations en cours |
| `dossiers` | 6 | Dossiers clients avec progression |
| `taches` | 12 | Tâches assignées aux agents |
| `info_mocker` | 1 | Trace d'injection |

## 🔑 UUIDs de référence

### Profiles
- `11111111-aaaa-1111-aaaa-111111111111` → Admin Principal
- `22222222-bbbb-2222-bbbb-222222222222` → Agent Koné
- `33333333-cccc-3333-cccc-333333333333` → Agent Touré
- `44444444-dddd-4444-dddd-444444444444` → Agent Diallo
- `55555555-eeee-5555-eeee-555555555555` → Client Bamba
- `66666666-ffff-6666-ffff-666666666666` → Client Coulibaly
- `77777777-aaaa-7777-aaaa-777777777777` → Client Ouattara
- `88888888-bbbb-8888-bbbb-888888888888` → Client Konan

### Biens
- `aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa` → Villa Prestige Cocody
- `bbbbbbbb-2222-bbbb-2222-bbbbbbbbbbbb` → Terrain Bingerville
- ... (voir le fichier SQL)
