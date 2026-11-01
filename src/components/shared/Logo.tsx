import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  light?: boolean
}

export default function Logo({ className = '', iconOnly = false, light = false }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={`inline-flex items-center gap-3 group transition-opacity hover:opacity-90 ${className}`}
    >
      {/* Emblème Officiel ImmOfika */}
      <div className="relative flex items-center justify-center h-9 sm:h-10 w-auto shrink-0 group-hover:scale-105 transition-transform duration-200">
        <Image
          src="/logo-immo.svg"
          alt="Logo Officiel ImmOfika"
          width={34}
          height={40}
          className={`h-9 sm:h-10 w-auto object-contain transition-all ${light ? 'brightness-0 invert' : ''}`}
          priority
        />
      </div>

      {!iconOnly && (
        <span className={`text-xl font-black tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
          ImmO<span className="text-emerald-500 font-extrabold">fika</span>
        </span>
      )}
    </Link>
  )
}
