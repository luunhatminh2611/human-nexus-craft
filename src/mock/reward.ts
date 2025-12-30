// mock/reward.ts

export interface Reward {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  position: string;
  proposedBy: string;
  proposedById: string;
  proposedDate: string;
  rewardType: string; // Loại khen thưởng (string tự do)
  achievement: string; // Thành tích
  reason: string; // Lý do khen thưởng
  proposedAmount?: number; // Mức khen thưởng đề xuất
  approvedAmount?: number; // Mức khen thưởng được duyệt
  decisionNumber?: string; // Số quyết định
  decisionDate?: string; // Ngày quyết định
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  rewardHistory?: RewardHistoryItem[]; // Lịch sử khen thưởng của nhân viên này
}

export interface RewardHistoryItem {
  date: string;
  rewardType: string;
  amount: number;
  reason: string;
}

export const statusLabels = {
  DRAFT: 'Bản nháp',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
};

export const mockRewards: Reward[] = [
  {
    id: 'RW001',
    employeeId: 'EMP001',
    employeeName: 'Nguyễn Văn An',
    departmentName: 'Phòng Kỹ thuật',
    position: 'Senior Developer',
    proposedBy: 'Trần Văn B',
    proposedById: 'MGR001',
    proposedDate: '2024-12-15',
    rewardType: 'Giải thưởng hoàn thành dự án xuất sắc',
    achievement: 'Hoàn thành dự án ERP trước thời hạn 2 tuần, tiết kiệm 30% chi phí',
    reason: 'Anh An đã làm việc không ngừng nghỉ, tối ưu hóa code và giải quyết nhiều vấn đề kỹ thuật phức tạp',
    proposedAmount: 10000000,
    approvedAmount: 10000000,
    decisionNumber: 'QD-KT/2024/001',
    decisionDate: '2024-12-20',
    status: 'APPROVED',
    createdAt: '2024-12-15T08:00:00Z',
    updatedAt: '2024-12-20T10:30:00Z',
    rewardHistory: [
      { date: '2024-06-15', rewardType: 'Nhân viên xuất sắc quý 2', amount: 5000000, reason: 'Hoàn thành KPI vượt mức' },
      { date: '2024-03-20', rewardType: 'Sáng kiến cải tiến', amount: 3000000, reason: 'Đề xuất quy trình tối ưu' },
    ],
  },
  {
    id: 'RW002',
    employeeId: 'EMP002',
    employeeName: 'Lê Thị Bình',
    departmentName: 'Phòng Marketing',
    position: 'Marketing Manager',
    proposedBy: 'Phạm Văn C',
    proposedById: 'MGR002',
    proposedDate: '2024-12-18',
    rewardType: 'Thưởng tăng trưởng doanh số',
    achievement: 'Tăng trưởng doanh số 45% so với cùng kỳ năm trước',
    reason: 'Chị Bình đã xây dựng và triển khai chiến dịch marketing hiệu quả, mở rộng thị trường mới',
    proposedAmount: 15000000,
    status: 'PENDING',
    createdAt: '2024-12-18T09:00:00Z',
    updatedAt: '2024-12-18T09:00:00Z',
    rewardHistory: [
      { date: '2024-09-10', rewardType: 'Nhân viên xuất sắc quý 3', amount: 8000000, reason: 'Vượt chỉ tiêu doanh số' },
    ],
  },
  {
    id: 'RW003',
    employeeId: 'EMP003',
    employeeName: 'Hoàng Văn Cường',
    departmentName: 'Phòng Kỹ thuật',
    position: 'Tech Lead',
    proposedBy: 'Trần Văn B',
    proposedById: 'MGR001',
    proposedDate: '2024-12-10',
    rewardType: 'Giải thưởng đổi mới sáng tạo',
    achievement: 'Phát triển hệ thống AI tự động hóa quy trình báo cáo',
    reason: 'Giải pháp AI giúp tiết kiệm 200 giờ làm việc mỗi tháng cho toàn bộ công ty',
    proposedAmount: 20000000,
    approvedAmount: 18000000,
    decisionNumber: 'QD-KT/2024/002',
    decisionDate: '2024-12-16',
    status: 'APPROVED',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-16T14:00:00Z',
    rewardHistory: [
      { date: '2024-08-20', rewardType: 'Sáng kiến cải tiến', amount: 5000000, reason: 'Cải tiến hệ thống backup' },
      { date: '2024-04-15', rewardType: 'Nhân viên xuất sắc quý 1', amount: 6000000, reason: 'Hiệu suất làm việc cao' },
    ],
  },
  {
    id: 'RW004',
    employeeId: 'EMP004',
    employeeName: 'Phạm Thị Dung',
    departmentName: 'Phòng Nhân sự',
    position: 'HR Specialist',
    proposedBy: 'Nguyễn Văn D',
    proposedById: 'MGR003',
    proposedDate: '2024-12-22',
    rewardType: 'Nhân viên tiêu biểu năm 2024',
    achievement: 'Tuyển dụng thành công 50+ nhân sự chất lượng cao, giảm tỷ lệ nghỉ việc 30%',
    reason: 'Chị Dung đã xây dựng quy trình tuyển dụng mới, cải thiện đáng kể chất lượng nguồn nhân lực',
    proposedAmount: 25000000,
    status: 'PENDING',
    createdAt: '2024-12-22T08:30:00Z',
    updatedAt: '2024-12-22T08:30:00Z',
    rewardHistory: [
      { date: '2024-10-05', rewardType: 'Nhân viên xuất sắc quý 3', amount: 7000000, reason: 'Hoàn thành tốt công việc' },
      { date: '2024-07-12', rewardType: 'Thưởng dự án', amount: 4000000, reason: 'Tổ chức training hiệu quả' },
    ],
  },
  {
    id: 'RW005',
    employeeId: 'EMP005',
    employeeName: 'Đỗ Văn Em',
    departmentName: 'Phòng Kinh doanh',
    position: 'Sales Executive',
    proposedBy: 'Lê Văn E',
    proposedById: 'MGR004',
    proposedDate: '2024-12-25',
    rewardType: 'Thưởng ký hợp đồng lớn',
    achievement: 'Ký được hợp đồng 5 tỷ đồng với khách hàng chiến lược',
    reason: 'Anh Em đã nỗ lực trong 6 tháng để thuyết phục khách hàng, mở ra cơ hội hợp tác lớn',
    proposedAmount: 12000000,
    status: 'DRAFT',
    createdAt: '2024-12-25T11:00:00Z',
    updatedAt: '2024-12-25T11:00:00Z',
    rewardHistory: [],
  },
  {
    id: 'RW006',
    employeeId: 'EMP006',
    employeeName: 'Vũ Thị Phượng',
    departmentName: 'Phòng Kế toán',
    position: 'Chief Accountant',
    proposedBy: 'Trần Văn F',
    proposedById: 'MGR005',
    proposedDate: '2024-12-12',
    rewardType: 'Giải thưởng báo cáo tài chính xuất sắc',
    achievement: 'Hoàn thành báo cáo tài chính năm sớm 1 tháng, không có sai sót',
    reason: 'Chị Phượng đã làm việc chuyên nghiệp, đảm bảo độ chính xác cao',
    proposedAmount: 8000000,
    approvedAmount: 8000000,
    decisionNumber: 'QD-KT/2024/003',
    decisionDate: '2024-12-18',
    status: 'APPROVED',
    createdAt: '2024-12-12T09:30:00Z',
    updatedAt: '2024-12-18T15:00:00Z',
    rewardHistory: [
      { date: '2024-06-30', rewardType: 'Nhân viên xuất sắc quý 2', amount: 6000000, reason: 'Hoàn thành tốt công việc' },
    ],
  },
  {
    id: 'RW007',
    employeeId: 'EMP007',
    employeeName: 'Bùi Văn Giang',
    departmentName: 'Phòng Kỹ thuật',
    position: 'DevOps Engineer',
    proposedBy: 'Trần Văn B',
    proposedById: 'MGR001',
    proposedDate: '2024-12-20',
    rewardType: 'Thưởng xử lý sự cố',
    achievement: 'Khắc phục sự cố hệ thống nghiêm trọng trong 2 giờ, tránh thiệt hại 100 triệu đồng',
    reason: 'Anh Giang đã làm việc xuyên đêm để khôi phục hệ thống',
    proposedAmount: 7000000,
    status: 'PENDING',
    createdAt: '2024-12-20T16:00:00Z',
    updatedAt: '2024-12-20T16:00:00Z',
    rewardHistory: [
      { date: '2024-09-15', rewardType: 'Thưởng đột xuất', amount: 3000000, reason: 'Hỗ trợ dự án khẩn cấp' },
    ],
  },
  {
    id: 'RW008',
    employeeId: 'EMP008',
    employeeName: 'Ngô Thị Hà',
    departmentName: 'Phòng Marketing',
    position: 'Content Creator',
    proposedBy: 'Phạm Văn C',
    proposedById: 'MGR002',
    proposedDate: '2024-12-14',
    rewardType: 'Giải thưởng nội dung sáng tạo',
    achievement: 'Video viral đạt 5 triệu view, tăng 10,000 followers',
    reason: 'Chị Hà đã tạo ra nội dung độc đáo, thu hút lớn',
    proposedAmount: 6000000,
    status: 'REJECTED',
    rejectionReason: 'Đã nhận thưởng tháng trước cho cùng loại thành tích',
    createdAt: '2024-12-14T10:00:00Z',
    updatedAt: '2024-12-19T11:00:00Z',
    rewardHistory: [
      { date: '2024-11-10', rewardType: 'Thưởng viral content', amount: 5000000, reason: 'Video đạt 3 triệu view' },
    ],
  },
];

export const calculateRewardStatistics = (rewards: Reward[]) => {
  const total = rewards.length;
  const draft = rewards.filter(r => r.status === 'DRAFT').length;
  const pending = rewards.filter(r => r.status === 'PENDING').length;
  const approved = rewards.filter(r => r.status === 'APPROVED').length;
  const rejected = rewards.filter(r => r.status === 'REJECTED').length;

  const totalProposedAmount = rewards
    .filter(r => r.proposedAmount)
    .reduce((sum, r) => sum + (r.proposedAmount || 0), 0);

  const totalApprovedAmount = rewards
    .filter(r => r.approvedAmount && r.status === 'APPROVED')
    .reduce((sum, r) => sum + (r.approvedAmount || 0), 0);

  return {
    total,
    draft,
    pending,
    approved,
    rejected,
    totalProposedAmount,
    totalApprovedAmount,
  };
};