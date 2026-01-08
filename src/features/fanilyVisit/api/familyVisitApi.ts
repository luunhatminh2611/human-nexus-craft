import mockFamilyVisits from "@/mock/familyVisitData";

const familyVisitApi = {
  // Lấy tất cả (Admin)
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFamilyVisits;
  },

  // Lấy theo nhân viên
  getByEmployeeId: async (employeeId: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFamilyVisits.filter(v => v.employee.id === employeeId);
  },

  // Lấy chi tiết
  getById: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const visit = mockFamilyVisits.find(v => v.id === id);
    return { data: visit };
  },

  // Tạo mới
  create: async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newVisit = {
      ...data,
      id: Math.max(...mockFamilyVisits.map(v => v.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockFamilyVisits.push(newVisit);
    return { data: newVisit };
  },

  // Cập nhật
  update: async (id: number, data: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockFamilyVisits.findIndex(v => v.id === id);
    if (index !== -1) {
      mockFamilyVisits[index] = {
        ...mockFamilyVisits[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return { data: mockFamilyVisits[index] };
    }
    throw new Error('Visit not found');
  },

  // Xóa
  delete: async (id: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockFamilyVisits.findIndex(v => v.id === id);
    if (index !== -1) {
      mockFamilyVisits.splice(index, 1);
      return { success: true };
    }
    throw new Error('Visit not found');
  }
};

export default familyVisitApi;
