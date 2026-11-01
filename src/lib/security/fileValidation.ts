/**
 * Validation stricte et sécurisée des fichiers téléversés pour ImmOfika
 */

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export const FORBIDDEN_EXTENSIONS = new Set([
  'html', 'htm', 'svg', 'php', 'phtml', 'exe', 'bat', 'cmd', 'sh',
  'bash', 'js', 'mjs', 'cjs', 'ts', 'jsx', 'tsx', 'py', 'vbs', 'jar',
  'war', 'apk', 'msi', 'dll', 'so', 'bin', 'cgi', 'pl'
])

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 Mo

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateUploadedFile(file: File): ValidationResult {
  // 1. Vérification de la taille
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Le fichier "${file.name}" dépasse la taille maximale autorisée (5 Mo).`,
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: `Le fichier "${file.name}" est vide.`,
    }
  }

  // 2. Vérification de l'extension
  const parts = file.name.split('.')
  const ext = (parts.length > 1 ? parts.pop() : '')?.toLowerCase() || ''

  if (!ext || FORBIDDEN_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `L'extension du fichier "${file.name}" (.${ext}) est interdite pour des raisons de sécurité.`,
    }
  }

  // 3. Vérification du type MIME déclaré
  const mimeType = file.type.toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: `Le type de fichier "${file.type || 'inconnu'}" n'est pas autorisé. Seuls les formats PDF, Word (DOC/DOCX) et images (JPG, PNG, WebP) sont acceptés.`,
    }
  }

  return { valid: true }
}
