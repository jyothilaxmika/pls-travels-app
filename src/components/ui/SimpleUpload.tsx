"use client"

import { useState, useRef } from "react"
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadTripPhoto } from "@/lib/storage"

interface SimpleUploadProps {
  tripId: string
  onUploadSuccess: (url: string) => void
  onUploadError?: (error: string) => void
  className?: string
}

export default function SimpleUpload({
  tripId,
  onUploadSuccess,
  onUploadError,
  className = ""
}: SimpleUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const url = await uploadTripPhoto(selectedFile, tripId)
      setUploadedUrl(url)
      onUploadSuccess(url)
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadedUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dashboard Photo
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Preview:</span>
            <button
              onClick={clearFile}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <img
            src={previewUrl}
            alt="Preview"
            className="h-32 w-32 object-cover rounded-lg border border-gray-300"
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !uploadedUrl && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      )}

      {/* Success Message */}
      {uploadedUrl && (
        <div className="flex items-center gap-2 p-2 bg-green-50 text-green-800 rounded-md">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Photo uploaded successfully!</span>
        </div>
      )}
    </div>
  )
} 