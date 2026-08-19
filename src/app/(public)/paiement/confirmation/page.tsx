import * as React from 'react'
import { verifierPaiement } from '@/lib/paystack/verify'
import { confirmerPaiementEnBase } from '@/lib/paystack/db-confirm'
import Navbar from '@/components/shared/Navbar'
import { CheckCircle, AlertTriangle, Home, Calendar, CreditCard, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Confirmation de Paiement — Favor Company International',
}

interface PageProps {
  searchParams: Promise<{ reference?: string }>
}

export default async function PaiementConfirmationPage({ searchParams }: PageProps) {
  const { reference } = await searchParams

  if (!reference) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-red-100 p-8 shadow-lg text-center">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-[#1A2A4A] mb-3">Référence Manquante</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Impossible de vérifier votre transaction car aucune référence de paiement n&apos;a été fournie dans l&apos;URL.
            </p>
            <Link
              href="/client/dashboard"
              className="inline-flex items-center justify-center w-full py-3 px-6 rounded-xl bg-[#1A2A4A] hover:bg-[#C9A84C] text-white font-semibold text-sm transition-all duration-300 shadow-md cursor-pointer"
            >
              Retour à l&apos;espace client
            </Link>
          </div>
        </main>
      </>
    )
  }

  // Double check transaction status with Paystack directly
  const verification = await verifierPaiement(reference)

  if (verification.success) {
    // Fail-safe update: confirm payment in DB in case webhook hasn't run or failed (e.g. local dev)
    await confirmerPaiementEnBase({
      reference,
      amountInXof: verification.amount || 0,
      channel: verification.channel || 'unknown',
      paidAt: verification.paidAt,
      metadata: verification.metadata,
    })
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8F6F1] flex items-center justify-center pt-24 pb-16 px-4">
        {verification.success ? (
          /* Gorgeous SUCCESS View */
          <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
            {/* Top decorative premium bar */}
            <div className="h-2 bg-[#C9A84C] w-full" />
            
            <div className="p-8 sm:p-10 flex flex-col items-center text-center">
              {/* Checkmark Animation Hub */}
              <div className="h-20 w-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
                <CheckCircle className="h-10 w-10" />
              </div>

              <span className="px-3.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 uppercase tracking-widest mb-3">
                Transaction Réussie
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2A4A] tracking-tight mb-2">
                Paiement Confirmé !
              </h1>
              
              <p className="text-gray-400 text-sm font-light max-w-sm mb-8 leading-relaxed">
                Votre transaction a été validée avec succès par Paystack. Votre réservation est désormais active.
              </p>

              {/* Receipt details */}
              <div className="w-full bg-[#F8F6F1] rounded-2xl border border-gray-100 p-6 text-left space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-3">
                  <span className="text-gray-400 font-light flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-gray-300" />
                    Référence transaction
                  </span>
                  <span className="font-mono font-semibold text-[#1A2A4A] text-xs">
                    {verification.reference || reference}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-3">
                  <span className="text-gray-400 font-light flex items-center gap-1.5">
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                    Montant versé
                  </span>
                  <span className="font-bold text-[#C9A84C]">
                    {new Intl.NumberFormat('fr-CI').format(verification.amount || 0)} FCFA
                  </span>
                </div>
                {verification.channel && (
                  <div className="flex justify-between items-center text-sm border-b border-gray-200/50 pb-3">
                    <span className="text-gray-400 font-light flex items-center gap-1.5">
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                      Canal utilisé
                    </span>
                    <span className="font-semibold text-[#1A2A4A] capitalize">
                      {verification.channel.replace('_', ' ')}
                    </span>
                  </div>
                )}
                {verification.paidAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 font-light flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-gray-300" />
                      Date du paiement
                    </span>
                    <span className="font-semibold text-[#1A2A4A]">
                      {new Date(verification.paidAt).toLocaleDateString('fr-CI', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href="/client/dashboard"
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#1A2A4A] hover:bg-[#C9A84C] text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  Aller à mon espace client
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/biens"
                  className="py-3.5 px-6 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1A2A4A] hover:text-[#1A2A4A] transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Home className="h-4 w-4" />
                  Catalogue
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Beautiful FAILURE / PENDING View */
          <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
            <div className="h-2 bg-amber-500 w-full" />
            
            <div className="p-8 sm:p-10 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-6 shadow-sm">
                <AlertTriangle className="h-10 w-10 animate-bounce" />
              </div>

              <span className="px-3.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 uppercase tracking-widest mb-3">
                Vérification Requise
              </span>
              
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A2A4A] tracking-tight mb-2">
                Paiement non confirmé
              </h1>
              
              <p className="text-gray-400 text-sm font-light max-w-sm mb-6 leading-relaxed">
                Paystack n&apos;a pas encore validé cette transaction ou une erreur est survenue lors de la vérification :
              </p>
              
              <div className="w-full bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-amber-800 text-sm mb-8 leading-relaxed">
                {verification.error || 'Statut de paiement incomplet. En attente de validation finale.'}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href={`/paiement/confirmation?reference=${reference}`}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-[#1A2A4A] hover:bg-[#C9A84C] text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                  Actualiser et vérifier à nouveau
                </Link>
                <Link
                  href="/client/dashboard"
                  className="py-3.5 px-6 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:border-[#1A2A4A] hover:text-[#1A2A4A] transition-all duration-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Retour
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
