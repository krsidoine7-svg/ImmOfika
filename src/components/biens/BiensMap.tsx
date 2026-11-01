'use client'

import * as React from 'react'
import Link from 'next/link'
import { ABIDJAN_CENTER } from '@/lib/constants/abidjan'
import { MapPin, ExternalLink, BedDouble, Ruler } from 'lucide-react'

interface BienMapItem {
  id: string
  slug: string
  titre: string
  prix: string | number
  transaction: string
  type: string
  ville: string
  quartier?: string | null
  surface?: string | number | null
  chambres?: number | null
  latitude?: string | number | null
  longitude?: string | number | null
  main_image_url?: string | null
  type_titre_propriete?: string | null
}

interface BiensMapProps {
  biens: BienMapItem[]
  selectedBienId?: string | null
  onSelectBien?: (id: string) => void
  heightClass?: string
}

function formatPrix(prix: string | number, transaction: string): string {
  const n = typeof prix === 'string' ? parseFloat(prix) : prix
  const formatted = new Intl.NumberFormat('fr-CI').format(n) + ' F'
  return transaction === 'location' ? formatted + '/m' : formatted
}

export default function BiensMap({
  biens,
  selectedBienId,
  onSelectBien,
  heightClass = 'h-[500px]',
}: BiensMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null)
  const mapInstanceRef = React.useRef<any>(null)
  const markersRef = React.useRef<any[]>([])

  // Filtrer les biens qui ont des coordonnées valides
  const validBiens = React.useMemo(() => {
    return biens.filter((b) => {
      const lat = typeof b.latitude === 'string' ? parseFloat(b.latitude) : b.latitude
      const lng = typeof b.longitude === 'string' ? parseFloat(b.longitude) : b.longitude
      return lat && lng && !isNaN(lat) && !isNaN(lng) && lat > 4.0 && lat < 6.0 && lng > -6.0 && lng < -3.0
    })
  }, [biens])

  React.useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapContainerRef.current) return
      if (typeof window === 'undefined') return

      const L = (await import('leaflet')).default

      // Injecter la feuille de style Leaflet côté client
      if (typeof document !== 'undefined' && !document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Fix pour les icones Leaflet par défaut
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (!isMounted) return

      if (!mapInstanceRef.current && mapContainerRef.current) {
        const centerLat = validBiens.length > 0
          ? Number(validBiens[0].latitude)
          : ABIDJAN_CENTER.lat
        const centerLng = validBiens.length > 0
          ? Number(validBiens[0].longitude)
          : ABIDJAN_CENTER.lng

        const map = L.map(mapContainerRef.current, {
          center: [centerLat, centerLng],
          zoom: ABIDJAN_CENTER.zoom,
          scrollWheelZoom: false,
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map
      }

      const map = mapInstanceRef.current
      if (!map) return

      // Nettoyer les anciens marqueurs
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      // Créer les marqueurs pour chaque bien avec badge prix moderne
      validBiens.forEach((bien) => {
        const lat = Number(bien.latitude)
        const lng = Number(bien.longitude)
        const isSelected = selectedBienId === bien.id

        const priceText = formatPrix(bien.prix, bien.transaction)

        // Marqueur HTML personnalisé façon Airbnb / SeLoger
        const customIcon = L.divIcon({
          className: 'custom-property-pin',
          html: `
            <div style="
              background: ${isSelected ? '#059669' : '#10B981'};
              color: white;
              font-weight: 800;
              font-size: 11px;
              padding: 4px 8px;
              border-radius: 9999px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              border: 2px solid white;
              cursor: pointer;
              white-space: nowrap;
              transform: translate(-50%, -100%);
              transition: all 0.2s ease;
            ">
              ${priceText}
            </div>
          `,
          iconSize: [0, 0],
        })

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

        // Popup HTML riche
        const popupContent = document.createElement('div')
        popupContent.className = 'p-1 max-w-[220px]'
        popupContent.innerHTML = `
          ${bien.main_image_url ? `
            <div style="width: 100%; height: 110px; border-radius: 8px; overflow: hidden; margin-bottom: 6px;">
              <img src="${bien.main_image_url}" style="width: 100%; height: 100%; object-fit: cover;" alt="${bien.titre}" />
            </div>
          ` : ''}
          <div style="font-size: 10px; font-weight: 700; color: #10B981; text-transform: uppercase; margin-bottom: 2px;">
            ${bien.type} · ${bien.transaction}
          </div>
          <div style="font-size: 12px; font-weight: 700; color: #0F172A; line-height: 1.2; margin-bottom: 4px;">
            ${bien.titre}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            📍 ${bien.quartier ? bien.quartier + ', ' : ''}${bien.ville}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #059669; margin-bottom: 8px;">
            ${priceText}
          </div>
          <a href="/biens/${bien.slug}" style="
            display: block;
            text-align: center;
            background: #10B981;
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 8px;
            text-decoration: none;
          ">
            Consulter l'annonce →
          </a>
        `

        marker.bindPopup(popupContent)

        marker.on('click', () => {
          if (onSelectBien) onSelectBien(bien.id)
        })

        markersRef.current.push(marker)
      })

      // Recentrer la vue si des coordonnées sont présentes
      if (validBiens.length > 1) {
        const bounds = L.latLngBounds(validBiens.map((b) => [Number(b.latitude), Number(b.longitude)]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
      }
    }

    initMap()

    return () => {
      isMounted = false
    }
  }, [validBiens, selectedBienId, onSelectBien])

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-10`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {validBiens.length === 0 && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 text-center z-20 pointer-events-none">
          <div className="bg-white rounded-2xl p-6 max-w-sm shadow-xl">
            <MapPin className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-slate-900 text-sm mb-1">Abidjan & Grand Abidjan</h4>
            <p className="text-xs text-slate-500">
              Les biens filtrés s&apos;afficheront sur la carte interactive dès que leurs coordonnées GPS sont renseignées.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

