"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import apiClient from "../services/api"
import { ArrowLeft, User, Clock, Calendar } from "lucide-react"

const ArticleDetail = () => {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchArticle()
  }, [id])

  const fetchArticle = async () => {
    try {
      const response = await apiClient.get(`/articles/${id}`)
      setArticle(response.data)
    } catch (error) {
      setError("ไม่พบบทความที่ต้องการ")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{error}</h2>
          <Link to="/articles" className="btn-primary">
            กลับไปหน้าบทความ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/articles" className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600 mb-8">
          <ArrowLeft className="h-4 w-4" />
          <span>กลับไปหน้าบทความ</span>
        </Link>

        {/* Article Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="mb-6">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">{article.category}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.title}</h1>

          <div className="flex items-center space-x-6 text-gray-600 mb-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{article.author_name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{new Date(article.created_at).toLocaleDateString("th-TH")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>อ่าน 5 นาที</span>
            </div>
          </div>

          {article.excerpt && <p className="text-xl text-gray-600 leading-relaxed">{article.excerpt}</p>}
        </div>

        {/* Featured Image */}
        {article.featured_image_url && (
          <div className="mb-8">
            <img 
              src={article.featured_image_url} 
              alt={article.title}
              className="w-full h-auto rounded-xl shadow-md object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">{article.content}</div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">บทความที่เกี่ยวข้อง</h3>
          <div className="text-center py-8 text-gray-600">
            <p>กำลังโหลดบทความที่เกี่ยวข้อง...</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticleDetail
