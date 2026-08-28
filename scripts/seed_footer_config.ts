import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!)

async function seedFooterConfig() {
  console.log("=== 🚀 ENREGISTREMENT DES COORDONNÉES EN BASE DE DONNÉES ===")

  const footerContent = {
    newsletter_title: "Restez informé des opportunités immobilières",
    newsletter_badge: "Rejoignez notre communauté",
    newsletter_description: "Recevez en avant-première nos nouvelles annonces et opportunités d'investissement.",
    tagline: "Ton chez-toi garanti, zéro palabre !",
    description: "Solution complète d'achat, de vente, de location et de promotion immobilière agréée.",
    facebook_link: "",
    address: "Yahou, immeuble en face de la maison blanche, au 2ie",
    address_link: "https://maps.google.com/?q=Yahou+immeuble+en+face+de+la+maison+blanche+au+2ie",
    whatsapp_number: "+225 01 03 13 28 78",
    whatsapp_link: "https://wa.me/2250103132878",
    phone_fixe: "+225 27 24 37 01 55 (Fixe)",
    phone_mobile: "+225 07 47 63 17 06 (Mobile)",
    email: "ImmOfika@gmail.com"
  }

  const existing = await sql`SELECT id FROM public.homepage_configs WHERE section = 'footer';`

  if (existing.length > 0) {
    await sql`
      UPDATE public.homepage_configs
      SET content = ${sql.json(footerContent)},
          updated_at = now(),
          deleted_at = NULL
      WHERE section = 'footer';
    `
    console.log("✅ Configuration 'footer' mise à jour avec succès dans DB !")
  } else {
    await sql`
      INSERT INTO public.homepage_configs (section, content, created_at, updated_at)
      VALUES ('footer', ${sql.json(footerContent)}, now(), now());
    `
    console.log("✅ Section 'footer' insérée avec succès dans DB !")
  }

  await sql.end()
}

seedFooterConfig()
