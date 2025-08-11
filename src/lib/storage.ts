import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export type FileType = 'trip-photo' | 'driver-doc'

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export const STORAGE_CONFIG = {
  buckets: {
    'trip-photo': 'trip-photos',
    'driver-doc': 'driver-docs'
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    'trip-photo': ['image/jpeg', 'image/png', 'image/webp'],
    'driver-doc': ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  }
}

export function validateFile(file: File, fileType: FileType): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > STORAGE_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size must be less than ${formatFileSize(STORAGE_CONFIG.maxFileSize)}`
    }
  }

  // Check file type
  const allowedTypes = STORAGE_CONFIG.allowedTypes[fileType]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  return { valid: true }
}

export async function uploadFile(
  file: File, 
  fileType: FileType, 
  metadata: Record<string, any> = {}
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${metadata.driverId || 'general'}/${uuidv4()}.${fileExt}`
    const bucketName = STORAGE_CONFIG.buckets[fileType]

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

    return {
      success: true,
      url: urlData.publicUrl,
      path: fileName
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export async function uploadTripPhoto(file: File, tripId: string): Promise<string> {
  const result = await uploadFile(file, 'trip-photo', { tripId })
  
  if (!result.success) {
    throw new Error(result.error || 'Upload failed')
  }
  
  return result.path || ''
}

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getFileIcon(file: File): string {
  if (file.type.startsWith('image/')) return '🖼️'
  if (file.type === 'application/pdf') return '📄'
  if (file.type.includes('document')) return '📝'
  return '📁'
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf'
}