import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api';
import { Users as UsersIcon, Search, Filter, TrendingUp, UserX, UserCheck } from 'lucide-react';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_at'); // created_at | last_login | name
  const [sortDir, setSortDir] = useState('desc'); // asc | desc


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

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let av, bv;
    if (sortKey === 'created_at') {
      av = new Date(a.created_at).getTime();
      bv = new Date(b.created_at).getTime();
    } else if (sortKey === 'last_login') {
      av = a.last_login ? new Date(a.last_login).getTime() : 0;
      bv = b.last_login ? new Date(b.last_login).getTime() : 0;
    } else {
      av = (a.full_name || '').toLowerCase();
      bv = (b.full_name || '').toLowerCase();
    }
    if (av === bv) return 0;
    const result = av > bv ? 1 : -1;
    return sortDir === 'asc' ? result : -1 * result;
  });

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ผู้ใช้งานทั้งหมด</p>
              <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
            </div>
            <UsersIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ใช้งานอยู่</p>
              <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.is_active).length}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">สัตวแพทย์</p>
              <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'veterinarian').length}</p>
            </div>
            <span className="text-blue-600 text-xl">🐾</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">แอดมิน</p>
              <p className="text-2xl font-semibold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <span className="text-purple-600 text-xl">🛡️</span>
          </div>
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

            {/* Reset */}
            <button
              onClick={() => { setSearchTerm(''); setRoleFilter('all'); setStatusFilter('all'); setSortKey('created_at'); setSortDir('desc'); }}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:shadow-sm"
            >รีเซ็ต</button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภท</th>
                  <th onClick={() => toggleSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    วันที่สมัคร {sortKey === 'created_at' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                  <th onClick={() => toggleSort('last_login')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    เข้าสู่ระบบล่าสุด {sortKey === 'last_login' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
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
                {sortedUsers.map((userItem) => (
                  <tr key={userItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                          {userItem.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{userItem.full_name}</div>
                          <div className="text-sm text-gray-500">{userItem.email}</div>
                        </div>
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