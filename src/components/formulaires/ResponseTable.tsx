'use client'

import React, { useState } from 'react'
import { Formulaire, FormulaireReponse } from '@/types/formulaire'
import ExcelJS from 'exceljs'
import {
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Eye,
  Calendar,
  X,
  ExternalLink,
  Paperclip,
  CheckCircle,
} from 'lucide-react'

interface ResponseTableProps {
  formulaire: Formulaire
  reponses: FormulaireReponse[]
}

export function ResponseTable({ formulaire, reponses }: ResponseTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedReponse, setSelectedReponse] = useState<FormulaireReponse | null>(null)

  // Filtrer les champs (exclure les sections)
  const inputChamps = formulaire.champs.filter(c => c.type !== 'section')

  // Filtrer les réponses par terme de recherche
  const filteredReponses = reponses.filter(rep => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()

    return Object.values(rep.reponses).some(val => {
      if (typeof val === 'string') return val.toLowerCase().includes(term)
      if (Array.isArray(val)) return val.join(' ').toLowerCase().includes(term)
      return false
    })
  })

  // Export CSV
  const handleExportCSV = () => {
    if (reponses.length === 0) return

    const headers = ['ID Réponse', 'Date de soumission', ...inputChamps.map(c => c.label)]

    const rows = reponses.map(rep => {
      const rowData = [
        rep.id,
        new Date(rep.createdAt).toLocaleString('fr-FR'),
        ...inputChamps.map(champ => {
          const val = rep.reponses[champ.id]
          if (Array.isArray(val)) return `"${val.join(', ')}"`
          if (val === null || val === undefined) return '""'
          return `"${String(val).replace(/"/g, '""')}"`
        }),
      ]
      return rowData.join(';')
    })

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reponses_${formulaire.slug}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export Excel (.xlsx) via ExcelJS
  const handleExportExcel = async () => {
    if (reponses.length === 0) return

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Réponses')

    // Style En-têtes
    const columnsDef = [
      { header: 'ID', key: 'id', width: 12 },
      { header: 'Date de soumission', key: 'createdAt', width: 22 },
      ...inputChamps.map(champ => ({
        header: champ.label,
        key: champ.id,
        width: Math.max(champ.label.length + 5, 20),
      })),
    ]

    worksheet.columns = columnsDef

    // Formater la ligne d'en-tête
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }, // Vert Émeraude Menthe
    }

    // Ajouter les données
    reponses.forEach(rep => {
      const rowObj: Record<string, string> = {
        id: rep.id.substring(0, 8),
        createdAt: new Date(rep.createdAt).toLocaleString('fr-FR'),
      }

      inputChamps.forEach(champ => {
        const val = rep.reponses[champ.id]
        if (Array.isArray(val)) {
          rowObj[champ.id] = val.join(', ')
        } else if (val === null || val === undefined) {
          rowObj[champ.id] = ''
        } else {
          rowObj[champ.id] = String(val)
        }
      })

      worksheet.addRow(rowObj)
    })

    // Générer et télécharger le fichier
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reponses_${formulaire.slug}_${Date.now()}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Barre de recherche & export */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Rechercher dans les réponses..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Grille / Tableau de réponses */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredReponses.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Aucune réponse trouvée</p>
            <p className="text-xs text-slate-400">
              Les réponses soumises par les clients s'afficheront automatiquement ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  {inputChamps.slice(0, 4).map(champ => (
                    <th key={champ.id} className="py-3.5 px-4">
                      {champ.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReponses.map(rep => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                      {new Date(rep.createdAt).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {inputChamps.slice(0, 4).map(champ => {
                      const val = rep.reponses[champ.id]
                      let displayVal = '-'

                      if (Array.isArray(val)) {
                        displayVal = val.join(', ')
                      } else if (val !== null && val !== undefined && val !== '') {
                        displayVal = String(val)
                      }

                      return (
                        <td key={champ.id} className="py-3.5 px-4 text-slate-800 truncate max-w-[200px]">
                          {displayVal}
                        </td>
                      )
                    })}

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReponse(rep)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Détail d'une réponse */}
      {selectedReponse && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Détails de la réponse</h3>
                <p className="text-xs text-slate-500">
                  Soumis le {new Date(selectedReponse.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReponse(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {inputChamps.map(champ => {
                const val = selectedReponse.reponses[champ.id]
                let textVal = 'Non renseigné'

                if (Array.isArray(val)) {
                  textVal = val.join(', ')
                } else if (val !== null && val !== undefined && val !== '') {
                  textVal = String(val)
                }

                return (
                  <div key={champ.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {champ.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 whitespace-pre-wrap">
                      {textVal}
                    </p>
                  </div>
                )
              })}

              {/* Affichage des fichiers de cette réponse */}
              {selectedReponse.fichiers && Object.keys(selectedReponse.fichiers).length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" /> Fichiers joint(s)
                  </p>
                  {Object.entries(selectedReponse.fichiers).map(([champId, fileObj]) => (
                    <a
                      key={champId}
                      href={fileObj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition"
                    >
                      <span className="truncate">{fileObj.name}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
