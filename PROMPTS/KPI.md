# KPI.md — Indicateurs de Performance
## Favor Company International

---

## 1. KPIs Business

### Ventes & Revenus
| KPI | Définition | Fréquence | Cible MVP |
|---|---|---|---|
| Chiffre d'affaires | Total des ventes finalisées (XOF) | Mensuel | — |
| Bénéfice net | CA - charges opérationnelles | Mensuel | — |
| Panier moyen | CA / nombre de ventes | Mensuel | — |
| Taux de conversion global | Leads → Ventes (%) | Mensuel | > 5% |
| Taux de conversion visite → vente | Visites → Achat (%) | Mensuel | > 20% |
| Délai moyen de vente | Lead → Contrat signé (jours) | Mensuel | < 60 jours |

### Leads & CRM
| KPI | Définition | Fréquence | Cible MVP |
|---|---|---|---|
| Nb leads entrants | Prospects créés | Hebdomadaire | 20/semaine |
| Leads qualifiés | Leads avec score ≥ seuil | Hebdomadaire | 50% des leads |
| Taux d'attribution | Leads attribués à un agent | Quotidien | 100% |
| Score moyen des leads | Score moyen du pipeline | Mensuel | > 60/100 |
| Leads perdus | Raison d'abandon | Mensuel | < 30% |

### Biens & Réservations
| KPI | Définition | Fréquence | Cible MVP |
|---|---|---|---|
| Nb biens disponibles | Catalogue actif | Quotidien | — |
| Taux d'occupation | Réservés / Total (%) | Hebdomadaire | > 40% |
| Délai moyen de réservation | Durée avant finalisation | Mensuel | < 45 jours |
| Taux d'expiration | Réservations non finalisées | Mensuel | < 20% |
| Nb visites planifiées | Rendez-vous planifiés | Hebdomadaire | > 10/semaine |
| Taux de présence visite | Visites effectuées / planifiées | Hebdomadaire | > 80% |

---

## 2. KPIs Produit

### Acquisition
| KPI | Définition | Fréquence |
|---|---|---|
| Visiteurs uniques | Sessions uniques sur le site | Quotidien |
| Taux de rebond | % qui quittent après 1 page | Hebdomadaire |
| Source du trafic | Organique, social, direct, référral | Mensuel |
| Inscriptions | Nouveaux comptes créés | Hebdomadaire |
| Coût par lead (CPL) | Budget marketing / nb leads | Mensuel |

### Engagement & Rétention
| KPI | Définition | Fréquence |
|---|---|---|
| DAU / MAU | Utilisateurs actifs quotidiens / mensuels | Quotidien |
| Taux de rétention semaine 1 | % qui reviennent après J+7 | Hebdomadaire |
| Temps moyen sur le site | Durée de session | Hebdomadaire |
| Pages par session | Nombre de pages visitées | Hebdomadaire |
| Taux d'ouverture emails | Emails ouverts / envoyés | Mensuel |
| Taux de clic emails | Clics / ouverts | Mensuel |

### Paiements
| KPI | Définition | Fréquence |
|---|---|---|
| Taux de succès paiement | Paiements réussis / tentatives | Quotidien |
| Taux d'abandon paiement | Abandons en cours de paiement | Quotidien |
| Délai moyen de paiement | De l'initiation au succès | Mensuel |
| Remboursements | Nb et montant des remboursements | Mensuel |

---

## 3. KPIs Opérationnels

### Agents & Équipe
| KPI | Définition | Fréquence |
|---|---|---|
| Leads par agent | Nb leads attribués / agent | Hebdomadaire |
| Ventes par agent | Nb ventes / agent | Mensuel |
| Temps de réponse moyen | Délai premier contact client | Quotidien |
| Taux de satisfaction | Avis clients / agent | Mensuel |
| Score performance | KPI composite par agent | Mensuel |

### Support & Qualité
| KPI | Définition | Fréquence |
|---|---|---|
| Note moyenne biens | Étoiles moyennes (sur 5) | Mensuel |
| NPS (Net Promoter Score) | Probabilité de recommandation | Trimestriel |
| Taux de résolution | Problèmes résolus / signalés | Hebdomadaire |
| Uptime plateforme | Disponibilité (%) | Quotidien |
| Temps de chargement | LCP moyen en secondes | Hebdomadaire |

---

## 4. KPIs Géographiques

| KPI | Définition |
|---|---|
| Zones les plus demandées | Heatmap des recherches |
| Prix moyen par zone | Prix médian / quartier |
| Taux de conversion par zone | Leads → Ventes par quartier |
| Biens les plus consultés | Vue ranking par bien |

---

## 5. Dashboard KPIs — Structure

```
┌─────────────────────────────────────────────────────┐
│  FAVOR COMPANY — TABLEAU DE BORD                    │
│                                  Période: [Mois]    │
├────────────┬─────────────┬────────────┬─────────────┤
│  CA Total  │  Nb Ventes  │  Leads     │  Visites    │
│  XXX XXX   │     XX      │    XXX     │    XX       │
│  FCFA      │             │            │             │
├────────────┴─────────────┴────────────┴─────────────┤
│                                                      │
│  [Graphe revenus sur 12 mois]                       │
│                                                      │
├─────────────────────────┬────────────────────────────┤
│  Pipeline (Kanban)      │  Biens (Disponible/Réservé)│
│  Prospect: XX           │  Disponibles: XX           │
│  Visite: XX             │  Réservés: XX              │
│  Négociation: XX        │  Vendus: XX                │
│  Signé: XX              │                            │
├─────────────────────────┴────────────────────────────┤
│  Top 5 Agents ce mois    │  Zones les + demandées    │
│  1. Agent A - X ventes   │  1. Cocody                │
│  2. Agent B - X ventes   │  2. Yopougon              │
│  3. Agent C - X ventes   │  3. Marcory               │
└──────────────────────────┴────────────────────────────┘
```

---

## 6. Alertes Automatiques

| Alerte | Condition | Destinataire |
|---|---|---|
| Lead sans suivi | Lead > 48h sans interaction | Agent + Manager |
| Réservation bientôt expirée | J-14 avant expiration | Agent + Client |
| Paiement en retard | Échéance dépassée | Agent + Manager |
| Bien populaire | > 100 vues en 24h | Admin manager |
| Taux conversion faible | < 5% sur 30 jours | Super admin |
| Paiement échoué | 3 échecs consécutifs | Agent + Client |
| Uptime < 99% | Toute indisponibilité | Tech admin |

---

*Les KPIs sont consultables dans le dashboard admin et exportables en CSV/Excel/PDF.*
