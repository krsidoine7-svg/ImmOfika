'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, ChevronRight, HelpCircle, Compass } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log the error to an external logging service (Sentry, Console, etc.)
    console.error('Next.js Client Error Boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Golden Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full text-center relative z-10 space-y-8 px-4">
        {/* Animated Icon Container */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Pulsing Backlight */}
            <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-[#1E293B] border border-[#D4AF37]/30 w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
              <AlertTriangle className="w-12 h-12 text-[#D4AF37] animate-bounce" />
            </div>
          </div>
        </div>

        {/* Text Header */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[#F5E6B2] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
            Une erreur est survenue
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            Nous nous excusons pour ce contretemps. Une erreur technique inattendue a perturbé l'affichage de cette page.
          </p>
        </div>

        {/* Core Actions */}
        <div className="flex justify-center">
          <Link
            href="/biens"
            className="w-full max-w-md inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:from-[#B8860B] hover:to-[#8B6914] text-white font-bold px-8 py-4 text-lg rounded-xl shadow-xl shadow-[#D4AF37]/25 transition-all duration-300 transform active:scale-[0.98] hover:scale-[1.02] cursor-pointer"
          >
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '10s' }} />
            Découvrir nos terrains & villas
          </Link>
        </div>

        {/* Interactive Diagnostics Panel */}
        <div className="border border-[#D4AF37]/20 bg-[#1E293B]/50 backdrop-blur-md rounded-xl overflow-hidden text-left transition-all duration-300">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between p-4 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#D4AF37]/80" />
              <span>Informations de diagnostic pour le support</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 transform transition-transform duration-300 ${
                showDetails ? 'rotate-90 text-[#D4AF37]' : ''
              }`}
            />
          </button>

          {showDetails && (
            <div className="p-4 border-t border-[#D4AF37]/20 bg-[#0F172A]/90 text-xs font-mono text-[#F5E6B2]/90 overflow-x-auto space-y-2">
              <div className="flex items-center gap-2 text-slate-500 border-b border-[#D4AF37]/10 pb-1.5 mb-2">
                <span>Digest : {error.digest || 'N/A'}</span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">
                {error.stack || error.message || 'Erreur inattendue sans stack trace disponible.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-xs text-slate-500">
          ImmOfika International &copy; {new Date().getFullYear()} &mdash; Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
