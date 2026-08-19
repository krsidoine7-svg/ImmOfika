export const PIPELINE_ETAPES = [
  { code: 'prospect',        nom: 'Prospect',         couleur: '#6B7280', ordre: 1 },
  { code: 'qualifie',        nom: 'Lead Qualifié',    couleur: '#3B82F6', ordre: 2 },
  { code: 'visite_planifiee',nom: 'Visite Planifiée', couleur: '#8B5CF6', ordre: 3 },
  { code: 'visite_effectuee',nom: 'Visite Effectuée', couleur: '#EC4899', ordre: 4 },
  { code: 'negociation',     nom: 'Négociation',      couleur: '#F59E0B', ordre: 5 },
  { code: 'offre_acceptee',  nom: 'Offre Acceptée',   couleur: '#10B981', ordre: 6 },
  { code: 'contrat_signe',   nom: 'Contrat Signé',    couleur: '#059669', ordre: 7 },
  { code: 'vente_finalisee', nom: 'Vente Finalisée',  couleur: '#065F46', ordre: 8 },
] as const

export type PipelineEtapeCode = typeof PIPELINE_ETAPES[number]['code']
