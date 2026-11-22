import Link from "next/link"

interface CtaSectionProps {
  data?: { title?: string; description?: string; button_label?: string; button_link?: string }
}

/** Appel aux annonceurs : propriétaires, agences et promoteurs. */
export default function CtaSection({ data }: CtaSectionProps) {
  const title = data?.title || "Vous louez ou vendez un bien ?"
  const description =
    data?.description ||
    "Publiez votre annonce. Notre équipe la vérifie avant sa mise en ligne, puis les personnes intéressées vous contactent directement par WhatsApp ou par téléphone."
  const buttonLabel = data?.button_label || "Publier une annonce"
  const buttonLink = data?.button_link || "/biens/publier"

  return (
    <section className="bg-slate-900 py-20 md:py-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-300">{description}</p>
        </div>
        <Link
          href={buttonLink}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500 px-6 text-[15px] font-semibold text-white hover:bg-emerald-400 active:scale-[0.98] transition"
        >
          {buttonLabel}
        </Link>
      </div>
    </section>
  )
}
