import { z } from 'zod'

export type TypeChamp =
  | 'text'
  | 'textarea'
  | 'email'
  | 'telephone'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'tags'
  | 'file'
  | 'section'

export interface ChampFormulaire {
  id: string
  type: TypeChamp
  label: string
  placeholder?: string
  requis: boolean
  options?: string[]        // Pour select, radio, checkbox, tags
  acceptedTypes?: string[]  // Pour file (ex: ['application/pdf', 'image/*'])
  maxSize?: number          // Pour file (en Mo, ex: 5)
}

export interface Formulaire {
  id: string
  titre: string
  description?: string | null
  slug: string
  champs: ChampFormulaire[]
  statut: 'actif' | 'archive'
  notificationsEmail?: string | null
  createdBy?: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

export interface FormulaireReponse {
  id: string
  formulaireId: string
  reponses: Record<string, unknown>
  fichiers?: Record<string, { url: string; name: string; size: number }> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string | Date
}

export interface ChampDefinitionUI {
  type: TypeChamp
  label: string
  description: string
  icon: string
  defaultValues: Partial<ChampFormulaire>
}

export const LISTE_TYPES_CHAMPS: ChampDefinitionUI[] = [
  {
    type: 'text',
    label: 'Texte court',
    description: 'Une seule ligne de texte',
    icon: 'text-input',
    defaultValues: { label: 'Texte court', requis: false, placeholder: 'Entrez du texte...' }
  },
  {
    type: 'textarea',
    label: 'Texte long',
    description: 'Zone de texte sur plusieurs lignes',
    icon: 'text-area',
    defaultValues: { label: 'Commentaires / Description', requis: false, placeholder: 'Saisissez vos explications...' }
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Adresse email valide',
    icon: 'mail',
    defaultValues: { label: 'Adresse Email', requis: true, placeholder: 'exemple@domaine.com' }
  },
  {
    type: 'telephone',
    label: 'Téléphone',
    description: 'Numéro de téléphone avec indicatif',
    icon: 'phone',
    defaultValues: { label: 'Numéro de téléphone', requis: true, placeholder: '+225 07 00 00 00 00' }
  },
  {
    type: 'number',
    label: 'Nombre / Montant',
    description: 'Valeur numérique (budget, quantité...)',
    icon: 'hash',
    defaultValues: { label: 'Montant (FCFA)', requis: false, placeholder: '0' }
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Sélection de date',
    icon: 'calendar',
    defaultValues: { label: 'Date d\'échéance / rendez-vous', requis: false }
  },
  {
    type: 'select',
    label: 'Liste déroulante',
    description: 'Choix unique parmi une liste déroulante',
    icon: 'list-ordered',
    defaultValues: { label: 'Choisissez une option', requis: false, options: ['Option 1', 'Option 2', 'Option 3'] }
  },
  {
    type: 'radio',
    label: 'Boutons Radio',
    description: 'Choix unique visible',
    icon: 'disc',
    defaultValues: { label: 'Sélectionnez un choix', requis: false, options: ['Oui', 'Non'] }
  },
  {
    type: 'checkbox',
    label: 'Cases à cocher',
    description: 'Sélection multiple',
    icon: 'check-square',
    defaultValues: { label: 'Sélectionnez les options', requis: false, options: ['Choix A', 'Choix B'] }
  },
  {
    type: 'tags',
    label: 'Tags / Mots-clés',
    description: 'Saisie ou choix de tags',
    icon: 'tags',
    defaultValues: { label: 'Tags / Mots-clés', requis: false, options: ['Résidentiel', 'Urgent'] }
  },
  {
    type: 'file',
    label: 'Fichier / Pièce jointe',
    description: 'Upload de PDF, Image (CNI, Titre foncier...)',
    icon: 'paperclip',
    defaultValues: { label: 'Pièce d\'identité / Document', requis: false, acceptedTypes: ['application/pdf', 'image/*'], maxSize: 5 }
  },
  {
    type: 'section',
    label: 'Titre de Section',
    description: 'Séparateur visuel pour structurer le formulaire',
    icon: 'heading',
    defaultValues: { label: 'Titre de la section', requis: false }
  }
]

/**
 * Générateur dynamique de schéma Zod pour la validation du formulaire
 */
export function buildDynamicZodSchema(champs: ChampFormulaire[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  champs.forEach(champ => {
    if (champ.type === 'section') {
      return // Les sections ne sont pas soumises
    }

    let fieldSchema: z.ZodTypeAny

    switch (champ.type) {
      case 'email':
        fieldSchema = z.string().email('Adresse email invalide')
        if (!champ.requis) fieldSchema = fieldSchema.or(z.literal(''))
        break

      case 'number':
        fieldSchema = z.preprocess(
          val => (val === '' || val === undefined || val === null ? undefined : Number(val)),
          z.number({ message: 'Veuillez entrer un nombre valide' })
        )
        break

      case 'checkbox':
        fieldSchema = z.array(z.string())
        if (champ.requis) {
          fieldSchema = z.array(z.string()).min(1, 'Sélectionnez au moins une option')
        }
        break

      case 'tags':
        fieldSchema = z.array(z.string())
        if (champ.requis) {
          fieldSchema = z.array(z.string()).min(1, 'Au moins un tag est obligatoire')
        }
        break

      case 'file':
        // Pour les fichiers, on reçoit soit une URL ou un objet File
        fieldSchema = z.any()
        break

      default:
        fieldSchema = z.string()
        break
    }

    if (!champ.requis && champ.type !== 'checkbox' && champ.type !== 'tags' && champ.type !== 'file') {
      shape[champ.id] = fieldSchema.optional().or(z.literal(''))
    } else if (champ.requis) {
      if (champ.type === 'text' || champ.type === 'textarea' || champ.type === 'telephone' || champ.type === 'date' || champ.type === 'select' || champ.type === 'radio') {
        shape[champ.id] = z.string().min(1, 'Ce champ est obligatoire')
      } else {
        shape[champ.id] = fieldSchema
      }
    } else {
      shape[champ.id] = fieldSchema.optional()
    }
  })

  return z.object(shape)
}
