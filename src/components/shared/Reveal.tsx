"use client"

import * as React from "react"
import { motion, useInView, useAnimation } from "framer-motion"

interface RevealProps {
  children: React.ReactNode
  width?: "fit-content" | "100%"
  delay?: number
  duration?: number
  y?: number
  x?: number
  scale?: number
}

export const Reveal = ({ 
  children, 
  width = "fit-content", 
  delay = 0.2,
  duration = 0.5,
  y = 40,
  x = 0,
  scale = 1
}: RevealProps) => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const mainControls = useAnimation()

  React.useEffect(() => {
    if (isInView) {
      mainControls.start("visible")
    }
  }, [isInView, mainControls])

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { opacity: 0, y, x, scale },
          visible: { opacity: 1, y: 0, x: 0, scale: 1 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}
