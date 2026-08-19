"use client"

import { ReactLenis, useLenis } from "lenis/react"
import { ReactNode, useEffect } from "react"
import { usePathname } from "next/navigation"

// Sous-composant pour réinitialiser le défilement au sommet lors des changements de page
function ScrollReset() {
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    if (lenis) {
      // Remet le scroll à 0 immédiatement sans délai
      lenis.scrollTo(0, { immediate: true })
    }
  }, [pathname, lenis])

  return null
}

// Routes exclues de Lenis pour éviter les conflits de défilement :
// - /admin : layout à hauteur fixe avec overflow-auto interne
// - /client : idem (espace client avec sidebar et blocs imbriqués)
// - /biens (pages de catalogue et de détail) : le chargement asynchrone et les blocs sticky perturbent le calcul de hauteur
const LENIS_EXCLUDED_PREFIXES = ["/admin", "/client", "/biens"]

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isExcluded = LENIS_EXCLUDED_PREFIXES.some((prefix) => pathname?.startsWith(prefix))

  if (isExcluded) {
    return <>{children}</>
  }

  return (
    <ReactLenis root options={{ 
      duration: 1.2, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  )
}
