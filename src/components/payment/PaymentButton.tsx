'use client'

import * as React from 'react'
import { initierPaiement } from '@/app/actions/paiements'
import { Loader2, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaymentButtonProps {
  reservationId: string
  clientId: string
  acompteRequis: number
  totalDejaPaye: number
  email: string
  bienTitre: string
}

const MAX_PAYSTACK_TRANSACTION_LIMIT = 9500000 // 9.5 million FCFA to stay safely below 10M limit

export default function PaymentButton({
  reservationId,
  clientId,
  acompteRequis,
  totalDejaPaye,
  email,
  bienTitre,
}: PaymentButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const resteAPayer = Math.max(0, acompteRequis - totalDejaPaye)
  
  // Default to the remaining balance, or 5M FCFA (a safe online transaction chunk) if remaining is larger
  const [montantSaisi, setMontantSaisi] = React.useState<string>(
    Math.min(resteAPayer, 5000000).toString()
  )

  const parsedMontant = parseFloat(montantSaisi) || 0
  const isOverRemaining = parsedMontant > resteAPayer
  const isOverLimit = parsedMontant > MAX_PAYSTACK_TRANSACTION_LIMIT
  const isTooSmall = parsedMontant < 100
  const isInvalid = isOverRemaining || isOverLimit || isTooSmall || isNaN(parsedMontant)

  async function handlePayment() {
    if (isInvalid) return

    console.log('[PaymentButton] Clicked handlePayment with params:', {
      reservationId,
      clientId,
      montant: parsedMontant,
      email,
      bienTitre,
    })
    
    setLoading(true)
    const toastId = toast.loading('Préparation de votre passerelle sécurisée Paystack...')

    try {
      const result = await initierPaiement({
        reservationId,
        clientId,
        montant: parsedMontant,
        email,
      })

      console.log('[PaymentButton] Result from server action:', result)

      if (result.success && result.authorizationUrl) {
        toast.success('Redirection vers Paystack...', { id: toastId })
        // Smoothly redirect to Paystack checkout URL
        window.location.href = result.authorizationUrl
      } else {
        toast.error(result.error || 'Erreur lors de la préparation du paiement.', { id: toastId })
        setLoading(false)
      }
    } catch (err) {
      console.error('[PaymentButton Click Error]', err)
      toast.error('Erreur réseau. Impossible de contacter la passerelle.', { id: toastId })
      setLoading(false)
    }
  }

  // Quick preset helper
  const setPresetAmount = (amount: number) => {
    setMontantSaisi(Math.min(amount, resteAPayer).toString())
  }

  return (
    <div className="bg-[#1A2A4A]/5 rounded-2xl border border-[#1A2A4A]/10 p-5 mt-4 space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="montant-input" className="block text-xs font-bold text-[#1A2A4A] uppercase tracking-wider">
          Montant à payer pour ce versement (FCFA)
        </label>
        
        <div className="relative rounded-xl shadow-sm">
          <input
            id="montant-input"
            type="number"
            value={montantSaisi}
            onChange={(e) => setMontantSaisi(e.target.value)}
            disabled={loading}
            min="100"
            max={Math.min(resteAPayer, MAX_PAYSTACK_TRANSACTION_LIMIT)}
            className="block w-full rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-16 text-sm font-bold text-[#1A2A4A] focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C] disabled:bg-gray-50 disabled:text-gray-400"
            placeholder="Ex: 2 000 000"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
            <span className="text-xs font-bold text-gray-400">FCFA</span>
          </div>
        </div>
      </div>

      {/* Preset values / helper tags */}
      <div className="flex flex-wrap gap-2">
        {resteAPayer > 1000000 && (
          <button
            type="button"
            onClick={() => setPresetAmount(1000000)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#1A2A4A] hover:text-[#1A2A4A] text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
          >
            1M FCFA
          </button>
        )}
        {resteAPayer > 2000000 && (
          <button
            type="button"
            onClick={() => setPresetAmount(2000000)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#1A2A4A] hover:text-[#1A2A4A] text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
          >
            2M FCFA
          </button>
        )}
        {resteAPayer > 5000000 && (
          <button
            type="button"
            onClick={() => setPresetAmount(5000000)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:border-[#1A2A4A] hover:text-[#1A2A4A] text-xs font-semibold text-gray-600 transition-colors cursor-pointer"
          >
            5M FCFA
          </button>
        )}
        <button
          type="button"
          onClick={() => setPresetAmount(Math.min(resteAPayer, MAX_PAYSTACK_TRANSACTION_LIMIT))}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg border border-[#C9A84C]/30 bg-[#C9A84C]/5 hover:bg-[#C9A84C]/10 text-xs font-semibold text-[#C9A84C] transition-colors cursor-pointer"
        >
          {resteAPayer > MAX_PAYSTACK_TRANSACTION_LIMIT ? 'Solde Max (9.5M)' : 'Tout payer'}
        </button>
      </div>

      {/* Logic threshold > 150 000 FCFA */}
      {parsedMontant > 150000 && (
        <div className="space-y-3 p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-xs text-amber-800 leading-relaxed font-light">
          <p className="font-bold text-amber-900 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Montant supérieur à 150 000 FCFA
          </p>
          <p>
            Pour les montants supérieurs à 150 000 FCFA, nous vous recommandons fortement d&apos;effectuer un **virement bancaire** :
          </p>
          <div className="bg-white p-3 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-700 font-semibold select-all">
            SGCI Côte d&apos;Ivoire<br />
            RIB : CI008 01101 12345678901 12<br />
            Libellé : [Votre nom] - Acquisition
          </div>
          <p className="text-[10px] text-slate-400">
            *Envoyez votre reçu de virement à support@immofika.ci pour validation manuelle.*
          </p>
          
          <div className="pt-2 border-t border-amber-200/40 flex items-start gap-2">
            <input 
              type="checkbox" 
              id="confirmDeplafonnement" 
              className="mt-0.5 rounded border-amber-300 text-[#C9A84C] focus:ring-[#C9A84C]"
              defaultChecked={false}
              onChange={(e) => {
                // we can store state or just use ref, let's keep track in ref or let the button enable
                (window as any).isDeplafonnementConfirmed = e.target.checked
              }}
            />
            <label htmlFor="confirmDeplafonnement" className="text-[10px] text-slate-600 select-none">
              Je souhaite tout de même payer en ligne. Je certifie que mon compte Mobile Money est **déplafonné** et dispose des fonds nécessaires (les comptes standards sont plafonnés à 200 000 FCFA).
            </label>
          </div>
        </div>
      )}

      {/* Warnings & Messages */}
      {isOverRemaining && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span>Le montant dépasse le solde d&apos;acompte restant ({new Intl.NumberFormat('fr-CI').format(resteAPayer)} FCFA).</span>
        </div>
      )}
      {isOverLimit && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span>Le montant maximum en ligne est de 9 500 000 FCFA par transaction.</span>
        </div>
      )}
      {resteAPayer > MAX_PAYSTACK_TRANSACTION_LIMIT && !isOverLimit && !isOverRemaining && (
        <div className="flex items-start gap-1.5 text-xs text-[#1A2A4A] bg-amber-50 border border-amber-200/50 p-2.5 rounded-lg leading-relaxed">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>
            Le montant de votre acompte ({new Intl.NumberFormat('fr-CI').format(acompteRequis)} FCFA) dépasse la limite transactionnelle de Paystack (10M FCFA). 
            Veuillez payer en <strong>plusieurs tranches</strong> (ex: 5 000 000 FCFA puis le solde).
          </span>
        </div>
      )}

      {/* Payment Action Button */}
      <button
        type="button"
        onClick={() => {
          if (parsedMontant > 150000 && !(window as any).isDeplafonnementConfirmed) {
            toast.error("Veuillez cocher la case certifiant que votre compte est déplafonné pour payer en ligne.")
            return
          }
          handlePayment()
        }}
        disabled={loading || isInvalid}
        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-sm transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Initialisation sécurisée...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 text-[#D4AF37]" />
            Procéder au versement ({new Intl.NumberFormat('fr-CI').format(parsedMontant)} FCFA)
          </>
        )}
      </button>
    </div>
  )
}
