import Link from 'next/link';
import { Compass, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Premium Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 px-4">
        {/* Animated Visual Area */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Glowing Ring */}
            <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-[#1E293B] border border-[#D4AF37]/30 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-2xl">
              <span className="text-4xl sm:text-5xl font-extrabold text-[#D4AF37] tracking-wider">404</span>
            </div>
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5E6B2] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
            Page introuvable
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            La page ou la propriété immobilière que vous recherchez n'est pas ou plus disponible. Elle a peut-être été déplacée ou renommée.
          </p>
        </div>

        {/* Action Options */}
        <div className="flex justify-center">
          <Link
            href="/biens"
            className="w-full max-w-md inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#B8860B] hover:to-[#8B6914] text-white font-bold px-8 py-4 text-lg rounded-xl shadow-xl shadow-[#D4AF37]/25 transition-all duration-300 transform active:scale-[0.98] hover:scale-[1.02] cursor-pointer"
          >
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
            Découvrir nos terrains & villas
          </Link>
        </div>

        {/* Quick Help Card */}
        <div className="border border-[#D4AF37]/20 bg-[#1E293B]/30 backdrop-blur-md rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
            <Search className="w-4 h-4" />
            <span>Besoin d'assistance ?</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Si vous pensez qu'il s'agit d'une anomalie technique, veuillez contacter notre équipe technique ou retourner au tableau de bord pour continuer votre parcours.
          </p>
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-500">
          Favor Company International &copy; {new Date().getFullYear()} &mdash; Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
