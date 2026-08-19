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
  ChevronDown, 
  ArrowRight,
  Home,
  Building2,
  Key,
  Layers,
  PhoneCall
} from "lucide-react"

const dropdownServices = [
  { name: "Achat & Vente de Biens", href: "/biens", icon: Building2 },
  { name: "Gestion Locative", href: "#services", icon: Key },
  { name: "Promotion Immobilière & Foncier", href: "#services", icon: Layers },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isMobileServicesOpen, setIsMobileServicesOpen] = React.useState(false)
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
          {/* Logo Immo Pro */}
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

            {/* Services Dropdown */}
            <div className="relative group py-2 cursor-pointer">
              <button className="flex items-center gap-1 text-xs uppercase font-bold tracking-wider text-slate-600 group-hover:text-emerald-600 transition-colors focus:outline-none">
                <span>Services</span>
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180 text-slate-400 group-hover:text-emerald-500" />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-[260px] bg-white backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-2 transition-all duration-200 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-50">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 py-1.5 border-b border-slate-100">
                  Expertises Immo Pro
                </p>
                {dropdownServices.map((svc) => (
                  <Link
                    key={svc.name}
                    href={pathname === "/" ? svc.href : `/${svc.href}`}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all mt-1"
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                      <svc.icon className="h-3.5 w-3.5" />
                    </div>
                    <span>{svc.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href={pathname === "/" ? "#about" : "/#about"}
              className="text-xs uppercase font-bold tracking-wider text-slate-600 hover:text-emerald-600 transition-colors"
            >
              À propos
            </Link>

            <Link
              href={pathname === "/" ? "#faq" : "/#faq"}
              className="text-xs uppercase font-bold tracking-wider text-slate-600 hover:text-emerald-600 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Action Header Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-98"
            >
              <span>Connexion / Espace Agent</span>
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
          isMobileMenuOpen ? "max-h-[500px] p-5 opacity-100" : "max-h-0 p-0 opacity-0 border-0"
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

          {/* Accordéon Mobile Services */}
          <div>
            <button
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              className="flex items-center justify-between w-full text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 text-emerald-500" />
                <span>Nos Services</span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", isMobileServicesOpen && "rotate-180")} />
            </button>

            {isMobileServicesOpen && (
              <div className="pl-9 space-y-1.5 py-1">
                {dropdownServices.map((svc) => (
                  <Link
                    key={svc.name}
                    href={pathname === "/" ? svc.href : `/${svc.href}`}
                    className="block text-xs font-semibold text-slate-600 hover:text-emerald-600 py-1.5"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {svc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href={pathname === "/" ? "#about" : "/#about"}
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Key className="h-4 w-4 text-emerald-500" />
            <span>À propos</span>
          </Link>

          <Link
            href={pathname === "/" ? "#faq" : "/#faq"}
            className="flex items-center gap-3 text-sm font-bold p-2.5 text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <PhoneCall className="h-4 w-4 text-emerald-500" />
            <span>FAQ & Contact</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
