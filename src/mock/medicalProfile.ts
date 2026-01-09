// mock/medicalProfile.ts

export interface MedicalProfile {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  bloodType: string;
  height: number;
  weight: number;
  allergy?: string;
  chronicDisease?: string;
  occupationalDisease?: string;
  medication?: string;
  healthClassification: string;
  lastCheckDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockMedicalProfiles: MedicalProfile[] = [
  {
    id: 'med-001',
    employeeId: 'emp-001',
    employeeName: 'Nguyễn Văn An',
    employeeCode: 'NV001',
    departmentName: 'Phòng Kỹ thuật',
    bloodType: 'O+',
    height: 172,
    weight: 68,
    allergy: 'Penicillin, Hải sản',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-12-15',
    createdAt: '2024-01-10',
    updatedAt: '2024-12-15',
  },
  {
    id: 'med-002',
    employeeId: 'emp-002',
    employeeName: 'Trần Thị Bình',
    employeeCode: 'NV002',
    departmentName: 'Phòng Nhân sự',
    bloodType: 'A+',
    height: 160,
    weight: 52,
    allergy: 'Không',
    chronicDisease: 'Viêm xoang mãn tính',
    occupationalDisease: 'Không',
    medication: 'Thuốc xịt mũi',
    healthClassification: 'Loại II',
    lastCheckDate: '2024-11-20',
    createdAt: '2024-01-15',
    updatedAt: '2024-11-20',
  },
  {
    id: 'med-003',
    employeeId: 'emp-003',
    employeeName: 'Lê Văn Cường',
    employeeCode: 'NV003',
    departmentName: 'Phòng Kinh doanh',
    bloodType: 'B+',
    height: 175,
    weight: 85,
    allergy: 'Bụi, Phấn hoa',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại II',
    lastCheckDate: '2025-01-05',
    createdAt: '2024-02-01',
    updatedAt: '2025-01-05',
  },
  {
    id: 'med-004',
    employeeId: 'emp-004',
    employeeName: 'Phạm Thị Dung',
    employeeCode: 'NV004',
    departmentName: 'Phòng Kế toán',
    bloodType: 'AB+',
    height: 165,
    weight: 58,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-10-10',
    createdAt: '2024-01-20',
    updatedAt: '2024-10-10',
  },
  {
    id: 'med-005',
    employeeId: 'emp-005',
    employeeName: 'Hoàng Văn Em',
    employeeCode: 'NV005',
    departmentName: 'Phòng IT',
    bloodType: 'O+',
    height: 170,
    weight: 72,
    allergy: 'Aspirin',
    chronicDisease: 'Thoát vị đĩa đệm',
    occupationalDisease: 'Đau cột sống do ngồi lâu',
    medication: 'Thuốc giảm đau',
    healthClassification: 'Loại III',
    lastCheckDate: '2024-09-25',
    createdAt: '2024-03-01',
    updatedAt: '2024-09-25',
  },
  {
    id: 'med-006',
    employeeId: 'emp-006',
    employeeName: 'Đỗ Thị Hoa',
    employeeCode: 'NV006',
    departmentName: 'Phòng Marketing',
    bloodType: 'A+',
    height: 162,
    weight: 55,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Vitamin tổng hợp',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-12-01',
    createdAt: '2024-02-15',
    updatedAt: '2024-12-01',
  },
  {
    id: 'med-007',
    employeeId: 'emp-007',
    employeeName: 'Vũ Văn Giang',
    employeeCode: 'NV007',
    departmentName: 'Phòng Kỹ thuật',
    bloodType: 'B+',
    height: 178,
    weight: 80,
    allergy: 'Tôm, Cua',
    chronicDisease: 'Cao huyết áp',
    occupationalDisease: 'Không',
    medication: 'Thuốc hạ huyết áp',
    healthClassification: 'Loại III',
    lastCheckDate: '2024-11-15',
    createdAt: '2024-01-05',
    updatedAt: '2024-11-15',
  },
  {
    id: 'med-008',
    employeeId: 'emp-008',
    employeeName: 'Bùi Thị Lan',
    employeeCode: 'NV008',
    departmentName: 'Phòng Nhân sự',
    bloodType: 'O+',
    height: 158,
    weight: 50,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-12-20',
    createdAt: '2024-01-25',
    updatedAt: '2024-12-20',
  },
  {
    id: 'med-009',
    employeeId: 'emp-009',
    employeeName: 'Trương Văn Minh',
    employeeCode: 'NV009',
    departmentName: 'Phòng Kinh doanh',
    bloodType: 'A+',
    height: 173,
    weight: 70,
    allergy: 'Phấn hoa, Bụi nhà',
    chronicDisease: 'Hen suyễn nhẹ',
    occupationalDisease: 'Không',
    medication: 'Thuốc xịt khí dung',
    healthClassification: 'Loại II',
    lastCheckDate: '2024-10-30',
    createdAt: '2024-03-10',
    updatedAt: '2024-10-30',
  },
  {
    id: 'med-010',
    employeeId: 'emp-010',
    employeeName: 'Phan Thị Nga',
    employeeCode: 'NV010',
    departmentName: 'Phòng IT',
    bloodType: 'AB+',
    height: 163,
    weight: 56,
    allergy: 'Kháng sinh nhóm Quinolone',
    chronicDisease: 'Không',
    occupationalDisease: 'Hội chứng ống cổ tay',
    medication: 'Không',
    healthClassification: 'Loại II',
    lastCheckDate: '2024-11-10',
    createdAt: '2024-02-20',
    updatedAt: '2024-11-10',
  },
  {
    id: 'med-011',
    employeeId: 'emp-011',
    employeeName: 'Lý Văn Phong',
    employeeCode: 'NV011',
    departmentName: 'Phòng Kế toán',
    bloodType: 'B+',
    height: 168,
    weight: 65,
    allergy: 'Không',
    chronicDisease: 'Đái tháo đường type 2',
    occupationalDisease: 'Không',
    medication: 'Metformin',
    healthClassification: 'Loại IV',
    lastCheckDate: '2025-01-08',
    createdAt: '2024-01-12',
    updatedAt: '2025-01-08',
  },
  {
    id: 'med-012',
    employeeId: 'emp-012',
    employeeName: 'Đinh Thị Quỳnh',
    employeeCode: 'NV012',
    departmentName: 'Phòng Marketing',
    bloodType: 'O+',
    height: 160,
    weight: 53,
    allergy: 'Sữa, Đậu nành',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-12-05',
    createdAt: '2024-02-28',
    updatedAt: '2024-12-05',
  },
  {
    id: 'med-013',
    employeeId: 'emp-013',
    employeeName: 'Mai Văn Sơn',
    employeeCode: 'NV013',
    departmentName: 'Phòng Kỹ thuật',
    bloodType: 'A+',
    height: 176,
    weight: 78,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Mất thính lực nhẹ',
    medication: 'Không',
    healthClassification: 'Loại III',
    lastCheckDate: '2024-09-18',
    createdAt: '2024-01-30',
    updatedAt: '2024-09-18',
  },
  {
    id: 'med-014',
    employeeId: 'emp-014',
    employeeName: 'Cao Thị Tâm',
    employeeCode: 'NV014',
    departmentName: 'Phòng Nhân sự',
    bloodType: 'AB+',
    height: 165,
    weight: 60,
    allergy: 'Không',
    chronicDisease: 'Rối loạn lipid máu',
    occupationalDisease: 'Không',
    medication: 'Statin',
    healthClassification: 'Loại III',
    lastCheckDate: '2024-11-28',
    createdAt: '2024-03-05',
    updatedAt: '2024-11-28',
  },
  {
    id: 'med-015',
    employeeId: 'emp-015',
    employeeName: 'Hồ Văn Tú',
    employeeCode: 'NV015',
    departmentName: 'Phòng Kinh doanh',
    bloodType: 'O+',
    height: 174,
    weight: 73,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-12-10',
    createdAt: '2024-02-10',
    updatedAt: '2024-12-10',
  },
  {
    id: 'med-016',
    employeeId: 'emp-016',
    employeeName: 'Ngô Thị Uyên',
    employeeCode: 'NV016',
    departmentName: 'Phòng IT',
    bloodType: 'B+',
    height: 161,
    weight: 54,
    allergy: 'Mèo, Chó',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Thuốc chống dị ứng',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-10-22',
    createdAt: '2024-01-18',
    updatedAt: '2024-10-22',
  },
  {
    id: 'med-017',
    employeeId: 'emp-017',
    employeeName: 'Dương Văn Việt',
    employeeCode: 'NV017',
    departmentName: 'Phòng Kế toán',
    bloodType: 'A+',
    height: 169,
    weight: 67,
    allergy: 'Không',
    chronicDisease: 'Viêm gan B',
    occupationalDisease: 'Không',
    medication: 'Thuốc kháng virus',
    healthClassification: 'Loại IV',
    lastCheckDate: '2024-12-22',
    createdAt: '2024-03-15',
    updatedAt: '2024-12-22',
  },
  {
    id: 'med-018',
    employeeId: 'emp-018',
    employeeName: 'Lâm Thị Xuân',
    employeeCode: 'NV018',
    departmentName: 'Phòng Marketing',
    bloodType: 'O+',
    height: 159,
    weight: 51,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-11-05',
    createdAt: '2024-02-25',
    updatedAt: '2024-11-05',
  },
  {
    id: 'med-019',
    employeeId: 'emp-019',
    employeeName: 'Trịnh Văn Yên',
    employeeCode: 'NV019',
    departmentName: 'Phòng Kỹ thuật',
    bloodType: 'AB+',
    height: 177,
    weight: 82,
    allergy: 'Ibuprofen',
    chronicDisease: 'Gout',
    occupationalDisease: 'Không',
    medication: 'Allopurinol',
    healthClassification: 'Loại III',
    lastCheckDate: '2024-10-15',
    createdAt: '2024-01-22',
    updatedAt: '2024-10-15',
  },
  {
    id: 'med-020',
    employeeId: 'emp-020',
    employeeName: 'Đặng Thị Hương',
    employeeCode: 'NV020',
    departmentName: 'Phòng Nhân sự',
    bloodType: 'B+',
    height: 164,
    weight: 57,
    allergy: 'Không',
    chronicDisease: 'Không',
    occupationalDisease: 'Không',
    medication: 'Không',
    healthClassification: 'Loại I',
    lastCheckDate: '2024-12-18',
    createdAt: '2024-03-20',
    updatedAt: '2024-12-18',
  },
];

// Helper function to calculate statistics
export const calculateMedicalStatistics = (profiles: MedicalProfile[]) => {
  const stats = {
    total: profiles.length,
    byHealthClass: {
      'Loại I': 0,
      'Loại II': 0,
      'Loại III': 0,
      'Loại IV': 0,
      'Loại V': 0,
    },
    byBloodType: {} as Record<string, number>,
    withAllergies: 0,
    withChronicDisease: 0,
    withOccupationalDisease: 0,
    averageBMI: 0,
  };

  let totalBMI = 0;
  let bmiCount = 0;

  profiles.forEach(profile => {
    // Health classification
    if (profile.healthClassification) {
      stats.byHealthClass[profile.healthClassification] = 
        (stats.byHealthClass[profile.healthClassification] || 0) + 1;
    }

    // Blood type
    if (profile.bloodType) {
      stats.byBloodType[profile.bloodType] = 
        (stats.byBloodType[profile.bloodType] || 0) + 1;
    }

    // Allergies
    if (profile.allergy && profile.allergy !== 'Không') {
      stats.withAllergies++;
    }

    // Chronic disease
    if (profile.chronicDisease && profile.chronicDisease !== 'Không') {
      stats.withChronicDisease++;
    }

    // Occupational disease
    if (profile.occupationalDisease && profile.occupationalDisease !== 'Không') {
      stats.withOccupationalDisease++;
    }

    // BMI
    if (profile.height && profile.weight) {
      const heightInMeters = profile.height / 100;
      const bmi = profile.weight / (heightInMeters * heightInMeters);
      totalBMI += bmi;
      bmiCount++;
    }
  });

  stats.averageBMI = bmiCount > 0 ? totalBMI / bmiCount : 0;

  return stats;
};