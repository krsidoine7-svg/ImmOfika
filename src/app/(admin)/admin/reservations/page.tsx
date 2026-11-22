import { db } from "@/lib/db"
import { reservations, biens, profiles } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { updateReservationStatusAction } from "@/app/actions/adminReservations"
import { AdminReservationsClient } from "@/components/admin/AdminReservationsClient"

export const metadata = {
  title: "Réservations - Admin Anyilo",
}

export default async function AdminReservationsPage() {
  const allReservations = await db
    .select({
      id: reservations.id,
      statut: reservations.statut,
      createdAt: reservations.createdAt,
      bienTitre: biens.titre,
      clientName: profiles.fullName,
      clientEmail: profiles.email,
    })
    .from(reservations)
    .leftJoin(biens, eq(reservations.bienId, biens.id))
    .leftJoin(profiles, eq(reservations.clientId, profiles.id))
    .orderBy(desc(reservations.createdAt))

  return (
    <AdminReservationsClient
      reservationsList={allReservations}
      updateStatusAction={updateReservationStatusAction}
    />
  )
}
