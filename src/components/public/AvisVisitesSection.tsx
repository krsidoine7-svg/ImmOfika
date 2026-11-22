import { getPublicAvisTemoignages } from "@/app/actions/visiteAvis"

/**
 * Avis réels laissés par des clients après une visite (table visite_avis).
 * Aucun avis n'est écrit en dur : sans avis en base, la section n'apparaît pas.
 */
export default async function AvisVisitesSection() {
  const avis = await getPublicAvisTemoignages()
  if (avis.length === 0) return null

  return (
    <section className="border-t border-slate-100 bg-slate-50 py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Avis après visite</h2>
        <p className="mt-3 max-w-2xl text-[15px] text-slate-600">
          Laissés par des clients après une visite organisée sur Anyilo. Les avis de 4 étoiles et plus sont publiés
          automatiquement.
        </p>

        <ul className="mt-10 grid gap-5 md:grid-cols-2">
          {avis.map((a) => (
            <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-sm font-semibold text-emerald-700" aria-label={`Note : ${a.note} sur 5`}>
                {"★".repeat(a.note)}
                <span className="text-slate-300">{"★".repeat(Math.max(0, 5 - a.note))}</span>
              </p>
              <blockquote className="mt-3 text-[15px] leading-relaxed text-slate-800">{a.commentaire}</blockquote>
              <p className="mt-4 text-sm text-slate-500">
                {a.auteur} · {new Date(a.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
