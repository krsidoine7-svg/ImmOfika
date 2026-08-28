"use client"

import * as React from "react"
import { Building, MapPin, ExternalLink, Tag } from "lucide-react"
import Link from "next/link"

interface GalleryViewProps {
  data: Record<string, any>[]
}

export function GalleryView({ data }: GalleryViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto h-full pr-1">
      {data.map((item) => {
        const imageUrl =
          item.mainImageUrl ||
          item.image ||
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800"

        return (
          <div
            key={item.id}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col group"
          >
            {/* Image d'illustration */}
            <div className="relative h-40 w-full overflow-hidden bg-slate-100 dark:bg-zinc-800">
              <img
                src={imageUrl}
                alt={item.titre || item.nom || "Bien"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-md capitalize">
                  {item.statut || "Actif"}
                </span>
              </div>
              {item.transaction && (
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/90 dark:bg-zinc-900/90 text-slate-900 dark:text-white shadow-xs capitalize">
                    {item.transaction}
                  </span>
                </div>
              )}
            </div>

            {/* Contenu de la carte */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {item.titre || item.nom || item.numero || "Enregistrement"}
                </h4>
                {item.ville && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    {item.ville} {item.quartier ? `(${item.quartier})` : ""}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  {item.prix ? (
                    <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                      {Number(item.prix).toLocaleString("fr-FR")} FCFA
                    </span>
                  ) : item.type ? (
                    <span className="text-xs text-slate-500 capitalize flex items-center gap-1">
                      <Tag className="h-3 w-3 text-emerald-600" />
                      {item.type}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </div>

                {item.slug && (
                  <Link
                    href={`/biens/${item.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                    title="Voir la fiche"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {data.length === 0 && (
        <div className="col-span-full py-16 text-center text-xs text-slate-400 italic">
          Aucun élément à afficher en galerie.
        </div>
      )}
    </div>
  )
}
