"use client"

import React from 'react'
import { Landmark, FileText, MapPin, Phone, Mail } from 'lucide-react'
import styles from './settings.module.css'

interface PromoterSettingsProps {
  values: {
    legalName: string
    agrement: string
    ncc: string
    phone: string
    address: string
    email: string
    whatsappPhone: string
    whatsappTemplate: string
  }
  onChange: (field: string, value: any) => void
}

export default function PromoterSettings({ values, onChange }: PromoterSettingsProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    onChange(name, value)
  }

  return (
    <div className={styles.body}>
      {/* Raison sociale */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Dénomination Légale</span>
          <span className={styles.desc}>Nom officiel de la société promotrice.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Landmark className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="legalName"
              value={values.legalName || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: ImmOfika Immobilier International"
            />
          </div>
        </div>
      </div>

      {/* Numéro Agrément */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Agrément Ministériel</span>
          <span className={styles.desc}>Numéro officiel de l&apos;agrément de promoteur immobilier en Côte d&apos;Ivoire.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="agrement"
              value={values.agrement || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: Arrêté N°2026/MCLU/..."
            />
          </div>
        </div>
      </div>

      {/* Code NCC */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Compte Contribuable (NCC)</span>
          <span className={styles.desc}>Numéro unique d&apos;identification fiscale de l&apos;entreprise.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="ncc"
              value={values.ncc || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: 1234567 A"
            />
          </div>
        </div>
      </div>

      {/* Téléphone Administratif */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Contact Téléphonique</span>
          <span className={styles.desc}>Ligne téléphonique officielle pour l&apos;administration et les clients.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="phone"
              value={values.phone || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: +225 0701020304"
            />
          </div>
        </div>
      </div>

      {/* Téléphone WhatsApp */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Numéro WhatsApp ImmOfika</span>
          <span className={styles.desc}>Numéro utilisé pour la redirection et le chat direct avec le client.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="whatsappPhone"
              value={values.whatsappPhone || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: 2250707070707"
            />
          </div>
        </div>
      </div>

      {/* WhatsApp Message Template */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Modèle de Message WhatsApp</span>
          <span className={styles.desc}>Texte pré-rempli envoyé par le client. Utilisez {`{name}`} pour injecter le nom complet.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <textarea
              name="whatsappTemplate"
              value={values.whatsappTemplate || ''}
              onChange={handleChange}
              rows={3}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-medium text-slate-900"
              placeholder="Bonjour ImmOfika, je suis {name}. Je souhaite échanger concernant mon projet."
            />
          </div>
        </div>
      </div>

      {/* E-mail Administratif */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Adresse E-mail Officielle</span>
          <span className={styles.desc}>Adresse de courrier électronique pour les communications légales.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              name="email"
              value={values.email || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: contact@immofika.ci"
            />
          </div>
        </div>
      </div>

      {/* Adresse du Siège social */}
      <div className={styles.row}>
        <div className={styles.info}>
          <span className={styles.label}>Adresse du Siège Social</span>
          <span className={styles.desc}>Emplacement physique de la direction générale.</span>
        </div>
        <div className={styles.control}>
          <div className="relative w-full max-w-lg">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="address"
              value={values.address || ''}
              onChange={handleChange}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-sm font-bold text-slate-900"
              placeholder="ex: Cocody Mermoz, Abidjan, Côte d'Ivoire"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
