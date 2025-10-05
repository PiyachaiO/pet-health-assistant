import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { Save, X } from 'lucide-react';

const VetNutritionForm = ({ petId, existingRecommendation, planId, onSave, onCancel }) => {
  const [instructions, setInstructions] = useState(existingRecommendation || '');
  const [calories, setCalories] = useState('');
  const [selectedPetId, setSelectedPetId] = useState(petId || '');
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ดึงข้อมูลสัตว์เลี้ยงทั้งหมด (สำหรับสัตวแพทย์)
  useEffect(() => {
    const fetchPets = async () => {
      setLoadingPets(true);
      try {
        const response = await apiClient.get('/pets');
        setPets(response.data || []);
      } catch (err) {
        console.error('Failed to fetch pets:', err);
        setError('ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้');
      } finally {
        setLoadingPets(false);
      }
    };
    
    fetchPets();
  }, []);

  // ดึงข้อมูลสัตว์เลี้ยงที่เลือก
  useEffect(() => {
    if (selectedPetId && pets.length > 0) {
      const pet = pets.find(p => p.id === selectedPetId);
      setSelectedPet(pet || null);
    } else if (petId) {
      // ถ้ามี petId จาก props ให้หา pet จาก pets array
      const pet = pets.find(p => p.id === petId);
      setSelectedPet(pet || null);
    } else {
      setSelectedPet(null);
    }
  }, [selectedPetId, pets, petId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // One Active Plan Per Pet: Always create a new plan
      // Old plans will be auto-deactivated by backend
      if (!selectedPetId) {
        setError('กรุณาเลือกสัตว์เลี้ยง');
        setSaving(false);
        return;
      }
      
      const response = await apiClient.post('/nutrition/vet-recommendation', {
        pet_id: selectedPetId,
        custom_instructions: instructions,
        custom_calories: calories ? parseInt(calories) : null
      });
      
      onSave(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'ไม่สามารถบันทึกคำแนะนำได้';
      setError(errorMessage);
      console.error('Failed to save vet recommendation:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        สร้างแผนโภชนาการใหม่
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        แผนใหม่จะแทนที่แผนปัจจุบัน และแผนเก่าจะถูกเก็บเป็นประวัติอัตโนมัติ
      </p>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* Pet Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลือกสัตว์เลี้ยง <span className="text-red-500">*</span>
          </label>
          {loadingPets ? (
            <div className="text-gray-500">กำลังโหลดข้อมูลสัตว์เลี้ยง...</div>
          ) : (
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="form-select w-full"
              required
            >
              <option value="">-- เลือกสัตว์เลี้ยง --</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.species} - {pet.breed || 'ไม่ระบุพันธุ์'})
                </option>
              ))}
            </select>
          )}
          {pets.length === 0 && !loadingPets && (
            <p className="text-sm text-gray-500 mt-1">ไม่พบข้อมูลสัตว์เลี้ยงในระบบ</p>
          )}
          {selectedPet && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>สัตว์เลี้ยงที่เลือก:</strong> {selectedPet.name}
              </p>
              <p className="text-xs text-blue-600">
                {selectedPet.species} - {selectedPet.breed || 'ไม่ระบุพันธุ์'} | 
                น้ำหนัก: {selectedPet.weight ? `${selectedPet.weight} กก.` : 'ไม่ระบุ'} | 
                เจ้าของ: {selectedPet.users?.full_name || 'ไม่ระบุ'}
              </p>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            แคลอรี่ต่อวัน (kcal)
          </label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            className="form-input w-full"
            placeholder="เช่น 350"
            min="0"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            คำแนะนำโภชนาการ
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows="5"
            className="form-textarea w-full"
            placeholder="กรอกคำแนะนำโภชนาการสำหรับสัตว์เลี้ยง..."
            required
          />
        </div>
        
        <div className="flex justify-end gap-4 mt-4">
          <button type="button" onClick={onCancel} className="btn-secondary">
            <X size={18} className="mr-2" />
            ยกเลิก
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={18} className="mr-2" />
            {saving ? 'กำลังสร้างแผน...' : 'สร้างแผนใหม่'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VetNutritionForm;