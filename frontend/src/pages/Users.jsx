import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Users as UsersIcon, Plus, Edit, Trash2, UserCheck, UserX, Search, Filter } from 'lucide-react';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');


  // Function to fetch all users from the API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users.');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handler for user status update
  const handleUserStatusUpdate = async (userId, isActive) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, { is_active: isActive });
      setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)));
      alert(`อัพเดทสถานะผู้ใช้${isActive ? "เปิดใช้" : "ระงับ"}สำเร็จแล้ว`);
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.error || error.message}`);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">จัดการผู้ใช้งาน</h1>
          <p className="text-gray-600 mt-2">จัดการข้อมูลผู้ใช้งานในระบบ</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="ค้นหาผู้ใช้..."
                className="form-input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="form-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">ทุกประเภท</option>
                <option value="user">ผู้ใช้</option>
                <option value="veterinarian">สัตวแพทย์</option>
                <option value="admin">ผู้ดูแล</option>
              </select>
            </div>

            {/* Status Filter */}
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ระงับ</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้ใช้งาน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่สมัคร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เข้าสู่ระบบล่าสุด
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{userItem.full_name}</div>
                        <div className="text-sm text-gray-500">{userItem.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : userItem.role === "veterinarian"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {userItem.role === "admin" ? "ผู้ดูแล" : userItem.role === "veterinarian" ? "สัตวแพทย์" : "ผู้ใช้"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userItem.created_at).toLocaleDateString("th-TH")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.last_login ? new Date(userItem.last_login).toLocaleDateString("th-TH") : "ยังไม่เคย"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userItem.is_active ? "ใช้งาน" : "ระงับ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {userItem.role !== "admin" && (
                        <div className="flex space-x-2">
                          {userItem.is_active ? (
                            <button
                              onClick={() => handleUserStatusUpdate(userItem.id, false)}
                              className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                            >
                              <UserX className="h-4 w-4" />
                              <span>ระงับ</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUserStatusUpdate(userItem.id, true)}
                              className="text-green-600 hover:text-green-900 flex items-center space-x-1"
                            >
                              <UserCheck className="h-4 w-4" />
                              <span>เปิดใช้</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบผู้ใช้</h3>
              <p className="text-gray-600">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;