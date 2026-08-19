// src/hooks/useOfflineLeadSubmit.ts
"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

interface LeadData {
  nom: string
  prenom?: string
  email?: string
  telephone: string
  message?: string
  bienInteresse?: string
  source?: string
}

export function useOfflineLeadSubmit(submitAction: (data: FormData) => Promise<any>) {
  const [isSyncing, setIsSyncing] = useState(false)

  // Fonction pour envoyer tous les leads en attente
  const syncOfflineLeads = async () => {
    const queue = localStorage.getItem("offline_leads")
    if (!queue) return

    const leads: LeadData[] = JSON.parse(queue)
    if (leads.length === 0) return

    setIsSyncing(true)
    toast.info(`Connexion rétablie. Envoi de ${leads.length} formulaire(s) en attente...`)

    const remainingLeads: LeadData[] = []

    for (const lead of leads) {
      try {
        const formData = new FormData()
        formData.append("nom", lead.nom)
        if (lead.prenom) formData.append("prenom", lead.prenom)
        if (lead.email) formData.append("email", lead.email)
        formData.append("telephone", lead.telephone)
        if (lead.message) formData.append("message", lead.message)
        if (lead.bienInteresse) formData.append("bienInteresse", lead.bienInteresse)
        if (lead.source) formData.append("source", lead.source)

        await submitAction(formData)
      } catch (err) {
        console.error("Échec d'envoi d'un lead en cache, conservation locale :", err)
        remainingLeads.push(lead)
      }
    }

    localStorage.setItem("offline_leads", JSON.stringify(remainingLeads))
    setIsSyncing(false)

    if (remainingLeads.length === 0) {
      toast.success("Tous les formulaires hors-ligne ont été synchronisés avec succès !")
    }
  }

  useEffect(() => {
    // Écouter le retour de la connexion internet
    if (typeof window !== "undefined") {
      window.addEventListener("online", syncOfflineLeads)
      return () => window.removeEventListener("online", syncOfflineLeads)
    }
  }, [])

  // Soumission principale
  const submitLead = async (data: LeadData) => {
    if (typeof window !== "undefined" && !navigator.onLine) {
      // Enregistrer localement si hors-ligne
      const queue = localStorage.getItem("offline_leads")
      const leads: LeadData[] = queue ? JSON.parse(queue) : []
      leads.push(data)
      localStorage.setItem("offline_leads", JSON.stringify(leads))

      toast.warning(
        "Vous êtes actuellement hors-ligne. Votre demande a été enregistrée sur votre téléphone et sera envoyée dès que vous retrouverez du réseau.",
        { duration: 7000 }
      )
      return { offline: true, success: true }
    }

    // Convertir en FormData pour correspondre aux Server Actions
    const formData = new FormData()
    formData.append("nom", data.nom)
    if (data.prenom) formData.append("prenom", data.prenom)
    if (data.email) formData.append("email", data.email)
    formData.append("telephone", data.telephone)
    if (data.message) formData.append("message", data.message)
    if (data.bienInteresse) formData.append("bienInteresse", data.bienInteresse)
    if (data.source) formData.append("source", data.source || "site_web")

    return await submitAction(formData)
  }

  return { submitLead, isSyncing }
}
