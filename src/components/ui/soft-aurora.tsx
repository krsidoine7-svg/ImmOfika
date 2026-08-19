"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface SoftAuroraProps {
  className?: string
  colors?: string[]
  blur?: number
  speed?: number
}

export default function SoftAurora({
  className = "",
  colors = [
    "rgba(184, 134, 11, 0.35)",   // Or profond
    "rgba(212, 175, 55, 0.25)",   // Or moyen
    "rgba(245, 230, 178, 0.2)",   // Or clair / reflet
    "rgba(15, 23, 42, 0.4)",      // Bleu Nuit
    "rgba(139, 105, 20, 0.3)",    // Ambre foncé
  ],
  blur = 80,
  speed = 1,
}: SoftAuroraProps) {
  const blobs = [
    { cx: "20%",  cy: "30%", rx: "50%", ry: "40%", color: colors[0], duration: 18 / speed, delay: 0     },
    { cx: "75%",  cy: "25%", rx: "45%", ry: "35%", color: colors[1], duration: 22 / speed, delay: 3     },
    { cx: "50%",  cy: "70%", rx: "55%", ry: "45%", color: colors[2], duration: 25 / speed, delay: 6     },
    { cx: "85%",  cy: "65%", rx: "40%", ry: "50%", color: colors[3], duration: 20 / speed, delay: 2     },
    { cx: "10%",  cy: "75%", rx: "35%", ry: "30%", color: colors[4], duration: 15 / speed, delay: 8     },
  ]

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ filter: `blur(${blur}px)` }}
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left:   blob.cx,
            top:    blob.cy,
            width:  blob.rx,
            height: blob.ry,
            background: blob.color,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            x: ["-5%", "8%",  "-3%", "10%", "-5%"],
            y: ["-5%", "5%",  "10%", "-8%", "-5%"],
            scale: [1, 1.15, 0.9, 1.2, 1],
            opacity: [0.6, 0.9, 0.7, 1, 0.6],
          }}
          transition={{
            duration:   blob.duration,
            delay:      blob.delay,
            repeat:     Infinity,
            ease:       "easeInOut",
            repeatType: "mirror",
          }}
        />
      ))}
    </div>
  )
}
