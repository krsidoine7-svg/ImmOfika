"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Logo from "@/components/shared/Logo"
import { 
  Menu, 
  X, 
  ArrowRight,
  Home,
  Building2,
  Key,
  Layers,
  PhoneCall,
  PlusCircle
} from "lucide-react"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 pt-3 transition-all duration-300">
      <div 
        className={cn(
          "max-w-7xl mx-auto rounded-2xl sm:rounded-full transition-all duration-300 border relative",
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-slate-200/90 shadow-lg py-2.5 px-5 sm:px-7"
            : "bg-white/90 backdrop-blur-sm border-slate-100/80 shadow-sm py-3 px-6 sm:px-8"
        )}
      >
        <div className="flex items-center justify-between">
          {/* Logo Anyilo */}
          <Logo />

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                "text-xs uppercase font-bold tracking-wider transition-all relative py-1",
                pathname === "/" 
                  ? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full" 
                  : "text-slate-600 hover:text-emerald-600"
              )}
            >
              Accueil
            </Link>

            <Link
              href="/biens"
              className={cn(
                "text-xs uppercase font-bold tracking-wider transition-all relative py-1",
                pathname === "/biens" 
                  ? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full" 
                  : "text-slate-600 hover:text-emerald-600"
              )}
            >
              Catalogue Biens
            </Link>

            <Link
              href={pathname === "/" ? "#comment-ca-marche" : "/#comment-ca-marche"}
              className="text-xs uppercase font-bold tracking-wider text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Comment ça marche
            </Link>

            <Link
              href={pathname === "/" ? "#faq" : "/#faq"}
              className="text-xs uppercase font-bold tracking-wider text-slate-600 hover:text-emerald-600 transition-colors"
            >
              FAQ
            </Link>

            <Link
              href="/contact"
              className={cn(
                "text-xs uppercase font-bold tracking-wider transition-all relative py-1",
                pathname === "/contact" 
                  ? "text-emerald-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full" 
                  : "text-slate-600 hover:text-emerald-600"
              )}
            >
              Contact
            </Link>
          </nav>

          {/* Action Header Button */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Bouton Publier une Annonce */}
            <Link
              href="/biens/publier"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 shadow-2xs transition-all duration-200 hover:scale-[1.02] active:scale-98"
            >
              <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Publier une annonce</span>
              <span className="sm:hidden">Publier</span>
            </Link>

            <Link
              href="/auth/login"
              className="group relative inline-flex items-center gap-2 rounded-full px-4 sm:px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-98"
            >
              <span>Connexion</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-slate-700 hover:bg-slate-100 rounded-full h-9 w-9"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      <div 
        className={cn(
          "lg:hidden max-w-7xl mx-auto mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "max-h-[550px] p-5 opacity-100" : "max-h-0 p-0 opacity-0 border-0"
        )}
      >
        <div className="space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Home className="h-4 w-4 text-emerald-500" />
            <span>Accueil</span>
          </Link>

          <Link
            href="/biens"
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Building2 className="h-4 w-4 text-emerald-500" />
            <span>Biens Immobiliers</span>
          </Link>

          <Link
            href={pathname === "/" ? "#comment-ca-marche" : "/#comment-ca-marche"}
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Key className="h-4 w-4 text-emerald-500" />
            <span>Comment ça marche</span>
          </Link>

          <Link
            href={pathname === "/" ? "#faq" : "/#faq"}
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Layers className="h-4 w-4 text-emerald-500" />
            <span>FAQ</span>
          </Link>

          <Link
            href="/contact"
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PhoneCall className="h-4 w-4 text-emerald-500" />
            <span>Contactez-nous</span>
          </Link>

          {/* Actions mobiles dédiées */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/biens/publier"
              className="flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 text-emerald-800 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors border border-emerald-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <PlusCircle className="h-4 w-4 text-emerald-600" />
              <span>Publier une annonce</span>
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Connexion / Espace Agent</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
