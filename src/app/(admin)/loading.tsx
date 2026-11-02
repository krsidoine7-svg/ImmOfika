import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      <p className="text-sm font-medium">Chargement de l'espace administration...</p>
    </div>
  )
}
