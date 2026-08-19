"use client"

import * as React from "react"
import { CustomSelect } from "@/components/ui/custom-select"
import { Button } from "@/components/ui/button"
import { updateBienAction } from "@/app/actions/adminBiens"
import { ArrowLeftIcon, UploadCloudIcon, TrashIcon, EyeIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Bien {
  id: string
  titre: string
  prix: string
  type: string
  transaction: "vente" | "location"
  description: string | null
  ville: string | null
  quartier: string | null
  surface: string | null
  chambres: number | null
  sallesDeBain: number | null
  mainImageUrl: string | null
}

interface EditBienFormProps {
  bien: Bien
}

export function EditBienForm({ bien }: EditBienFormProps) {
  // États de saisie des champs contrôlés pour validation temps réel
  const [titre, setTitre] = React.useState(bien.titre)
  const [prix, setPrix] = React.useState(bien.prix)
  const [type, setType] = React.useState(bien.type)
  const [transaction, setTransaction] = React.useState(bien.transaction)
  const [description, setDescription] = React.useState(bien.description || "")
  const [ville, setVille] = React.useState(bien.ville || "")
  const [quartier, setQuartier] = React.useState(bien.quartier || "")
  const [surface, setSurface] = React.useState(bien.surface || "")
  const [chambres, setChambres] = React.useState(bien.chambres !== null ? bien.chambres.toString() : "")
  const [sallesDeBain, setSallesDeBain] = React.useState(bien.sallesDeBain !== null ? bien.sallesDeBain.toString() : "")

  // États pour la nouvelle photo chargée
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [imageName, setImageName] = React.useState<string>("")
  const [imageSize, setImageSize] = React.useState<string>("")
  const [loading, setLoading] = React.useState(false)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // ─── Gestionnaires de saisie avec filtrage en temps réel ───────────────────────
  
  // N'autorise que les lettres, espaces, tirets et apostrophes (pour Ville et Quartier)
  const handleLettersOnlyChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value
    const cleaned = val.replace(/[^a-zA-ZÀ-ÿ\s'\-]/g, "")
    setter(cleaned)
  }

  // N'autorise que les chiffres strictement positifs (pour Prix et Surface)
  const handleNumbersOnlyChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value
    const cleaned = val.replace(/[^0-9]/g, "")
    // Empêcher les zéros initiaux inutiles
    const finalized = cleaned.startsWith("0") ? cleaned.replace(/^0+/, "") : cleaned
    setter(finalized)
  }

  // N'autorise que les entiers positifs ou nuls (pour Chambres et Salles de Bain)
  const handleIntegersOnlyChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value
    const cleaned = val.replace(/[^0-9]/g, "")
    setter(cleaned)
  }

  // ─── Gestion de la photo ───────────────────────────────────────────────────────
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validation de la taille maximale (5 Mo)
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse. La taille maximale autorisée est de 5 Mo.")
        if (fileInputRef.current) fileInputRef.current.value = ""
        setPreviewUrl(null)
        setImageName("")
        setImageSize("")
        return
      }

      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setImageName(file.name)
      setImageSize((file.size / (1024 * 1024)).toFixed(2) + " Mo")
    } else {
      setPreviewUrl(null)
      setImageName("")
      setImageSize("")
    }
  }

  const handleCancelNewImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPreviewUrl(null)
    setImageName("")
    setImageSize("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // ─── Validateur global pour le bouton de soumission ───────────────────────────
  const isFormValid = React.useMemo(() => {
    return (
      titre.trim().length >= 3 &&
      description.trim().length >= 10 &&
      prix !== "" && Number(prix) > 0 &&
      type !== "" &&
      (transaction === "vente" || transaction === "location") &&
      ville.trim().length >= 1 &&
      quartier.trim().length >= 1 &&
      surface !== "" && Number(surface) > 0 &&
      chambres !== "" && Number(chambres) >= 0 &&
      sallesDeBain !== "" && Number(sallesDeBain) >= 0
    )
  }, [
    titre,
    description,
    prix,
    type,
    transaction,
    ville,
    quartier,
    surface,
    chambres,
    sallesDeBain,
  ])

  const handleSubmit = () => {
    setLoading(true)
  }

  return (
    <form action={updateBienAction} onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={bien.id} />

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1A2A4A] border-b pb-2">Informations Générales</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Titre de l&apos;annonce *</label>
            <input 
              required 
              type="text" 
              name="titre" 
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Prix (FCFA) *</label>
            <input 
              required 
              type="text" 
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              name="prix" 
              value={prix}
              onChange={handleNumbersOnlyChange(setPrix)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Type de bien *</label>
            <CustomSelect
              size="sm"
              value={type}
              onChange={setType}
              options={[
                { value: 'maison', label: 'Maison' },
                { value: 'appartement', label: 'Appartement' },
                { value: 'terrain', label: 'Terrain' },
                { value: 'commercial', label: 'Local Commercial' },
              ]}
              placeholder="Type de bien"
            />
            <input type="hidden" name="type" value={type} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Type de transaction *</label>
            <CustomSelect
              size="sm"
              value={transaction}
              onChange={(val) => setTransaction(val as "vente" | "location")}
              options={[
                { value: 'vente', label: 'Vente' },
                { value: 'location', label: 'Location' },
              ]}
              placeholder="Type de transaction"
            />
            <input type="hidden" name="transaction" value={transaction} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Description longue *</label>
          <textarea 
            required 
            minLength={10} 
            name="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4} 
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
          ></textarea>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1A2A4A] border-b pb-2">Localisation &amp; Caractéristiques</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Ville *</label>
            <input 
              required 
              type="text" 
              name="ville" 
              value={ville}
              onChange={handleLettersOnlyChange(setVille)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Quartier *</label>
            <input 
              required 
              type="text" 
              name="quartier" 
              value={quartier}
              onChange={handleLettersOnlyChange(setQuartier)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Surface (m²) *</label>
            <input 
              required 
              type="text" 
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              name="surface" 
              value={surface}
              onChange={handleNumbersOnlyChange(setSurface)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Chambres *</label>
            <input 
              required 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              name="chambres" 
              value={chambres}
              onChange={handleIntegersOnlyChange(setChambres)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Salles de bain *</label>
            <input 
              required 
              type="text" 
              inputMode="numeric"
              pattern="[0-9]*"
              name="sallesDeBain" 
              value={sallesDeBain}
              onChange={handleIntegersOnlyChange(setSallesDeBain)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]" 
            />
          </div>
        </div>
      </div>

      {/* Zone Photo Principale avec Design Réactif sans Débordement ni Overflow */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#1A2A4A] border-b pb-2">Photo Principale</h2>
        
        {/* UNIQUE input fichier persistant masqué dans le DOM */}
        <input 
          type="file" 
          name="image" 
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*" 
          className="hidden"
        />

        <div className="space-y-4">
          {previewUrl ? (
            /* Aperçu de la Nouvelle image sélectionnée */
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative h-32 w-full sm:w-48 rounded-lg overflow-hidden border border-gray-200 bg-white group shadow-sm shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Aperçu du bien" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold flex items-center gap-1">
                    <EyeIcon className="h-3.5 w-3.5" /> Nouvelle photo
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 w-full text-center sm:text-left min-w-0">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1A2A4A] truncate break-words px-1">{imageName}</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{imageSize}</p>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleCancelNewImage}
                    className="bg-red-50 text-red-600 hover:bg-red-100 border-none text-[10px] sm:text-xs h-7 px-3"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" /> Annuler le remplacement
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] sm:text-xs border-gray-200 bg-white h-7 px-3"
                  >
                    Remplacer par une autre
                  </Button>
                </div>
              </div>
            </div>
          ) : bien.mainImageUrl ? (
            /* Affichage de la photo actuelle conservée */
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="relative h-32 w-full sm:w-48 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0 shadow-sm">
                <Image 
                  src={bien.mainImageUrl} 
                  alt={bien.titre} 
                  fill 
                  sizes="192px" 
                  className="object-cover" 
                />
              </div>

              <div className="flex-1 space-y-2 w-full text-center sm:text-left min-w-0">
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1A2A4A] truncate">Photo Actuelle</h4>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Image d&apos;origine conservée</p>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] sm:text-xs border-gray-200 bg-white h-7 px-3"
                  >
                    Remplacer la photo
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Zone vide de téléversement (si aucune photo d'origine) */
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <UploadCloudIcon className="h-10 w-10 text-gray-400 mb-3 group-hover:text-[#C9A84C] transition-colors" />
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1 max-w-full px-2 break-words">
                Téléverser la photo principale *
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mb-4">PNG, JPG ou WEBP (Max. 5Mo)</p>
              <Button type="button" variant="outline" size="sm" className="pointer-events-none bg-white text-xs border-gray-200 w-full sm:w-auto text-ellipsis overflow-hidden px-4">
                Choisir un fichier
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t flex justify-end gap-3">
        <Button variant="outline" type="button" render={<Link href="/admin/biens" />} disabled={loading}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          disabled={!isFormValid || loading} 
          className="bg-[#1A2A4A] hover:bg-[#111e36] text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed px-8"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </form>
  )
}
