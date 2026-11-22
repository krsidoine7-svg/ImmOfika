"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { COMMUNES_ABIDJAN, TYPES_BIENS, PALIERS_PRIX_LOCATION, PALIERS_PRIX_VENTE } from "@/lib/constants/abidjan"

/**
 * Recherche principale de l'accueil.
 * Formulaire GET classique vers /biens (fonctionne aussi sans JavaScript),
 * avec exactement les paramètres lus par la page de résultats :
 * transaction, commune, type, prixMax.
 */
export default function HomeSearchForm() {
  const [transaction, setTransaction] = React.useState<"location" | "vente">("location")
  const paliers = transaction === "location" ? PALIERS_PRIX_LOCATION : PALIERS_PRIX_VENTE

  const champ =
    "w-full h-12 rounded-lg border border-slate-200 bg-white px-3 text-[15px] font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"

  return (
    <form action="/biens" method="get" role="search" aria-label="Rechercher un bien" className="w-full">
      <fieldset className="mb-3 flex gap-2">
        <legend className="sr-only">Je cherche à</legend>
        {(["location", "vente"] as const).map((t) => (
          <label
            key={t}
            className={`cursor-pointer select-none rounded-lg border px-4 h-11 inline-flex items-center text-sm font-semibold transition-colors ${
              transaction === t
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name="transaction"
              value={t}
              checked={transaction === t}
              onChange={() => setTransaction(t)}
              className="sr-only"
            />
            {t === "location" ? "Louer" : "Acheter"}
          </label>
        ))}
      </fieldset>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Commune</span>
          <select name="commune" className={champ} defaultValue="">
            <option value="">Toutes les communes</option>
            {COMMUNES_ABIDJAN.map((c) => (
              <option key={c.id} value={c.nom}>
                {c.nom}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Type de bien</span>
          <select name="type" className={champ} defaultValue="">
            <option value="">Tous les types</option>
            {TYPES_BIENS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-600">Budget maximum</span>
          <select name="prixMax" className={champ} defaultValue="" key={transaction}>
            {paliers.map((p) => (
              <option key={p.value || "tout"} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="h-12 self-end inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 text-[15px] font-semibold text-white hover:bg-slate-800 active:scale-[0.98] transition"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Rechercher
        </button>
      </div>
    </form>
  )
}
