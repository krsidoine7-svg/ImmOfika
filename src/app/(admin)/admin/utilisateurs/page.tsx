import { db } from "@/lib/db/index"
import { profiles, leads, reservations } from "@/lib/db/schema"
import { desc, eq, ne, inArray, and, isNull } from "drizzle-orm"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { AdminUsersClient } from "@/components/admin/AdminUsersClient"

export const metadata = {
  title: "Gestion des Utilisateurs - Admin Favor Company",
}

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  let currentUserRole = 'client'
  const currentUserId = user?.id

  if (user) {
    const [profile] = await db
      .select({ role: profiles.role })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)
    
    if (profile) {
      currentUserRole = profile.role
    }
  }

  // 1. Récupérer tous les agents commerciaux pour le filtre d'affiliation
  const agentsList = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
    })
    .from(profiles)
    .where(
      and(
        inArray(profiles.role, ['admin_agent', 'agent', 'admin', 'admin_manager']),
        isNull(profiles.deletedAt)
      )
    )

  let usersList: any[] = []

  // 2. Application des règles d'accès RBAC
  if ((currentUserRole === 'admin_agent' || currentUserRole === 'agent') && currentUserId) {
    // Agent Commercial : VOIR UNIQUEMENT LES CLIENTS AFFILIÉS À CET AGENT
    const agentLeads = await db
      .select({ email: leads.email })
      .from(leads)
      .where(and(eq(leads.agentId, currentUserId), isNull(leads.deletedAt)))

    const agentReservations = await db
      .select({ clientId: reservations.clientId })
      .from(reservations)
      .where(isNull(reservations.deletedAt))

    const leadEmails = agentLeads.map((l) => l.email).filter(Boolean) as string[]
    const reservationClientIds = agentReservations.map((r) => r.clientId).filter(Boolean) as string[]

    const filters = []
    if (leadEmails.length > 0) filters.push(inArray(profiles.email, leadEmails))
    if (reservationClientIds.length > 0) filters.push(inArray(profiles.id, reservationClientIds))

    if (filters.length > 0) {
      usersList = await db
        .select()
        .from(profiles)
        .where(and(eq(profiles.role, 'client'), isNull(profiles.deletedAt)))
        .orderBy(desc(profiles.createdAt))
    } else {
      usersList = []
    }
  } else if (currentUserRole === 'admin' || currentUserRole === 'admin_manager') {
    // Admin / Admin Manager : VOIT TOUS LES UTILISATEURS SAUF TECH_SUPER_ADMIN ET SUPER_ADMIN
    usersList = await db
      .select()
      .from(profiles)
      .where(and(
        ne(profiles.role, 'tech_super_admin'),
        ne(profiles.role, 'super_admin'),
        isNull(profiles.deletedAt)
      ))
      .orderBy(desc(profiles.createdAt))
  } else {
    // Super Admin & Tech Super Admin : VOIENT TOUS LES COMPTES SANS RESTRICTION
    usersList = await db.select().from(profiles).orderBy(desc(profiles.createdAt))
  }

  // 3. Construire le mapping email → agentId depuis les leads
  const allLeadAffiliations = await db
    .select({ email: leads.email, agentId: leads.agentId })
    .from(leads)
    .where(isNull(leads.deletedAt))

  const emailToAgentMap: Record<string, string> = {}
  for (const l of allLeadAffiliations) {
    if (l.email && l.agentId) {
      emailToAgentMap[l.email] = l.agentId
    }
  }

  // Enrichir chaque user avec son agent affilié
  const enrichedUsersList = usersList.map((u: any) => ({
    ...u,
    affiliatedAgentId: emailToAgentMap[u.email] || null,
  }))

  return (
    <AdminUsersClient
      usersList={enrichedUsersList}
      agentsList={agentsList}
      currentUserRole={currentUserRole}
    />
  )
}
