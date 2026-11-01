import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getSecureR2Object, R2_PUBLIC_URL } from '@/lib/r2/client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    if (!userId) {
      return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 })
    }

    // 1. Vérification d'authentification
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié. Veuillez vous connecter.' },
        { status: 401 }
      )
    }

    // 2. Vérification du profil et des permissions
    const [currentUserProfile] = await db
      .select({ role: profiles.role, deletedAt: profiles.deletedAt })
      .from(profiles)
      .where(eq(profiles.id, user.id))

    if (!currentUserProfile || currentUserProfile.deletedAt || currentUserProfile.role === 'suspended') {
      return NextResponse.json({ error: 'Compte inactif ou suspendu' }, { status: 403 })
    }

    const role = currentUserProfile.role as string
    const isStaff = role?.includes('admin') || role === 'agent'
    const isOwner = user.id === userId

    if (!isStaff && !isOwner) {
      return NextResponse.json(
        { error: 'Accès interdit : vous n\'êtes pas autorisé à consulter cette pièce d\'identité.' },
        { status: 403 }
      )
    }

    // 3. Récupérer le document KYC de l'utilisateur cible
    const [targetProfile] = await db
      .select({
        kycDocUrl: profiles.kycDocUrl,
        kycDocType: profiles.kycDocType,
      })
      .from(profiles)
      .where(eq(profiles.id, userId))

    if (!targetProfile || !targetProfile.kycDocUrl) {
      return NextResponse.json({ error: 'Aucun document KYC trouvé pour cet utilisateur' }, { status: 404 })
    }

    // 4. Déterminer la clé du fichier
    const queryKey = request.nextUrl.searchParams.get('file')
    let fileKey = queryKey

    if (!fileKey) {
      const rawUrl = targetProfile.kycDocUrl
      if (rawUrl.startsWith('private/') || rawUrl.startsWith('kyc/')) {
        fileKey = rawUrl
      } else if (R2_PUBLIC_URL && rawUrl.includes(R2_PUBLIC_URL)) {
        fileKey = rawUrl.replace(`${R2_PUBLIC_URL}/`, '')
      } else if (rawUrl.includes('/api/kyc/')) {
        try {
          const parsed = new URL(rawUrl, 'http://localhost')
          fileKey = parsed.searchParams.get('file')
        } catch {
          // ignore
        }
      }
    }

    if (!fileKey) {
      return NextResponse.json({ error: 'Fichier introuvable ou mal configuré' }, { status: 404 })
    }

    // 5. Récupérer le flux sécurisé depuis R2
    const s3Response = await getSecureR2Object(fileKey)
    if (!s3Response.Body) {
      return NextResponse.json({ error: 'Contenu du document inaccessible' }, { status: 404 })
    }

    const contentType = s3Response.ContentType || 'application/octet-stream'
    const byteArray = await s3Response.Body.transformToByteArray()
    const buffer = Buffer.from(byteArray)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'inline',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('[Secure KYC Stream Error]', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération sécurisée du document' },
      { status: 500 }
    )
  }
}
