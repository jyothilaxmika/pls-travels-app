"use client"

import { useState, useRef } from "react"
import { 
  Upload, X, CheckCircle, AlertCircle, Loader2, 
  Image, FileText, Eye, Download, Trash2 
} from 'lucide-react'
import { 
  uploadFile, validateFile, createPreviewUrl, revokePreviewUrl,
  formatFileSize, getFileIcon, isImageFile, isPdfFile,
  FileType, UploadResult, UploadProgress 
} from "@/lib/storage"

interface UploadButtonProps {
  fileType: FileType
  onUploadSuccess: (result: UploadResult) => void
  onUploadError?: (error: string) => void
  metadata?: Record<string, any>
  className?: string
  disabled?: boolean
  showPreview?: boolean
  maxFiles?: number
  accept?: string
  placeholder?: string
}

export default function UploadButton({
  fileType,
  onUploadSuccess,
  onUploadError,
  metadata = {},
  className = "",
  disabled = false,
  showPreview = true,
  maxFiles = 1,
  accept,
  placeholder = "Choose file or drag and drop"
}: UploadButtonProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles = Array.from(selectedFiles)
    const validFiles: File[] = []
    const newPreviewUrls: string[] = []

    newFiles.forEach(file => {
      const validation = validateFile(file, fileType)
      if (validation.valid) {
        validFiles.push(file)
        if (showPreview && isImageFile(file)) {
          newPreviewUrls.push(createPreviewUrl(file))
        }
      } else {
        onUploadError?.(validation.error || 'Invalid file')
      }
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles].slice(0, maxFiles))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, maxFiles))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress({ loaded: 0, total: files.length, percentage: 0 })

    const results: UploadResult[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        const result = await uploadFile(file, fileType, metadata)
        results.push(result)
        
        if (result.success) {
          onUploadSuccess(result)
        } else {
          onUploadError?.(result.error || 'Upload failed')
        }
        
        // Update progress
        setUploadProgress(prev => prev ? {
          loaded: i + 1,
          total: files.length,
          percentage: ((i + 1) / files.length) * 100
        } : null)
        
      } catch (error) {
        const errorResult: UploadResult = {
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed'
        }
        results.push(errorResult)
        onUploadError?.(errorResult.error || 'Upload failed')
      }
    }

    setUploadResults(results)
    setUploading(false)
    setUploadProgress(null)
    
    // Clear files after upload
    setTimeout(() => {
      clearFiles()
    }, 2000)
  }

  const clearFiles = () => {
    // Revoke preview URLs
    previewUrls.forEach(url => revokePreviewUrl(url))
    
    setFiles([])
    setPreviewUrls([])
    setUploadResults([])
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...files]
    const newPreviewUrls = [...previewUrls]
    
    // Revoke preview URL
    if (newPreviewUrls[index]) {
      revokePreviewUrl(newPreviewUrls[index])
    }
    
    newFiles.splice(index, 1)
    newPreviewUrls.splice(index, 1)
    
    setFiles(newFiles)
    setPreviewUrls(newPreviewUrls)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">{placeholder}</p>
            <p className="text-xs text-gray-500 mt-1">
              {maxFiles > 1 ? `Up to ${maxFiles} files` : 'Single file'} • 
              {fileType === 'trip-photo' ? ' Images only' : ' Images, PDFs, Documents'}
            </p>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFileIcon(file)}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {showPreview && isImageFile(file) && previewUrls[index] && (
                    <button
                      onClick={() => window.open(previewUrls[index], '_blank')}
                      className="p-1 text-gray-500 hover:text-blue-600"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-500 hover:text-red-600"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Progress */}
          {uploading && uploadProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResults.length > 0 && (
            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className={`flex items-center gap-2 p-2 rounded ${
                  result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span className="text-sm">
                    {result.success ? 'Upload successful' : result.error}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {!uploading && files.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={disabled}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload {files.length} File{files.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for inline use
export function UploadButtonCompact({
  fileType,
  onUploadSuccess,
  onUploadError,
  metadata = {},
  className = "",
  disabled = false,
  children
}: UploadButtonProps & { children?: React.ReactNode }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validation = validateFile(file, fileType)
    
    if (!validation.valid) {
      onUploadError?.(validation.error || 'Invalid file')
      return
    }

    setUploading(true)
    
    try {
      const result = await uploadFile(file, fileType, metadata)
      if (result.success) {
        onUploadSuccess(result)
      } else {
        onUploadError?.(result.error || 'Upload failed')
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={fileType === 'trip-photo' ? 'image/*' : '*/*'}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {children || (uploading ? 'Uploading...' : 'Upload')}
      </button>
    </div>
  )
} 