import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import JobTitlesTab from '@/features/categories/components/JobTitle';
import MajorsTab from '@/features/categories/components/Majors';
import DegreesTab from '@/features/categories/components/Degrees';
import RolesTab from '../../components/Roles';
import EthnicitiesTab from '@/features/categories/components/Ethnicity';
import WardsTab from '@/features/categories/components/Ward';
import ProvincesTab from '@/features/categories/components/ProvinceCity';
import SpecialtiesTab from '@/features/categories/components/Specialty';
import PoliticalTheoriesTab from '@/features/categories/components/PoliticalTheory';
import LanguageLevelsTab from '@/features/categories/components/LanguageLevel';
import Nationality from '@/features/categories/components/Nationality';
import DepartmentTypesTab from '@/features/categories/components/DepartmentType';
import PPEItemsTab from '../../components/PPEItems';
import LaborContractTypeTab from '../../components/LaborContractTypeTab';
import CulturalLevelTab from '../../components/CulturalLevelTab';
import ProfessionalLevelTab from '../../components/ProfessionalLevelTab';
import ITLevelTab from '../../components/ITLevelTab';
import TrainingInstitutionTab from '../../components/TrainingInsitution';
import TrainingMajorTab from '../../components/TrainingMajor';
import TrainingTypeTab from '../../components/TrainingType';
import MilitaryRankTab from '../../components/MilitaryRankTab';
import PolicyFamilyTab from '../../components/PolicyFamilyTab';
import SocialInsuranceJobTab from '../../components/SocialJobTab';
import { Button } from '@/shared/components/ui/button/Button2';
import DepartmentTabs from '../../components/DepartmentsTab';
import PositionTab from '../../components/PositionTab';
import JobPositionTab from '../../components/JobPositionTab';
import OrganizationTab from '../../components/OrganizationTab';
import ReligionTab from '../../components/ReligionTab';
import PartyCommitteeTab from '../../components/PartyCommitteeTab';
import SalaryPayrollTab from '../../components/SalaryPayrollTab';
import SalaryScaleTab from '../../components/SalaryScaleTab';


interface Category {
  id: string;
  label: string;
  component: React.ComponentType;
  group: string;
}

const categories: Category[] = [
  // Nhóm Nhân sự
  { id: 'jobTitles', label: 'Chức danh', component: JobTitlesTab, group: 'Nhân sự' },
  { id: 'contractType', label: 'Loại hợp đồng', component: LaborContractTypeTab, group: 'Nhân sự' },
  { id: 'department', label: 'Phòng Ban', component: DepartmentTabs, group: 'Nhân sự' },
  { id: 'departmentTypes', label: 'Loại Phòng Ban', component: DepartmentTypesTab, group: 'Nhân sự' },
  { id: 'ppe', label: 'Đồ bảo hộ lao động', component: PPEItemsTab, group: 'Nhân sự' },

  // Nhóm Thông tin cá nhân
  { id: 'nationality', label: 'Quốc tịch', component: Nationality, group: 'Thông tin cá nhân' },
  { id: 'ethnicities', label: 'Dân tộc', component: EthnicitiesTab, group: 'Thông tin cá nhân' },
  { id: 'policyFamily', label: 'Gia đình chính sách', component: PolicyFamilyTab, group: 'Thông tin cá nhân' },
  { id: 'militaryRank', label: 'Quân hàm', component: MilitaryRankTab, group: 'Thông tin cá nhân' },

  // Nhóm Địa chỉ
  { id: 'provinces', label: 'Tỉnh/Thành Phố', component: ProvincesTab, group: 'Địa chỉ' },
  { id: 'wards', label: 'Phường/Xã', component: WardsTab, group: 'Địa chỉ' },

  // Nhóm Đào tạo
  { id: 'degrees', label: 'Bậc học', component: DegreesTab, group: 'Đào tạo' },
  { id: 'trainingInstitution', label: 'Trường đào tạo', component: TrainingInstitutionTab, group: 'Đào tạo' },
  { id: 'trainingMajor', label: 'Ngành đào tạo', component: TrainingMajorTab, group: 'Đào tạo' },
  { id: 'trainingType', label: 'Hình thức đào tạo', component: TrainingTypeTab, group: 'Đào tạo' },

  // Nhóm Trình độ
  { id: 'culturalLevel', label: 'Trình độ văn hóa', component: CulturalLevelTab, group: 'Trình độ' },
  { id: 'professionalLevel', label: 'Trình độ chuyên môn', component: ProfessionalLevelTab, group: 'Trình độ' },
  { id: 'itLevel', label: 'Trình độ tin học', component: ITLevelTab, group: 'Trình độ' },
  { id: 'languageLevels', label: 'Trình độ ngoại ngữ', component: LanguageLevelsTab, group: 'Trình độ' },
  { id: 'politicalTheories', label: 'Lý luận chính trị', component: PoliticalTheoriesTab, group: 'Trình độ' },

  // Nhóm Nghề nghiệp
  { id: 'specialties', label: 'Nghề nghiệp', component: SpecialtiesTab, group: 'Nghề nghiệp' },
  { id: 'socialJob', label: 'Nghề BHXH', component: SocialInsuranceJobTab, group: 'Nghề nghiệp' },

  // { id: 'position', label: 'Chức vụ', component: PositionTab, group: 'Nhân sự' },
  { id: 'position', label: 'Chức vụ', component: PositionTab, group: 'Nhân sự' },
  { id: 'jobPosition', label: 'Vị trí công việc', component: JobPositionTab, group: 'Nhân sự' },
  { id: 'organization', label: 'Cơ cấu tổ chức', component: OrganizationTab, group: 'Nhân sự' },
  // { id: 'employeeStatus', label: 'Trạng thái hồ sơ', component: EmployeeStatusTab, group: 'Nhân sự' },

  // Nhóm Thông tin cá nhân — bổ sung
  { id: 'religion', label: 'Tôn giáo', component: ReligionTab, group: 'Thông tin cá nhân' },
  { id: 'partyCommittee', label: 'Cấp ủy', component: PartyCommitteeTab, group: 'Thông tin cá nhân' },

  // Nhóm Lương — tạo mới
  { id: 'salaryPayroll', label: 'Bảng lương', component: SalaryPayrollTab, group: 'Lương' },
  { id: 'salaryScale', label: 'Thang bảng lương', component: SalaryScaleTab, group: 'Lương' },
];

export default function Catalog() {
  const [activeTab, setActiveTab] = useState('jobTitles');
  const [searchQuery, setSearchQuery] = useState('');

  // Nhóm các categories theo group
  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.group]) {
      acc[category.group] = [];
    }
    acc[category.group].push(category);
    return acc;
  }, {} as Record<string, Category[]>);

  // Filter categories dựa trên search query
  const filteredCategories = categories.filter(cat =>
    cat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ActiveComponent = categories.find(cat => cat.id === activeTab)?.component;

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Sidebar */}
        <Card className="w-64 flex-shrink-0">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm danh mục..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-4">
                {searchQuery ? (
                  // Hiển thị kết quả tìm kiếm
                  <div className="space-y-1">
                    {filteredCategories.map((category) => (
                      <Button
                        key={category.id}
                        onClick={() => setActiveTab(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === category.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted'
                          }`}
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  // Hiển thị theo nhóm
                  Object.entries(groupedCategories).map(([group, items]) => (
                    <div key={group}>
                      <h3 className="font-bold text-sm text-green-500 mb-2 px-3">
                        {group}
                      </h3>
                      <div className="space-y-1">
                        {items.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setActiveTab(category.id)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${activeTab === category.id
                                ? 'bg-green-500 text-primary-foreground'
                                : 'hover:bg-muted'
                              }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>

        {/* Main Content */}
        <Card className="flex-1">
          <div className="p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </Card>
      </div>
    </div>
  );
}