import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

const ManageArticles = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      // We use the admin/all route to get all articles for management purposes
      const response = await axios.get("/api/articles/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setArticles(response.data)
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลบทความได้")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?")) {
      try {
        await axios.delete(`/api/articles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setArticles(articles.filter((article) => article.id !== id))
      } catch (err) {
        alert("เกิดข้อผิดพลาดในการลบบทความ")
        console.error(err)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">จัดการบทความ</h1>
        <Link to="/admin/articles/new" className="btn-primary inline-flex items-center gap-2">
          <PlusCircle size={20} />
          สร้างบทความใหม่
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หัวข้อ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้เขียน
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สร้าง
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{article.users.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(article.created_at).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      <Link to={`/admin/articles/edit/${article.id}`} className="text-indigo-600 hover:text-indigo-900">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ManageArticles