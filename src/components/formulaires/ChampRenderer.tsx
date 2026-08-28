'use client'

import React, { useState } from 'react'
import { ChampFormulaire } from '@/types/formulaire'
import { UseFormReturn } from 'react-hook-form'
import { UploadCloud, Check, X, FileText } from 'lucide-react'

interface ChampRendererProps {
  champ: ChampFormulaire
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  disabled?: boolean
}

export function ChampRenderer({ champ, form, disabled = false }: ChampRendererProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const error = errors[champ.id]?.message as string | undefined
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tagsInput, setTagsInput] = useState('')

  // 1. Type Section (Titre séparateur)
  if (champ.type === 'section') {
    return (
      <div className="pt-6 pb-2 border-b border-emerald-100">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          {champ.label}
        </h3>
        {champ.placeholder && (
          <p className="text-sm text-slate-500 mt-1">{champ.placeholder}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2 text-left">
      <label className="block text-sm font-medium text-slate-700">
        {champ.label}
        {champ.requis && <span className="text-rose-500 ml-1 font-bold">*</span>}
      </label>

      {/* 2. Texte court */}
      {champ.type === 'text' && (
        <input
          type="text"
          disabled={disabled}
          placeholder={champ.placeholder || ''}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
      )}

      {/* 3. Texte long (Textarea) */}
      {champ.type === 'textarea' && (
        <textarea
          rows={4}
          disabled={disabled}
          placeholder={champ.placeholder || ''}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
      )}

      {/* 4. Email */}
      {champ.type === 'email' && (
        <input
          type="email"
          disabled={disabled}
          placeholder={champ.placeholder || 'exemple@domaine.com'}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
      )}

      {/* 5. Téléphone */}
      {champ.type === 'telephone' && (
        <input
          type="tel"
          disabled={disabled}
          placeholder={champ.placeholder || '+225 07 00 00 00 00'}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
      )}

      {/* 6. Nombre */}
      {champ.type === 'number' && (
        <input
          type="number"
          disabled={disabled}
          placeholder={champ.placeholder || '0'}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
      )}

      {/* 7. Date */}
      {champ.type === 'date' && (
        <input
          type="date"
          disabled={disabled}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        />
      )}

      {/* 8. Liste déroulante (Select) */}
      {champ.type === 'select' && (
        <select
          disabled={disabled}
          {...register(champ.id)}
          className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-800 transition focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-400 focus:ring-rose-200'
              : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100'
          }`}
        >
          <option value="">{champ.placeholder || '-- Choisir une option --'}</option>
          {champ.options?.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}

      {/* 9. Boutons Radio */}
      {champ.type === 'radio' && (
        <div className="space-y-2 pt-1">
          {champ.options?.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 cursor-pointer transition bg-white"
            >
              <input
                type="radio"
                value={opt}
                disabled={disabled}
                {...register(champ.id)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* 10. Cases à cocher (Checkbox) */}
      {champ.type === 'checkbox' && (
        <div className="space-y-2 pt-1">
          {champ.options?.map((opt, idx) => {
            const currentVals: string[] = watch(champ.id) || []
            const isChecked = currentVals.includes(opt)

            return (
              <label
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={isChecked}
                  onChange={e => {
                    const checked = e.target.checked
                    let updated: string[] = [...currentVals]
                    if (checked) {
                      updated.push(opt)
                    } else {
                      updated = updated.filter(v => v !== opt)
                    }
                    setValue(champ.id, updated, { shouldValidate: true })
                  }}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">{opt}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* 11. Tags / Mots-clés */}
      {champ.type === 'tags' && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 min-h-[42px] p-2 rounded-xl border border-slate-200 bg-white items-center">
            {((watch(champ.id) as string[]) || []).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg"
              >
                {tag}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => {
                      const current: string[] = watch(champ.id) || []
                      setValue(
                        champ.id,
                        current.filter(t => t !== tag),
                        { shouldValidate: true }
                      )
                    }}
                    className="hover:text-emerald-950 focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}

            {!disabled && (
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const trimmed = tagsInput.trim()
                    if (trimmed) {
                      const current: string[] = watch(champ.id) || []
                      if (!current.includes(trimmed)) {
                        setValue(champ.id, [...current, trimmed], { shouldValidate: true })
                      }
                      setTagsInput('')
                    }
                  }
                }}
                placeholder={champ.placeholder || 'Appuyez sur Entrée...'}
                className="flex-1 bg-transparent border-none text-sm text-slate-800 focus:outline-none min-w-[120px]"
              />
            )}
          </div>
          {champ.options && champ.options.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-xs text-slate-400">Suggestions :</span>
              {champ.options.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const current: string[] = watch(champ.id) || []
                    if (!current.includes(opt)) {
                      setValue(champ.id, [...current, opt], { shouldValidate: true })
                    }
                  }}
                  className="text-xs px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition"
                >
                  + {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 12. Fichier / Pièce jointe */}
      {champ.type === 'file' && (
        <div className="space-y-2">
          <div
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
              selectedFile
                ? 'border-emerald-500 bg-emerald-50/30'
                : error
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id={`file-${champ.id}`}
              disabled={disabled}
              accept={champ.acceptedTypes?.join(',')}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  if (champ.maxSize && file.size > champ.maxSize * 1024 * 1024) {
                    alert(`Le fichier ne doit pas dépasser ${champ.maxSize} Mo`)
                    return
                  }
                  setSelectedFile(file)
                  setValue(champ.id, file, { shouldValidate: true })
                }
              }}
              className="hidden"
            />
            <label htmlFor={`file-${champ.id}`} className="cursor-pointer block">
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-emerald-600 ml-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 mx-auto text-emerald-600" />
                  <p className="text-sm font-medium text-slate-700">
                    Cliquez ou glissez votre fichier ici
                  </p>
                  <p className="text-xs text-slate-400">
                    Formats acceptés : {champ.acceptedTypes?.join(', ') || 'Tous formats'} (Max :{' '}
                    {champ.maxSize || 5} Mo)
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>
      )}

      {/* Message d'erreur Zod */}
      {error && <p className="text-xs text-rose-500 font-medium pt-0.5">{error}</p>}
    </div>
  )
}
