/**
 * File utility functions for formatting and validation
 */

/**
 * Formats a byte number into a human-readable size string (e.g. 512 B, 1.2 KB, 3.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Extracts the file extension without dot (e.g. "CV.pdf" -> "pdf")
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".")
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ""
}

/**
 * Validates if a file matches the allowed extensions from accept string (e.g. ".pdf,.doc,.docx")
 */
export function isValidFileType(filename: string, accept: string): boolean {
  if (!accept || accept === "*") return true
  const ext = `.${getFileExtension(filename)}`
  const allowed = accept
    .split(",")
    .map((s) => s.trim().toLowerCase())

  return allowed.some((a) => a === ext || a === `*` || filename.toLowerCase().endsWith(a))
}

/**
 * Validates if file does not exceed maximum allowed size
 */
export function isValidFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes
}

