import Link from "next/link"

const ETAPES = [
  {
    titre: "Cherchez",
    texte:
      "Choisissez la commune, le type de bien et votre budget. Chaque annonce indique le prix, le quartier, les photos et, s'il a été fourni, le titre foncier (ACD, CMP…).",
  },
  {
    titre: "Contactez l'annonceur",
    texte:
      "Sur la fiche du bien, écrivez sur WhatsApp ou appelez le propriétaire ou l'agence. Vous pouvez aussi demander une visite en ligne.",
  },
  {
    titre: "Visitez avant de payer",
    texte:
      "Ne versez jamais d'argent sans avoir vu le bien et les documents. L'acompte se règle directement avec l'annonceur, contre un reçu.",
  },
]

export default function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Comment ça marche</h2>

        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {ETAPES.map((e, i) => (
            <li key={e.titre} className="border-t-2 border-slate-900 pt-5">
              <span className="text-sm font-bold text-emerald-700">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{e.titre}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{e.texte}</p>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <p className="text-base font-bold text-amber-900">Anyilo ne vous demande jamais d&apos;argent.</p>
          <p className="mt-1 text-[15px] leading-relaxed text-amber-900/90">
            Si quelqu&apos;un vous demande de payer « via Anyilo », des frais de visite à l&apos;avance ou un acompte
            avant toute visite, c&apos;est une arnaque. Utilisez le bouton « Signaler cette annonce » sur la fiche du
            bien : notre équipe l&apos;examine.
          </p>
          <Link href="/biens" className="mt-3 inline-block text-sm font-semibold text-amber-900 underline underline-offset-4">
            Voir les annonces
          </Link>
        </div>
      </div>
    </section>
  )
}
