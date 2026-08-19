// src/app/api/version/route.ts
import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  let buildId = "development"
  
  try {
    // Tenter de lire le BUILD_ID généré par Next.js lors du build de production
    const filePath = path.join(process.cwd(), ".next", "BUILD_ID")
    if (fs.existsSync(filePath)) {
      buildId = fs.readFileSync(filePath, "utf-8").trim()
    }
  } catch (err) {
    console.warn("Impossible de lire le BUILD_ID :", err)
  }

  // Permettre également un fallback via variable d'environnement ou timestamp
  const buildHash = process.env.NEXT_PUBLIC_BUILD_ID || buildId

  return NextResponse.json({ hash: buildHash })
}
