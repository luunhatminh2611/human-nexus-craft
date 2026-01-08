// ==================== MOCK DATA ====================
// mockData/familyVisitData.ts

const mockFamilyVisits = [
  {
    id: 1,
    employee: {
      id: 18,
      code: 'EMP002',
      fullName: 'Trần Thị Minh',
      department: { id: 2, name: 'Phòng Nhân sự' },
      position: { id: 2, name: 'Trưởng phòng' }
    },
    visitType: 'Ốm đau',
    visitDate: '2024-12-15',
    visitPerson: 'Mẹ',
    relationShip: 'Mẹ',
    reason: 'Mẹ bị tai biến mạch máu não, nhập viện cấp cứu',
    giftAmount: 3000000,
    giftDescription: 'Tiền mặt hỗ trợ',
    notes: 'Tình trạng sức khỏe nghiêm trọng, cần theo dõi lâu dài',
    visitedBy: 'Nguyễn Văn A - Giám đốc',
    status: 'Đã thăm',
    createdAt: '2024-12-14',
    updatedAt: '2024-12-15'
  },
  {
    id: 2,
    employee: {
      id: 25,
      code: 'EMP009',
      fullName: 'Lê Văn Hùng',
      department: { id: 3, name: 'Phòng Kinh doanh' },
      position: { id: 5, name: 'Nhân viên' }
    },
    visitType: 'Tang lễ',
    visitDate: '2024-12-20',
    visitPerson: 'Ông nội',
    relationShip: 'Ông',
    reason: 'Ông nội qua đời',
    giftAmount: 5000000,
    giftDescription: 'Vòng hoa + tiền phúng điếu',
    notes: 'Ông nội hưởng thọ 89 tuổi',
    visitedBy: 'Trần Thị B - Trưởng phòng Kinh doanh',
    status: 'Đã thăm',
    createdAt: '2024-12-19',
    updatedAt: '2024-12-20'
  },
  {
    id: 3,
    employee: {
      id: 30,
      code: 'EMP014',
      fullName: 'Phạm Thị Lan',
      department: { id: 2, name: 'Phòng Nhân sự' },
      position: { id: 5, name: 'Nhân viên' }
    },
    visitType: 'Sinh con',
    visitDate: '2024-12-25',
    visitPerson: 'Vợ/Chồng',
    relationShip: 'Vợ',
    reason: 'Sinh con trai đầu lòng',
    giftAmount: 2000000,
    giftDescription: 'Quà tặng + tiền mừng',
    notes: 'Mẹ tròn con vuông, bé nặng 3.2kg',
    visitedBy: 'Nguyễn Thị C - Trưởng phòng Nhân sự',
    status: 'Đã thăm',
    createdAt: '2024-12-24',
    updatedAt: '2024-12-25'
  },
  {
    id: 4,
    employee: {
      id: 18,
      code: 'EMP002',
      fullName: 'Trần Thị Minh',
      department: { id: 2, name: 'Phòng Nhân sự' },
      position: { id: 2, name: 'Trưởng phòng' }
    },
    visitType: 'Cưới hỏi',
    visitDate: '2025-01-10',
    visitPerson: 'Con',
    relationShip: 'Con gái',
    reason: 'Con gái kết hôn',
    giftAmount: 5000000,
    giftDescription: 'Tiền mừng cưới',
    notes: '',
    visitedBy: '',
    status: 'Chưa thăm',
    createdAt: '2024-12-28',
    updatedAt: '2024-12-28'
  },
  {
    id: 5,
    employee: {
      id: 35,
      code: 'EMP019',
      fullName: 'Hoàng Văn Nam',
      department: { id: 4, name: 'Phòng Kỹ thuật' },
      position: { id: 5, name: 'Nhân viên' }
    },
    visitType: 'Ốm đau',
    visitDate: '2025-01-05',
    visitPerson: 'Bố',
    relationShip: 'Bố',
    reason: 'Bố bị tai nạn giao thông',
    giftAmount: 2000000,
    giftDescription: 'Tiền mặt hỗ trợ',
    notes: 'Gãy chân, phải phẫu thuật',
    visitedBy: 'Lê Văn D - Trưởng phòng Kỹ thuật',
    status: 'Đã thăm',
    createdAt: '2025-01-04',
    updatedAt: '2025-01-05'
  }
];

export default mockFamilyVisits;

export const visitTypes = [
  'Ốm đau',
  'Tang lễ',
  'Sinh con',
  'Cưới hỏi',
  'Tai nạn',
  'Khác'
];

export const relationships = [
  'Bố',
  'Mẹ',
  'Vợ',
  'Chồng',
  'Con',
  'Anh/Chị/Em',
  'Ông',
  'Bà',
  'Khác'
];

// ==================== API (Mock) ====================
// api/familyVisitApi.ts

