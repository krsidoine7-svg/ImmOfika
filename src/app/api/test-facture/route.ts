import { NextResponse } from 'next/server'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { paiements } from '@/lib/db/schema'
import { genererEtEnvoyerFacture } from '@/lib/factures/genererFacture'

const pgClient = postgres(process.env.DATABASE_URL!)
const db = drizzle(pgClient)

export async function GET() {
  try {
    const allPaiements = await db.select().from(paiements).limit(1)
    
    if (allPaiements.length === 0) {
      return NextResponse.json({ error: 'Aucun paiement trouvé dans la base de données.' }, { status: 400 })
    }
    
    const payment = allPaiements[0]
    console.log(`[Test] Lancement de la génération pour le paiement : ${payment.id}`)
    
    const result = await genererEtEnvoyerFacture(payment.id)
    return NextResponse.json({ success: true, paymentId: payment.id, result })
  } catch (error: any) {
    console.error('[Test Error]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
