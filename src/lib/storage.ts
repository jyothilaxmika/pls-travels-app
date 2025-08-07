import { supabase } from './supabase'
import { v4 as uuidv4 } from 'uuid'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export type FileType = 'trip-photo' | 'driver-license' | 'driver-aadhar' | 'driver-other'

export interface UploadConfig {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  bucketName: string
  folderPath: string
}

export const UPLOAD_CONFIGS: Record<FileType, UploadConfig> = {
  'trip-photo': {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    bucketName: 'trip-photos',
    folderPath: 'trips'
  },
  'driver-license': {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    bucketName: 'driver-docs',
    folderPath: 'licenses'
  },
  'driver-aadhar': {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    bucketName: 'driver-docs',
    folderPath: 'aadhar'
  },
  'driver-other': {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    bucketName: 'driver-docs',
    folderPath: 'other'
  }
}

export function validateFile(file: File, fileType: FileType): { valid: boolean; error?: string } {
  const config = UPLOAD_CONFIGS[fileType]
  
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size (${config.maxFileSize / 1024 / 1024}MB)`
    }
  }
  
  // Check file type
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type (${file.type}) is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`
    }
  }
  
  return { valid: true }
}

export async function uploadFile(
  file: File, 
  fileType: FileType, 
  metadata: Record<string, any> = {},
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file, fileType)
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error
      }
    }
    
    const config = UPLOAD_CONFIGS[fileType]
    const fileExt = file.name.split('.').pop()
    const fileName = `${config.folderPath}/${uuidv4()}.${fileExt}`
    
    // Upload file
    const { data, error } = await supabase.storage
      .from(config.bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        metadata: {
          ...metadata,
          originalName: file.name,
          fileType,
          uploadedAt: new Date().toISOString()
        }
      })
    
    if (error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(config.bucketName)
      .getPublicUrl(fileName)
    
    return {
      success: true,
      url: urlData.publicUrl,
      fileName: fileName
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

export async function uploadTripPhoto(
  file: File, 
  driverId: string, 
  tripId?: string
): Promise<UploadResult> {
  const metadata = {
    driverId,
    tripId,
    uploadedBy: 'driver',
    purpose: 'trip-verification'
  }
  
  return uploadFile(file, 'trip-photo', metadata)
}

export async function uploadDriverDocument(
  file: File,
  driverId: string,
  documentType: 'driver-license' | 'driver-aadhar' | 'driver-other',
  description?: string
): Promise<UploadResult> {
  const metadata = {
    driverId,
    documentType,
    description,
    uploadedBy: 'admin',
    purpose: 'driver-verification'
  }
  
  return uploadFile(file, documentType, metadata)
}

export async function deleteFile(fileName: string, bucketName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName])
    
    if (error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed'
    }
  }
}

export async function listDriverDocuments(driverId: string): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from('driver-docs')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) {
      return {
        success: false,
        error: error.message
      }
    }
    
    // Filter files for this driver
    const driverFiles = data.filter(file => 
      file.metadata?.driverId === driverId
    )
    
    return {
      success: true,
      files: driverFiles
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'List failed'
    }
  }
}

export async function getFileUrl(fileName: string, bucketName: string): Promise<string | null> {
  try {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  } catch (error) {
    console.error('Error getting file URL:', error)
    return null
  }
}

// Utility function to create a preview URL for images
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// Utility function to revoke preview URL
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// Utility function to get file extension
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

// Utility function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Utility function to check if file is an image
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

// Utility function to check if file is a PDF
export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf'
}

// Utility function to get file icon based on type
export function getFileIcon(file: File): string {
  if (isImageFile(file)) return '🖼️'
  if (isPdfFile(file)) return '📄'
  if (file.type.includes('word')) return '��'
  return '📎'
} 