import Link from "next/link"

interface FaqItem {
  question: string
  answer: string
}

interface FaqSectionProps {
  data?: { title?: string; faqs?: FaqItem[] }
}

/** Réponses limitées à ce que la plateforme fait réellement. */
const DEFAULT_FAQS: FaqItem[] = [
  {
    question: "Dois-je payer quelque chose à Anyilo ?",
    answer:
      "Non. La recherche et le contact des annonceurs sont gratuits pour vous. Anyilo n'encaisse aucun paiement : l'acompte et le loyer se règlent directement avec l'annonceur, contre un reçu.",
  },
  {
    question: "Comment les annonces sont-elles vérifiées ?",
    answer:
      "Chaque annonce publiée par un propriétaire ou une agence est relue par notre équipe avant sa mise en ligne. Si l'annonceur a fourni un titre foncier (ACD, CMP, arrêté…), son type est indiqué sur l'annonce. Une vérification ne remplace pas votre visite : voyez toujours le bien et les documents originaux.",
  },
  {
    question: "Comment contacter le propriétaire ou l'agence ?",
    answer:
      "Sur la fiche du bien, utilisez le bouton WhatsApp ou le numéro de téléphone de l'annonceur. Vous pouvez aussi demander une visite en ligne.",
  },
  {
    question: "Une annonce me semble fausse. Que faire ?",
    answer:
      "Ne versez pas d'argent et cliquez sur « Signaler cette annonce » sur la fiche du bien. Notre équipe examine chaque signalement et retire les annonces frauduleuses.",
  },
  {
    question: "Je suis propriétaire ou agence : comment publier ?",
    answer:
      "Créez un compte en choisissant votre profil (propriétaire, agence ou promoteur), puis publiez votre annonce depuis « Publier une annonce ». Elle apparaît après vérification par notre équipe.",
  },
]

export default function FaqSection({ data }: FaqSectionProps) {
  const title = data?.title || "Questions fréquentes"
  const items = data?.faqs && data.faqs.length > 0 ? data.faqs : DEFAULT_FAQS

  return (
    <section id="faq" className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>

        <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
          {items.map((f) => (
            <details key={f.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-base font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {f.question}
                <span aria-hidden="true" className="mt-0.5 text-xl leading-none text-slate-400 group-open:hidden">+</span>
                <span aria-hidden="true" className="mt-0.5 hidden text-xl leading-none text-slate-400 group-open:inline">−</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{f.answer}</p>
            </details>
          ))}
        </div>

        <p className="mt-6 text-sm text-slate-600">
          Une autre question ?{" "}
          <Link href="/contact" className="font-semibold text-emerald-700 underline underline-offset-4">
            Écrivez-nous
          </Link>
        </p>
      </div>
    </section>
  )
}
