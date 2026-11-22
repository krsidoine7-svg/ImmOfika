import { Check } from "lucide-react"
import HomeSearchForm from "@/components/public/HomeSearchForm"

interface HeroSectionProps {
  data?: { title?: string; subtitle?: string }
}

/** Faits vérifiables dans le produit : rien d'autre n'est affirmé ici. */
const POINTS = [
  "Chaque annonce est relue par notre équipe avant d'être publiée",
  "Vous contactez l'annonceur directement, par WhatsApp ou par téléphone",
  "Anyilo ne vous demande jamais d'argent",
]

export default function HeroSection({ data }: HeroSectionProps) {
  const title = data?.title || "Trouvez où vivre à Abidjan."
  const subtitle =
    data?.subtitle ||
    "Maisons, appartements et terrains à louer ou à acheter, publiés par des propriétaires et des agences. Comparez, contactez, visitez."

  return (
    <section className="border-b border-slate-100 bg-white pt-28 pb-14 md:pt-36 md:pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">{subtitle}</p>

        <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <HomeSearchForm />
        </div>

        <ul className="mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-3 sm:gap-4">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
