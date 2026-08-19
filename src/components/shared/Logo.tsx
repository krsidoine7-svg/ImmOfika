import React from 'react'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  light?: boolean
}

export default function Logo({ className = '', iconOnly = false, light = false }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group transition-opacity hover:opacity-90 ${className}`}>
      {/* Icon SVG */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <span className={`text-xl font-bold tracking-tight ${light ? 'text-white' : 'text-slate-900'}`}>
            ImmO<span className="text-emerald-500 font-extrabold">fika</span>
          </span>
          <span className={`text-[10px] uppercase font-semibold tracking-widest ${light ? 'text-emerald-200' : 'text-slate-400'}`}>
            Immobilier & Promotion
          </span>
        </div>
      )}
    </Link>
  )
}
