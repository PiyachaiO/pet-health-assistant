"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { ArrowLeft, Save, Eye, Upload, X, Image, Trash2 } from "lucide-react"
import ImageUpload from "../components/ImageUpload"

const ArticleForm = () => {
  const { id } = useParams() // id จะมีค่าเมื่อเป็นการแก้ไข
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    is_published: false
  })

  const [imagePreview, setImagePreview] = useState(null)

  const categories = [
    "การดูแลทั่วไป",
    "โภชนาการ", 
    "สุขภาพและโรคภัย",
    "พฤติกรรม",
    "การฝึก"
  ]

  // ดึงข้อมูลบทความถ้าเป็นการแก้ไข
  useEffect(() => {
    if (id) {
      fetchArticle()
    }
  }, [id])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/articles/${id}`)
      const article = response.data
      
      setFormData({
        title: article.title || "",
        category: article.category || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        featured_image_url: article.featured_image_url || "",
        is_published: article.is_published || false
      })

      // ถ้ามีรูปภาพอยู่แล้ว ให้แสดง preview
      if (article.featured_image_url) {
        setImagePreview(article.featured_image_url)
      }
    } catch (error) {
      console.error("Failed to fetch article:", error)
      setError("ไม่สามารถโหลดข้อมูลบทความได้")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleContentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      content: e.target.value
    }))
  }

  const handleImageUploaded = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      featured_image_url: imageUrl
    }))
    setImagePreview(imageUrl)
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featured_image_url: ""
    }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      if (id) {
        // แก้ไขบทความ
        await apiClient.put(`/articles/${id}`, formData)
      } else {
        // สร้างบทความใหม่
        await apiClient.post("/articles", formData)
      }
      
      navigate("/articles")
    } catch (error) {
      console.error("Failed to save article:", error)
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการบันทึกบทความ")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/articles" className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600">
            <ArrowLeft className="h-4 w-4" />
            <span>กลับไปหน้าบทความ</span>
          </Link>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye className="h-4 w-4" />
              <span>{previewMode ? "แก้ไข" : "ดูตัวอย่าง"}</span>
            </button>
          </div>
        </div>

        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {id ? "แก้ไขบทความ" : "สร้างบทความใหม่"}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {previewMode ? (
            /* Preview Mode */
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.title || "หัวข้อบทความ"}</h2>
                {formData.category && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {formData.category}
                  </span>
                )}
              </div>
              
              {imagePreview && (
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={imagePreview} 
                    alt="รูปภาพปกบทความ" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {formData.excerpt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 italic">{formData.excerpt}</p>
                </div>
              )}
              
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, '<br/>') }} />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label htmlFor="title" className="form-label">หัวข้อบทความ *</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    className="form-input"
                    placeholder="กรอกหัวข้อบทความ..."
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="form-label">หมวดหมู่ *</label>
                  <select
                    id="category"
                    name="category"
                    required
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">เลือกหมวดหมู่</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Featured Image Upload */}
                <div>
                  <label className="form-label">รูปภาพปก</label>
                  <ImageUpload
                    onImageUploaded={handleImageUploaded}
                    currentImage={imagePreview}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    <p>รองรับไฟล์: JPG, PNG, GIF</p>
                    <p>ขนาดไฟล์สูงสุด: 5MB</p>
                  </div>
                </div>

                {/* Excerpt */}
                <div className="md:col-span-2">
                  <label htmlFor="excerpt" className="form-label">สรุปย่อ</label>
                  <textarea
                    id="excerpt"
                    name="excerpt"
                    rows="3"
                    className="form-input"
                    placeholder="สรุปย่อบทความ..."
                    value={formData.excerpt}
                    onChange={handleChange}
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                  <label htmlFor="content" className="form-label">เนื้อหาบทความ *</label>
                  <textarea
                    id="content"
                    name="content"
                    rows="15"
                    required
                    className="form-input font-mono"
                    placeholder="เขียนเนื้อหาบทความที่นี่..."
                    value={formData.content}
                    onChange={handleContentChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    ใช้ Enter เพื่อขึ้นบรรทัดใหม่
                  </p>
                </div>

                {/* Published Status */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleChange}
                      className="form-checkbox"
                    />
                    <span className="text-sm font-medium text-gray-700">เผยแพร่ทันที</span>
                  </label>
                  <p className="text-sm text-gray-500 mt-1">
                    ถ้าไม่เลือก บทความจะถูกบันทึกเป็นแบบร่าง
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link to="/articles" className="btn-secondary">
                  ยกเลิก
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "กำลังบันทึก..." : (id ? "อัปเดตบทความ" : "สร้างบทความ")}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticleForm