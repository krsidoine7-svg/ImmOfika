import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'immofika-documents'
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || ''

// Initialize the S3 Client for Cloudflare R2
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

/**
 * Uploads a file (Buffer) to Cloudflare R2 and returns its public URL.
 * @param buffer The file content buffer
 * @param fileName The desired file name (without path)
 * @param contentType The MIME type (e.g., 'application/pdf')
 * @returns The public URL of the uploaded file
 */
export async function uploadToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'factures'
): Promise<string> {
  // Create a unique file path to avoid overwriting
  const uniqueId = crypto.randomUUID().substring(0, 8)
  const fileKey = `${folder}/${Date.now()}-${uniqueId}-${fileName.replace(/\s+/g, '_')}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  })

  try {
    await r2Client.send(command)
    // Return the public URL for this file
    // Assumes R2_PUBLIC_URL is configured (e.g., https://pub-xxxx.r2.dev)
    const publicUrl = `${R2_PUBLIC_URL}/${fileKey}`
    return publicUrl
  } catch (error) {
    console.error('[R2 Upload Error]', error)
    throw new Error('Erreur lors de l\'upload vers Cloudflare R2')
  }
}

/**
 * Téléverse un document confidentiel (KYC, CNI, passeport, contrat)
 * dans un répertoire privé et retourne la clé interne du fichier.
 */
export async function uploadSecureToR2(
  buffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'kyc'
): Promise<string> {
  const uniqueId = crypto.randomUUID().substring(0, 8)
  const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileKey = `private/${folder}/${Date.now()}-${uniqueId}-${cleanName}`

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  })

  try {
    await r2Client.send(command)
    return fileKey
  } catch (error) {
    console.error('[R2 Secure Upload Error]', error)
    throw new Error('Erreur lors de l\'upload sécurisé du document confidentiel')
  }
}

/**
 * Récupère un fichier sécurisé depuis Cloudflare R2
 */
export async function getSecureR2Object(fileKey: string) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  })

  return await r2Client.send(command)
}

