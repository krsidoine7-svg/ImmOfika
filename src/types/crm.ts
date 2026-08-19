export interface GatingCondition {
  id: string
  label: string
  valid: boolean
  type: 'auto' | 'manual'
}

export type TaskStatut = 'a_faire' | 'en_cours' | 'bloquee' | 'terminee'
export type TaskPriorite = 'basse' | 'normale' | 'moyenne' | 'haute' | 'urgente'

