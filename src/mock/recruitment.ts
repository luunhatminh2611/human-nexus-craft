// mock/recruitment.ts

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvFileName: string;
  cvFileKey: string;
  appliedDate: string;
  status: 'NEW' | 'REVIEWING' | 'INTERVIEW' | 'OFFERED' | 'REJECTED' | 'ACCEPTED';
  notes?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
  level: 'INTERN' | 'JUNIOR' | 'MIDDLE' | 'SENIOR' | 'LEAD' | 'MANAGER';
  salaryRange: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  postedDate: string;
  deadline?: string;
  applicants: Applicant[];
  createdAt: string;
  updatedAt: string;
}

export const applicationStatusLabels = {
  NEW: 'Mới',
  REVIEWING: 'Đang xem xét',
  INTERVIEW: 'Phỏng vấn',
  OFFERED: 'Đã offer',
  REJECTED: 'Từ chối',
  ACCEPTED: 'Đã nhận việc',
};

export const employmentTypeLabels = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

export const levelLabels = {
  INTERN: 'Thực tập sinh',
  JUNIOR: 'Junior',
  MIDDLE: 'Middle',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  MANAGER: 'Quản lý',
};

export const jobStatusLabels = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang tuyển',
  CLOSED: 'Đã đóng',
};

export const mockJobPostings: JobPosting[] = [
  {
    id: 'job-001',
    title: 'Frontend Developer (ReactJS)',
    department: 'Phòng IT',
    location: 'Hà Nội',
    employmentType: 'FULL_TIME',
    level: 'MIDDLE',
    salaryRange: '15-25 triệu',
    description: 'Chúng tôi đang tìm kiếm Frontend Developer có kinh nghiệm với ReactJS để tham gia vào team phát triển sản phẩm.',
    requirements: [
      'Có ít nhất 2 năm kinh nghiệm với ReactJS',
      'Thành thạo HTML, CSS, JavaScript/TypeScript',
      'Kinh nghiệm với state management (Redux, Zustand, hoặc tương tự)',
      'Hiểu biết về REST API và GraphQL',
      'Có khả năng làm việc nhóm tốt',
    ],
    responsibilities: [
      'Phát triển và duy trì ứng dụng web sử dụng ReactJS',
      'Tối ưu hiệu suất và trải nghiệm người dùng',
      'Làm việc chặt chẽ với team Backend và Designer',
      'Code review và mentor junior developers',
      'Tham gia vào việc thiết kế kiến trúc frontend',
    ],
    benefits: [
      'Lương tháng 13, thưởng theo hiệu suất',
      'Bảo hiểm sức khỏe cao cấp',
      'Laptop và thiết bị làm việc',
      'Môi trường làm việc năng động, trẻ trung',
      'Cơ hội học hỏi và phát triển',
    ],
    status: 'ACTIVE',
    postedDate: '2024-12-01',
    deadline: '2025-02-28',
    applicants: [
      {
        id: 'app-001',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        phone: '0912345678',
        cvFileName: 'NguyenVanA_FE_CV.pdf',
        cvFileKey: 'cvs/job-001/NguyenVanA_FE_CV.pdf',
        appliedDate: '2024-12-05',
        status: 'INTERVIEW',
        notes: 'Ứng viên có kinh nghiệm tốt, đã qua vòng 1',
      },
      {
        id: 'app-002',
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        phone: '0987654321',
        cvFileName: 'TranThiB_ReactJS.pdf',
        cvFileKey: 'cvs/job-001/TranThiB_ReactJS.pdf',
        appliedDate: '2024-12-10',
        status: 'REVIEWING',
      },
      {
        id: 'app-003',
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        phone: '0901234567',
        cvFileName: 'LeVanC_CV_2024.pdf',
        cvFileKey: 'cvs/job-001/LeVanC_CV_2024.pdf',
        appliedDate: '2024-12-15',
        status: 'NEW',
      },
    ],
    createdAt: '2024-12-01',
    updatedAt: '2024-12-15',
  },
  {
    id: 'job-002',
    title: 'Marketing Executive',
    department: 'Phòng Marketing',
    location: 'Hà Nội',
    employmentType: 'FULL_TIME',
    level: 'JUNIOR',
    salaryRange: '10-15 triệu',
    description: 'Tìm kiếm Marketing Executive năng động, sáng tạo để phát triển các chiến dịch marketing.',
    requirements: [
      'Tốt nghiệp Đại học chuyên ngành Marketing, Kinh doanh hoặc tương đương',
      'Có ít nhất 1 năm kinh nghiệm trong lĩnh vực Marketing',
      'Kỹ năng viết content tốt',
      'Có kinh nghiệm với Social Media Marketing',
      'Thành thạo Microsoft Office, đặc biệt là Excel và PowerPoint',
    ],
    responsibilities: [
      'Lên kế hoạch và thực hiện các chiến dịch marketing',
      'Quản lý social media channels',
      'Viết content cho website, blog, social media',
      'Phân tích hiệu quả các chiến dịch marketing',
      'Phối hợp với các phòng ban khác để thực hiện các hoạt động marketing',
    ],
    benefits: [
      'Lương cạnh tranh, thưởng theo KPI',
      'Bảo hiểm đầy đủ theo quy định',
      'Du lịch công ty hàng năm',
      'Đào tạo và phát triển kỹ năng',
      'Môi trường làm việc sáng tạo',
    ],
    status: 'ACTIVE',
    postedDate: '2024-12-10',
    deadline: '2025-01-31',
    applicants: [
      {
        id: 'app-004',
        name: 'Phạm Thị D',
        email: 'phamthid@email.com',
        phone: '0923456789',
        cvFileName: 'PhamThiD_Marketing_CV.pdf',
        cvFileKey: 'cvs/job-002/PhamThiD_Marketing_CV.pdf',
        appliedDate: '2024-12-12',
        status: 'OFFERED',
        notes: 'Ứng viên xuất sắc, đã gửi offer letter',
      },
      {
        id: 'app-005',
        name: 'Hoàng Văn E',
        email: 'hoangvane@email.com',
        phone: '0934567890',
        cvFileName: 'HoangVanE_CV.pdf',
        cvFileKey: 'cvs/job-002/HoangVanE_CV.pdf',
        appliedDate: '2024-12-18',
        status: 'REVIEWING',
      },
    ],
    createdAt: '2024-12-10',
    updatedAt: '2024-12-18',
  },
  {
    id: 'job-003',
    title: 'Backend Developer (Java Spring)',
    department: 'Phòng IT',
    location: 'Hà Nội',
    employmentType: 'FULL_TIME',
    level: 'SENIOR',
    salaryRange: '25-35 triệu',
    description: 'Cần tuyển Backend Developer Senior có kinh nghiệm với Java Spring để dẫn dắt team.',
    requirements: [
      'Có ít nhất 4 năm kinh nghiệm với Java và Spring Framework',
      'Thành thạo Spring Boot, Spring Security, Spring Data JPA',
      'Kinh nghiệm với Microservices architecture',
      'Hiểu biết sâu về Database (MySQL, PostgreSQL, MongoDB)',
      'Có kinh nghiệm làm việc với Docker, Kubernetes',
    ],
    responsibilities: [
      'Thiết kế và phát triển backend services',
      'Dẫn dắt team Backend developers',
      'Code review và mentoring',
      'Tối ưu hiệu suất hệ thống',
      'Đảm bảo chất lượng code và best practices',
    ],
    benefits: [
      'Lương cao, thưởng hấp dẫn',
      'Bảo hiểm sức khỏe toàn diện',
      'Thiết bị làm việc cao cấp',
      'Flexible working hours',
      'Remote 2 ngày/tuần',
    ],
    status: 'ACTIVE',
    postedDate: '2024-11-20',
    deadline: '2025-01-20',
    applicants: [
      {
        id: 'app-006',
        name: 'Đỗ Văn F',
        email: 'dovanf@email.com',
        phone: '0945678901',
        cvFileName: 'DoVanF_Java_Senior.pdf',
        cvFileKey: 'cvs/job-003/DoVanF_Java_Senior.pdf',
        appliedDate: '2024-11-25',
        status: 'REJECTED',
        notes: 'Không đủ kinh nghiệm về Microservices',
      },
      {
        id: 'app-007',
        name: 'Vũ Thị G',
        email: 'vuthig@email.com',
        phone: '0956789012',
        cvFileName: 'VuThiG_Backend_CV.pdf',
        cvFileKey: 'cvs/job-003/VuThiG_Backend_CV.pdf',
        appliedDate: '2024-12-01',
        status: 'INTERVIEW',
        notes: 'Ứng viên tiềm năng, đã lên lịch phỏng vấn vòng 2',
      },
    ],
    createdAt: '2024-11-20',
    updatedAt: '2024-12-01',
  },
  {
    id: 'job-004',
    title: 'UI/UX Designer',
    department: 'Phòng Design',
    location: 'Hà Nội / Remote',
    employmentType: 'FULL_TIME',
    level: 'MIDDLE',
    salaryRange: '15-20 triệu',
    description: 'Tìm kiếm UI/UX Designer để thiết kế trải nghiệm người dùng cho các sản phẩm digital.',
    requirements: [
      'Có ít nhất 2 năm kinh nghiệm thiết kế UI/UX',
      'Thành thạo Figma, Adobe XD, hoặc Sketch',
      'Hiểu biết về User Research và Usability Testing',
      'Portfolio ấn tượng',
      'Có khả năng làm việc độc lập và theo team',
    ],
    responsibilities: [
      'Thiết kế UI/UX cho web và mobile applications',
      'Thực hiện user research và testing',
      'Tạo wireframes, prototypes, và mockups',
      'Làm việc với developers để implement designs',
      'Duy trì và phát triển design system',
    ],
    benefits: [
      'Lương thưởng cạnh tranh',
      'Flexible working arrangement',
      'Budget cho courses và conferences',
      'Thiết bị làm việc hiện đại',
      'Teambuilding và du lịch',
    ],
    status: 'ACTIVE',
    postedDate: '2024-12-15',
    deadline: '2025-02-15',
    applicants: [
      {
        id: 'app-008',
        name: 'Bùi Văn H',
        email: 'buivanh@email.com',
        phone: '0967890123',
        cvFileName: 'BuiVanH_Designer_Portfolio.pdf',
        cvFileKey: 'cvs/job-004/BuiVanH_Designer_Portfolio.pdf',
        appliedDate: '2024-12-16',
        status: 'NEW',
      },
    ],
    createdAt: '2024-12-15',
    updatedAt: '2024-12-16',
  },
  {
    id: 'job-005',
    title: 'Nhân viên Kế toán',
    department: 'Phòng Kế toán',
    location: 'Hà Nội',
    employmentType: 'FULL_TIME',
    level: 'JUNIOR',
    salaryRange: '8-12 triệu',
    description: 'Tuyển dụng nhân viên kế toán có kinh nghiệm để hỗ trợ công việc kế toán tổng hợp.',
    requirements: [
      'Tốt nghiệp Đại học chuyên ngành Kế toán, Tài chính',
      'Có chứng chỉ kế toán trưởng (ưu tiên)',
      'Thành thạo Excel, phần mềm kế toán (MISA, FAST)',
      'Hiểu biết về luật thuế và kế toán Việt Nam',
      'Cẩn thận, tỉ mỉ, có trách nhiệm',
    ],
    responsibilities: [
      'Ghi chép và hạch toán các nghiệp vụ kế toán',
      'Theo dõi công nợ phải thu, phải trả',
      'Lập báo cáo tài chính',
      'Kê khai thuế',
      'Hỗ trợ kế toán trưởng trong các công việc khác',
    ],
    benefits: [
      'Lương cứng + thưởng',
      'Bảo hiểm đầy đủ',
      'Thời gian làm việc ổn định',
      'Được đào tạo và phát triển',
      'Môi trường làm việc chuyên nghiệp',
    ],
    status: 'CLOSED',
    postedDate: '2024-11-01',
    deadline: '2024-12-31',
    applicants: [
      {
        id: 'app-009',
        name: 'Trương Thị I',
        email: 'truongthii@email.com',
        phone: '0978901234',
        cvFileName: 'TruongThiI_Accountant.pdf',
        cvFileKey: 'cvs/job-005/TruongThiI_Accountant.pdf',
        appliedDate: '2024-11-05',
        status: 'ACCEPTED',
        notes: 'Đã nhận việc từ ngày 01/12/2024',
      },
      {
        id: 'app-010',
        name: 'Phan Văn K',
        email: 'phanvank@email.com',
        phone: '0989012345',
        cvFileName: 'PhanVanK_CV.pdf',
        cvFileKey: 'cvs/job-005/PhanVanK_CV.pdf',
        appliedDate: '2024-11-10',
        status: 'REJECTED',
        notes: 'Không đủ kinh nghiệm',
      },
    ],
    createdAt: '2024-11-01',
    updatedAt: '2024-12-01',
  },
];

// Helper function to calculate statistics
export const calculateRecruitmentStatistics = (jobs: JobPosting[]) => {
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => j.status === 'ACTIVE').length,
    closedJobs: jobs.filter(j => j.status === 'CLOSED').length,
    draftJobs: jobs.filter(j => j.status === 'DRAFT').length,
    totalApplicants: 0,
    newApplicants: 0,
    interviewingApplicants: 0,
    offeredApplicants: 0,
    acceptedApplicants: 0,
    byDepartment: {} as Record<string, number>,
  };

  jobs.forEach(job => {
    stats.totalApplicants += job.applicants.length;
    stats.newApplicants += job.applicants.filter(a => a.status === 'NEW').length;
    stats.interviewingApplicants += job.applicants.filter(a => a.status === 'INTERVIEW').length;
    stats.offeredApplicants += job.applicants.filter(a => a.status === 'OFFERED').length;
    stats.acceptedApplicants += job.applicants.filter(a => a.status === 'ACCEPTED').length;

    stats.byDepartment[job.department] = (stats.byDepartment[job.department] || 0) + 1;
  });

  return stats;
};