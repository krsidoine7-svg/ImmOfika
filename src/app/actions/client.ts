'use server'

import { db } from "@/lib/db"
import { profiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { uploadToR2 } from "@/lib/r2/client"

export async function updateProfileAction(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Non autorisé")

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const email = formData.get('email') as string
  const avatarFile = formData.get('avatar') as File | null
  
  let avatarUrl = undefined
  
  if (avatarFile && avatarFile.size > 0) {
    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    avatarUrl = await uploadToR2(buffer, avatarFile.name, avatarFile.type, 'avatars')
  }

  const updateData: any = {}
  if (fullName !== null && fullName !== undefined) updateData.fullName = fullName
  if (phone !== null && phone !== undefined) updateData.phone = phone
  if (avatarUrl) updateData.avatarUrl = avatarUrl

  if (email && email.trim() !== '' && email !== user.email) {
    const newEmail = email.trim().toLowerCase()
    const { error: authError } = await supabase.auth.updateUser({ email: newEmail })
    if (authError) {
      throw new Error(`Erreur lors du changement d'e-mail : ${authError.message}`)
    }
    updateData.email = newEmail
  }

  if (Object.keys(updateData).length > 0) {
    updateData.updatedAt = new Date()
    await db.update(profiles).set(updateData).where(eq(profiles.id, user.id))
  }

  revalidatePath('/client/dashboard')
  revalidatePath('/client/profil')
  revalidatePath('/admin')
  revalidatePath('/admin/profil')
}

export async function updateKycAction(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Non autorisé")

  const kycDocType = formData.get('kycDocType') as string
  const kycFile = formData.get('kycDoc') as File | null

  if (!kycDocType) throw new Error("Le type de pièce est requis")
  if (!kycFile || kycFile.size === 0) throw new Error("Le fichier de pièce d'identité est requis")

  const buffer = Buffer.from(await kycFile.arrayBuffer())
  const kycDocUrl = await uploadToR2(buffer, kycFile.name, kycFile.type, 'kyc')

  // Mettre à jour le profil avec kycRejectionReason à null
  await db.update(profiles).set({
    kycDocUrl,
    kycDocType,
    kycStatus: 'pending',
    kycRejectionReason: null,
    updatedAt: new Date()
  }).where(eq(profiles.id, user.id))

  // Récupérer le nom de l'utilisateur pour la notification
  const clientProfile = await db
    .select({ fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)
  const clientName = clientProfile[0]?.fullName || user.email?.split('@')[0]

  // Notifier tous les agents et administrateurs
  const { and, or, isNull } = await import("drizzle-orm")
  const { creerNotificationHelper } = await import("@/lib/notifications/service")
  
  const staffMembers = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(
        or(eq(profiles.role, 'admin'), eq(profiles.role, 'agent')),
        isNull(profiles.deletedAt)
      )
    )

  for (const staff of staffMembers) {
    await creerNotificationHelper(
      staff.id,
      'Pièce d\'identité KYC soumise',
      `Le client ${clientName} a téléversé un document KYC (${kycDocType}) pour validation.`,
      'system',
      '/admin/kyc'
    )
  }

  revalidatePath('/client/profil')
  revalidatePath('/client/dashboard')
}

export async function submitSuggestionAction(categorie: string, message: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Non autorisé")

  const { suggestions } = await import("@/lib/db/schema")
  const { envoyerEmailHelper } = await import("@/lib/notifications/service")

  await db.insert(suggestions).values({
    clientId: user.id,
    categorie,
    message,
    statut: 'recue'
  })

  // Envoyer un e-mail d'alerte à l'administrateur
  await envoyerEmailHelper(
    'support@favorcompany.ci',
    `[Suggestion] Nouvelle préoccupation client - ${categorie}`,
    `<p>Un client a soumis une suggestion dans la boîte à suggestions :</p>
     <p><strong>Catégorie :</strong> ${categorie}</p>
     <p><strong>Client ID :</strong> ${user.id}</p>
     <p><strong>Message :</strong> ${message}</p>`
  )

  revalidatePath('/client/suggestions')
}

export async function submitBienConfieAction(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Non autorisé")

  const { bienConfies } = await import("@/lib/db/schema")
  const { envoyerEmailHelper } = await import("@/lib/notifications/service")

  const typeService = formData.get('typeService') as string
  const ville = formData.get('ville') as string
  const quartier = formData.get('quartier') as string
  const surface = formData.get('surface') as string
  const titreFoncier = formData.get('titreFoncier') === 'true'
  const budget = formData.get('budget') as string
  const telephone = formData.get('telephone') as string

  if (!typeService || !ville || !telephone) {
    throw new Error("Les champs obligatoires (Service, Ville, Téléphone) doivent être remplis.")
  }

  await db.insert(bienConfies).values({
    clientId: user.id,
    typeService,
    ville,
    quartier,
    surface,
    titreFoncier,
    budget,
    telephone,
    statut: 'nouveau'
  })

  // Envoyer un e-mail d'alerte
  await envoyerEmailHelper(
    'support@immofika.ci',
    `[Confier un Bien] Nouveau bien soumis par un client`,
    `<p>Un client souhaite confier un bien immobilier à ImmOfika :</p>
     <ul>
       <li><strong>Type de Service :</strong> ${typeService}</li>
       <li><strong>Ville :</strong> ${ville}</li>
       <li><strong>Quartier :</strong> ${quartier || 'Non renseigné'}</li>
       <li><strong>Surface :</strong> ${surface || 'Non renseigné'} m²</li>
       <li><strong>Titre Foncier disponible :</strong> ${titreFoncier ? 'Oui' : 'Non'}</li>
       <li><strong>Budget estimé :</strong> ${budget || 'Non renseigné'} FCFA</li>
       <li><strong>Téléphone de contact :</strong> ${telephone}</li>
     </ul>`
  )

  revalidatePath('/client/confier')
}

export async function validateKycAction(
  clientId: string,
  status: 'verified' | 'none',
  reason?: string
) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Non autorisé")

  // Check if staff
  const staff = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)
  
  const userRole = staff[0]?.role
  if (userRole !== 'admin' && userRole !== 'agent' && userRole !== 'super_admin' && userRole !== 'tech_super_admin') {
    throw new Error("Action non autorisée")
  }

  // Update profile
  await db.update(profiles).set({
    kycStatus: status,
    kycRejectionReason: status === 'none' ? (reason || 'Fichier non lisible') : null,
    updatedAt: new Date()
  }).where(eq(profiles.id, clientId))

  // Retrieve client email
  const client = await db
    .select({ email: profiles.email, fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.id, clientId))
    .limit(1)

  const clientEmail = client[0]?.email
  const clientName = client[0]?.fullName || clientEmail?.split('@')[0]

  const { creerNotificationHelper, envoyerEmailHelper } = await import("@/lib/notifications/service")

  if (status === 'verified') {
    // Notify client (in-app)
    await creerNotificationHelper(
      clientId,
      '🎉 KYC Validé',
      'Votre pièce d\'identité a été validée avec succès par nos agents. Votre profil est désormais vérifié.',
      'system',
      '/client/profil'
    )
    
    // Notify client (email)
    if (clientEmail) {
      await envoyerEmailHelper(
        clientEmail,
        '🎉 Validation de votre pièce d\'identité - ImmOfika',
        `<p>Bonjour ${clientName},</p>
         <p>Nous avons le plaisir de vous informer que votre pièce d'identité a été validée par nos agents.</p>
         <p>Votre profil est désormais certifié "Vérifié". Vous pouvez procéder en toute sérénité à la signature électronique de vos contrats officiels.</p>
         <p>L'équipe ImmOfika</p>`
      )
    }
  } else {
    // Notify client (in-app)
    await creerNotificationHelper(
      clientId,
      '❌ KYC Rejeté',
      `Votre pièce d'identité a été rejetée pour le motif suivant : ${reason || 'Fichier non lisible'}. Veuillez la réuploader.`,
      'system',
      '/client/profil'
    )

    // Notify client (email)
    if (clientEmail) {
      await envoyerEmailHelper(
        clientEmail,
        '❌ Rejet de votre pièce d\'identité - ImmOfika',
        `<p>Bonjour ${clientName},</p>
         <p>Après examen, nos agents ont dû rejeter votre pièce d'identité pour le motif suivant :</p>
         <blockquote style="border-left: 3px solid #EF4444; padding-left: 10px; color: #7F1D1D;">
           <strong>${reason || 'Fichier non lisible ou flou'}</strong>
         </blockquote>
         <p>Veuillez vous connecter à votre espace client et charger un nouveau document lisible (au format image ou PDF, recto-verso) depuis l'onglet profil.</p>
         <p><a href="https://immofika.ci/client/profil">Se connecter à mon Espace Client</a></p>
         <p>L'équipe ImmOfika</p>`
      )
    }
  }

  revalidatePath('/client/dashboard')
  revalidatePath('/client/profil')
  revalidatePath('/admin/kyc')
}
