import { db } from "@/lib/db"
import { contractTemplates } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { TemplatesManagerClient } from "@/components/admin/TemplatesManagerClient"
import { requireAdminAccess } from "@/lib/auth/permissions"

export const metadata = {
  title: "Modèles de Contrats Word (.docx) - Admin Favor Company",
}

export default async function ContractTemplatesPage() {
  await requireAdminAccess()

  const allTemplates = await db
    .select()
    .from(contractTemplates)
    .orderBy(desc(contractTemplates.createdAt))

  return <TemplatesManagerClient initialTemplates={allTemplates} />
}
