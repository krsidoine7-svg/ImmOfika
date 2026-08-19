import * as React from 'react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/public/Footer'
import ContactForm from '@/components/public/ContactForm'
import { db } from '@/lib/db'
import { biens } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import type { Metadata } from 'next'

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Contactez-nous — ImmOfika',
  description: "Prenez contact avec l'équipe ImmOfika pour concrétiser votre projet d'acquisition, de vente, de location ou de promotion immobilière à Abidjan.",
  openGraph: {
    title: 'Contactez-nous — ImmOfika',
    description: "Prenez contact avec l'équipe ImmOfika pour concrétiser votre projet d'acquisition, de vente, de location ou de promotion immobilière à Abidjan.",
  },
}

interface PageProps {
  searchParams: Promise<{ bienId?: string }>
}

export default async function ContactPage({ searchParams }: PageProps) {
  const params = await searchParams
  const bienId = params.bienId

  let bienData = null

  if (bienId) {
    try {
      const [fetchedBien] = await db
        .select({
          id: biens.id,
          titre: biens.titre,
          prix: biens.prix,
          transaction: biens.transaction,
          ville: biens.ville,
          mainImageUrl: biens.mainImageUrl,
        })
        .from(biens)
        .where(
          and(
            eq(biens.id, bienId),
            isNull(biens.deletedAt)
          )
        )
        .limit(1)

      if (fetchedBien) {
        bienData = fetchedBien
      }
    } catch (err) {
      console.error('Erreur lors du chargement des infos du bien pour contact:', err)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <ContactForm bien={bienData} />
      </main>
      <Footer />
    </>
  )
}
