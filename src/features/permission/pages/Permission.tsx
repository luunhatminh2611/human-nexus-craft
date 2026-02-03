import React, { useState } from 'react';
import { Users, Building2, ShieldCheck, User, ChevronDown, ChevronRight, Search, AlertCircle } from 'lucide-react';

const PermissionManagementUI = () => {
  const [activeTab, setActiveTab] = useState('department');
  const [expandedDepts, setExpandedDepts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);

  const departments = [
    {
      name: 'Phòng Điều hành',
      children: ['Ban Giám đốc']
    },
    {
      name: 'Phòng Quản lý',
      children: ['Văn phòng', 'Phòng KT', 'Phòng TCLĐ', 'Phòng BQ', 'Phòng KCM', 'Phòng TĐ', 'Phòng AT', 'Phòng CV', 'Phòng ĐK', 'Trạm y tế', 'Phòng KCS', 'Phòng ĐTM', 'Phòng VT', 'Phòng KH', 'Văn phòng Đảng ủy', 'Công đoàn', 'Văn phòng Đoàn Thanh niên']
    },
    {
      name: 'Phân xưởng sản xuất, khai thác',
      children: ['Phân xưởng Cơ điện lò 1,2', 'Phân xưởng Cơ giới', 'Phân xưởng ĐS', 'Phân xưởng khai thác đào lò', 'Phân xưởng đào lò cơ giới K27', 'Phân xưởng Sàng tuyển', 'Phân xưởng Vận tải lò', 'Phân xưởng Thông gió', 'Phân xưởng Xây dựng Môi trường']
    }
  ];

  const modules = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Nhân sự', key: 'hr' },
    { name: 'Quyết định', key: 'decision' },
    { name: 'Chấm công & Nghỉ phép', key: 'attendance' },
    { name: 'Tuyển dụng & Đào tạo', key: 'recruitment' },
    { name: 'Lương & KPI', key: 'salary' },
    { name: 'Bảo hộ lao động', key: 'safety' },
    { name: 'Báo cáo', key: 'report' }
  ];

  const moduleSubModules = [
    {
      module: 'NHÂN SỰ',
      items: ['Sơ đồ tổ chức', 'Nhân viên', 'Bằng cấp', 'Quan hệ gia đình', 'Thăm nhân', 'Xuất cảnh nước ngoài', 'Bảo hiểm xã hội', 'Hợp đồng']
    },
    {
      module: 'QUYẾT ĐỊNH',
      items: ['Khen thưởng', 'Kỷ luật', 'Điều chỉnh lương', 'Bổ nhiệm', 'Miễn nhiệm', 'Điều chuyển công tác']
    },
    {
      module: 'CHẤM CÔNG & NGHỈ PHÉP',
      items: ['Nghỉ phép', 'Lịch công tác']
    },
    {
      module: 'TUYỂN DỤNG & ĐÀO TẠO',
      items: ['Tuyển dụng', 'Đào tạo, bồi dưỡng']
    },
    {
      module: 'LƯƠNG & KPI',
      items: ['Lương', 'KPI']
    },
    {
      module: 'BẢO HỘ LAO ĐỘNG',
      items: ['Bảo hộ lao động']
    },
    {
      module: 'BÁO CÁO',
      items: ['Báo cáo']
    },
    {
      module: 'HỆ THỐNG',
      items: ['Danh mục', 'Phân quyền', 'Cấu hình']
    }
  ];

  // Quyền mặc định theo chức vụ
  const rolePermissions = {
    'Admin': {
      'NHÂN SỰ': { 'Sơ đồ tổ chức': [true, true, true, true, true], 'Nhân viên': [true, true, true, true, true], 'Bằng cấp': [true, true, true, true, true], 'Quan hệ gia đình': [true, true, true, true, true], 'Thăm nhân': [true, true, true, true, true], 'Xuất cảnh nước ngoài': [true, true, true, true, true], 'Bảo hiểm xã hội': [true, true, true, true, true], 'Hợp đồng': [true, true, true, true, true] },
      'QUYẾT ĐỊNH': { 'Khen thưởng': [true, true, true, true, true], 'Kỷ luật': [true, true, true, true, true], 'Điều chỉnh lương': [true, true, true, true, true], 'Bổ nhiệm': [true, true, true, true, true], 'Miễn nhiệm': [true, true, true, true, true], 'Điều chuyển công tác': [true, true, true, true, true] },
      'CHẤM CÔNG & NGHỈ PHÉP': { 'Nghỉ phép': [true, true, true, true, true], 'Lịch công tác': [true, true, true, true, true] },
      'TUYỂN DỤNG & ĐÀO TẠO': { 'Tuyển dụng': [true, true, true, true, true], 'Đào tạo, bồi dưỡng': [true, true, true, true, true] },
      'LƯƠNG & KPI': { 'Lương': [true, true, true, true, true], 'KPI': [true, true, true, true, true] },
      'BẢO HỘ LAO ĐỘNG': { 'Bảo hộ lao động': [true, true, true, true, true] },
      'BÁO CÁO': { 'Báo cáo': [true, true, true, true, true] },
      'HỆ THỐNG': { 'Danh mục': [true, true, true, true, true], 'Phân quyền': [true, true, true, true, true], 'Cấu hình': [true, true, true, true, true] }
    },
    'Giám đốc': {
      'NHÂN SỰ': { 'Sơ đồ tổ chức': [true, true, true, true, false], 'Nhân viên': [true, true, true, true, false], 'Bằng cấp': [true, true, true, true, false], 'Quan hệ gia đình': [true, true, true, true, false], 'Thăm nhân': [true, true, true, true, false], 'Xuất cảnh nước ngoài': [true, true, true, true, false], 'Bảo hiểm xã hội': [true, true, true, true, false], 'Hợp đồng': [true, true, true, true, false] },
      'QUYẾT ĐỊNH': { 'Khen thưởng': [true, true, true, true, false], 'Kỷ luật': [true, true, true, true, false], 'Điều chỉnh lương': [true, true, true, true, false], 'Bổ nhiệm': [true, true, true, true, false], 'Miễn nhiệm': [true, true, true, true, false], 'Điều chuyển công tác': [true, true, true, true, false] },
      'CHẤM CÔNG & NGHỈ PHÉP': { 'Nghỉ phép': [true, true, true, false, false], 'Lịch công tác': [true, true, true, false, false] },
      'TUYỂN DỤNG & ĐÀO TẠO': { 'Tuyển dụng': [true, true, true, false, false], 'Đào tạo, bồi dưỡng': [true, true, true, false, false] },
      'LƯƠNG & KPI': { 'Lương': [true, true, false, false, false], 'KPI': [true, true, false, false, false] },
      'BẢO HỘ LAO ĐỘNG': { 'Bảo hộ lao động': [true, true, false, false, false] },
      'BÁO CÁO': { 'Báo cáo': [true, true, false, false, false] },
      'HỆ THỐNG': { 'Danh mục': [false, true, false, false, false], 'Phân quyền': [false, true, false, false, false], 'Cấu hình': [false, true, false, false, false] }
    },
    'Trưởng phòng': {
      'NHÂN SỰ': { 'Sơ đồ tổ chức': [true, true, true, false, false], 'Nhân viên': [true, true, true, false, false], 'Bằng cấp': [true, true, false, false, false], 'Quan hệ gia đình': [false, true, false, false, false], 'Thăm nhân': [false, true, false, false, false], 'Xuất cảnh nước ngoài': [false, true, false, false, false], 'Bảo hiểm xã hội': [false, true, false, false, false], 'Hợp đồng': [false, true, false, false, false] },
      'QUYẾT ĐỊNH': { 'Khen thưởng': [false, true, false, false, false], 'Kỷ luật': [false, true, false, false, false], 'Điều chỉnh lương': [false, true, false, false, false], 'Bổ nhiệm': [false, true, false, false, false], 'Miễn nhiệm': [false, true, false, false, false], 'Điều chuyển công tác': [false, true, false, false, false] },
      'CHẤM CÔNG & NGHỈ PHÉP': { 'Nghỉ phép': [false, true, false, false, false], 'Lịch công tác': [false, true, false, false, false] },
      'TUYỂN DỤNG & ĐÀO TẠO': { 'Tuyển dụng': [false, true, false, false, false], 'Đào tạo, bồi dưỡng': [false, true, false, false, false] },
      'LƯƠNG & KPI': { 'Lương': [false, true, false, false, false], 'KPI': [false, true, false, false, false] },
      'BẢO HỘ LAO ĐỘNG': { 'Bảo hộ lao động': [false, true, false, false, false] },
      'BÁO CÁO': { 'Báo cáo': [false, true, false, false, false] },
      'HỆ THỐNG': { 'Danh mục': [false, false, false, false, false], 'Phân quyền': [false, false, false, false, false], 'Cấu hình': [false, false, false, false, false] }
    },
    'Nhân viên': {
      'NHÂN SỰ': { 'Sơ đồ tổ chức': [false, true, false, false, false], 'Nhân viên': [false, true, false, false, false], 'Bằng cấp': [false, true, false, false, false], 'Quan hệ gia đình': [false, true, false, false, false], 'Thăm nhân': [false, true, false, false, false], 'Xuất cảnh nước ngoài': [false, true, false, false, false], 'Bảo hiểm xã hội': [false, true, false, false, false], 'Hợp đồng': [false, true, false, false, false] },
      'QUYẾT ĐỊNH': { 'Khen thưởng': [false, true, false, false, false], 'Kỷ luật': [false, true, false, false, false], 'Điều chỉnh lương': [false, true, false, false, false], 'Bổ nhiệm': [false, true, false, false, false], 'Miễn nhiệm': [false, true, false, false, false], 'Điều chuyển công tác': [false, true, false, false, false] },
      'CHẤM CÔNG & NGHỈ PHÉP': { 'Nghỉ phép': [false, true, false, false, false], 'Lịch công tác': [false, true, false, false, false] },
      'TUYỂN DỤNG & ĐÀO TẠO': { 'Tuyển dụng': [false, true, false, false, false], 'Đào tạo, bồi dưỡng': [false, true, false, false, false] },
      'LƯƠNG & KPI': { 'Lương': [false, true, false, false, false], 'KPI': [false, true, false, false, false] },
      'BẢO HỘ LAO ĐỘNG': { 'Bảo hộ lao động': [false, true, false, false, false] },
      'BÁO CÁO': { 'Báo cáo': [false, true, false, false, false] },
      'HỆ THỐNG': { 'Danh mục': [false, false, false, false, false], 'Phân quyền': [false, false, false, false, false], 'Cấu hình': [false, false, false, false, false] }
    }
  };

  const accounts = [
    { id: 1, name: 'Nguyễn Văn A', username: 'nguyenvana', role: 'Admin', department: 'Phòng Điều hành' },
    { id: 2, name: 'Trần Thị B', username: 'tranthib', role: 'Trưởng phòng', department: 'Phòng KT' },
    { id: 3, name: 'Lê Văn C', username: 'levanc', role: 'Nhân viên', department: 'Phân xưởng Cơ điện' },
    { id: 4, name: 'Phạm Văn D', username: 'phamvand', role: 'Giám đốc', department: 'Phòng Điều hành' }
  ];

  const [accountPermissions, setAccountPermissions] = useState({});

  const getAccountPermissions = (accountId) => {
    if (!accountPermissions[accountId]) {
      const account = accounts.find(a => a.id === accountId);
      accountPermissions[accountId] = JSON.parse(JSON.stringify(rolePermissions[account.role]));
    }
    return accountPermissions[accountId];
  };

  const updateAccountPermission = (accountId, module, item, permIndex, value) => {
    const perms = getAccountPermissions(accountId);
    perms[module][item][permIndex] = value;
    setAccountPermissions({ ...accountPermissions, [accountId]: perms });
  };

  const toggleDept = (deptName) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptName]: !prev[deptName]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Phân quyền hệ thống</h1>
          <p className="text-gray-600 mt-2">Quản lý phân quyền theo phòng ban, chức vụ và tài khoản</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('department')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'department'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Building2 className="w-5 h-5" />
              Phân quyền theo phòng ban
            </button>
            <button
              onClick={() => setActiveTab('role')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'role'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <ShieldCheck className="w-5 h-5" />
              Phân quyền theo chức vụ
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === 'account'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <User className="w-5 h-5" />
              Phân quyền theo tài khoản
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Tab 1: Phân quyền theo phòng ban */}
          {activeTab === 'department' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Phạm vi dữ liệu theo phòng ban</h2>
                <span className="text-sm text-gray-500">Admin có thể tick chọn các module</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left: Department Tree */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4 text-gray-900">Cấu trúc phòng ban</h3>
                  <div className="space-y-2">
                    {departments.map((dept, idx) => (
                      <div key={idx} className="space-y-1">
                        <button
                          onClick={() => toggleDept(dept.name)}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-md hover:bg-white transition-colors"
                        >
                          {expandedDepts[dept.name] ? (
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                          )}
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">{dept.name}</span>
                        </button>
                        {expandedDepts[dept.name] && (
                          <div className="ml-8 space-y-1">
                            {dept.children.map((child, childIdx) => (
                              <div key={childIdx} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                {child}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Module Permissions */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 text-gray-900">Quyền truy cập module</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Module</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Phòng Điều hành</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Phòng Quản lý</th>
                          <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Phân xưởng SX</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modules.map((module) => (
                          <tr key={module.key} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-2 text-sm text-gray-900">{module.name}</td>
                            <td className="py-3 px-2">
                              <div className="flex justify-center">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex justify-center">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex justify-center">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-green-600 rounded" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      Hủy
                    </button>
                    <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Phân quyền theo chức vụ */}
          {activeTab === 'role' && (
            <div className="space-y-6">
              <div className="pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Phân quyền theo chức vụ</h2>
                <div className="flex gap-3 text-sm flex-wrap">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md font-medium">C = Thêm (Create)</span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md font-medium">R = Xem (Read)</span>
                  <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md font-medium">U = Sửa (Update)</span>
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md font-medium">D = Xóa (Delete)</span>
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md font-medium">A = Duyệt (Approve)</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">Module</th>
                      <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Sub-module</th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900" colSpan={5}>
                        <div className="mb-1">Admin</div>
                        <div className="flex justify-center gap-2 text-xs font-normal">
                          <span className="w-8 text-blue-600">C</span>
                          <span className="w-8 text-green-600">R</span>
                          <span className="w-8 text-yellow-600">U</span>
                          <span className="w-8 text-red-600">D</span>
                          <span className="w-8 text-purple-600">A</span>
                        </div>
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900" colSpan={5}>
                        <div className="mb-1">Giám đốc</div>
                        <div className="flex justify-center gap-2 text-xs font-normal">
                          <span className="w-8 text-blue-600">C</span>
                          <span className="w-8 text-green-600">R</span>
                          <span className="w-8 text-yellow-600">U</span>
                          <span className="w-8 text-red-600">D</span>
                          <span className="w-8 text-purple-600">A</span>
                        </div>
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900" colSpan={5}>
                        <div className="mb-1">Trưởng phòng</div>
                        <div className="flex justify-center gap-2 text-xs font-normal">
                          <span className="w-8 text-blue-600">C</span>
                          <span className="w-8 text-green-600">R</span>
                          <span className="w-8 text-yellow-600">U</span>
                          <span className="w-8 text-red-600">D</span>
                          <span className="w-8 text-purple-600">A</span>
                        </div>
                      </th>
                      <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-900" colSpan={5}>
                        <div className="mb-1">Nhân viên</div>
                        <div className="flex justify-center gap-2 text-xs font-normal">
                          <span className="w-8 text-blue-600">C</span>
                          <span className="w-8 text-green-600">R</span>
                          <span className="w-8 text-yellow-600">U</span>
                          <span className="w-8 text-red-600">D</span>
                          <span className="w-8 text-purple-600">A</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {moduleSubModules.map((module, idx) => (
                      <React.Fragment key={idx}>
                        {module.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className="hover:bg-gray-50">
                            {itemIdx === 0 && (
                              <td rowSpan={module.items.length} className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                                {module.module}
                              </td>
                            )}
                            <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">{item}</td>
                            
                            {/* Admin */}
                            {rolePermissions['Admin'][module.module][item].map((checked, permIdx) => (
                              <td key={`admin-${permIdx}`} className="border border-gray-200 px-2 py-3 text-center">
                                <input type="checkbox" checked={checked} readOnly className="w-4 h-4 cursor-pointer" />
                              </td>
                            ))}
                            
                            {/* Giám đốc */}
                            {rolePermissions['Giám đốc'][module.module][item].map((checked, permIdx) => (
                              <td key={`gd-${permIdx}`} className="border border-gray-200 px-2 py-3 text-center">
                                <input type="checkbox" checked={checked} readOnly className="w-4 h-4 cursor-pointer" />
                              </td>
                            ))}
                            
                            {/* Trưởng phòng */}
                            {rolePermissions['Trưởng phòng'][module.module][item].map((checked, permIdx) => (
                              <td key={`tp-${permIdx}`} className="border border-gray-200 px-2 py-3 text-center">
                                <input type="checkbox" checked={checked} readOnly className="w-4 h-4 cursor-pointer" />
                              </td>
                            ))}
                            
                            {/* Nhân viên */}
                            {rolePermissions['Nhân viên'][module.module][item].map((checked, permIdx) => (
                              <td key={`nv-${permIdx}`} className="border border-gray-200 px-2 py-3 text-center">
                                <input type="checkbox" checked={checked} readOnly className="w-4 h-4 cursor-pointer" />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                  Hủy
                </button>
                <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Phân quyền theo tài khoản */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Phân quyền theo tài khoản</h2>
                <p className="text-sm text-gray-600 mb-3">Chỉ có thể tắt bớt quyền. Để thêm quyền, chỉnh sửa quyền cho chức vụ</p>
                <div className="flex gap-3 text-sm flex-wrap">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md font-medium">C = Thêm (Create)</span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md font-medium">R = Xem (Read)</span>
                  <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-md font-medium">U = Sửa (Update)</span>
                  <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md font-medium">D = Xóa (Delete)</span>
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md font-medium">A = Duyệt (Approve)</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {/* Left: Account List */}
                <div className="col-span-1 border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm tài khoản..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {accounts.filter(acc => acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.username.toLowerCase().includes(searchTerm.toLowerCase())).map((account) => (
                      <button
                        key={account.id}
                        onClick={() => setSelectedAccount(account)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${selectedAccount?.id === account.id
                            ? 'bg-green-50 border-2 border-green-500'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                            {account.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">{account.name}</p>
                            <p className="text-xs text-gray-500">@{account.username}</p>
                            <div className="flex gap-1 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                {account.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Permission Settings */}
                <div className="col-span-2 border border-gray-200 rounded-lg p-4">
                  {selectedAccount ? (
                    <>
                      <div className="mb-4 pb-4 border-b">
                        <h3 className="text-lg font-semibold text-gray-900">Quyền của: {selectedAccount.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{selectedAccount.department} • {selectedAccount.role}</p>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md flex gap-2">
                          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-700">
                            Quyền mặc định dựa trên chức vụ <strong>{selectedAccount.role}</strong>. Checkbox xám là quyền không có ở chức vụ (không thể bật). Chỉ có thể <strong>tắt</strong> quyền riêng cho tài khoản này.
                          </p>
                        </div>
                      </div>

                      <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 bg-white z-10">
                            <tr className="bg-gray-50 border-b-2 border-gray-300">
                              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-50 z-20">Module</th>
                              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Sub-module</th>
                              <th className="border border-gray-200 px-2 py-3 text-center text-xs font-semibold text-blue-600">C<br/>Thêm</th>
                              <th className="border border-gray-200 px-2 py-3 text-center text-xs font-semibold text-green-600">R<br/>Xem</th>
                              <th className="border border-gray-200 px-2 py-3 text-center text-xs font-semibold text-yellow-600">U<br/>Sửa</th>
                              <th className="border border-gray-200 px-2 py-3 text-center text-xs font-semibold text-red-600">D<br/>Xóa</th>
                              <th className="border border-gray-200 px-2 py-3 text-center text-xs font-semibold text-purple-600">A<br/>Duyệt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {moduleSubModules.map((module, idx) => (
                              <React.Fragment key={idx}>
                                {module.items.map((item, itemIdx) => {
                                  const perms = getAccountPermissions(selectedAccount.id)?.[module.module]?.[item] || [];
                                  const rolePerms = rolePermissions[selectedAccount.role]?.[module.module]?.[item] || [];

                                  return (
                                    <tr key={itemIdx} className="hover:bg-gray-50">
                                      {itemIdx === 0 && (
                                        <td rowSpan={module.items.length} className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                                          {module.module}
                                        </td>
                                      )}
                                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-700">{item}</td>
                                      
                                      {perms.map((checked, permIdx) => (
                                        <td key={permIdx} className="border border-gray-200 px-2 py-3 text-center">
                                          <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={!rolePerms[permIdx]}
                                            onChange={() => {
                                              if (rolePerms[permIdx]) {
                                                updateAccountPermission(selectedAccount.id, module.module, item, permIdx, !checked);
                                              }
                                            }}
                                            className={`w-4 h-4 ${!rolePerms[permIdx] ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <button
                          onClick={() => setSelectedAccount(null)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Đóng
                        </button>
                        <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
                          Lưu thay đổi
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 min-h-[400px]">
                      <div className="text-center">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Chọn một tài khoản để cấu hình quyền</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionManagementUI;