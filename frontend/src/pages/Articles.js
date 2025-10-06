"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { Search, Clock, User, Plus, Edit, Trash2 } from "lucide-react"

const Articles = () => {
  const [articles, setArticles] = useState([])
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortKey, setSortKey] = useState('created_at') // created_at | title
  const [sortDir, setSortDir] = useState('desc')
  const [deletingId, setDeletingId] = useState(null)

  const categories = ["ทั้งหมด", "การดูแลทั่วไป", "โภชนาการ", "สุขภาพและโรคภัย", "พฤติกรรม", "การฝึก"]

  useEffect(() => {
    fetchArticles()
  }, [searchTerm, selectedCategory, sortKey, sortDir])

  const fetchArticles = async () => {
    try {
      const params = {}
      if (searchTerm) params.search = searchTerm
      if (selectedCategory && selectedCategory !== "ทั้งหมด") {
        params.category = selectedCategory
      }
      params.sort = sortKey
      params.dir = sortDir

      const response = await apiClient.get("/articles", { params })
      setArticles(response.data || [])
    } catch (error) {
      console.error("Failed to fetch articles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (articleId) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบบทความนี้?")) return
    
    try {
      setDeletingId(articleId)
      await apiClient.delete(`/articles/${articleId}`)
      setArticles(articles.filter(article => article.id !== articleId))
    } catch (error) {
      console.error("Failed to delete article:", error)
      alert("เกิดข้อผิดพลาดในการลบบทความ")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">บทความสุขภาพสัตว์เลี้ยง</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            ความรู้และเคล็ดลับจากสัตวแพทย์มืออาชีพ เพื่อการดูแลสัตว์เลี้ยงที่ดีที่สุด
          </p>
          {/* Add Article Button for Admin/Vet */}
          {(user?.role === 'admin' || user?.role === 'veterinarian') && (
            <div className="mt-6">
              <Link to="/articles/new" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>เพิ่มบทความใหม่</span>
              </Link>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาบทความ..."
              className="form-input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === "ทั้งหมด" ? "" : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  (selectedCategory === category) || (selectedCategory === "" && category === "ทั้งหมด")
                    ? "bg-green-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
            <div className="flex items-center space-x-2 ml-2">
              <span className="text-sm text-gray-600">เรียงโดย:</span>
              <select
                className="form-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
              >
                <option value="created_at">ล่าสุด</option>
                <option value="title">ชื่อเรื่อง</option>
              </select>
              <select
                className="form-select"
                value={sortDir}
                onChange={(e) => setSortDir(e.target.value)}
              >
                <option value="desc">ใหม่ → เก่า</option>
                <option value="asc">เก่า → ใหม่</option>
              </select>
              <button
                onClick={() => { setSearchTerm(""); setSelectedCategory(""); setSortKey('created_at'); setSortDir('desc'); }}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm text-sm"
              >รีเซ็ต</button>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบบทความ</h3>
            <p className="text-gray-600">ลองค้นหาด้วยคำอื่นหรือเปลี่ยนหมวดหมู่</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="card hover:shadow-lg transition-shadow">
                <Link to={`/articles/${article.id}`}>
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    {article.featured_image_url ? (
                      <img 
                        src={article.featured_image_url} 
                        alt={article.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        {article.category}
                      </span>
                      {!article.is_published && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          ร่าง
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{article.title}</h3>

                    <p className="text-gray-600 line-clamp-3">{article.excerpt}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          {article.users?.profile_picture_url ? (
                            <img 
                              src={article.users.profile_picture_url} 
                              alt={article.users?.full_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${article.users?.profile_picture_url ? 'hidden' : 'flex'}`}>
                            <User className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                        <span>{article.users?.full_name || article.author_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>อ่าน 5 นาที</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Admin/Vet Action Buttons */}
                {(user?.role === 'admin' || user?.role === 'veterinarian') && (
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <Link
                      to={`/articles/edit/${article.id}`}
                      className="btn-secondary btn-sm flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>แก้ไข</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="btn-danger btn-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                      <Trash2 className="h-3 w-3" />
                      <span>{deletingId === article.id ? "กำลังลบ..." : "ลบ"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Articles
