"use client"

import React from 'react'
import { CreditCard, Eye, EyeOff, Percent, DollarSign, Clock } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import styles from './settings.module.css'

interface FinanceSettingsProps {
  values: {
    paystackPublicKey: string
    paystackSecretKey: string
    acomptePercent: number
    tvaPercent: number
    currency: string
    reservationExpiryHours: number
  }
  onChange: (field: string, value: any) => void
}

export default function FinanceSettings({ values, onChange }: FinanceSettingsProps) {
  const [showSecret, setShowSecret] = React.useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const numericFields = ['acomptePercent', 'tvaPercent', 'reservationExpiryHours']
    onChange(name, numericFields.includes(name) ? parseFloat(value) || 0 : value)
  }

  return (
    <div className={styles.body}>
      {/* Paystack Public Key */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Paystack Clé Publique</span>
          <span className={styles.desc}>Clé publique Paystack pour l&apos;initialisation des paiements dans le navigateur client.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="paystackPublicKey"
              value={values.paystackPublicKey || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="pk_live_..."
            />
          </div>
        </div>
      </div>

      {/* Paystack Secret Key */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Paystack Clé Secrète</span>
          <span className={styles.desc}>Clé secrète de paiement Paystack pour les transactions et validations côté serveur.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type={showSecret ? 'text' : 'password'}
              name="paystackSecretKey"
              value={values.paystackSecretKey || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="sk_live_..."
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Pourcentage Acompte */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Acompte Requis (%)</span>
          <span className={styles.desc}>Pourcentage du prix total du bien exigé pour confirmer une réservation.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              name="acomptePercent"
              value={values.acomptePercent ?? 10}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              min="1"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Pourcentage TVA */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>TVA Applicable (%)</span>
          <span className={styles.desc}>Taux de Taxe sur la Valeur Ajoutée (TVA) légalement applicable sur les transactions.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Percent className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              name="tvaPercent"
              value={values.tvaPercent ?? 18}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Devise Officielle */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Devise de Référence</span>
          <span className={styles.desc}>Devise principale utilisée pour tous les calculs et exports financiers de la plateforme.</span>
        </div>
        <div className={styles.control}>
          <div className="w-full max-w-lg">
            <CustomSelect
              value={values.currency || 'XOF'}
              onChange={(val) => onChange('currency', val)}
              options={[
                { value: 'XOF', label: 'XOF (Franc CFA - UEMOA)' },
                { value: 'USD', label: 'USD (Dollar Américain)' },
                { value: 'EUR', label: 'EUR (Euro)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Expiration Réservation */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Expiration Réservation (h)</span>
          <span className={styles.desc}>Temps accordé à l&apos;acheteur pour payer l&apos;acompte avant annulation automatique de la réservation.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              name="reservationExpiryHours"
              value={values.reservationExpiryHours ?? 72}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              min="1"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
