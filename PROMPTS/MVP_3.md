# MVP_3.md — Contrats, Airtable View & Chatbot IA
## Favor Company International

> **Durée :** Semaines 11–16  
> **Prérequis :** MVP_1 et MVP_2 entièrement terminés et testés  
> **Objectif :** Génération de contrats, vue base de données avancée (style Airtable), générateur de formulaires, et chatbot IA

---

## Périmètre MVP_3

| # | Feature | Priorité | Statut |
|---|---|---|---|
| F17 | Génération de Contrats (MD → DOCX → PDF) | 🔴 Critique | ⬜ Todo |
| F18 | Générateur de Formulaires (style Tally) | 🟠 Important | ⬜ Todo |
| F19 | Base de Données Visuelle (style Airtable) | 🟠 Important | ⬜ Todo |
| F20 | Chatbot IA (Agent RAG) | 🔴 Critique | ⬜ Todo |

---

## F17 — Génération de Contrats

### Critères d'acceptance
- [ ] Template de contrat en Markdown avec variables dynamiques
- [ ] Génération en Word (.docx) et PDF
- [ ] Titres de différentes tailles (H1, H2, H3)
- [ ] Listes à puces et listes numérotées
- [ ] Liens cliquables
- [ ] Citations (blockquote)
- [ ] Hachage SHA-256 pour vérifier l'intégrité (le document n'a pas été modifié)
- [ ] Signature électronique du client et de l'agent
- [ ] Stockage sécurisé sur Cloudflare R2
- [ ] Envoi par email avec lien de signature
- [ ] Notification aux admins après signature
- [ ] Ajout automatique en DB après signature

### Template de Contrat (Markdown)

```markdown
<!-- src/lib/contrats/templates/vente.md.template -->

# CONTRAT DE VENTE IMMOBILIÈRE

**Entre les soussignés :**

**Le Vendeur :**  
Favor Company International  
Yaho, Immeuble en face de la Maison Blanche, 2ème étage  
Abidjan, Côte d'Ivoire  
Représenté par : {{agent_nom}} {{agent_prenom}}  
En qualité de : Agent Immobilier

**Et l'Acquéreur :**  
Monsieur/Madame : {{client_nom}} {{client_prenom}}  
Adresse : {{client_adresse}}  
Contact : {{client_telephone}}  
Email : {{client_email}}

---

## Article 1 — Désignation du Bien

Le bien objet du présent contrat est désigné comme suit :

- **Nature :** {{bien_type}}
- **Localisation :** {{bien_localisation}}, {{bien_ville}}
- **Superficie :** {{bien_surface}} m²
- **Référence :** {{bien_slug}}

> Le bien est vendu dans l'état où il se trouve, tel que visité et accepté par l'acquéreur.

---

## Article 2 — Prix de Vente

Le prix de vente est fixé à la somme de :

**{{montant_total_lettres}}** ({{montant_total}} FCFA)

### Modalités de Paiement

{{modalites_paiement}}

---

## Article 3 — Conditions Suspensives

La présente vente est conclue sous les conditions suspensives suivantes :

- Obtention des documents de propriété (Titre Foncier / ACD)
- Paiement intégral du prix convenu
- Signature des deux parties

---

## Article 4 — Documents Remis

À la finalisation de la vente, le vendeur remettra à l'acquéreur :

1. L'Attestation de Cession de Droit (ACD)
2. Le plan de bornage (pour les terrains)
3. Le reçu de paiement des taxes foncières
4. La facture normalisée

---

## Article 5 — Élection de Domicile

Pour l'exécution du présent contrat, les parties font élection de domicile à leurs adresses respectives indiquées ci-dessus.

---

## Article 6 — Droit Applicable

Le présent contrat est soumis au droit ivoirien. Tout litige sera soumis aux tribunaux compétents d'Abidjan.

---

**Fait à Abidjan, le {{date_signature}}**

| Signature du Vendeur | Signature de l'Acquéreur |
|---|---|
| Favor Company International | {{client_nom}} {{client_prenom}} |
| {{agent_nom}} {{agent_prenom}} | |
| Date : {{date_signature}} | Date : {{date_signature_client}} |

---

*Numéro de contrat : {{contrat_numero}}*  
*Hash d'intégrité : {{contrat_hash}}*
```

### Générateur de Contrat

```typescript
// src/lib/contrats/generator.ts
import { createHash } from 'crypto'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { promises as fs } from 'fs'
import path from 'path'

interface ContratVariables {
  agent_nom: string
  agent_prenom: string
  client_nom: string
  client_prenom: string
  client_adresse: string
  client_telephone: string
  client_email: string
  bien_type: string
  bien_localisation: string
  bien_ville: string
  bien_surface: number
  bien_slug: string
  montant_total: number
  montant_total_lettres: string
  modalites_paiement: string
  date_signature: string
  contrat_numero: string
}

export async function genererContrat(
  variables: ContratVariables,
  templatePath: string = 'vente'
): Promise<{ docxBuffer: Buffer; hash: string }> {
  // Charger le template DOCX
  const templateFile = await fs.readFile(
    path.join(process.cwd(), `src/lib/contrats/templates/${templatePath}.docx`)
  )

  const zip = new PizZip(templateFile)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  })

  // Injecter les variables
  doc.render(variables)

  const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' })

  // Calculer le hash SHA-256 pour l'intégrité
  const hash = createHash('sha256').update(docxBuffer).digest('hex')

  return { docxBuffer, hash }
}

export function verifierIntegriteContrat(
  buffer: Buffer,
  hashAttendu: string
): boolean {
  const hashCalcule = createHash('sha256').update(buffer).digest('hex')
  return hashCalcule === hashAttendu
}
```

### Convertir en PDF

```typescript
// src/lib/contrats/pdf.ts
import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export async function convertirDocxEnPdf(docxBuffer: Buffer): Promise<Buffer> {
  // Créer un fichier temporaire
  const tmpDir = os.tmpdir()
  const tmpDocx = path.join(tmpDir, `contrat-${Date.now()}.docx`)
  const tmpPdf = path.join(tmpDir, `contrat-${Date.now()}.pdf`)

  await fs.writeFile(tmpDocx, docxBuffer)

  // Utiliser LibreOffice en ligne de commande (disponible sur Vercel via une fonction Edge)
  // Alternative : utiliser une API externe (ILovePDF, DocRaptor, etc.)
  execSync(`libreoffice --headless --convert-to pdf --outdir ${tmpDir} ${tmpDocx}`)

  const pdfBuffer = await fs.readFile(tmpPdf)

  // Nettoyer les fichiers temporaires
  await fs.unlink(tmpDocx)
  await fs.unlink(tmpPdf)

  return pdfBuffer
}

// Alternative recommandée : API DocRaptor
export async function convertirAvecDocRaptor(htmlContent: string): Promise<Buffer> {
  const response = await fetch('https://docraptor.com/docs', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(process.env.DOCRAPTOR_API_KEY!).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      doc: {
        document_content: htmlContent,
        document_type: 'pdf',
        name: 'contrat.pdf',
      },
    }),
  })

  return Buffer.from(await response.arrayBuffer())
}
```

### Server Action — Créer et Envoyer un Contrat

```typescript
// src/app/actions/contrats.ts
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { genererContrat, convertirAvecDocRaptor } from '@/lib/contrats'
import { uploadToR2 } from '@/lib/cloudflare/r2'
import { envoyerEmailContrat } from '@/lib/resend/emails'
import { createHash } from 'crypto'

export async function creerEtEnvoyerContrat(input: {
  clientId: string
  bienId: string
  agentId: string
  variables: ContratVariables
}) {
  const supabase = createServerClient()

  // 1. Générer le DOCX
  const { docxBuffer, hash } = await genererContrat(input.variables)

  // 2. Convertir en PDF
  const pdfBuffer = await convertirAvecDocRaptor(/* html content */)

  // 3. Numéro de contrat unique
  const contratNumero = `FC-CT-${Date.now()}`

  // 4. Uploader sur Cloudflare R2
  const docxUrl = await uploadToR2(docxBuffer, `contrats/${contratNumero}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  const pdfUrl = await uploadToR2(pdfBuffer, `contrats/${contratNumero}.pdf`, 'application/pdf')

  // 5. Sauvegarder en DB
  const { data: contrat, error } = await supabase
    .from('contrats')
    .insert({
      numero: contratNumero,
      type: 'vente',
      client_id: input.clientId,
      bien_id: input.bienId,
      agent_id: input.agentId,
      contenu_hash: hash,
      statut: 'envoyé',
      url_docx: docxUrl,
      url_pdf: pdfUrl,
      date_envoi: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // 6. Envoyer par email
  await envoyerEmailContrat({
    clientEmail: input.variables.client_email,
    clientNom: `${input.variables.client_nom} ${input.variables.client_prenom}`,
    contratNumero,
    pdfUrl,
    lienSignature: `${process.env.NEXT_PUBLIC_APP_URL}/contrats/${contrat.id}/signer`,
  })

  // 7. Notifier les admins
  await supabase.from('notifications').insert([
    {
      user_id: input.agentId,
      titre: 'Contrat envoyé',
      message: `Le contrat ${contratNumero} a été envoyé au client.`,
      type: 'contrat',
      lien: `/admin/contrats/${contrat.id}`,
    },
  ])

  return { success: true, contrat }
}
```

---

## F18 — Générateur de Formulaires (style Tally)

### Critères d'acceptance
- [ ] Interface de création de formulaires par drag & drop
- [ ] Types de champs : texte court, texte long, email, téléphone, nombre, date, liste déroulante, boutons radio, cases à cocher, tags, fichier, section (titre)
- [ ] Marquer un champ comme obligatoire
- [ ] Lien unique de partage par formulaire (slug)
- [ ] Page de remplissage côté client
- [ ] Stockage des réponses en DB
- [ ] Notification à l'admin à chaque réponse
- [ ] Export des réponses (CSV, Excel)
- [ ] Envoi par email à un destinataire

### Structure d'un Formulaire en DB

```typescript
// Type d'un champ de formulaire
interface ChampFormulaire {
  id: string
  type: 'text' | 'textarea' | 'email' | 'telephone' | 'number' | 'date' |
        'select' | 'radio' | 'checkbox' | 'tags' | 'file' | 'section'
  label: string
  placeholder?: string
  requis: boolean
  options?: string[]        // Pour select, radio, checkbox, tags
  acceptedTypes?: string[]  // Pour file (ex: ['pdf', 'image/*'])
  maxSize?: number          // Pour file (en Mo)
}

// Structure complète stockée en JSONB
const formulaireExemple = {
  titre: "Fiche de renseignements client",
  description: "Merci de remplir ce formulaire avant votre visite",
  champs: [
    { id: '1', type: 'text', label: 'Nom complet', requis: true },
    { id: '2', type: 'email', label: 'Email', requis: true },
    { id: '3', type: 'telephone', label: 'Téléphone', requis: true },
    { id: '4', type: 'select', label: 'Type de bien recherché', requis: false,
      options: ['Terrain', 'Maison', 'Appartement', 'Lotissement'] },
    { id: '5', type: 'number', label: 'Budget maximum (FCFA)', requis: false },
    { id: '6', type: 'textarea', label: 'Commentaires', requis: false },
    { id: '7', type: 'file', label: 'Pièce d\'identité', requis: false,
      acceptedTypes: ['application/pdf', 'image/*'], maxSize: 5 },
  ]
}
```

### Rendu Dynamique du Formulaire

```tsx
// src/components/formulaires/FormRenderer.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface FormRendererProps {
  formulaire: Formulaire
  onSubmit: (reponses: Record<string, unknown>) => void
}

export function FormRenderer({ formulaire, onSubmit }: FormRendererProps) {
  // Générer le schéma Zod dynamiquement
  const schema = z.object(
    Object.fromEntries(
      formulaire.champs.map(champ => [
        champ.id,
        champ.requis ? z.string().min(1, 'Ce champ est obligatoire') : z.string().optional(),
      ])
    )
  )

  const form = useForm({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {formulaire.champs.map(champ => (
        <ChampRenderer key={champ.id} champ={champ} form={form} />
      ))}
      <button type="submit" className="btn-primary w-full">
        Envoyer
      </button>
    </form>
  )
}
```

---

## F19 — Base de Données Visuelle (style Airtable)

### Critères d'acceptance
- [ ] Vue Grid (tableau) avec lignes et colonnes éditables
- [ ] Vue Calendar (biens par date d'ajout, réservations par échéance)
- [ ] Vue Kanban (statuts des biens ou étapes du pipeline)
- [ ] Vue Gallery (cartes avec image)
- [ ] Vue Graph (graphe de relations ou statistiques)
- [ ] Ajouter une ligne (nouvelle entrée) depuis le tableau
- [ ] Ajouter une colonne (nouveau champ) depuis le tableau
- [ ] Modification en double-cliquant sur une cellule
- [ ] Types de champs : texte court, texte long, nombre, date, liste déroulante, tags, case à cocher, relation
- [ ] Filtres avancés combinables
- [ ] Tri par colonne
- [ ] Relations entre tables (ex: biens ↔ clients)
- [ ] Export CSV, Excel, PDF

### Architecture du Composant

```tsx
// src/components/admin/DataView/index.tsx
'use client'

import { useState } from 'react'
import { GridView } from './GridView'
import { KanbanView } from './KanbanView'
import { CalendarView } from './CalendarView'
import { GalleryView } from './GalleryView'
import { GraphView } from './GraphView'
import { ViewSwitcher } from './ViewSwitcher'
import { FilterBar } from './FilterBar'

type ViewType = 'grid' | 'kanban' | 'calendar' | 'gallery' | 'graph'

interface DataViewProps {
  tableName: string
  columns: ColumnDef[]
  data: Record<string, unknown>[]
  onAdd: () => void
  onEdit: (rowId: string, field: string, value: unknown) => void
  onDelete: (rowId: string) => void
  onAddColumn: (column: ColumnDef) => void
}

export function DataView({ tableName, columns, data, onAdd, onEdit, onDelete, onAddColumn }: DataViewProps) {
  const [activeView, setActiveView] = useState<ViewType>('grid')
  const [filters, setFilters] = useState<Filter[]>([])
  const [sorts, setSorts] = useState<Sort[]>([])

  const filteredData = applyFilters(data, filters)
  const sortedData = applySorts(filteredData, sorts)

  const views = {
    grid: <GridView columns={columns} data={sortedData} onEdit={onEdit} onAddColumn={onAddColumn} />,
    kanban: <KanbanView columns={columns} data={sortedData} />,
    calendar: <CalendarView data={sortedData} />,
    gallery: <GalleryView data={sortedData} />,
    graph: <GraphView data={sortedData} />,
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">{tableName}</h2>
        <ViewSwitcher active={activeView} onChange={setActiveView} />
      </div>
      <FilterBar filters={filters} onChange={setFilters} columns={columns} />
      <div className="flex-1 overflow-auto">
        {views[activeView]}
      </div>
      <button onClick={onAdd} className="m-4 btn-ghost text-left">
        + Ajouter une ligne
      </button>
    </div>
  )
}
```

### Vue Grid (éditable en double-clic)

```tsx
// src/components/admin/DataView/GridView.tsx
'use client'

import { useState, useRef, useEffect } from 'react'

interface GridCellProps {
  value: unknown
  column: ColumnDef
  onEdit: (value: unknown) => void
}

function GridCell({ value, column, onEdit }: GridCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  function handleDoubleClick() {
    setIsEditing(true)
  }

  function handleBlur() {
    setIsEditing(false)
    onEdit(editValue)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleBlur()
    if (e.key === 'Escape') setIsEditing(false)
  }

  if (isEditing) {
    return (
      <CellEditor
        ref={inputRef}
        type={column.type}
        value={editValue}
        onChange={setEditValue}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        options={column.options}
      />
    )
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="px-3 py-2 min-h-[36px] cursor-text hover:bg-secondary-50 rounded transition-colors"
    >
      <CellDisplay type={column.type} value={value} />
    </div>
  )
}
```

---

## F20 — Chatbot IA (Agent RAG)

### Critères d'acceptance
- [ ] Widget chatbot présent sur TOUTES les pages du site
- [ ] L'utilisateur peut poser des questions à tout moment
- [ ] Répond aux questions sur les biens disponibles (prix, localisation, type)
- [ ] Répond aux questions sur les services de Favor Company
- [ ] Répond aux questions sur le processus d'achat/réservation
- [ ] Répond aux questions sur les modalités de paiement
- [ ] Répond aux questions sur les documents requis
- [ ] Escalade vers un agent humain si la question dépasse ses capacités
- [ ] Historique de la conversation dans la session
- [ ] Design intégré à la charte graphique Favor Company

### Architecture RAG

```
Base de Connaissances (Supabase + pgvector)
  ↓
Documents vectorisés :
  - Catalogue biens (nom, description, prix, localisation)
  - FAQ Favor Company
  - Guide du processus d'achat
  - Services proposés
  - Infos légales (documents requis, etc.)
  ↓
Embeddings OpenAI ou Mistral
  ↓
Recherche sémantique lors d'une question
  ↓
Contexte pertinent injecté dans le prompt
  ↓
Réponse générée par le LLM
```

### Widget Chatbot

```tsx
// src/components/shared/ChatBot.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Bonjour ! Je suis l\'assistant virtuel de Favor Company International. Comment puis-je vous aider aujourd\'hui ? (biens disponibles, processus d\'achat, prix, etc.)',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-10), // 10 derniers messages pour le contexte
        }),
      })

      const data = await response.json()

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Veuillez réessayer ou contacter notre équipe au +225 0103132878.',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors"
        aria-label="Ouvrir le chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-secondary-200"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b bg-primary-500 rounded-t-2xl">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Assistant Favor Company</p>
                <p className="text-primary-100 text-xs">Disponible 24h/24</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-primary-500 text-white rounded-br-sm'
                        : 'bg-secondary-100 text-secondary-800 rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary-100 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-secondary-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Posez votre question..."
                  className="flex-1 px-3 py-2 rounded-xl border border-secondary-200 text-sm focus:outline-none focus:border-primary-500"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

### API Route Chatbot (RAG)

```typescript
// src/app/api/chatbot/route.ts
import { createServerClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  const { message, history } = await request.json()
  const supabase = createServerClient()

  // 1. Générer l'embedding de la question
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: message,
  })
  const embedding = embeddingResponse.data[0].embedding

  // 2. Recherche sémantique dans la base de connaissances
  const { data: documents } = await supabase.rpc('recherche_semantique', {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
  })

  const contexte = documents?.map((d: { content: string }) => d.content).join('\n\n') ?? ''

  // 3. Générer la réponse avec le contexte
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Tu es l'assistant virtuel de Favor Company International, un promoteur immobilier agréé basé à Abidjan, Côte d'Ivoire.
        
Ton rôle est d'aider les visiteurs à trouver le bien immobilier de leurs rêves et de répondre à toutes leurs questions sur nos services.

Informations sur Favor Company :
- Localisation : Yaho, Immeuble face à la Maison Blanche, 2ème étage, Abidjan
- Téléphone : +225 2724370155 | WhatsApp : +225 0103132878
- Email : Favorcompanyint@gmail.com
- Services : Terrains, Maisons, Appartements, Lotissements, Topographie, Construction

Contexte pertinent de notre base de données :
${contexte}

Réponds en français, de façon chaleureuse et professionnelle. Si tu ne connais pas la réponse, invite l'utilisateur à contacter notre équipe directement.`,
      },
      ...history.slice(-10).map((m: Message) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ],
    max_tokens: 500,
    temperature: 0.7,
  })

  const response = completion.choices[0].message.content

  return Response.json({ response })
}
```

---

## Tests de Recette MVP_3

### Scénario 1 — Contrat Complet
1. Admin génère un contrat de vente pour un client
2. Le contrat est généré en DOCX et PDF
3. Hash SHA-256 calculé et stocké
4. Contrat envoyé par email au client
5. Client signe le contrat en ligne
6. Vérification que le hash est toujours valide après signature
7. Notification envoyée aux admins

### Scénario 2 — Formulaire Personnalisé
1. Admin crée un formulaire "Fiche client" avec 6 champs
2. Envoie le lien du formulaire à un prospect
3. Prospect remplit et soumet le formulaire
4. Les réponses apparaissent dans le backoffice
5. Export des réponses en CSV

### Scénario 3 — Vue Airtable
1. Admin ouvre la vue Grid des biens
2. Double-clique sur le statut d'un bien → Le modifie
3. Ajoute une colonne "Priorité" de type liste déroulante
4. Bascule en vue Kanban → Les biens sont groupés par statut
5. Filtre les biens par ville "Cocody"
6. Exporte en Excel

### Scénario 4 — Chatbot
1. Visiteur sur la page d'accueil → Clique sur le chatbot
2. Demande : "Quels terrains sont disponibles à Cocody ?"
3. Le chatbot répond avec les biens pertinents depuis la DB
4. Visiteur demande : "Comment puis-je réserver ?"
5. Le chatbot explique le processus de réservation

---

*MVP_3 terminé → Passer à MVP_4.md (SaaS multi-agences)*
