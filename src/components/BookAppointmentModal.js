"use client"

import { useState, useEffect } from "react"
import apiClient from "../services/api"
import { X } from "lucide-react"

const BookAppointmentModal = ({ onClose, onAppointmentBooked }) => {
  const [formData, setFormData] = useState({
    pet_id: "",
    veterinarian_id: "",
    appointment_date: "",
    appointment_time: "",
    appointment_type: "",
    notes: "",
  })
  const [pets, setPets] = useState([])
  const [veterinarians, setVeterinarians] = useState([])
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log("BookAppointmentModal mounted, checking token...");
      const token = localStorage.getItem('token');
      console.log("Token exists:", !!token);
      if (token) {
        console.log("Token length:", token.length);
      }
    }
    fetchData()
  }, [])

  const fetchData = async (retryCount = 0) => {
    setDataLoading(true);
    setError("");
    
    try {
      // ตรวจสอบ token ก่อน
      const token = localStorage.getItem('token');
      if (!token) {
        setError("กรุณาเข้าสู่ระบบใหม่");
        setDataLoading(false);
        return;
      }

      // ตรวจสอบว่า backend server ทำงานอยู่หรือไม่
      try {
        await apiClient.get("/health");
      } catch (healthError) {
        console.error("Backend server is not responding:", healthError);
        setError("เซิร์ฟเวอร์ไม่ตอบสนอง กรุณาลองใหม่อีกครั้ง");
        setDataLoading(false);
        return;
      }

      console.log(`Fetching pets and veterinarians... (attempt ${retryCount + 1})`);
      
      // แยก API calls เพื่อให้ง่ายต่อการ debug
      let petsResponse, vetsResponse;
      
      try {
        petsResponse = await apiClient.get("/pets");
        console.log("Pets response:", petsResponse.data);
      } catch (petsError) {
        console.error("Pets fetch error:", petsError);
        throw petsError;
      }
      
      try {
        vetsResponse = await apiClient.get("/users/veterinarians");
        console.log("Vets response:", vetsResponse.data);
      } catch (vetsError) {
        console.error("Vets fetch error:", vetsError);
        throw vetsError;
      }
      
      setPets(petsResponse.data || [])
      setVeterinarians(vetsResponse.data.veterinarians || [])
      setDataLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error)
      
      // Retry logic สำหรับ timeout errors
      if (error.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchData(retryCount + 1), 2000);
        return;
      }
      
      if (error.response?.status === 401) {
        setError("กรุณาเข้าสู่ระบบใหม่");
      } else if (error.code === 'ECONNABORTED') {
        setError("การเชื่อมต่อช้า กรุณาลองใหม่อีกครั้ง");
      } else {
        setError("ไม่สามารถโหลดข้อมูลได้");
      }
      setDataLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // ตรวจสอบข้อมูลที่จำเป็น
      if (
        !formData.pet_id ||
        !formData.veterinarian_id ||
        !formData.appointment_date ||
        !formData.appointment_time ||
        !formData.appointment_type
      ) {
        setError("กรุณากรอกข้อมูลให้ครบถ้วน")
        return
      }

      const appointmentDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`)

      // ตรวจสอบว่าวันที่ไม่ใช่อดีต
      if (appointmentDateTime < new Date()) {
        setError("ไม่สามารถจองนัดหมายในอดีตได้")
        return
      }

      const response = await apiClient.post("/appointments", {
        pet_id: formData.pet_id,
        veterinarian_id: formData.veterinarian_id,
        appointment_date: appointmentDateTime.toISOString(),
        appointment_type: formData.appointment_type,
        notes: formData.notes,
      })

      onAppointmentBooked(response.data)
    } catch (error) {
      setError(error.response?.data?.error || "เกิดข้อผิดพลาดในการจองนัดหมาย")
    } finally {
      setLoading(false)
    }
  }

  // สร้างตัวเลือกเวลา
  const timeOptions = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeOptions.push(timeString)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">จองนัดหมาย</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setError("");
                    fetchData();
                  }}
                  className="text-red-700 hover:text-red-900 underline text-sm"
                >
                  ลองใหม่
                </button>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="pet_id" className="block text-sm font-medium text-gray-700 mb-1">
              เลือกสัตว์เลี้ยง *
            </label>
            <select
              id="pet_id"
              name="pet_id"
              required
              disabled={dataLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.pet_id}
              onChange={handleChange}
            >
              <option value="">
                {dataLoading ? "กำลังโหลด..." : "เลือกสัตว์เลี้ยง"}
              </option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species_name}) - {pet.users?.full_name || 'ไม่ระบุเจ้าของ'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="veterinarian_id" className="block text-sm font-medium text-gray-700 mb-1">
              เลือกสัตวแพทย์ *
            </label>
            <select
              id="veterinarian_id"
              name="veterinarian_id"
              required
              disabled={dataLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              value={formData.veterinarian_id}
              onChange={handleChange}
            >
              <option value="">
                {dataLoading ? "กำลังโหลด..." : "เลือกสัตวแพทย์"}
              </option>
              {veterinarians.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 mb-1">
              ประเภทการนัดหมาย *
            </label>
            <select
              id="appointment_type"
              name="appointment_type"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.appointment_type}
              onChange={handleChange}
            >
              <option value="">เลือกประเภท</option>
              <option value="checkup">ตรวจสุขภาพทั่วไป</option>
              <option value="vaccination">ฉีดวัคซีน</option>
              <option value="consultation">ปรึกษาปัญหา</option>
              <option value="surgery">ผ่าตัด</option>
              <option value="emergency">ฉุกเฉิน</option>
            </select>
          </div>

          <div>
            <label htmlFor="appointment_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่นัดหมาย *
            </label>
            <input
              type="date"
              id="appointment_date"
              name="appointment_date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              min={new Date().toISOString().split("T")[0]}
              value={formData.appointment_date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="appointment_time" className="block text-sm font-medium text-gray-700 mb-1">
              เวลานัดหมาย *
            </label>
            <select
              id="appointment_time"
              name="appointment_time"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.appointment_time}
              onChange={handleChange}
            >
              <option value="">เลือกเวลา</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              หมายเหตุ
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="รายละเอียดเพิ่มเติม..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังจอง..." : "จองนัดหมาย"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookAppointmentModal
