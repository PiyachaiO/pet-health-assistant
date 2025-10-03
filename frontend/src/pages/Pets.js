"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import apiClient from "../services/api"
import { PawPrint, Search, Filter, Users, Calendar, Heart, ArrowLeft } from "lucide-react"

const Pets = () => {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterSpecies, setFilterSpecies] = useState("")
  const [filterBreed, setFilterBreed] = useState("")

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const response = await apiClient.get('/pets')
      let allPets = []
      
      if (Array.isArray(response.data)) {
        allPets = response.data
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        allPets = response.data.data
      } else if (response.data?.pets && Array.isArray(response.data.pets)) {
        allPets = response.data.pets
      }
      
      // Load images for pets that have photo_url
      const petsWithImages = await Promise.all(
        allPets.map(async (pet) => {
          if (pet.photo_url) {
            try {
              // For existing images, try to fetch and convert to base64
              if (pet.photo_url.startsWith('/uploads/') || pet.photo_url.startsWith('http://localhost:5000/api/upload/image/')) {
                const filename = pet.photo_url.includes('/') ? pet.photo_url.split('/').pop() : pet.photo_url
                const response = await fetch(`${process.env.REACT_APP_API_URL.replace('/api', '')}/upload/image/${filename}`)
                if (response.ok) {
                  const blob = await response.blob()
                  const reader = new FileReader()
                  return new Promise((resolve) => {
                    reader.onload = (e) => {
                      resolve({ ...pet, photo_url: e.target.result })
                    }
                    reader.readAsDataURL(blob)
                  })
                }
              }
            } catch (error) {
              console.error('Failed to load pet image:', error)
            }
          }
          return pet
        })
      )
      
      setPets(petsWithImages)
    } catch (error) {
      console.error("Failed to fetch pets:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter pets based on search and filters
  const filteredPets = pets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecies = !filterSpecies || pet.species === filterSpecies
    const matchesBreed = !filterBreed || pet.breed === filterBreed
    
    return matchesSearch && matchesSpecies && matchesBreed
  })

  // Get unique species and breeds for filter dropdowns
  const species = [...new Set(pets.map(pet => pet.species).filter(Boolean))]
  const breeds = [...new Set(pets.map(pet => pet.breed).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center space-x-2 text-green-500 hover:text-green-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>กลับไปแดชบอร์ด</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <PawPrint className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">สัตว์เลี้ยงทั้งหมดในระบบ</h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'veterinarian' 
                  ? 'ดูข้อมูลสัตว์เลี้ยงผู้ป่วยทั้งหมด' 
                  : 'ดูข้อมูลสัตว์เลี้ยงของคุณ'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <PawPrint className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">สัตว์เลี้ยงทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{pets.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">เจ้าของทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">
                  {[...new Set(pets.map(pet => pet.user_id))].length}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">สายพันธุ์</p>
                <p className="text-2xl font-bold text-gray-900">{species.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">เพิ่มใหม่วันนี้</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pets.filter(pet => {
                    const today = new Date()
                    const petDate = new Date(pet.created_at)
                    return petDate.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">ค้นหา</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหาตามชื่อสัตว์เลี้ยง, เจ้าของ, สายพันธุ์..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Species Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชนิดสัตว์</label>
              <select
                value={filterSpecies}
                onChange={(e) => setFilterSpecies(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                {species.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {/* Breed Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">สายพันธุ์</label>
              <select
                value={filterBreed}
                onChange={(e) => setFilterBreed(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">ทั้งหมด</option>
                {breeds.map(breed => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.length === 0 ? (
            <div className="col-span-full">
              <div className="card text-center py-12">
                <PawPrint className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterSpecies || filterBreed ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีข้อมูลสัตว์เลี้ยง'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterSpecies || filterBreed 
                    ? 'ลองเปลี่ยนคำค้นหาหรือตัวกรอง' 
                    : 'ข้อมูลสัตว์เลี้ยงจะแสดงที่นี่เมื่อมีผู้ใช้ลงทะเบียน'
                  }
                </p>
              </div>
            </div>
          ) : (
            filteredPets.map((pet) => (
              <Link key={pet.id} to={`/pets/${pet.id}`} className="block">
                <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer group h-full">
                  <div className="flex flex-col h-full">
                    {/* Pet Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors overflow-hidden">
                        {pet.photo_url ? (
                          <img 
                            src={pet.photo_url} 
                            alt={pet.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${pet.photo_url ? 'hidden' : 'flex'}`}>
                          <PawPrint className="h-10 w-10 text-gray-600" />
                        </div>
                      </div>
                    </div>

                    {/* Pet Info */}
                    <div className="flex-1 text-center">
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors text-lg mb-2">
                        {pet.name}
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-medium">{pet.species}</span>
                          {pet.breed && <span>- {pet.breed}</span>}
                        </div>
                        
                        <div className="flex items-center justify-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{pet.users?.full_name || 'ไม่ระบุเจ้าของ'}</span>
                        </div>
                        
                        {pet.weight && (
                          <div className="flex items-center justify-center space-x-2">
                            <Heart className="h-4 w-4" />
                            <span>{pet.weight} กก.</span>
                          </div>
                        )}
                        
                        {pet.color && (
                          <div className="flex items-center justify-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{backgroundColor: pet.color}}
                            ></div>
                            <span>{pet.color}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          เพิ่มเมื่อ: {new Date(pet.created_at).toLocaleDateString("th-TH")}
                        </span>
                        <div className="text-gray-400 group-hover:text-green-500 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Results Count */}
        {filteredPets.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              แสดง {filteredPets.length} จาก {pets.length} รายการ
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Pets
