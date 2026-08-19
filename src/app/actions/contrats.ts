'use server'

import { uploaderContratScanneAction } from "@/app/actions/contrat"

export async function uploadContratScanneAction(input: any) {
  return uploaderContratScanneAction(input)
}
