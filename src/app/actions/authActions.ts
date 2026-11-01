'use server'

import { headers, cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { checkRateLimit } from '@/lib/security/rateLimiter'
import { logAuditEvent } from '@/lib/audit/logger'
import { getSafeRedirectUrl } from '@/lib/roles'
import { z } from 'zod'
import { PasswordPolicySchema } from '@/lib/auth/passwordPolicy'

export interface ResetPasswordResult {
  success: boolean
  error?: string
}

export async function requestPasswordResetAction(
  email: string,
  redirectTo?: string
): Promise<ResetPasswordResult> {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Adresse e-mail invalide.' }
  }

  const cleanEmail = email.trim().toLowerCase()

  // 1. Détection de l'IP client
  const headerStore = await headers()
  const clientIp =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'

  // 2. Rate limiting par IP (max 3 demandes / 15 minutes)
  const ipLimit = await checkRateLimit(`pwd-reset-ip:${clientIp}`, {
    limit: 3,
    windowSeconds: 900,
  })

  if (!ipLimit.success) {
    await logAuditEvent({
      action: 'security.rate_limit_exceeded',
      entity: 'auth',
      details: { route: 'forgot-password', ip: clientIp, email: cleanEmail },
    })
    return {
      success: false,
      error: 'Trop de tentatives depuis votre adresse IP. Veuillez patienter 15 minutes avant de réessayer.',
    }
  }

  // 3. Rate limiting par compte email (max 2 demandes / 15 minutes)
  const emailLimit = await checkRateLimit(`pwd-reset-email:${cleanEmail}`, {
    limit: 2,
    windowSeconds: 900,
  })

  if (!emailLimit.success) {
    return {
      success: false,
      error: 'Un lien de réinitialisation a déjà été envoyé récemment pour cette adresse. Veuillez patienter quelques minutes.',
    }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const defaultUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const targetRedirect = redirectTo || `${defaultUrl}/auth/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: targetRedirect,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    await logAuditEvent({
      action: 'auth.password_reset_requested',
      entity: 'auth',
      details: { email: cleanEmail },
    })

    return { success: true }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erreur technique lors de la demande.'
    return { success: false, error: errMsg }
  }
}

export interface VerifyOtpResult {
  success: boolean
  roleRedirect?: string
  error?: string
}

export async function verifyOtpAction(identifier: string, token: string): Promise<VerifyOtpResult> {
  if (!identifier || !token) {
    return { success: false, error: 'Identifiant et code de vérification requis.' }
  }

  const cleanIdentifier = identifier.trim()
  const cleanToken = token.trim()

  // 1. Détection de l'IP client
  const headerStore = await headers()
  const clientIp =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'

  // 2. Rate limiting anti-brute force sur le code OTP (5 essais max / 10 minutes)
  const otpLimit = await checkRateLimit(`otp-verify:${clientIp}:${cleanIdentifier}`, {
    limit: 5,
    windowSeconds: 600,
  })

  if (!otpLimit.success) {
    await logAuditEvent({
      action: 'security.otp_brute_force_blocked',
      entity: 'auth',
      details: { identifier: cleanIdentifier, ip: clientIp },
    })
    return {
      success: false,
      error: 'Nombre maximal de tentatives atteint. Votre accès est temporairement bloqué pendant 10 minutes.',
    }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const isPhone = cleanIdentifier.startsWith('+')
    const { data, error } = isPhone
      ? await supabase.auth.verifyOtp({ phone: cleanIdentifier, token: cleanToken, type: 'sms' })
      : await supabase.auth.verifyOtp({ email: cleanIdentifier, token: cleanToken, type: 'email' })

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Code de vérification invalide ou expiré.' }
    }

    // Récupérer le rôle pour déterminer la redirection sécurisée
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role || 'client'
    const roleRedirect = getSafeRedirectUrl(null, role)

    await logAuditEvent({
      userId: data.user.id,
      userRole: role,
      action: 'auth.otp_verified',
      entity: 'auth',
      details: { identifier: cleanIdentifier },
    })

    return { success: true, roleRedirect }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Erreur de vérification OTP.'
    return { success: false, error: errMsg }
  }
}

export interface LoginResult {
  success: boolean
  roleRedirect?: string
  error?: string
}

export async function loginWithPasswordAction(
  email: string,
  password: string,
  callbackUrl?: string | null
): Promise<LoginResult> {
  if (!email || !password) {
    return { success: false, error: 'Veuillez renseigner votre adresse e-mail et votre mot de passe.' }
  }

  const cleanEmail = email.trim().toLowerCase()

  // 1. Détection de l'IP client
  const headerStore = await headers()
  const clientIp =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'

  // 2. Rate limiting côté serveur anti-force brute (5 échecs par IP ou email sur 15 minutes)
  const rateLimitKey = `login-attempt:${clientIp}:${cleanEmail}`
  const ipLimit = await checkRateLimit(rateLimitKey, {
    limit: 5,
    windowSeconds: 900, // 15 minutes
  })

  if (!ipLimit.success) {
    await logAuditEvent({
      action: 'security.login_brute_force_blocked',
      entity: 'auth',
      details: { email: cleanEmail, ip: clientIp },
    })
    return {
      success: false,
      error: 'Trop de tentatives infructueuses. Pour votre sécurité, votre accès est bloqué pendant 15 minutes.',
    }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    if (error || !data.user) {
      await logAuditEvent({
        action: 'auth.login_failed',
        entity: 'auth',
        details: { email: cleanEmail, ip: clientIp, reason: error?.message || 'Identifiants invalides' },
      })

      return {
        success: false,
        error: 'Adresse e-mail ou mot de passe incorrect.',
      }
    }

    // Récupérer le rôle et le statut du compte dans profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, deleted_at')
      .eq('id', data.user.id)
      .single()

    // Gestion du compte suspendu
    if (profile?.deleted_at || profile?.role === 'suspended') {
      await logAuditEvent({
        userId: data.user.id,
        userRole: 'suspended',
        action: 'auth.login_suspended_rejected',
        entity: 'auth',
        details: { email: cleanEmail },
      })
      return { success: true, roleRedirect: '/suspended' }
    }

    const role = profile?.role || 'client'
    const targetUrl = getSafeRedirectUrl(callbackUrl, role)

    // Traçabilité du succès de connexion
    await logAuditEvent({
      userId: data.user.id,
      userRole: role,
      userEmail: cleanEmail,
      action: 'auth.login_success',
      entity: 'auth',
      details: { ip: clientIp },
    })

    return { success: true, roleRedirect: targetUrl }
  } catch (err: unknown) {
    console.error('[loginWithPasswordAction]', err)
    return { success: false, error: 'Une erreur technique est survenue lors de la connexion.' }
  }
}

export type AllowedPublicRole = 'client' | 'proprietaire' | 'agence' | 'promoteur'

const RegisterInputSchema = z.object({
  email: z.string().trim().email('Adresse e-mail invalide.'),
  password: PasswordPolicySchema,
  acceptedTerms: z.literal(true, {
    message: "Vous devez accepter les conditions d'utilisation.",
  }),
  role: z.enum(['client', 'proprietaire', 'agence', 'promoteur']).default('client'),
})

export interface RegisterResult {
  success: boolean
  error?: string
}

export async function registerUserAction(
  input: { email: string; password: string; acceptedTerms: boolean; role?: AllowedPublicRole },
  originUrl?: string
): Promise<RegisterResult> {
  const parsed = RegisterInputSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Données d'inscription non conformes.",
    }
  }

  const { email, password, role: chosenRole } = parsed.data
  const cleanEmail = email.toLowerCase()

  // 1. Détection de l'IP client
  const headerStore = await headers()
  const clientIp =
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    '127.0.0.1'

  // 2. Rate limiting anti-création massive de comptes (max 5 inscriptions par IP / heure)
  const regLimit = await checkRateLimit(`register-ip:${clientIp}`, {
    limit: 5,
    windowSeconds: 3600, // 1 heure
  })

  if (!regLimit.success) {
    await logAuditEvent({
      action: 'security.register_rate_limit_exceeded',
      entity: 'auth',
      details: { email: cleanEmail, ip: clientIp },
    })
    return {
      success: false,
      error: 'Trop de créations de compte depuis votre réseau. Veuillez patienter une heure.',
    }
  }

  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const defaultOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const targetOrigin = originUrl || defaultOrigin
    const emailRedirectTo = `${targetOrigin}/auth/callback`

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo,
        data: {
          role: chosenRole,
          is_onboarded: false,
        },
      },
    })

    if (error) {
      await logAuditEvent({
        action: 'auth.register_failed',
        entity: 'auth',
        details: { email: cleanEmail, reason: error.message },
      })
      return { success: false, error: error.message }
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: cleanEmail,
          role: chosenRole,
          is_onboarded: false,
        }, { onConflict: 'id' })

      await supabase
        .from('user_roles')
        .upsert({
          user_id: data.user.id,
          role_name: chosenRole,
        }, { onConflict: 'user_id,role_name' })
    }

    await logAuditEvent({
      userId: data.user?.id || null,
      userEmail: cleanEmail,
      userRole: chosenRole,
      action: 'auth.register_success',
      entity: 'auth',
      details: { ip: clientIp, chosenRole },
    })

    return { success: true }
  } catch (err: unknown) {
    console.error('[registerUserAction]', err)
    return { success: false, error: 'Une erreur est survenue lors de la création du compte.' }
  }
}

export async function getCurrentUserOnboardingStatusAction() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { isAuthenticated: false }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone, role, is_onboarded, organization_id, kyc_status, kyc_doc_type')
      .eq('id', user.id)
      .single()

    let organization = null
    if (profile?.organization_id) {
      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.organization_id)
        .single()
      organization = org
    }

    return {
      isAuthenticated: true,
      user: { id: user.id, email: user.email },
      profile,
      organization,
    }
  } catch (err: unknown) {
    console.error('[getCurrentUserOnboardingStatusAction]', err)
    return { isAuthenticated: false }
  }
}

export interface CompleteOnboardingInput {
  fullName?: string
  phone: string
  // Client specific
  commune?: string
  searchType?: 'achat' | 'location' | 'les_deux'
  // Propriétaire specific
  kycDocType?: string
  // Pro (agence/promoteur) specific
  organizationName?: string
  rccm?: string
  ncc?: string
  agrementNumero?: string
  whatsapp?: string
  adresse?: string
}

export async function completeOnboardingAction(input: CompleteOnboardingInput): Promise<{
  success: boolean
  redirectUrl?: string
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' }
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, role, is_onboarded')
      .eq('id', user.id)
      .single()

    if (profileErr || !profile) {
      return { success: false, error: 'Profil introuvable.' }
    }

    const role = profile.role

    // 1. Profil CLIENT (Acheteur / Locataire)
    if (role === 'client') {
      if (!input.fullName || input.fullName.trim().length < 2) {
        return { success: false, error: 'Veuillez renseigner votre nom complet (au moins 2 caractères).' }
      }
      if (!input.phone || input.phone.trim().length < 8) {
        return { success: false, error: 'Veuillez renseigner un numéro de téléphone valide.' }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        return { success: false, error: 'Erreur lors de la mise à jour du profil.' }
      }

      if (input.commune || input.searchType) {
        await supabase.from('recherches_alertes').insert({
          user_id: user.id,
          titre: `Alerte ${input.commune || 'Abidjan'}`,
          criteres: {
            commune: input.commune || null,
            transaction: input.searchType === 'achat' ? 'vente' : input.searchType === 'location' ? 'location' : null,
          },
          frequence: 'quotidien',
        })
      }

      await logAuditEvent({
        userId: user.id,
        userRole: role,
        action: 'auth.onboarding_completed',
        entity: 'auth',
        details: { role },
      })

      return { success: true, redirectUrl: '/client/dashboard' }
    }

    // 2. Profil PROPRIÉTAIRE (Particulier)
    if (role === 'proprietaire') {
      if (!input.fullName || input.fullName.trim().length < 2) {
        return { success: false, error: 'Veuillez renseigner votre nom complet.' }
      }
      if (!input.phone || input.phone.trim().length < 8) {
        return { success: false, error: 'Veuillez renseigner un numéro de téléphone joignable.' }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: input.fullName.trim(),
          phone: input.phone.trim(),
          kyc_doc_type: input.kycDocType || 'cni',
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        return { success: false, error: 'Erreur lors de la validation du profil bailleur.' }
      }

      await logAuditEvent({
        userId: user.id,
        userRole: role,
        action: 'auth.onboarding_completed',
        entity: 'auth',
        details: { role },
      })

      return { success: true, redirectUrl: '/dashboard/bailleur' }
    }

    // 3. Profils Professionnels : AGENCE IMMOBILIÈRE ou PROMOTEUR AGRÉÉ
    if (role === 'agence' || role === 'promoteur') {
      if (!input.organizationName || input.organizationName.trim().length < 2) {
        return { success: false, error: "La raison sociale ou nom de l'entreprise est obligatoire." }
      }
      if (!input.rccm || input.rccm.trim().length < 5) {
        return { success: false, error: 'Le numéro de Registre de Commerce (RCCM) est obligatoire.' }
      }
      if (role === 'promoteur' && (!input.agrementNumero || input.agrementNumero.trim().length < 3)) {
        return { success: false, error: "Le numéro d'agrément MCLU officiel est obligatoire pour un promoteur immobilier." }
      }
      if (!input.phone || input.phone.trim().length < 8) {
        return { success: false, error: 'Le numéro de téléphone professionnel est obligatoire.' }
      }

      // Génération slug
      const baseSlug = input.organizationName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      const uniqueSlug = `${baseSlug || 'org'}-${Math.random().toString(36).substring(2, 6)}`

      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: input.organizationName.trim(),
          slug: uniqueSlug,
          type: role,
          rccm: input.rccm.trim(),
          ncc: input.ncc?.trim() || null,
          agrement_numero: input.agrementNumero?.trim() || null,
          telephone: input.phone.trim(),
          whatsapp: input.whatsapp?.trim() || null,
          commune: input.commune?.trim() || 'Abidjan',
          adresse: input.adresse?.trim() || null,
          is_active: true,
        })
        .select('id')
        .single()

      if (orgError || !newOrg) {
        console.error('[completeOnboardingAction] Org creation error:', orgError)
        return { success: false, error: "Erreur lors de la création de l'entreprise. Veuillez vérifier le RCCM." }
      }

      // Lier comme gérant
      await supabase
        .from('organization_members')
        .insert({
          organization_id: newOrg.id,
          user_id: user.id,
          role_in_org: 'gerant',
        })

      // Mettre à jour profil
      const { error: profileUpdateErr } = await supabase
        .from('profiles')
        .update({
          full_name: input.fullName?.trim() || input.organizationName.trim(),
          phone: input.phone.trim(),
          organization_id: newOrg.id,
          is_onboarded: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileUpdateErr) {
        return { success: false, error: 'Erreur lors de la finalisation du compte professionnel.' }
      }

      await logAuditEvent({
        userId: user.id,
        userRole: role,
        action: 'auth.onboarding_completed',
        entity: 'auth',
        details: { role, organizationId: newOrg.id },
      })

      return { success: true, redirectUrl: '/dashboard/bailleur' }
    }

    // Autres rôles (admin, moderateur, etc.)
    await supabase.from('profiles').update({ is_onboarded: true }).eq('id', user.id)
    return { success: true, redirectUrl: '/admin' }
  } catch (err: unknown) {
    console.error('[completeOnboardingAction]', err)
    return { success: false, error: 'Une erreur technique est survenue.' }
  }
}
