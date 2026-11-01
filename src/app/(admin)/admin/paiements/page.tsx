import { db } from "@/lib/db/index"
import { paiements, profiles } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { requirePermission } from "@/lib/auth/permissions"
import { AdminPaiementsClient } from "@/components/admin/AdminPaiementsClient"

export const metadata = {
  title: "Historique des Paiements & FNE - Admin ImmOfika",
}

export default async function AdminPaiementsPage() {
  await requirePermission('facture:voir/exporter')

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
      fneNumero: paiements.fneNumero,
      fneType: paiements.fneType,
      fneStatut: paiements.fneStatut,
      fneQrData: paiements.fneQrData,
      fneCertifieLe: paiements.fneCertifieLe,
    })
    .from(paiements)
    .leftJoin(profiles, eq(paiements.clientId, profiles.id))
    .orderBy(desc(paiements.createdAt))

  return <AdminPaiementsClient paiementsList={allPaiements} />
}
