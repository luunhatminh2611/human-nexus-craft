import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportEmployeesToExcel(employees, categories) {
  const workbook = new ExcelJS.Workbook();
  const mainSheet = workbook.addWorksheet('Nhân viên');
  const dropdownSheet = workbook.addWorksheet('Danh mục');
  
  // Ẩn sheet danh mục
  dropdownSheet.state = 'hidden';

  // Định nghĩa TẤT CẢ các cột (không phụ thuộc visibleColumns)
  const columns = [
    { header: 'Mã nhân viên', key: 'employeeCode', width: 15 },
    { header: 'Tên nhân viên', key: 'fullName', width: 25 },
    { header: 'Ngày sinh', key: 'dateOfBirth', width: 15 },
    { header: 'Giới tính', key: 'gender', width: 10 },
    { header: 'Nơi sinh', key: 'birthPlace', width: 20 },
    { header: 'Dân tộc', key: 'ethnicity', width: 15 },
    { header: 'Quốc tịch', key: 'nationality', width: 15 },
    { header: 'Tôn giáo', key: 'religion', width: 15 },
    { header: 'Gia đình CS', key: 'policyFamily', width: 20 },
    
    // CCCD
    { header: 'Số CCCD', key: 'cccdNumber', width: 15 },
    { header: 'Ngày cấp CCCD', key: 'cccdDate', width: 15 },
    { header: 'Nơi cấp CCCD', key: 'cccdPlace', width: 20 },
    { header: 'Số thẻ', key: 'cardNumber', width: 15 },
    
    // Địa chỉ
    { header: 'Tỉnh/TP', key: 'provinceCity', width: 20 },
    { header: 'Phường/Xã', key: 'ward', width: 20 },
    { header: 'Địa chỉ liên hệ', key: 'contactAddress', width: 30 },
    { header: 'Hộ khẩu TT', key: 'permanentAddress', width: 30 },
    { header: 'Nguyên quán', key: 'nativePlace', width: 20 },
    { header: 'Quê quán', key: 'homeTown', width: 20 },
    
    // Công việc
    { header: 'Ngày vào làm', key: 'startDate', width: 15 },
    { header: 'Ngày kết thúc', key: 'endDate', width: 15 },
    { header: 'Phòng ban', key: 'department', width: 25 },
    { header: 'Chức vụ', key: 'position', width: 20 },
    { header: 'Loại HĐ lao động', key: 'laborContractType', width: 20 },
    { header: 'Công việc cụ thể', key: 'currentJobDetail', width: 30 },
    { header: 'Danh hiệu', key: 'title', width: 20 },
    { header: 'Ngày trả hồ sơ', key: 'documentReturnDate', width: 15 },
    { header: 'Thương binh', key: 'isWoundedSoldier', width: 12 },
    
    // Trình độ
    { header: 'Bậc học', key: 'educationLevel', width: 20 },
    { header: 'Trình độ cụ thể', key: 'educationDetail', width: 30 },
    { header: 'Trình độ VH', key: 'culturalLevel', width: 20 },
    { header: 'Trình độ CM', key: 'professionalLevel', width: 20 },
    { header: 'Nghề nghiệp', key: 'specialty', width: 20 },
    { header: 'Trình độ TH', key: 'itLevel', width: 20 },
    { header: 'Trình độ NN', key: 'languageLevel', width: 20 },
    { header: 'Lý luận CT', key: 'politicalTheory', width: 20 },
    
    // Đào tạo
    { header: 'Trường ĐT', key: 'trainingInstitution', width: 30 },
    { header: 'Ngành ĐT', key: 'trainingMajor', width: 25 },
    { header: 'Hình thức ĐT', key: 'trainingType', width: 20 },
    
    // BHXH
    { header: 'Số sổ BHXH', key: 'socialInsuranceNumber', width: 15 },
    { header: 'Ngày tham gia BHXH', key: 'socialInsuranceStartDate', width: 18 },
    { header: 'Nghề BHXH', key: 'socialInsuranceJob', width: 20 },
    
    // Đảng, Đoàn, Quân đội
    { header: 'Ngày vào Đảng', key: 'partyJoinDate', width: 15 },
    { header: 'Ngày chính thức', key: 'partyOfficialDate', width: 15 },
    { header: 'Ngày vào Đoàn', key: 'youthUnionJoinDate', width: 15 },
    { header: 'Ngày nhập ngũ', key: 'militaryJoinDate', width: 15 },
    { header: 'Ngày xuất ngũ', key: 'militaryEndDate', width: 15 },
    { header: 'Quân hàm', key: 'militaryRank', width: 15 },
    
    { header: 'Ghi chú', key: 'note', width: 40 },
  ];

  mainSheet.columns = columns;

  // Tạo danh sách dropdown trong sheet ẩn
  let colIndex = 1;
  const dropdownRanges = {};

  // Helper function để ghi dropdown data (đã cải thiện)
  const writeDropdownColumn = (data, columnKey, labelKey = 'name') => {
    if (data && data.length > 0) {
      dropdownSheet.getCell(1, colIndex).value = columnKey;
      
      // Lọc bỏ giá trị null/undefined và duplicate
      const validData = data.filter(item => item && (item[labelKey] || item.name || item));
      const uniqueData = [...new Set(validData.map(item => item[labelKey] || item.name || item))];
      
      uniqueData.forEach((value, idx) => {
        dropdownSheet.getCell(idx + 2, colIndex).value = value as string;
      });
      
      dropdownRanges[columnKey] = {
        col: colIndex,
        range: `'Danh mục'!$${getColumnLetter(colIndex)}$2:$${getColumnLetter(colIndex)}$${uniqueData.length + 1}`
      };
      colIndex++;
    }
  };

  // **THÊM HELPER FUNCTION ĐỂ TÌM TÊN CHÍNH XÁC TỪ DANH MỤC**
  const findCategoryName = (categoryKey, employeeValue) => {
    if (!employeeValue) return '';
    
    const categoryList = categories[categoryKey];
    if (!categoryList || !Array.isArray(categoryList)) return employeeValue;
    
    // Tìm item trong danh mục - so sánh cả tên và ID
    const found = categoryList.find(item => {
      if (!item) return false;
      
      const itemName = item.name || item;
      const itemId = item.id;
      
      // So sánh chính xác
      if (itemName === employeeValue || itemId === employeeValue) return true;
      
      // So sánh không phân biệt hoa thường và trim khoảng trắng
      if (typeof itemName === 'string' && typeof employeeValue === 'string') {
        return itemName.trim().toLowerCase() === employeeValue.trim().toLowerCase();
      }
      
      return false;
    });
    
    return found ? (found.name || found) : '';
  };

  // Ghi các danh mục vào sheet ẩn
  writeDropdownColumn(['Nam', 'Nữ', 'Khác'], 'gender');
  writeDropdownColumn(categories.departments, 'department');
  writeDropdownColumn(categories.positions, 'position');
  writeDropdownColumn(categories.laborContractTypes, 'laborContractType');
  writeDropdownColumn(categories.nationalities, 'nationality');
  writeDropdownColumn(categories.ethnicities, 'ethnicity');
  writeDropdownColumn(categories.policyFamilies, 'policyFamily');
  writeDropdownColumn(categories.provinceCities, 'provinceCity');
  writeDropdownColumn(categories.wards, 'ward');
  writeDropdownColumn(categories.degrees, 'educationLevel');
  writeDropdownColumn(categories.culturalLevels, 'culturalLevel');
  writeDropdownColumn(categories.professionalLevels, 'professionalLevel');
  writeDropdownColumn(categories.specialties, 'specialty');
  writeDropdownColumn(categories.itLevels, 'itLevel');
  writeDropdownColumn(categories.languageLevels, 'languageLevel');
  writeDropdownColumn(categories.politicalTheories, 'politicalTheory');
  writeDropdownColumn(categories.trainingInstitutions, 'trainingInstitution');
  writeDropdownColumn(categories.trainingMajors, 'trainingMajor');
  writeDropdownColumn(categories.trainingTypes, 'trainingType');
  writeDropdownColumn(categories.socialInsuranceJobs, 'socialInsuranceJob');
  writeDropdownColumn(categories.militaryRanks, 'militaryRank');
  writeDropdownColumn(['Có', 'Không'], 'isWoundedSoldier');

  // **SỬA: Ghi dữ liệu nhân viên với findCategoryName**
  employees.forEach(emp => {
    mainSheet.addRow({
      employeeCode: emp.employeeCode || emp.code,
      fullName: emp.fullName || emp.name,
      dateOfBirth: emp.dateOfBirth ? formatDate(emp.dateOfBirth) : '',
      gender: emp.gender,
      birthPlace: emp.birthPlace,
      ethnicity: findCategoryName('ethnicities', emp.ethnicity),
      nationality: findCategoryName('nationalities', emp.nationalityName),
      religion: emp.religion,
      policyFamily: findCategoryName('policyFamilies', emp.policyFamilyName),
      cccdNumber: emp.cccdNumber,
      cccdDate: emp.cccdDate ? formatDate(emp.cccdDate) : '',
      cccdPlace: emp.cccdPlace,
      cardNumber: emp.cardNumber,
      provinceCity: findCategoryName('provinceCities', emp.provinceCityName),
      ward: findCategoryName('wards', emp.wardName),
      contactAddress: emp.contactAddress,
      permanentAddress: emp.permanentAddress,
      nativePlace: emp.nativePlace,
      homeTown: emp.homeTown,
      startDate: emp.startDate ? formatDate(emp.startDate) : '',
      endDate: emp.endDate ? formatDate(emp.endDate) : '',
      department: findCategoryName('departments', emp.departmentName),
      position: findCategoryName('positions', emp.positionName),
      laborContractType: findCategoryName('laborContractTypes', emp.laborContractTypeName),
      currentJobDetail: emp.currentJobDetail,
      title: emp.title,
      documentReturnDate: emp.documentReturnDate ? formatDate(emp.documentReturnDate) : '',
      isWoundedSoldier: emp.isWoundedSoldier ? 'Có' : 'Không',
      educationLevel: findCategoryName('degrees', emp.educationLevelName),
      educationDetail: emp.educationDetail,
      culturalLevel: findCategoryName('culturalLevels', emp.culturalLevelName),
      professionalLevel: findCategoryName('professionalLevels', emp.professionalLevelName),
      specialty: findCategoryName('specialties', emp.specialtyName),
      itLevel: findCategoryName('itLevels', emp.itLevelName),
      languageLevel: findCategoryName('languageLevels', emp.languageLevelName),
      politicalTheory: findCategoryName('politicalTheories', emp.politicalTheoryName),
      trainingInstitution: findCategoryName('trainingInstitutions', emp.trainingInstitutionName),
      trainingMajor: findCategoryName('trainingMajors', emp.trainingMajorName),
      trainingType: findCategoryName('trainingTypes', emp.trainingTypeName),
      socialInsuranceNumber: emp.socialInsuranceNumber,
      socialInsuranceStartDate: emp.socialInsuranceStartDate ? formatDate(emp.socialInsuranceStartDate) : '',
      socialInsuranceJob: findCategoryName('socialInsuranceJobs', emp.socialInsuranceJobName),
      partyJoinDate: emp.partyJoinDate ? formatDate(emp.partyJoinDate) : '',
      partyOfficialDate: emp.partyOfficialDate ? formatDate(emp.partyOfficialDate) : '',
      youthUnionJoinDate: emp.youthUnionJoinDate ? formatDate(emp.youthUnionJoinDate) : '',
      militaryJoinDate: emp.militaryJoinDate ? formatDate(emp.militaryJoinDate) : '',
      militaryEndDate: emp.militaryEndDate ? formatDate(emp.militaryEndDate) : '',
      militaryRank: findCategoryName('militaryRanks', emp.militaryRankName),
      note: emp.note,
    });
  });

  // Thêm data validation cho các cột dropdown
  const addValidation = (columnKey, dropdownKey) => {
    const colNumber = columns.findIndex(col => col.key === columnKey) + 1;
    if (colNumber > 0 && dropdownRanges[dropdownKey]) {
      for (let i = 2; i <= employees.length + 1; i++) {
        mainSheet.getCell(i, colNumber).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [dropdownRanges[dropdownKey].range],
          showErrorMessage: true,
          errorTitle: 'Giá trị không hợp lệ',
          error: 'Vui lòng chọn từ danh sách'
        };
      }
    }
  };

  // Áp dụng validation cho các cột
  addValidation('gender', 'gender');
  addValidation('department', 'department');
  addValidation('position', 'position');
  addValidation('laborContractType', 'laborContractType');
  addValidation('nationality', 'nationality');
  addValidation('ethnicity', 'ethnicity');
  addValidation('policyFamily', 'policyFamily');
  addValidation('provinceCity', 'provinceCity');
  addValidation('ward', 'ward');
  addValidation('educationLevel', 'educationLevel');
  addValidation('culturalLevel', 'culturalLevel');
  addValidation('professionalLevel', 'professionalLevel');
  addValidation('specialty', 'specialty');
  addValidation('itLevel', 'itLevel');
  addValidation('languageLevel', 'languageLevel');
  addValidation('politicalTheory', 'politicalTheory');
  addValidation('trainingInstitution', 'trainingInstitution');
  addValidation('trainingMajor', 'trainingMajor');
  addValidation('trainingType', 'trainingType');
  addValidation('socialInsuranceJob', 'socialInsuranceJob');
  addValidation('militaryRank', 'militaryRank');
  addValidation('isWoundedSoldier', 'isWoundedSoldier');

  // Style header
  mainSheet.getRow(1).font = { bold: true };
  mainSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };
  mainSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  // Export file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, `Danh_sach_nhan_vien_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Helper functions
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
}

function getColumnLetter(colNumber) {
  let letter = '';
  while (colNumber > 0) {
    const mod = (colNumber - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    colNumber = Math.floor((colNumber - mod) / 26);
  }
  return letter;
}