"use client"

import { useState } from "react"
import { Upload, X } from "lucide-react"
import apiClient from "../services/api"

const ImageUpload = ({ onImageUploaded, currentImage, className = "" }) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage || null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB")
      return
    }

    setUploading(true)

    try {
      // Create preview and convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target.result
        setPreview(base64Data)
        
        // Upload to server
        const formData = new FormData()
        formData.append('file', file)

        const response = await apiClient.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        // Use base64 data for display, but store server URL for database
        const serverUrl = `http://localhost:5000/api/upload/image/${response.data.file.filename}`
        onImageUploaded(serverUrl)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload failed:", error)
      alert(`เกิดข้อผิดพลาดในการอัพโหลด: ${error.response?.data?.error || error.message}`)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded(null)
  }

  return (
    <div className={`relative ${className}`}>
      {preview ? (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">คลิกเพื่ือเลือกรูป</span> หรือลากไฟล์มาวาง
                </p>
                <p className="text-xs text-gray-500">PNG, JPG หรือ GIF (สูงสุด 5MB)</p>
              </>
            )}
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} disabled={uploading} />
        </label>
      )}
    </div>
  )
}

export default ImageUpload
