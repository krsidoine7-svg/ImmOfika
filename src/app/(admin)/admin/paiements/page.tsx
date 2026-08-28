import { db } from "@/lib/db/index"
import { paiements, profiles } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { AdminPaiementsClient } from "@/components/admin/AdminPaiementsClient"

export const metadata = {
  title: "Historique des Paiements - Admin ImmOfika",
}

export default async function AdminPaiementsPage() {
  await requirePermission('view:paiements')

  const allPaiements = await db
    .select({
      id: paiements.id,
      montant: paiements.montant,
      statut: paiements.statut,
      factureNumero: paiements.factureNumero,
      factureUrl: paiements.factureUrl,
      paystackChannel: paiements.paystackChannel,
      paidAt: paiements.paidAt,
      clientName: profiles.fullName,
      clientEmail: profiles.email,
    })
    .from(paiements)
    .leftJoin(profiles, eq(paiements.clientId, profiles.id))
    .orderBy(desc(paiements.createdAt))

  return <AdminPaiementsClient paiementsList={allPaiements} />
}
