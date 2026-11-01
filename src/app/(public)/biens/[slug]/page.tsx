import * as React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import BienDetailClient from '@/components/biens/BienDetailClient'
import BiensSuggeres from '@/components/biens/BiensSuggeres'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: bien } = await supabase
    .from('biens')
    .select('titre, description, ville, quartier, type, transaction, prix, main_image_url, type_titre_propriete')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!bien) return { title: 'Bien introuvable — ImmOfika' }

  const formattedPrix =
    typeof bien.prix === 'number'
      ? new Intl.NumberFormat('fr-CI').format(bien.prix)
      : Number(bien.prix).toLocaleString('fr-CI')
  const localisation = [bien.quartier, bien.ville || 'Abidjan'].filter(Boolean).join(', ')
  const titreBadge = bien.type_titre_propriete ? `[${bien.type_titre_propriete.toUpperCase()}] ` : ''

  const seoTitle = `${titreBadge}${bien.titre} à ${localisation} (${formattedPrix} FCFA)`
  const seoDescription = `${bien.titre} — ${bien.transaction === 'location' ? 'À louer' : 'À vendre'} à ${localisation}. Prix : ${formattedPrix} FCFA. Annonce vérifiée sur ImmOfika, marketplace immobilière sécurisée à Abidjan.`

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      bien.type,
      bien.transaction,
      bien.ville,
      bien.quartier,
      'immobilier Abidjan',
      'ACD',
      'titre foncier',
      'ImmOfika',
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${seoTitle} | ImmOfika`,
      description: seoDescription,
      url: `https://immofika.ci/biens/${slug}`,
      siteName: 'ImmOfika',
      locale: 'fr_CI',
      type: 'article',
      images: bien.main_image_url
        ? [
            {
              url: bien.main_image_url,
              width: 1200,
              height: 630,
              alt: bien.titre,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: bien.main_image_url ? [bien.main_image_url] : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BienDetailPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Récupérer le bien avec son organisation annonceur
  const { data: bien, error } = await supabase
    .from('biens')
    .select(`
      *,
      organization:organizations(id, name, slug, type, agrement_numero, logo_url, telephone, whatsapp, email, ville, commune, adresse, verified_at)
    `)
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error || !bien) notFound()

  // Incrémenter les vues (fire & forget)
  const vuesActuelles = (bien.vues ?? 0) + 1
  supabase
    .from('biens')
    .update({ vues: vuesActuelles, updated_at: new Date().toISOString() })
    .eq('id', bien.id)
    .then(() => {})
  bien.vues = vuesActuelles

  // Récupérer les images additionnelles
  const { data: images } = await supabase
    .from('bien_images')
    .select('*')
    .eq('bien_id', bien.id)
    .order('order', { ascending: true })

  // Récupérer les biens suggérés (même type)
  const { data: suggeres } = await supabase
    .from('biens')
    .select('id, slug, titre, prix, type, transaction, ville, quartier, surface, chambres, main_image_url, statut, type_titre_propriete')
    .neq('id', bien.id)
    .eq('type', bien.type)
    .is('deleted_at', null)
    .eq('statut_moderation', 'valide')
    .limit(3)

  // Vérifier si connecté + si favori
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let isFavori = false
  if (user) {
    const { data: fav } = await supabase
      .from('favoris')
      .select('id')
      .eq('bien_id', bien.id)
      .eq('client_id', user.id)
      .single()
    isFavori = !!fav
  }

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: bien.titre,
    description: bien.description,
    url: `https://immofika.ci/biens/${bien.slug}`,
    image: bien.main_image_url ? [bien.main_image_url] : [],
    offers: {
      '@type': 'Offer',
      price: bien.prix,
      priceCurrency: 'XOF',
      availability:
        bien.statut === 'disponible' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      businessFunction:
        bien.transaction === 'location' ? 'https://schema.org/LeaseOut' : 'https://schema.org/Sell',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: bien.ville || 'Abidjan',
      addressRegion: bien.quartier || 'Abidjan',
      addressCountry: 'CI',
    },
    ...(bien.latitude && bien.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: Number(bien.latitude),
            longitude: Number(bien.longitude),
          },
        }
      : {}),
  }

  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-slate-50/50 pt-20">
        <BienDetailClient
          bien={bien}
          images={images ?? []}
          isFavori={isFavori}
          isConnected={!!user}
        />
        {suggeres && suggeres.length > 0 && <BiensSuggeres biens={suggeres} />}
      </main>
      <Footer />
    </>
  )
}
