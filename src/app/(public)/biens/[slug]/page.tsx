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
    .select('titre, description, ville, type, prix, main_image_url')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (!bien) return { title: 'Bien introuvable' }

  const formattedPrix = typeof bien.prix === 'number' ? new Intl.NumberFormat('fr-FR').format(bien.prix) : bien.prix
  const seoTitle = `${bien.titre} à ${bien.ville || 'Côte d\'Ivoire'} (${formattedPrix} FCFA)`
  const seoDescription = `${bien.titre} à ${bien.ville || 'Côte d\'Ivoire'} — ${bien.description.slice(0, 120)}... Offre certifiée par Favor Company International, Promoteur Immobilier Agréé pour l'aménagement foncier et la construction.`

  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: `${seoTitle} | Promoteur Immobilier Agréé`,
      description: seoDescription,
      images: bien.main_image_url ? [{ url: bien.main_image_url, alt: bien.titre }] : [],
    },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BienDetailPage({ params }: PageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Récupérer le bien
  const { data: bien, error } = await supabase
    .from('biens')
    .select('*')
    .eq('slug', slug)
    .is('deleted_at', null)
    .single()

  if (error || !bien) notFound()

  // Incrémenter les vues (fire & forget) + afficher la valeur +1 immédiatement
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

  // Récupérer les biens suggérés (même type, toutes villes — pas de filtre ville pour maximiser les résultats)
  const { data: suggeres } = await supabase
    .from('biens')
    .select('id, slug, titre, prix, type, transaction, ville, quartier, surface, chambres, main_image_url, statut')
    .neq('id', bien.id)
    .eq('type', bien.type)
    .is('deleted_at', null)
    .limit(3)

  // Vérifier si connecté + si favori
  const { data: { user } } = await supabase.auth.getUser()
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F6F1] pt-20">
        <BienDetailClient
          bien={bien}
          images={images ?? []}
          isFavori={isFavori}
          isConnected={!!user}
        />
        {suggeres && suggeres.length > 0 && (
          <BiensSuggeres biens={suggeres} />
        )}
      </main>
      <Footer />
    </>
  )
}
