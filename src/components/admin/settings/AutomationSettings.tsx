"use client"

import React from 'react'
import { Link, Mail } from 'lucide-react'
import styles from './settings.module.css'

interface AutomationSettingsProps {
  values: {
    webhookUrl: string
    resendApiKey: string
    whatsappNotify: boolean
    emailNotify: boolean
    smsNotify: boolean
  }
  onChange: (field: string, value: any) => void
}

export default function AutomationSettings({ values, onChange }: AutomationSettingsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    onChange(name, type === 'checkbox' ? checked : value)
  }

  return (
    <div className={styles.body}>
      {/* Webhook Sync URL */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Webhook CRM</span>
          <span className={styles.desc}>URL utilisée pour envoyer les fiches de prospects et de réservations vers les outils CRM externes (ex: Make, Zapier).</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="webhookUrl"
              value={values.webhookUrl || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: https://hooks.make.com/..."
            />
          </div>
        </div>
      </div>

      {/* Resend API key */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Clé d&apos;API Resend</span>
          <span className={styles.desc}>Clé d&apos;API de service Resend utilisée pour l&apos;envoi d&apos;e-mails transactionnels automatisés.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="password"
              name="resendApiKey"
              value={values.resendApiKey || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: re_..."
            />
          </div>
        </div>
      </div>

      {/* Notifications toggles */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Notifications Clients</span>
          <span className={styles.desc}>Activer ou désactiver les différents canaux de notification automatique pour les agents de vente et clients.</span>
        </div>
        <div className={styles.control}>
          <div className={styles.controlStack}>
            {/* Email notify */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors select-none w-full max-w-lg">
              <input
                type="checkbox"
                name="emailNotify"
                checked={!!values.emailNotify}
                onChange={handleChange}
                className="h-4.5 w-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Notifications Email</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Envoyer les accusés de réception par e-mail</p>
              </div>
            </label>

            {/* WhatsApp Notify */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors select-none w-full max-w-lg">
              <input
                type="checkbox"
                name="whatsappNotify"
                checked={!!values.whatsappNotify}
                onChange={handleChange}
                className="h-4.5 w-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Alertes WhatsApp (Côte d&apos;Ivoire)</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Envoyer des notifications de vente sur WhatsApp</p>
              </div>
            </label>

            {/* SMS Notify */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors select-none w-full max-w-lg">
              <input
                type="checkbox"
                name="smsNotify"
                checked={!!values.smsNotify}
                onChange={handleChange}
                className="h-4.5 w-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Alertes SMS Directes</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">SMS locaux via passerelle de télécoms ivoirienne</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
