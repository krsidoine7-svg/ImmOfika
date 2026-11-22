import Image from "next/image"
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

/**
 * Vraies photos d'Abidjan (Wikimedia Commons, licences libres avec attribution).
 * Elles montrent la ville, pas des biens proposés sur Anyilo.
 */
const PHOTOS = [
  {
    src: "/hero/abidjan-plateau-lagune.webp",
    alt: "Le Plateau et la lagune Ébrié vus depuis le pont Alassane-Ouattara, Abidjan",
    auteur: "Edison McCullen",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Le_Plateau_depuis_le_Pont_ADO_%E2%80%93_Abidjan.jpg",
  },
  {
    src: "/hero/abidjan-riviera-golf.webp",
    alt: "Immeubles résidentiels et palmiers à la Riviera Golf, Cocody",
    auteur: "Willy Stephane Awaho",
    licence: "CC BY 2.0",
    licenceUrl: "https://creativecommons.org/licenses/by/2.0",
    source: "https://commons.wikimedia.org/wiki/File:Copropri%C3%A9t%C3%A9s_Abidjan_Rivi%C3%A9ra_Golf.jpg",
  },
  {
    src: "/hero/abidjan-riviera-coucher-soleil.webp",
    alt: "Coucher de soleil sur les quartiers de la Riviera, Abidjan",
    auteur: "Georges Hermann Njiale Njiale",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    source: "https://commons.wikimedia.org/wiki/File:Sunset_abidjan.jpg",
  },
]

export default function HeroSection({ data }: HeroSectionProps) {
  const title = data?.title || "Trouvez où vivre à Abidjan."
  const subtitle =
    data?.subtitle ||
    "Maisons, appartements et terrains à louer ou à acheter, publiés par des propriétaires et des agences. Comparez, contactez, visitez."

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 pt-28 pb-10 md:pt-36 md:pb-12">
      {/* Photos en fondu */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {PHOTOS.map((p, i) => (
          <Image
            key={p.src}
            src={p.src}
            alt=""
            fill
            sizes="100vw"
            priority={i === 0}
            quality={70}
            className={`hero-photo hero-photo-${i + 1} object-cover ${i === 0 ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {/* Voile pour garder le texte lisible sur toutes les photos */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/80" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200 sm:text-lg">{subtitle}</p>

        <div className="mt-8 rounded-xl bg-white p-4 shadow-2xl shadow-black/30 sm:p-5">
          <HomeSearchForm />
        </div>

        <ul className="mt-6 grid gap-2 text-sm text-slate-100 sm:grid-cols-3 sm:gap-4">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[11px] leading-relaxed text-slate-400">
          Photos d&apos;Abidjan :{" "}
          {PHOTOS.map((p, i) => (
            <span key={p.src}>
              <a href={p.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-200">
                {p.auteur}
              </a>{" "}
              (
              <a href={p.licenceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-slate-200">
                {p.licence}
              </a>
              ){i < PHOTOS.length - 1 ? ", " : ""}
            </span>
          ))}
          , via Wikimedia Commons.
        </p>
      </div>
    </section>
  )
}
