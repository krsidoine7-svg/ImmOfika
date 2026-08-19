"use client"

import React from 'react'
import { Shield, Clock, AlertTriangle } from 'lucide-react'
import { CustomSelect } from '@/components/ui/custom-select'
import styles from './settings.module.css'

interface SecuritySettingsProps {
  values: {
    sessionTimeoutMinutes: number
    require2FA: boolean
    maintenanceMode: boolean
    auditLogLevel: string
  }
  onChange: (field: string, value: any) => void
}

export default function SecuritySettings({ values, onChange }: SecuritySettingsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    onChange(name, type === 'checkbox' ? checked : (name === 'sessionTimeoutMinutes' ? parseInt(value) || 0 : value))
  }

  return (
    <div className={styles.body}>
      {/* Session Timeout */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Validité des Sessions</span>
          <span className={styles.desc}>Durée maximale d&apos;inactivité avant la déconnexion automatique de l&apos;utilisateur (en minutes).</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              name="sessionTimeoutMinutes"
              value={values.sessionTimeoutMinutes ?? 60}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              min="5"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Level */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Niveau d&apos;Audit</span>
          <span className={styles.desc}>Niveau de détail de la traçabilité des modifications et des connexions système.</span>
        </div>
        <div className={styles.control}>
          <div className="w-full max-w-lg">
            <CustomSelect
              value={values.auditLogLevel || 'info'}
              onChange={(val) => onChange('auditLogLevel', val)}
              options={[
                { value: 'error', label: 'Erreurs uniquement' },
                { value: 'info', label: 'Standard (Connexions et modifications)' },
                { value: 'debug', label: 'Total (Traçabilité technique complète)' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Gouvernance</span>
          <span className={styles.desc}>Appliquez des contrôles de sécurité globaux pour l&apos;ensemble des administrateurs et des clients.</span>
        </div>
        <div className={styles.control}>
          <div className={styles.controlStack}>
            {/* 2FA Require */}
            <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors select-none w-full max-w-lg">
              <input
                type="checkbox"
                name="require2FA"
                checked={!!values.require2FA}
                onChange={handleChange}
                className="h-4.5 w-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Authentification 2FA</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Exiger le double-facteur pour le personnel</p>
              </div>
            </label>

            {/* Maintenance Mode */}
            <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors select-none w-full max-w-lg ${
              values.maintenanceMode 
                ? 'bg-red-50 border-red-200 hover:bg-red-100/50' 
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100/50'
            }`}>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={!!values.maintenanceMode}
                onChange={handleChange}
                className="h-4.5 w-4.5 rounded text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
              />
              <div>
                <p className={`text-xs font-bold ${values.maintenanceMode ? 'text-red-700' : 'text-slate-900'}`}>
                  Mode Maintenance Général
                </p>
                <p className={`text-[10px] font-medium mt-0.5 ${values.maintenanceMode ? 'text-red-600' : 'text-slate-500'}`}>
                  Mettre l&apos;application en maintenance pour les clients
                </p>
              </div>
            </label>

            {values.maintenanceMode && (
              <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed w-full max-w-lg font-medium">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">Attention :</span> L&apos;activation du mode maintenance rendra l&apos;espace client et la page d&apos;accueil inaccessibles pour les visiteurs. Les administrateurs pourront continuer à travailler sur la console.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
