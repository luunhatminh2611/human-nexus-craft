import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { employeeApi } from "../../api/employeeApi";
import { toast } from "@/shared/components/ui/use-toast";
import {
  Loader2,
  X,
  Plus,
  UserPlus,
  Download,
  Upload,
  Copy,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from "lucide-react";
import GenericSearchSelect from "@/features/employees/components/GenericSearchSelect";
import { categoryConfigs } from "@/features/employees/components/CategoriesConfig";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/tables/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Button } from "@/shared/components/ui/button/Button2";
import { Field } from "@/features/medical/components/sections/FormHelpers";
import NameSelectField from "../NameSelectedField";
import { STATUS_MAP, STATUS_REVERSE_MAP } from "./EmployeeModal";

export default function BulkAddEmployeeModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [employees, setEmployees] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<"table" | "expanded">("table"); // Chế độ hiển thị
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set([
      "code",
      "fullName",
      "birthDate",
      "startDate",
      "departmentId",
      "positionId",
      "gender",
      "contactAddress",
      "laborContractTypeId",
    ]),
  );

  useEffect(() => {
    if (isOpen && employees.length === 0) {
      handleAddEmployee();
    }
  }, [isOpen]);

  const allColumns = {
    required: [
      { key: "code", label: "Mã nhân viên *" },
      { key: "fullName", label: "Tên nhân viên *" },
      { key: "birthDate", label: "Ngày sinh *" },
      { key: "startDate", label: "Ngày vào làm *" },
      { key: "departmentId", label: "Phòng ban *" },
      { key: "positionId", label: "Chức vụ *" },
    ],
    optional: [
      // ================= THÔNG TIN ĐỊNH DANH =================
      { key: "companyId", label: "Công ty", group: "Thông tin định danh" },
      { key: "email", label: "Email", group: "Thông tin định danh" },
      { key: "phone", label: "Số điện thoại", group: "Thông tin định danh" },
      { key: "gender", label: "Giới tính", group: "Thông tin định danh" },
      { key: "otherName", label: "Tên gọi khác", group: "Thông tin định danh" },
      { key: "birthPlace", label: "Nơi sinh", group: "Thông tin định danh" },
      {
        key: "dateOfBirth",
        label: "Ngày sinh (khác)",
        group: "Thông tin định danh",
      },
      { key: "status", label: "Trạng thái", group: "Thông tin định danh" },
      { key: "cardNumber", label: "Số thẻ", group: "Thông tin định danh" },
      {
        key: "documentReturnDate",
        label: "Ngày trả hồ sơ",
        group: "Thông tin định danh",
      },

      // ================= CẤP ỦY =================
      { key: "partyCommitteeId", label: "Cấp ủy hiện tại", group: "Cấp ủy" },
      { key: "subPartyCommitteeId", label: "Cấp ủy kiêm", group: "Cấp ủy" },

      // ================= CHỨC VỤ & CHỨC DANH =================
      { key: "taxCode", label: "Mã số thuế", group: "Chức vụ & Chức danh" },
      {
        key: "subPositionId",
        label: "Chức vụ kiêm",
        group: "Chức vụ & Chức danh",
      },
      {
        key: "subDepartmentId",
        label: "Phòng ban phụ",
        group: "Chức vụ & Chức danh",
      },
      { key: "jobTitleId", label: "Chức danh", group: "Chức vụ & Chức danh" },
      {
        key: "jobPositionId",
        label: "Vị trí công việc",
        group: "Chức vụ & Chức danh",
      },

      // ================= ĐỊA CHỈ =================
      { key: "contactAddress", label: "Nơi ở hiện nay", group: "Địa chỉ" },
      { key: "provinceCityId", label: "Tỉnh/TP", group: "Địa chỉ" },
      { key: "wardId", label: "Phường/Xã", group: "Địa chỉ" },
      { key: "permanentAddress", label: "Thường trú", group: "Địa chỉ" },
      { key: "nativePlace", label: "Nguyên quán", group: "Địa chỉ" },
      { key: "homeTown", label: "Quê quán", group: "Địa chỉ" },
      { key: "organizationId", label: "Cơ quan tuyển dụng", group: "Địa chỉ" },
      {
        key: "organizationAddress",
        label: "Địa chỉ cơ quan",
        group: "Địa chỉ",
      },

      // ================= THÔNG TIN CÁ NHÂN =================
      { key: "ethnicity", label: "Dân tộc", group: "Thông tin cá nhân" },
      { key: "religion", label: "Tôn giáo", group: "Thông tin cá nhân" },
      { key: "nationalityId", label: "Quốc tịch", group: "Thông tin cá nhân" },
      {
        key: "policyFamilyId",
        label: "Gia đình CS",
        group: "Thông tin cá nhân",
      },

      // ================= TỔ CHỨC CHÍNH TRỊ =================
      {
        key: "youthUnionJoinDate",
        label: "Ngày vào Đoàn",
        group: "Tổ chức chính trị",
      },
      {
        key: "partyJoinDate",
        label: "Ngày vào Đảng",
        group: "Tổ chức chính trị",
      },
      {
        key: "partyOfficialDate",
        label: "Ngày chính thức Đảng",
        group: "Tổ chức chính trị",
      },
      {
        key: "workProcesses",
        label: "Quá trình công tác",
        group: "Tổ chức chính trị",
      },

      // ================= QUÂN SỰ & DANH HIỆU =================
      {
        key: "militaryJoinDate",
        label: "Ngày nhập ngũ",
        group: "Quân sự & Danh hiệu",
      },
      {
        key: "militaryEndDate",
        label: "Ngày xuất ngũ",
        group: "Quân sự & Danh hiệu",
      },
      {
        key: "title",
        label: "Quân hàm cao nhất",
        group: "Quân sự & Danh hiệu",
      },
      {
        key: "militaryRankId",
        label: "Danh hiệu",
        group: "Quân sự & Danh hiệu",
      },
      {
        key: "injuryRank",
        label: "Hạng thương binh",
        group: "Quân sự & Danh hiệu",
      },
      {
        key: "isWoundedSoldier",
        label: "Thương binh",
        group: "Quân sự & Danh hiệu",
      },

      // ================= SỨC KHỎE =================
      { key: "healthStatus", label: "Tình trạng sức khỏe", group: "Sức khỏe" },
      { key: "height", label: "Chiều cao", group: "Sức khỏe" },
      { key: "weight", label: "Cân nặng", group: "Sức khỏe" },
      { key: "bloodType", label: "Nhóm máu", group: "Sức khỏe" },

      // ================= CCCD =================
      { key: "cccdNumber", label: "Số CCCD", group: "CCCD" },
      { key: "cccdDate", label: "Ngày cấp", group: "CCCD" },
      { key: "cccdPlace", label: "Nơi cấp", group: "CCCD" },

      // ================= THU NHẬP =================
      { key: "familyIncome", label: "Thu nhập gia đình", group: "Thu nhập" },
      { key: "otherIncome", label: "Thu nhập khác", group: "Thu nhập" },

      // ================= NHÀ Ở =================
      { key: "housingType", label: "Loại nhà", group: "Nhà ở" },
      { key: "housingArea", label: "Diện tích nhà", group: "Nhà ở" },
      { key: "selfHousingType", label: "Nhà tự mua", group: "Nhà ở" },
      { key: "usableArea", label: "Diện tích sử dụng", group: "Nhà ở" },

      // ================= ĐẤT ĐAI =================
      { key: "grantedLandArea", label: "Đất được cấp", group: "Đất đai" },
      { key: "purchasedLandArea", label: "Đất mua", group: "Đất đai" },
      { key: "otherLand", label: "Đất khác", group: "Đất đai" },

      // ================= NGÂN HÀNG =================
      {
        key: "bankAccountNumber",
        label: "Số tài khoản",
        group: "Tài khoản ngân hàng",
      },
      { key: "bankName", label: "Ngân hàng", group: "Tài khoản ngân hàng" },
      {
        key: "bankAccountHolder",
        label: "Chủ tài khoản",
        group: "Tài khoản ngân hàng",
      },
      { key: "bankBranch", label: "Chi nhánh", group: "Tài khoản ngân hàng" },

      // ================= TUYỂN DỤNG =================
      { key: "previousJob", label: "Nghề trước", group: "Tuyển dụng" },
      { key: "recruitmentDate", label: "Ngày tuyển dụng", group: "Tuyển dụng" },
      { key: "contractType", label: "Loại hợp đồng", group: "Tuyển dụng" },
      { key: "laborContractTypeId", label: "Loại HĐLĐ", group: "Tuyển dụng" },
      { key: "salary", label: "Lương hợp đồng", group: "Tuyển dụng" },

      // ================= TRÌNH ĐỘ =================
      {
        key: "educationDetail",
        label: "Học vấn cụ thể",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "educationLevelId",
        label: "Bằng cấp",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "politicalTheoryId",
        label: "Lý luận chính trị",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "foreignLanguageId",
        label: "Ngoại ngữ",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "languageLevelId",
        label: "Trình độ ngoại ngữ",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "culturalLevelId",
        label: "Văn hóa",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "professionalLevelId",
        label: "Chuyên môn",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "itLevelId",
        label: "Trình độ IT",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "trainingMajorId",
        label: "Ngành đào tạo",
        group: "Trình độ học vấn & chuyên môn",
      },
      {
        key: "occupationId",
        label: "Nghề nghiệp",
        group: "Trình độ học vấn & chuyên môn",
      },

      // ================= CÔNG VIỆC =================
      {
        key: "currentJobDetail",
        label: "Công việc hiện tại",
        group: "Chi tiết công việc",
      },
      { key: "workStrength", label: "Sở trường", group: "Chi tiết công việc" },
      {
        key: "longestJob",
        label: "Công việc lâu nhất",
        group: "Chi tiết công việc",
      },

      // ================= LƯƠNG =================
      { key: "payrollId", label: "Bảng lương", group: "Lương" },
      { key: "payrollName", label: "Tên bảng lương", group: "Lương" },
      { key: "salaryScaleId", label: "Thang lương", group: "Lương" },
      { key: "salaryScaleName", label: "Tên thang lương", group: "Lương" },
      { key: "salaryCoefficient", label: "Hệ số lương", group: "Lương" },
      { key: "salaryAmount", label: "Mức lương", group: "Lương" },
      { key: "effectiveDate", label: "Ngày áp dụng", group: "Lương" },

      // ================= BHXH =================
      { key: "insurancePayrollId", label: "Bảng lương BHXH", group: "BHXH" },
      { key: "insuranceSalaryScaleId", label: "Thang BHXH", group: "BHXH" },
      { key: "insuranceSalaryCoefficient", label: "Hệ số BHXH", group: "BHXH" },
      { key: "insuranceSalaryBase", label: "Lương BHXH", group: "BHXH" },
      { key: "insurancePlace", label: "Nơi đóng BHXH", group: "BHXH" },
      { key: "insuranceBookNumber", label: "Số sổ BHXH", group: "BHXH" },
      { key: "socialInsuranceNumber", label: "Số BHXH", group: "BHXH" },
      {
        key: "socialInsuranceStartDate",
        label: "Ngày bắt đầu BHXH",
        group: "BHXH",
      },
      { key: "insuranceUnionSalary", label: "Lương công đoàn", group: "BHXH" },
      { key: "insurancePositionId", label: "Chức danh BHXH", group: "BHXH" },
      { key: "socialInsuranceJobId", label: "Nghề BHXH", group: "BHXH" },

      // ================= LỊCH SỬ =================
      {
        key: "legalHistory",
        label: "Lịch sử pháp lý",
        group: "Lịch sử bản thân",
      },
      {
        key: "workedInOldRegime",
        label: "Chế độ cũ",
        group: "Lịch sử bản thân",
      },
      {
        key: "foreignOrganizationRelation",
        label: "Quan hệ nước ngoài",
        group: "Lịch sử bản thân",
      },
      {
        key: "relativesAbroad",
        label: "Thân nhân nước ngoài",
        group: "Lịch sử bản thân",
      },
      {
        key: "decreaseReasonId",
        label: "Lý do giảm",
        group: "Lịch sử bản thân",
      },
      {
        key: "increaseReasonId",
        label: "Lý do tăng",
        group: "Lịch sử bản thân",
      },

      // ================= GHI CHÚ =================
      { key: "note", label: "Ghi chú", group: "Ghi chú" },
    ],
  };

  const toggleColumn = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: any[]) => employeeApi.saveAll(payload),
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: `Đã thêm ${employees.length} nhân viên`,
      });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm nhân viên",
        variant: "destructive",
      });
    },
  });

  const createNewEmployee = () => {
    return {
      tempId: nextId,
      code: "",
      fullName: "",
      birthDate: "",
      birthPlace: "",
      startDate: "",
      gender: "NAM",
      status: "DANG_CONG_TAC",
      email: "",
      phone: "",
      otherName: "",
      dateOfBirth: "",
      cardNumber: "",
      documentReturnDate: "",

      // CCCD
      cccdNumber: "",
      cccdDate: "",
      cccdPlace: "",

      // Địa chỉ
      contactAddress: "",
      nativePlace: "",
      homeTown: "",
      permanentAddress: "",
      wardId: "",
      provinceCityId: "",
      organizationId: "",
      organizationAddress: "",

      // Công việc
      departmentId: "",
      subDepartmentId: "",
      positionId: "",
      subPositionId: "",
      jobTitleId: "",
      jobPositionId: "",
      currentJobDetail: "",
      workStrength: "",
      longestJob: "",
      title: "",
      isWoundedSoldier: false,

      // Tuyển dụng
      previousJob: "",
      recruitmentDate: "",
      contractType: "",
      laborContractTypeId: "",
      salary: "",

      // Thông tin cá nhân
      ethnicity: "",
      religion: "",
      nationalityId: "",
      policyFamilyId: "",

      // Cấp ủy
      partyCommitteeId: "",
      subPartyCommitteeId: "",

      // Chức vụ & Chức danh
      companyId: "",
      taxCode: "",

      // Trình độ
      educationDetail: "",
      educationLevelId: "",
      politicalTheoryId: "",
      foreignLanguageId: "", // đổi từ languageId
      languageLevelId: "",
      culturalLevelId: "",
      professionalLevelId: "",
      itLevelId: "",
      trainingMajorId: "",
      occupationId: "", // đổi từ specialtyId

      // Quân sự
      militaryJoinDate: "",
      militaryEndDate: "",
      militaryRankId: "",
      injuryRank: "",

      // Đảng, Đoàn
      partyJoinDate: "",
      partyOfficialDate: "",
      youthUnionJoinDate: "",

      // Sức khỏe
      healthStatus: "",
      height: "",
      weight: "",
      bloodType: "",

      // Thu nhập
      familyIncome: "",
      otherIncome: "",

      // Nhà ở
      housingType: "",
      housingArea: "",
      selfHousingType: "",
      usableArea: "",

      // Đất đai
      grantedLandArea: "",
      purchasedLandArea: "",
      otherLand: "",

      // Ngân hàng
      bankAccountNumber: "",
      bankName: "",
      bankAccountHolder: "",
      bankBranch: "",

      // Lương
      payrollId: "", // đổi từ salaryPayrollId
      payrollName: "",
      salaryScaleId: "",
      salaryScaleName: "",
      salaryCoefficient: "",
      salaryAmount: "",
      effectiveDate: "", // đổi từ salaryEffectiveDate

      // BHXH
      insurancePayrollId: "", // đổi từ socialInsurancePayrollId
      insuranceSalaryScaleId: "", // đổi từ socialInsuranceSalaryScaleId
      insuranceSalaryCoefficient: "", // đổi từ socialInsuranceSalaryCoefficient
      insuranceSalaryBase: "", // đổi từ socialInsuranceSalaryAmount
      insurancePlace: "", // đổi từ socialInsurancePlace
      insuranceBookNumber: "",
      socialInsuranceNumber: "",
      socialInsuranceStartDate: "",
      insuranceUnionSalary: "", // đổi từ unionSalary
      insurancePositionId: "", // đổi từ socialInsuranceJobTitleId
      socialInsuranceJobId: "",

      // Lịch sử
      legalHistory: "",
      workedInOldRegime: "",
      foreignOrganizationRelation: "",
      relativesAbroad: "",
      decreaseReasonId: "",
      increaseReasonId: "",

      // Ghi chú
      note: "",

      // Quá trình công tác
      workProcesses: [],
    };
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const mainSheet = workbook.addWorksheet("Nhân viên");
      const dropdownSheet = workbook.addWorksheet("Danh mục");

      dropdownSheet.state = "hidden";

      // Định nghĩa tất cả các cột
      const columns = [
        { header: "Mã nhân viên *", key: "code", width: 15 },
        { header: "Tên nhân viên *", key: "fullName", width: 25 },
        { header: "Ngày sinh *", key: "birthDate", width: 15 },
        { header: "Giới tính", key: "gender", width: 10 },
        { header: "Nơi sinh", key: "birthPlace", width: 20 },
        { header: "Dân tộc", key: "ethnicity", width: 15 },
        { header: "Quốc tịch", key: "nationality", width: 15 },
        { header: "Tôn giáo", key: "religion", width: 15 },
        { header: "Gia đình CS", key: "policyFamily", width: 20 },
        { header: "Số CCCD", key: "cccdNumber", width: 15 },
        { header: "Ngày cấp CCCD", key: "cccdDate", width: 15 },
        { header: "Nơi cấp CCCD", key: "cccdPlace", width: 20 },
        { header: "Tỉnh/TP", key: "provinceCity", width: 20 },
        { header: "Phường/Xã", key: "ward", width: 20 },
        { header: "Địa chỉ liên hệ", key: "contactAddress", width: 30 },
        { header: "Hộ khẩu TT", key: "permanentAddress", width: 30 },
        { header: "Nguyên quán", key: "nativePlace", width: 20 },
        { header: "Quê quán", key: "homeTown", width: 20 },
        { header: "Ngày vào làm *", key: "startDate", width: 15 },
        { header: "Ngày kết thúc", key: "endDate", width: 15 },
        { header: "Phòng ban *", key: "department", width: 25 },
        { header: "Chức vụ *", key: "position", width: 20 },
        { header: "Loại HĐ lao động", key: "laborContractType", width: 20 },
        { header: "Công việc cụ thể", key: "currentJobDetail", width: 30 },
        { header: "Danh hiệu", key: "title", width: 20 },
        { header: "Số thẻ từ", key: "cardNumber", width: 15 },
        { header: "Ngày trả hồ sơ", key: "documentReturnDate", width: 15 },
        { header: "Thương binh", key: "isWoundedSoldier", width: 12 },
        { header: "Bậc học", key: "educationLevel", width: 20 },
        { header: "Trình độ cụ thể", key: "educationDetail", width: 30 },
        { header: "Trình độ VH", key: "culturalLevel", width: 20 },
        { header: "Trình độ CM", key: "professionalLevel", width: 20 },
        { header: "Nghề nghiệp", key: "specialty", width: 20 },
        { header: "Trình độ TH", key: "itLevel", width: 20 },
        { header: "Trình độ NN", key: "languageLevel", width: 20 },
        { header: "Lý luận CT", key: "politicalTheory", width: 20 },
        { header: "Trường ĐT", key: "trainingInstitution", width: 30 },
        { header: "Ngành ĐT", key: "trainingMajor", width: 25 },
        { header: "Hình thức ĐT", key: "trainingType", width: 20 },
        { header: "Số sổ BHXH", key: "socialInsuranceNumber", width: 15 },
        {
          header: "Ngày tham gia BHXH",
          key: "socialInsuranceStartDate",
          width: 18,
        },
        { header: "Nghề BHXH", key: "socialInsuranceJob", width: 20 },
        { header: "Ngày vào Đảng", key: "partyJoinDate", width: 15 },
        { header: "Ngày chính thức", key: "partyOfficialDate", width: 15 },
        { header: "Ngày vào Đoàn", key: "youthUnionJoinDate", width: 15 },
        { header: "Ngày nhập ngũ", key: "militaryJoinDate", width: 15 },
        { header: "Ngày xuất ngũ", key: "militaryEndDate", width: 15 },
        { header: "Quân hàm", key: "militaryRank", width: 15 },
        { header: "Ghi chú", key: "note", width: 40 },
      ];

      mainSheet.columns = columns;

      // Lấy danh mục
      const [
        departments,
        positions,
        laborContractTypes,
        nationalities,
        ethnicities,
        policyFamilies,
        provinceCities,
        wards,
        degrees,
        culturalLevels,
        professionalLevels,
        specialties,
        itLevels,
        languageLevels,
        politicalTheories,
        trainingInstitutions,
        trainingMajors,
        trainingTypes,
        socialInsuranceJobs,
        militaryRanks,
      ] = await Promise.all([
        categoryConfigs.department.api.getAll(),
        categoryConfigs.jobTitle.api.getAll(),
        categoryConfigs.laborContractType.api.getAll(),
        categoryConfigs.nationality.api.getAll(),
        categoryConfigs.ethnicity.api.getAll(),
        categoryConfigs.policyFamily.api.getAll(),
        categoryConfigs.provinceCity.api.getAll(),
        categoryConfigs.ward.api.getAll(),
        categoryConfigs.degree.api.getAll(),
        categoryConfigs.culturalLevel.api.getAll(),
        categoryConfigs.professionalLevel.api.getAll(),
        categoryConfigs.specialty.api.getAll(),
        categoryConfigs.itLevel.api.getAll(),
        categoryConfigs.languageLevel.api.getAll(),
        categoryConfigs.politicalTheory.api.getAll(),
        categoryConfigs.trainingInstitution.api.getAll(),
        categoryConfigs.trainingMajor.api.getAll(),
        categoryConfigs.trainingType.api.getAll(),
        categoryConfigs.socialInsuranceJob.api.getAll(),
        categoryConfigs.militaryRank.api.getAll(),
      ]);

      // Helper: Tìm tên từ ID
      const findNameById = (list: any[], id: string) => {
        if (!id) return "";
        const found = list?.find((item) => item.id === Number(id));
        return found?.name || "";
      };

      // Helper: Ghi dropdown
      let colIndex = 1;
      const dropdownRanges = {};
      const writeDropdown = (data: any[], key: string) => {
        if (data && data.length > 0) {
          dropdownSheet.getCell(1, colIndex).value = key;
          data.forEach((item, idx) => {
            dropdownSheet.getCell(idx + 2, colIndex).value = item.name || item;
          });
          dropdownRanges[key] =
            `'Danh mục'!$${getColumnLetter(colIndex)}$2:$${getColumnLetter(colIndex)}$${data.length + 1}`;
          colIndex++;
        }
      };

      // Ghi danh mục
      writeDropdown(["Nam", "Nữ", "Khác"], "gender");
      writeDropdown(departments, "department");
      writeDropdown(positions, "position");
      writeDropdown(laborContractTypes, "laborContractType");
      writeDropdown(nationalities, "nationality");
      writeDropdown(ethnicities, "ethnicity");
      writeDropdown(policyFamilies, "policyFamily");
      writeDropdown(provinceCities, "provinceCity");
      writeDropdown(wards, "ward");
      writeDropdown(degrees, "educationLevel");
      writeDropdown(culturalLevels, "culturalLevel");
      writeDropdown(professionalLevels, "professionalLevel");
      writeDropdown(specialties, "specialty");
      writeDropdown(itLevels, "itLevel");
      writeDropdown(languageLevels, "languageLevel");
      writeDropdown(politicalTheories, "politicalTheory");
      writeDropdown(trainingInstitutions, "trainingInstitution");
      writeDropdown(trainingMajors, "trainingMajor");
      writeDropdown(trainingTypes, "trainingType");
      writeDropdown(socialInsuranceJobs, "socialInsuranceJob");
      writeDropdown(militaryRanks, "militaryRank");
      writeDropdown(["Có", "Không"], "isWoundedSoldier");

      // Ghi dữ liệu nhân viên (nếu có)
      employees.forEach((emp) => {
        mainSheet.addRow({
          code: emp.code,
          fullName: emp.fullName,
          birthDate: emp.birthDate,
          gender: emp.gender,
          birthPlace: emp.birthPlace,
          ethnicity: findNameById(ethnicities, emp.ethnicity),
          nationality: findNameById(nationalities, emp.nationalityId),
          religion: emp.religion,
          policyFamily: findNameById(policyFamilies, emp.policyFamilyId),
          cccdNumber: emp.cccdNumber,
          cccdDate: emp.cccdDate,
          cccdPlace: emp.cccdPlace,
          provinceCity: findNameById(provinceCities, emp.provinceCityId),
          ward: findNameById(wards, emp.wardId),
          contactAddress: emp.contactAddress,
          permanentAddress: emp.permanentAddress,
          nativePlace: emp.nativePlace,
          homeTown: emp.homeTown,
          startDate: emp.startDate,
          endDate: emp.endDate,
          department: findNameById(departments, emp.departmentId),
          position: findNameById(positions, emp.positionId),
          laborContractType: findNameById(
            laborContractTypes,
            emp.laborContractTypeId,
          ),
          currentJobDetail: emp.currentJobDetail,
          title: emp.title,
          cardNumber: emp.cardNumber,
          documentReturnDate: emp.documentReturnDate,
          isWoundedSoldier: emp.isWoundedSoldier ? "Có" : "Không",
          educationLevel: findNameById(degrees, emp.educationLevelId),
          educationDetail: emp.educationDetail,
          culturalLevel: findNameById(culturalLevels, emp.culturalLevelId),
          professionalLevel: findNameById(
            professionalLevels,
            emp.professionalLevelId,
          ),
          specialty: findNameById(specialties, emp.specialtyId),
          itLevel: findNameById(itLevels, emp.itLevelId),
          languageLevel: findNameById(languageLevels, emp.languageLevelId),
          politicalTheory: findNameById(
            politicalTheories,
            emp.politicalTheoryId,
          ),
          trainingInstitution: findNameById(
            trainingInstitutions,
            emp.trainingInstitutionId,
          ),
          trainingMajor: findNameById(trainingMajors, emp.trainingMajorId),
          trainingType: findNameById(trainingTypes, emp.trainingTypeId),
          socialInsuranceNumber: emp.socialInsuranceNumber,
          socialInsuranceStartDate: emp.socialInsuranceStartDate,
          socialInsuranceJob: findNameById(
            socialInsuranceJobs,
            emp.socialInsuranceJobId,
          ),
          partyJoinDate: emp.partyJoinDate,
          partyOfficialDate: emp.partyOfficialDate,
          youthUnionJoinDate: emp.youthUnionJoinDate,
          militaryJoinDate: emp.militaryJoinDate,
          militaryEndDate: emp.militaryEndDate,
          militaryRank: findNameById(militaryRanks, emp.militaryRankId),
          note: emp.note,
        });
      });

      // Thêm validation
      const addValidation = (columnKey: string, dropdownKey: string) => {
        const colNumber = columns.findIndex((col) => col.key === columnKey) + 1;
        if (colNumber > 0 && dropdownRanges[dropdownKey]) {
          const maxRow = Math.max(employees.length + 1, 100); // Ít nhất 100 dòng
          for (let i = 2; i <= maxRow; i++) {
            mainSheet.getCell(i, colNumber).dataValidation = {
              type: "list",
              allowBlank: true,
              formulae: [dropdownRanges[dropdownKey]],
            };
          }
        }
      };

      addValidation("gender", "gender");
      addValidation("department", "department");
      addValidation("position", "position");
      addValidation("laborContractType", "laborContractType");
      addValidation("nationality", "nationality");
      addValidation("ethnicity", "ethnicity");
      addValidation("policyFamily", "policyFamily");
      addValidation("provinceCity", "provinceCity");
      addValidation("ward", "ward");
      addValidation("educationLevel", "educationLevel");
      addValidation("culturalLevel", "culturalLevel");
      addValidation("professionalLevel", "professionalLevel");
      addValidation("specialty", "specialty");
      addValidation("itLevel", "itLevel");
      addValidation("languageLevel", "languageLevel");
      addValidation("politicalTheory", "politicalTheory");
      addValidation("trainingInstitution", "trainingInstitution");
      addValidation("trainingMajor", "trainingMajor");
      addValidation("trainingType", "trainingType");
      addValidation("socialInsuranceJob", "socialInsuranceJob");
      addValidation("militaryRank", "militaryRank");
      addValidation("isWoundedSoldier", "isWoundedSoldier");

      // Style header
      mainSheet.getRow(1).font = { bold: true };
      mainSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4472C4" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName =
        employees.length > 0
          ? `Them_nhan_vien_${new Date().toISOString().split("T")[0]}.xlsx`
          : `Mau_them_nhan_vien.xlsx`;

      saveAs(blob, fileName);

      toast({
        title: "Thành công",
        description:
          employees.length > 0
            ? `Đã tải xuống file với ${employees.length} nhân viên`
            : "Đã tải xuống file mẫu",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống file",
        variant: "destructive",
      });
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());

      const worksheet = workbook.getWorksheet("Nhân viên");
      if (!worksheet) {
        throw new Error('Không tìm thấy sheet "Nhân viên"');
      }

      // Lấy danh mục để map tên -> ID
      const [
        departments,
        positions,
        laborContractTypes,
        nationalities,
        ethnicities,
        policyFamilies,
        provinceCities,
        wards,
        degrees,
        culturalLevels,
        professionalLevels,
        specialties,
        itLevels,
        languageLevels,
        politicalTheories,
        trainingInstitutions,
        trainingMajors,
        trainingTypes,
        socialInsuranceJobs,
        militaryRanks,
      ] = await Promise.all([
        categoryConfigs.department.api.getAll(),
        categoryConfigs.jobTitle.api.getAll(),
        categoryConfigs.laborContractType.api.getAll(),
        categoryConfigs.nationality.api.getAll(),
        categoryConfigs.ethnicity.api.getAll(),
        categoryConfigs.policyFamily.api.getAll(),
        categoryConfigs.provinceCity.api.getAll(),
        categoryConfigs.ward.api.getAll(),
        categoryConfigs.degree.api.getAll(),
        categoryConfigs.culturalLevel.api.getAll(),
        categoryConfigs.professionalLevel.api.getAll(),
        categoryConfigs.specialty.api.getAll(),
        categoryConfigs.itLevel.api.getAll(),
        categoryConfigs.languageLevel.api.getAll(),
        categoryConfigs.politicalTheory.api.getAll(),
        categoryConfigs.trainingInstitution.api.getAll(),
        categoryConfigs.trainingMajor.api.getAll(),
        categoryConfigs.trainingType.api.getAll(),
        categoryConfigs.socialInsuranceJob.api.getAll(),
        categoryConfigs.militaryRank.api.getAll(),
      ]);

      // Helper: Tìm ID từ tên
      const findIdByName = (list: any[], name: string) => {
        if (!name) return "";
        const found = list?.find(
          (item) =>
            item.name?.toLowerCase().trim() === name?.toLowerCase().trim(),
        );
        return found ? String(found.id) : "";
      };

      const importedEmployees: any[] = [];
      const existingCodes = new Map(employees.map((emp) => [emp.code, emp]));

      const formatDateFromExcel = (value: any) => {
        if (!value) return "";

        // Date object
        if (value instanceof Date) {
          return value.toISOString().split("T")[0];
        }

        // Số serial Excel
        if (typeof value === "number") {
          const date = new Date((value - 25569) * 86400 * 1000);
          return date.toISOString().split("T")[0];
        }

        // Chuỗi dd/mm/yyyy
        if (typeof value === "string") {
          const trimmed = value.trim();

          // Format dd/mm/yyyy hoặc d/m/yyyy
          const ddmmyyyyMatch = trimmed.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
          );
          if (ddmmyyyyMatch) {
            const [, day, month, year] = ddmmyyyyMatch;
            return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }

          // Đã đúng yyyy-mm-dd
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
          }
        }

        return "";
      };

      // Helper: Chuẩn hóa giới tính
      const normalizeGender = (value: string) => {
        const genderMap = {
          Nam: "NAM",
          Nữ: "NỮ",
          Khác: "KHÁC",
        };
        return genderMap[value?.trim()] || value?.toUpperCase() || "NAM";
      };

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const getCellValue = (colNumber: number) => {
          const cell = row.getCell(colNumber);
          return cell.value ? String(cell.value).trim() : "";
        };

        const code = getCellValue(1);
        if (!code) return; // Skip empty rows

        const employeeData = {
          tempId: existingCodes.has(code)
            ? existingCodes.get(code)!.tempId
            : nextId + importedEmployees.length,
          code,
          fullName: getCellValue(2),
          birthDate: formatDateFromExcel(getCellValue(3)),
          gender: normalizeGender(getCellValue(4)),
          birthPlace: getCellValue(5),
          ethnicity: findIdByName(ethnicities, getCellValue(6)),
          nationalityId: findIdByName(nationalities, getCellValue(7)),
          religion: getCellValue(8),
          policyFamilyId: findIdByName(policyFamilies, getCellValue(9)),
          cccdNumber: getCellValue(10),
          cccdDate: formatDateFromExcel(getCellValue(11)),
          cccdPlace: getCellValue(12),
          provinceCityId: findIdByName(provinceCities, getCellValue(13)),
          wardId: findIdByName(wards, getCellValue(14)),
          contactAddress: getCellValue(15),
          permanentAddress: getCellValue(16),
          nativePlace: getCellValue(17),
          homeTown: getCellValue(18),
          startDate: formatDateFromExcel(getCellValue(19)),
          endDate: formatDateFromExcel(getCellValue(20)),
          departmentId: findIdByName(departments, getCellValue(21)),
          positionId: findIdByName(positions, getCellValue(22)),
          laborContractTypeId: findIdByName(
            laborContractTypes,
            getCellValue(23),
          ),
          currentJobDetail: getCellValue(24),
          title: getCellValue(25),
          cardNumber: getCellValue(26),
          documentReturnDate: formatDateFromExcel(getCellValue(27)),
          isWoundedSoldier: getCellValue(28) === "Có",
          educationLevelId: findIdByName(degrees, getCellValue(29)),
          educationDetail: getCellValue(30),
          culturalLevelId: findIdByName(culturalLevels, getCellValue(31)),
          professionalLevelId: findIdByName(
            professionalLevels,
            getCellValue(32),
          ),
          specialtyId: findIdByName(specialties, getCellValue(33)),
          itLevelId: findIdByName(itLevels, getCellValue(34)),
          languageLevelId: findIdByName(languageLevels, getCellValue(35)),
          politicalTheoryId: findIdByName(politicalTheories, getCellValue(36)),
          trainingInstitutionId: findIdByName(
            trainingInstitutions,
            getCellValue(37),
          ),
          trainingMajorId: findIdByName(trainingMajors, getCellValue(38)),
          trainingTypeId: findIdByName(trainingTypes, getCellValue(39)),
          socialInsuranceNumber: getCellValue(40),
          socialInsuranceStartDate: formatDateFromExcel(getCellValue(41)),
          socialInsuranceJobId: findIdByName(
            socialInsuranceJobs,
            getCellValue(42),
          ),
          partyJoinDate: formatDateFromExcel(getCellValue(43)),
          partyOfficialDate: formatDateFromExcel(getCellValue(44)),
          youthUnionJoinDate: formatDateFromExcel(getCellValue(45)),
          militaryJoinDate: formatDateFromExcel(getCellValue(46)),
          militaryEndDate: formatDateFromExcel(getCellValue(47)),
          militaryRankId: findIdByName(militaryRanks, getCellValue(48)),
          note: getCellValue(49),
          status: "Đang làm việc",
        };

        importedEmployees.push(employeeData);
      });

      // Merge: Cập nhật nếu trùng code, thêm mới nếu không
      const updatedEmployees = employees.map((emp) => {
        const imported = importedEmployees.find((imp) => imp.code === emp.code);
        return imported || emp;
      });

      const newEmployees = importedEmployees.filter(
        (imp) => !existingCodes.has(imp.code),
      );

      setEmployees([...updatedEmployees, ...newEmployees]);
      setNextId((prev) => prev + newEmployees.length);

      toast({
        title: "Thành công",
        description: `Đã nhập ${importedEmployees.length} nhân viên (${newEmployees.length} mới, ${importedEmployees.length - newEmployees.length} cập nhật)`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đọc file",
        variant: "destructive",
      });
    } finally {
      e.target.value = ""; // Reset input
    }
  };

  // Helper function
  function getColumnLetter(colNumber: number) {
    let letter = "";
    while (colNumber > 0) {
      const mod = (colNumber - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      colNumber = Math.floor((colNumber - mod) / 26);
    }
    return letter;
  }

  const handleCopyEmployee = (tempId: number) => {
    const employeeToCopy = employees.find((e) => e.tempId === tempId);
    if (employeeToCopy) {
      const newEmployee = {
        ...employeeToCopy,
        tempId: nextId,
        code: "", // Reset mã nhân viên để tránh trùng
      };
      setEmployees((prev) => [...prev, newEmployee]);
      setNextId((prev) => prev + 1);
      toast({
        title: "Thành công",
        description: "Đã sao chép thông tin nhân viên",
      });
    }
  };

  const toggleRowExpansion = (tempId: number) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tempId)) {
        newSet.delete(tempId);
      } else {
        newSet.add(tempId);
      }
      return newSet;
    });
  };

  const handleAddEmployee = () => {
    setEmployees((prev) => [...prev, createNewEmployee()]);
    setNextId((prev) => prev + 1);
  };

  const handleRemoveEmployee = (tempId: number) => {
    setEmployees((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  const handleFieldChange = (tempId: number, field: string, value: any) => {
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.tempId === tempId ? { ...emp, [field]: value } : emp,
      ),
    );
  };

  const handleSubmit = () => {
    if (employees.length === 0) {
      toast({
        title: "Thông báo",
        description: "Vui lòng thêm ít nhất một nhân viên",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    const invalidEmployees = employees.filter(
      (emp) =>
        !emp.code ||
        !emp.fullName ||
        !emp.birthDate ||
        !emp.startDate ||
        !emp.departmentId ||
        !emp.positionId,
    );

    const payload = employees.map((emp) => ({
      code: emp.code,
      fullName: emp.fullName,
      birthDate: emp.birthDate,
      birthPlace: emp.birthPlace || null,
      startDate: emp.startDate,
      gender: emp.gender,
      status: emp.status,
      otherName: emp.otherName || null,
      email: emp.email || null,
      phone: emp.phone || null,
      dateOfBirth: emp.dateOfBirth || null,
      cardNumber: emp.cardNumber || null,
      documentReturnDate: emp.documentReturnDate || null,

      // Công ty & Chức vụ
      companyId: emp.companyId || null,
      subDepartmentId: emp.subDepartmentId || null,
      partyCommitteeId: emp.partyCommitteeId || null,
      subPartyCommitteeId: emp.subPartyCommitteeId || null,
      taxCode: emp.taxCode || null,
      subPositionId: emp.subPositionId || null,
      jobTitleId: emp.jobTitleId || null,
      jobPositionId: emp.jobPositionId || null,

      // Tuyển dụng
      laborContractTypeId: emp.laborContractTypeId || null,
      contractType: emp.contractType || null,
      salary: emp.salary || null,
      previousJob: emp.previousJob || null,
      recruitmentDate: emp.recruitmentDate || null,
      organizationId: emp.organizationId || null,
      organizationAddress: emp.organizationAddress || null,

      // CCCD
      cccdNumber: emp.cccdNumber || null,
      cccdDate: emp.cccdDate || null,
      cccdPlace: emp.cccdPlace || null,

      // Địa chỉ
      contactAddress: emp.contactAddress || null,
      nativePlace: emp.nativePlace || null,
      homeTown: emp.homeTown || null,
      permanentAddress: emp.permanentAddress || null,
      wardId: emp.wardId || null,
      provinceCityId: emp.provinceCityId || null,

      // Công việc
      currentJobDetail: emp.currentJobDetail || null,
      workStrength: emp.workStrength || null,
      longestJob: emp.longestJob || null,
      title: emp.title || null,
      isWoundedSoldier: emp.isWoundedSoldier,

      // Thông tin cá nhân
      ethnicity: emp.ethnicity || null,
      religion: emp.religion || null,
      nationalityId: emp.nationalityId || null,
      policyFamilyId: emp.policyFamilyId || null,
      injuryRank: emp.injuryRank || null,

      // Sức khỏe
      healthStatus: emp.healthStatus || null,
      height: emp.height || null,
      weight: emp.weight || null,
      bloodType: emp.bloodType || null,

      // Trình độ
      educationDetail: emp.educationDetail || null,
      educationLevelId: emp.educationLevelId || null,
      politicalTheoryId: emp.politicalTheoryId || null,
      foreignLanguageId: emp.foreignLanguageId || null, // đổi từ languageId
      languageLevelId: emp.languageLevelId || null,
      culturalLevelId: emp.culturalLevelId || null,
      professionalLevelId: emp.professionalLevelId || null,
      itLevelId: emp.itLevelId || null,
      trainingMajorId: emp.trainingMajorId || null,
      occupationId: emp.occupationId || null, // đổi từ specialtyId

      // Đảng, Đoàn, Quân đội
      partyJoinDate: emp.partyJoinDate || null,
      partyOfficialDate: emp.partyOfficialDate || null,
      youthUnionJoinDate: emp.youthUnionJoinDate || null,
      militaryJoinDate: emp.militaryJoinDate || null,
      militaryEndDate: emp.militaryEndDate || null,
      militaryRankId: emp.militaryRankId || null,

      // Thu nhập
      familyIncome: emp.familyIncome || null,
      otherIncome: emp.otherIncome || null,

      // Nhà ở
      housingType: emp.housingType || null,
      housingArea: emp.housingArea || null,
      selfHousingType: emp.selfHousingType || null,
      usableArea: emp.usableArea || null,

      // Đất đai
      grantedLandArea: emp.grantedLandArea || null,
      purchasedLandArea: emp.purchasedLandArea || null,
      otherLand: emp.otherLand || null,

      // Ngân hàng
      bankAccountNumber: emp.bankAccountNumber || null,
      bankName: emp.bankName || null,
      bankAccountHolder: emp.bankAccountHolder || null,
      bankBranch: emp.bankBranch || null,

      // Lương
      payrollId: emp.payrollId || null, // đổi từ salaryPayrollId
      payrollName: emp.payrollName || null,
      salaryScaleId: emp.salaryScaleId || null,
      salaryScaleName: emp.salaryScaleName || null,
      salaryCoefficient: emp.salaryCoefficient || null,
      salaryAmount: emp.salaryAmount || null,
      effectiveDate: emp.effectiveDate || null, // đổi từ salaryEffectiveDate

      // BHXH
      insurancePayrollId: emp.insurancePayrollId || null, // đổi từ socialInsurancePayrollId
      insuranceSalaryScaleId: emp.insuranceSalaryScaleId || null, // đổi từ socialInsuranceSalaryScaleId
      insuranceSalaryCoefficient: emp.insuranceSalaryCoefficient || null, // đổi từ socialInsuranceSalaryCoefficient
      insuranceSalaryBase: emp.insuranceSalaryBase || null, // đổi từ socialInsuranceSalaryAmount
      insurancePlace: emp.insurancePlace || null, // đổi từ socialInsurancePlace
      insuranceBookNumber: emp.insuranceBookNumber || null,
      socialInsuranceNumber: emp.socialInsuranceNumber || null,
      socialInsuranceStartDate: emp.socialInsuranceStartDate || null,
      insuranceUnionSalary: emp.insuranceUnionSalary || null, // đổi từ unionSalary
      insurancePositionId: emp.insurancePositionId || null, // đổi từ socialInsuranceJobTitleId
      socialInsuranceJobId: emp.socialInsuranceJobId || null,

      // Lịch sử
      legalHistory: emp.legalHistory || null,
      workedInOldRegime: emp.workedInOldRegime || null,
      foreignOrganizationRelation: emp.foreignOrganizationRelation || null,
      relativesAbroad: emp.relativesAbroad || null,
      decreaseReasonId: emp.decreaseReasonId || null,
      increaseReasonId: emp.increaseReasonId || null,

      // Ghi chú
      note: emp.note || null,

      // Object references
      departmentId: emp.departmentId || null,
      position: emp.positionId ? { id: Number(emp.positionId) } : null,
      laborContractType: emp.laborContractTypeId
        ? { id: Number(emp.laborContractTypeId) }
        : null,
      ward: emp.wardId ? { id: Number(emp.wardId) } : null,
      provinceCity: emp.provinceCityId
        ? { id: Number(emp.provinceCityId) }
        : null,
      educationLevel: emp.educationLevelId
        ? { id: Number(emp.educationLevelId) }
        : null,
      politicalTheory: emp.politicalTheoryId
        ? { id: Number(emp.politicalTheoryId) }
        : null,
      languageLevel: emp.languageLevelId
        ? { id: Number(emp.languageLevelId) }
        : null,
      nationality: emp.nationalityId ? { id: Number(emp.nationalityId) } : null,
      culturalLevel: emp.culturalLevelId
        ? { id: Number(emp.culturalLevelId) }
        : null,
      professionalLevel: emp.professionalLevelId
        ? { id: Number(emp.professionalLevelId) }
        : null,
      trainingMajor: emp.trainingMajorId
        ? { id: Number(emp.trainingMajorId) }
        : null,
      militaryRank: emp.militaryRankId
        ? { id: Number(emp.militaryRankId) }
        : null,
      policyFamily: emp.policyFamilyId
        ? { id: Number(emp.policyFamilyId) }
        : null,
      partyCommittee: emp.partyCommitteeId
        ? { id: Number(emp.partyCommitteeId) }
        : null,
      subPartyCommittee: emp.subPartyCommitteeId
        ? { id: Number(emp.subPartyCommitteeId) }
        : null,
      jobTitle: emp.jobTitleId ? { id: Number(emp.jobTitleId) } : null,
      jobPosition: emp.jobPositionId ? { id: Number(emp.jobPositionId) } : null,
      organization: emp.organizationId
        ? { id: Number(emp.organizationId) }
        : null,

      // Quá trình công tác
      workProcesses: emp.workProcesses || [],
    }));
    console.log("payloadnha", payload);
    createMutation.mutate(payload);
  };

  const handleClose = () => {
    setEmployees([]);
    setNextId(1);
    setExpandedRows(new Set());
    onClose();
  };

  const renderTableCell = (employee, field: string) => {
    const commonInputClass = "h-8 text-sm w-full min-w-[150px]";

    switch (field) {
      case "code":
      case "fullName":
      case "birthPlace":
      case "religion":
      case "currentJobDetail":
      case "title":
      case "cardNumber":
      case "educationDetail":
      case "contactAddress":
      case "permanentAddress":
      case "nativePlace":
      case "homeTown":
      case "cccdNumber":
      case "cccdPlace":
      case "socialInsuranceNumber":
      case "otherName":
      case "status":
      case "taxCode":
      case "organizationAddress":
      case "previousJob":
      case "contractType":
      case "salary":
      case "email":
      case "phone":
      case "healthStatus":
      case "height":
      case "weight":
      case "bloodType":
      case "injuryRank":
      case "familyIncome":
      case "otherIncome":
      case "housingType":
      case "housingArea":
      case "selfHousingType":
      case "usableArea":
      case "grantedLandArea":
      case "purchasedLandArea":
      case "otherLand":
      case "bankAccountNumber":
      case "bankName":
      case "bankAccountHolder":
      case "bankBranch":
      case "salaryCoefficient":
      case "salaryAmount":
      case "payrollName":
      case "salaryScaleName":
      case "insuranceSalaryCoefficient": // đổi từ socialInsuranceSalaryCoefficient
      case "insuranceSalaryBase": // đổi từ socialInsuranceSalaryAmount
      case "insurancePlace": // đổi từ socialInsurancePlace
      case "insuranceUnionSalary": // đổi từ unionSalary
      case "insuranceBookNumber":
      case "legalHistory":
      case "workedInOldRegime":
      case "foreignOrganizationRelation":
      case "relativesAbroad":
        return (
          <Input
            value={employee[field]}
            onChange={(e) =>
              handleFieldChange(employee.tempId, field, e.target.value)
            }
            className={commonInputClass}
            placeholder="..."
          />
        );

      case "birthDate":
      case "startDate":
      case "dateOfBirth":
      case "cccdDate":
      case "documentReturnDate":
      case "socialInsuranceStartDate":
      case "partyJoinDate":
      case "partyOfficialDate":
      case "youthUnionJoinDate":
      case "militaryJoinDate":
      case "militaryEndDate":
      case "recruitmentDate":
      case "effectiveDate": // đổi từ salaryEffectiveDate
        return (
          <Input
            type="date"
            value={employee[field]}
            onChange={(e) =>
              handleFieldChange(employee.tempId, field, e.target.value)
            }
            className={commonInputClass}
          />
        );

      case "gender":
        return (
          <Select
            value={employee.gender}
            onValueChange={(value) =>
              handleFieldChange(employee.tempId, "gender", value)
            }
          >
            <SelectTrigger className={commonInputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NAM">Nam</SelectItem>
              <SelectItem value="NỮ">Nữ</SelectItem>
              <SelectItem value="KHÁC">Khác</SelectItem>
            </SelectContent>
          </Select>
        );

      case "isWoundedSoldier":
        return (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={employee.isWoundedSoldier}
              onCheckedChange={(checked) =>
                handleFieldChange(employee.tempId, "isWoundedSoldier", checked)
              }
            />
          </div>
        );

      case "note":
        return (
          <Textarea
            value={employee.note}
            onChange={(e) =>
              handleFieldChange(employee.tempId, "note", e.target.value)
            }
            className="text-sm min-w-[200px]"
            rows={2}
          />
        );

      // Các trường GenericSearchSelect
      case "ethnicity":
      case "nationalityId":
      case "policyFamilyId":
      case "provinceCityId":
      case "wardId":
      case "departmentId":
      case "subDepartmentId":
      case "positionId":
      case "subPositionId":
      case "laborContractTypeId":
      case "occupationId": // đổi từ specialtyId
      case "educationLevelId":
      case "politicalTheoryId":
      case "foreignLanguageId": // đổi từ languageId
      case "languageLevelId":
      case "culturalLevelId":
      case "professionalLevelId":
      case "itLevelId":
      case "trainingMajorId":
      case "militaryRankId":
      case "socialInsuranceJobId":
      case "jobTitleId":
      case "jobPositionId":
      case "organizationId":
      case "partyCommitteeId":
      case "subPartyCommitteeId":
      case "companyId":
      case "payrollId": // đổi từ salaryPayrollId
      case "salaryScaleId":
      case "insurancePayrollId": // đổi từ socialInsurancePayrollId
      case "insuranceSalaryScaleId": // đổi từ socialInsuranceSalaryScaleId
      case "insurancePositionId": // đổi từ socialInsuranceJobTitleId
      case "decreaseReasonId":
      case "increaseReasonId":
        const configKey =
          field === "positionId"
            ? "jobTitle"
            : field === "subPositionId"
              ? "jobTitle"
              : field === "educationLevelId"
                ? "degree"
                : field === "jobTitleId"
                  ? "jobTitle"
                  : field === "jobPositionId"
                    ? "jobPosition"
                    : field === "organizationId"
                      ? "organization"
                      : field === "partyCommitteeId"
                        ? "partyCommittee"
                        : field === "subPartyCommitteeId"
                          ? "partyCommittee"
                          : field === "subDepartmentId"
                            ? "department"
                            : field === "occupationId"
                              ? "specialty"
                              : field === "foreignLanguageId"
                                ? "language"
                                : field === "insurancePositionId"
                                  ? "jobTitle"
                                  : field === "payrollId" ||
                                      field === "insurancePayrollId"
                                    ? "payroll"
                                    : field === "salaryScaleId" ||
                                        field === "insuranceSalaryScaleId"
                                      ? "salaryScale"
                                      : field.replace(/Id$/, "");

        const config = categoryConfigs[configKey];
        if (!config)
          return <div className="text-xs text-muted-foreground">N/A</div>;

        return (
          <div className="min-w-[180px]">
            <GenericSearchSelect
              api={config.api}
              config={config}
              value={employee[field]}
              onChange={(v) =>
                handleFieldChange(employee.tempId, field, String(v))
              }
            />
          </div>
        );

      default:
        return <div className="text-xs text-muted-foreground">-</div>;
    }
  };

  const renderEmployeeFieldsExpanded = (employee, index) => (
    <div
      key={employee.tempId}
      className="border rounded-lg p-4 space-y-4 bg-muted/30"
    >
      <div className="flex items-center justify-between pb-2 border-b">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs">
            {index + 1}
          </span>
          {employee.fullName || "Nhân viên mới"}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleRemoveEmployee(employee.tempId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* TAB THÔNG TIN ĐỊNH DANH */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Thông tin định danh
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Công ty *</Label>
              <GenericSearchSelect
                api={categoryConfigs.company.api}
                config={categoryConfigs.company}
                value={employee.companyId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "companyId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phòng ban *</Label>
              <GenericSearchSelect
                api={categoryConfigs.department.api}
                config={categoryConfigs.department}
                value={employee.departmentId}
                onChange={(v) =>
                {
                  handleFieldChange(employee.tempId, "departmentId", String(v));
                  console.log("id them pb", v);
                }
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mã nhân viên *</Label>
              <Input
                value={employee.code}
                onChange={(e) =>
                  handleFieldChange(employee.tempId, "code", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="Nhập mã nhân viên"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Họ và tên *</Label>
              <Input
                value={employee.fullName}
                onChange={(e) =>
                  handleFieldChange(employee.tempId, "fullName", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Giới tính *</Label>
              <Select
                value={employee.gender}
                onValueChange={(v) =>
                  handleFieldChange(employee.tempId, "gender", v)
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NAM">Nam</SelectItem>
                  <SelectItem value="NỮ">Nữ</SelectItem>
                  <SelectItem value="KHÁC">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Các tên gọi khác</Label>
              <Input
                value={employee.otherName}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "otherName",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
                placeholder="Nhập các tên gọi khác (nếu có)"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ngày sinh *</Label>
              <Input
                type="date"
                value={employee.birthDate}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "birthDate",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Field label="Nơi sinh (Tỉnh/Thành Phố)" required>
                <NameSelectField
                  configKey="provinceCity"
                  currentName={employee.birthPlace}
                  onChange={(v) =>
                    handleFieldChange(employee.tempId, "birthPlace", v)
                  }
                />
              </Field>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Trạng thái hồ sơ *</Label>
              <Select
                value={STATUS_MAP[employee.status] ? STATUS_MAP[employee.status] : employee.status}
                onValueChange={(v) =>
                {
                  handleFieldChange(employee.tempId, "status", STATUS_REVERSE_MAP[v] ?? v);
                  console.log("status", v);
                }
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Đang công tác">Đang công tác</SelectItem>
                  <SelectItem value="Nghỉ chế độ">Nghỉ chế độ</SelectItem>
                  <SelectItem value="Nghỉ hưu trí">Nghỉ hưu trí</SelectItem>
                  <SelectItem value="Nghỉ việc">Nghỉ việc</SelectItem>
                  <SelectItem value="Từ trần">Từ trần</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <Input
                value={employee.email}
                onChange={(e) =>
                  handleFieldChange(employee.tempId, "email", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="@gmail.com"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Số điện thoại</Label>
              <Input
                value={employee.phone}
                onChange={(e) =>
                  handleFieldChange(employee.tempId, "phone", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="Nhập SĐT"
              />
            </div>
          </div>
        </div>

        {/* TAB CẤP ỦY */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Cấp ủy
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Cấp ủy hiện tại</Label>
              <GenericSearchSelect
                api={categoryConfigs.partyCommittee.api}
                config={categoryConfigs.partyCommittee}
                value={employee.partyCommitteeId}
                onChange={(v) =>
                  handleFieldChange(
                    employee.tempId,
                    "partyCommitteeId",
                    String(v),
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cấp ủy kiêm</Label>
              <GenericSearchSelect
                api={categoryConfigs.partyCommittee.api}
                config={categoryConfigs.partyCommittee}
                value={employee.subPartyCommitteeId}
                onChange={(v) =>
                  handleFieldChange(
                    employee.tempId,
                    "subPartyCommitteeId",
                    String(v),
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* TAB CHỨC VỤ & CHỨC DANH */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Chức vụ & Chức danh
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Chức vụ</Label>
              <GenericSearchSelect
                api={categoryConfigs.position.api}
                config={categoryConfigs.position}
                value={employee.positionId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "positionId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phòng ban phụ</Label>
              <GenericSearchSelect
                api={categoryConfigs.department.api}
                config={categoryConfigs.department}
                value={employee.subDepartmentId}
                onChange={(v) =>
                  handleFieldChange(
                    employee.tempId,
                    "subDepartmentId",
                    String(v),
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Mã số thuế</Label>
              <Input
                value={employee.taxCode}
                onChange={(e) =>
                  handleFieldChange(employee.tempId, "taxCode", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="Nhập mã"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Chức vụ kiêm</Label>
              <GenericSearchSelect
                api={categoryConfigs.position.api}
                config={categoryConfigs.position}
                value={employee.subPositionId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "subPositionId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Chức danh</Label>
              <GenericSearchSelect
                api={categoryConfigs.jobTitle.api}
                config={categoryConfigs.jobTitle}
                value={employee.jobTitleId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "jobTitleId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Vị trí công việc</Label>
              <GenericSearchSelect
                api={categoryConfigs.jobPosition.api}
                config={categoryConfigs.jobPosition}
                value={employee.jobPositionId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "jobPositionId", String(v))
                }
              />
            </div>
          </div>
        </div>

        {/* TAB ĐỊA CHỈ */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Địa chỉ
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Địa chỉ liên hệ</Label>
              <Input
                value={employee.contactAddress}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "contactAddress",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
                placeholder="Nhập địa chỉ liên hệ"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tỉnh/Thành phố</Label>
              <GenericSearchSelect
                api={categoryConfigs.provinceCity.api}
                config={categoryConfigs.provinceCity}
                value={employee.provinceCityId}
                onChange={(v) =>
                  handleFieldChange(
                    employee.tempId,
                    "provinceCityId",
                    String(v),
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phường/Xã</Label>
              <GenericSearchSelect
                api={categoryConfigs.ward.api}
                config={categoryConfigs.ward}
                value={employee.wardId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "wardId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hộ khẩu thường trú</Label>
              <Input
                value={employee.permanentAddress}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "permanentAddress",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
                placeholder="Nhập hộ khẩu thường trú"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Nguyên quán</Label>
              <Input
                value={employee.nativePlace}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "nativePlace",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
                placeholder="Nhập nguyên quán"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quê quán</Label>
              <Input
                value={employee.homeTown}
                onChange={(e) =>
                  handleFieldChange(employee.tempId, "homeTown", e.target.value)
                }
                className="h-8 text-sm"
                placeholder="Nhập quê quán"
              />
            </div>
          </div>
        </div>

        {/* TAB THÔNG TIN CÁ NHÂN */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Sức khỏe
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Dân tộc</Label>
              <GenericSearchSelect
                api={categoryConfigs.ethnicity.api}
                config={categoryConfigs.ethnicity}
                value={employee.ethnicity?.toString()}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "ethnicity", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tôn giáo</Label>
              <GenericSearchSelect
                api={categoryConfigs.religion.api}
                config={categoryConfigs.religion}
                value={employee.religionId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "religionId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Quốc tịch</Label>
              <GenericSearchSelect
                api={categoryConfigs.nationality.api}
                config={categoryConfigs.nationality}
                value={employee.nationalityId}
                onChange={(v) =>
                  handleFieldChange(employee.tempId, "nationalityId", String(v))
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gia đình chính sách</Label>
              <GenericSearchSelect
                api={categoryConfigs.policyFamily.api}
                config={categoryConfigs.policyFamily}
                value={employee.policyFamilyId}
                onChange={(v) =>
                  handleFieldChange(
                    employee.tempId,
                    "policyFamilyId",
                    String(v),
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* TAB TỔ CHỨC CHÍNH TRỊ - XÃ HỘI */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Tổ chức chính trị - xã hội
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Ngày tham gia cách mạng</Label>
              <Input
                type="date"
                value={employee.youthUnionJoinDate}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "youthUnionJoinDate",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ngày vào Đảng</Label>
              <Input
                type="date"
                value={employee.partyJoinDate}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "partyJoinDate",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ngày chính thức Đảng</Label>
              <Input
                type="date"
                value={employee.partyOfficialDate}
                onChange={(e) =>
                  handleFieldChange(
                    employee.tempId,
                    "partyOfficialDate",
                    e.target.value,
                  )
                }
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        {/* QUÁ TRÌNH CÔNG TÁC */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
            Quá trình công tác
          </h3>
          <div className="space-y-3">
            {employee.workProcesses?.map((process, processIndex) => (
              <div key={processIndex} className="border rounded p-3 bg-white">
                <div className="flex gap-3 items-end">
                  {/* Ngày bắt đầu - fixed width */}
                  <div className="w-[140px] space-y-1">
                    <Label className="text-xs">Ngày bắt đầu</Label>
                    <Input
                      type="date"
                      value={process.startDate || ""}
                      onChange={(e) => {
                        const updatedProcesses = [...employee.workProcesses];
                        updatedProcesses[processIndex] = {
                          ...process,
                          startDate: e.target.value,
                        };
                        handleFieldChange(
                          employee.tempId,
                          "workProcesses",
                          updatedProcesses,
                        );
                      }}
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Ngày kết thúc - fixed width */}
                  <div className="w-[140px] space-y-1">
                    <Label className="text-xs">Ngày kết thúc</Label>
                    <Input
                      type="date"
                      value={process.endDate || ""}
                      onChange={(e) => {
                        const updatedProcesses = [...employee.workProcesses];
                        updatedProcesses[processIndex] = {
                          ...process,
                          endDate: e.target.value,
                        };
                        handleFieldChange(
                          employee.tempId,
                          "workProcesses",
                          updatedProcesses,
                        );
                      }}
                      className="h-8 text-sm"
                    />
                  </div>

                  {/* Mô tả - chiếm hết */}
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Chi tiết công việc</Label>
                    <Input
                      value={process.detail || ""}
                      onChange={(e) => {
                        const updatedProcesses = [...employee.workProcesses];
                        updatedProcesses[processIndex] = {
                          ...process,
                          detail: e.target.value,
                        };
                        handleFieldChange(
                          employee.tempId,
                          "workProcesses",
                          updatedProcesses,
                        );
                      }}
                      className="h-8 text-sm"
                      placeholder="Mô tả công việc"
                    />
                  </div>

                  {/* Nút Xóa */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updatedProcesses = employee.workProcesses.filter(
                        (_, i) => i !== processIndex,
                      );
                      handleFieldChange(
                        employee.tempId,
                        "workProcesses",
                        updatedProcesses,
                      );
                    }}
                    className="h-8 w-8 text-red-500 hover:text-red-700 shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newProcess = { startDate: "", endDate: "", detail: "" };
                const updatedProcesses = [
                  ...(employee.workProcesses || []),
                  newProcess,
                ];
                console.log("id qua rinh cong tac", updatedProcesses);
                handleFieldChange(
                  employee.tempId,
                  "workProcesses",
                  updatedProcesses,
                );
              }}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm quá trình công tác
            </Button>
          </div>
        </div>
      </div>

      {/* TAB QUÂN SỰ & DANH HIỆU */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Quân sự & danh hiệu
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Ngày nhập ngũ</Label>
            <Input
              type="date"
              value={employee.militaryJoinDate}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "militaryJoinDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày xuất ngũ</Label>
            <Input
              type="date"
              value={employee.militaryEndDate}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "militaryEndDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Quân hàm, chức vụ cao nhất</Label>
            <Input
              value={employee.title}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "title", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập quân hàm / chức vụ"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Danh hiệu được phong</Label>
            <GenericSearchSelect
              api={categoryConfigs.militaryRank.api}
              config={categoryConfigs.militaryRank}
              value={employee.militaryRankId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "militaryRankId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thương binh hạng</Label>
            <Input
              type="number"
              value={employee.injuryRank}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "injuryRank", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập hạng (số)"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Gia đình liệt sĩ</Label>
            <Select
              value={employee.isWoundedSoldier ? "co" : "khong"}
              onValueChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "isWoundedSoldier",
                  v === "co",
                )
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="co">Có</SelectItem>
                <SelectItem value="khong">Không</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TAB SỨC KHỎE */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Sức khỏe
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Tình trạng sức khỏe</Label>
            <Input
              value={employee.healthStatus}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "healthStatus",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập tình trạng"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chiều cao (cm)</Label>
            <Input
              type="number"
              value={employee.height}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "height", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="cm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cân nặng (kg)</Label>
            <Input
              type="number"
              value={employee.weight}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "weight", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="kg"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhóm máu</Label>
            <Select
              value={employee.bloodType}
              onValueChange={(v) =>
                handleFieldChange(employee.tempId, "bloodType", v)
              }
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Chọn" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "A",
                  "B",
                  "AB",
                  "O",
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TAB CCCD */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Căn cước công dân / cccd
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số CCCD</Label>
            <Input
              value={employee.cccdNumber}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "cccdNumber", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập số CCCD"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày cấp</Label>
            <Input
              type="date"
              value={employee.cccdDate}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "cccdDate", e.target.value)
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nơi cấp</Label>
            <Input
              value={employee.cccdPlace}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "cccdPlace", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập nơi cấp"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Số thẻ</Label>
            <Input
              value={employee.cardNumber}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "cardNumber", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập số thẻ"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày trả hồ sơ</Label>
            <Input
              type="date"
              value={employee.documentReturnDate}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "documentReturnDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* TAB THU NHẬP GIA ĐÌNH & TÀI SẢN */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Thu nhập gia đình & tài sản
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nguồn thu nhập gia đình (VNĐ)</Label>
            <Input
              type="number"
              value={employee.familyIncome}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "familyIncome",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập số tiền"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Các nguồn thu nhập khác</Label>
            <Input
              value={employee.otherIncome}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "otherIncome",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Mô tả"
            />
          </div>
          {/* Nhà ở */}
          <div className="space-y-1">
            <Label className="text-xs">Loại nhà được cấp/thuê</Label>
            <Input
              value={employee.housingType}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "housingType",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập loại nhà"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Diện tích được cấp/thuê (m²)</Label>
            <Input
              type="number"
              value={employee.housingArea}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "housingArea",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="m²"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nhà tự mua/xây – Loại nhà</Label>
            <Input
              value={employee.selfHousingType}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "selfHousingType",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập loại nhà"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Diện tích tự mua/xây (m²)</Label>
            <Input
              type="number"
              value={employee.usableArea}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "usableArea", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="m²"
            />
          </div>
          {/* Đất đai */}
          <div className="space-y-1">
            <Label className="text-xs">Đất được cấp (m²)</Label>
            <Input
              type="number"
              value={employee.grantedLandArea}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "grantedLandArea",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="m²"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Đất tự mua (m²)</Label>
            <Input
              type="number"
              value={employee.purchasedLandArea}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "purchasedLandArea",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="m²"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Các loại đất khác</Label>
            <Input
              value={employee.otherLand}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "otherLand", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Mô tả"
            />
          </div>
        </div>
      </div>

      {/* TAB TÀI KHOẢN NGÂN HÀNG */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Tài khoản ngân hàng
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số tài khoản ngân hàng</Label>
            <Input
              value={employee.bankAccountNumber}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "bankAccountNumber",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập số tài khoản"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tên ngân hàng</Label>
            <Input
              value={employee.bankName}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "bankName", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập tên ngân hàng"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chủ tài khoản</Label>
            <Input
              value={employee.bankAccountHolder}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "bankAccountHolder",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập tên chủ tài khoản"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chi nhánh ngân hàng</Label>
            <Input
              value={employee.bankBranch}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "bankBranch", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập chi nhánh"
            />
          </div>
        </div>
      </div>

      {/* TAB TUYỂN DỤNG */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Tuyển dụng
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Ngày vào cơ quan *</Label>
            <Input
              type="date"
              value={employee.startDate}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "startDate", e.target.value)
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Loại hợp đồng</Label>
            <Input
              value={employee.contractType}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "contractType",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập loại HĐ"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Loại hợp đồng lao động</Label>
            <GenericSearchSelect
              api={categoryConfigs.laborContractType.api}
              config={categoryConfigs.laborContractType}
              value={employee.laborContractTypeId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "laborContractTypeId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nghề trước tuyển dụng</Label>
            <Input
              value={employee.previousJob}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "previousJob",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập nghề trước tuyển dụng"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày tuyển dụng</Label>
            <Input
              type="date"
              value={employee.recruitmentDate}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "recruitmentDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Cơ quan tuyển dụng</Label>
            <GenericSearchSelect
              api={categoryConfigs.organization.api}
              config={categoryConfigs.organization}
              value={employee.organizationId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "organizationId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Địa chỉ cơ quan</Label>
            <Input
              value={employee.organizationAddress}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "organizationAddress",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập địa chỉ cơ quan"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Công việc chính đang làm</Label>
            <Input
              value={employee.currentJobDetail}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "currentJobDetail",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập công việc chính"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sở trường công tác</Label>
            <Input
              value={employee.workStrength}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "workStrength",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập sở trường công tác"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Công việc đã làm lâu nhất</Label>
            <Input
              value={employee.longestJob}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "longestJob", e.target.value)
              }
              className="h-8 text-sm"
              placeholder="Nhập công việc đã làm lâu nhất"
            />
          </div>
        </div>
      </div>

      {/* TAB TRÌNH ĐỘ HỌC VẤN & CHUYÊN MÔN*/}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Trình độ học vấn & chuyên môn
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Bậc học</Label>
            <GenericSearchSelect
              api={categoryConfigs.degree.api}
              config={categoryConfigs.degree}
              value={employee.educationLevelId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "educationLevelId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trình độ cụ thể</Label>
            <Input
              value={employee.educationDetail}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "educationDetail",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập trình độ cụ thể"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trình độ văn hóa</Label>
            <GenericSearchSelect
              api={categoryConfigs.culturalLevel.api}
              config={categoryConfigs.culturalLevel}
              value={employee.culturalLevelId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "culturalLevelId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trình độ chuyên môn</Label>
            <GenericSearchSelect
              api={categoryConfigs.professionalLevel.api}
              config={categoryConfigs.professionalLevel}
              value={employee.professionalLevelId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "professionalLevelId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nghề nghiệp</Label>
            <GenericSearchSelect
              api={categoryConfigs.specialty.api}
              config={categoryConfigs.specialty}
              value={employee.occupationId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "occupationId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trình độ tin học</Label>
            <GenericSearchSelect
              api={categoryConfigs.itLevel.api}
              config={categoryConfigs.itLevel}
              value={employee.itLevelId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "itLevelId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngoại ngữ</Label>
            <GenericSearchSelect
              api={categoryConfigs.languageLevel.api}
              config={categoryConfigs.languageLevel}
              value={employee.foreignLanguageId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "foreignLanguageId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trình độ ngoại ngữ</Label>
            <GenericSearchSelect
              api={categoryConfigs.languageLevel.api}
              config={categoryConfigs.languageLevel}
              value={employee.languageLevelId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "languageLevelId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Lý luận chính trị</Label>
            <GenericSearchSelect
              api={categoryConfigs.politicalTheory.api}
              config={categoryConfigs.politicalTheory}
              value={employee.politicalTheoryId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "politicalTheoryId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Trường đào tạo</Label>
            <GenericSearchSelect
              api={categoryConfigs.trainingInstitution.api}
              config={categoryConfigs.trainingInstitution}
              value={employee.trainingInstitutionId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "trainingInstitutionId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngành đào tạo</Label>
            <GenericSearchSelect
              api={categoryConfigs.trainingMajor.api}
              config={categoryConfigs.trainingMajor}
              value={employee.trainingMajorId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "trainingMajorId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hình thức đào tạo</Label>
            <GenericSearchSelect
              api={categoryConfigs.trainingType.api}
              config={categoryConfigs.trainingType}
              value={employee.trainingTypeId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "trainingTypeId", String(v))
              }
            />
          </div>
        </div>
      </div>

      {/* TAB BHXH - BẢO HIỂM XÃ HỘI */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Bhxh - Bảo hiểm xã hội
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Số sổ BHXH</Label>
            <Input
              value={employee.socialInsuranceNumber}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "socialInsuranceNumber",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập số sổ BHXH"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Số sổ BHXH (book)</Label>
            <Input
              value={employee.insuranceBookNumber}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "insuranceBookNumber",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập số sổ BHXH (book)"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày tham gia BHXH</Label>
            <Input
              type="date"
              value={employee.socialInsuranceStartDate}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "socialInsuranceStartDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nơi đóng BHXH</Label>
            <Input
              value={employee.insurancePlace}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "insurancePlace",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập nơi đóng BHXH"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Công việc BHXH</Label>
            <GenericSearchSelect
              api={categoryConfigs.socialInsuranceJob.api}
              config={categoryConfigs.socialInsuranceJob}
              value={employee.socialInsuranceJobId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "socialInsuranceJobId",
                  String(v),
                )
              }
            />
          </div>
        </div>
      </div>

      {/* TAB LƯƠNG CHÍNH */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Lương chính
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Bảng lương</Label>
            <GenericSearchSelect
              api={categoryConfigs.payroll.api}
              config={categoryConfigs.payroll}
              value={employee.payrollId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "payrollId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bậc lương</Label>
            <GenericSearchSelect
              api={categoryConfigs.salaryScale.api}
              config={categoryConfigs.salaryScale}
              value={employee.salaryScaleId}
              onChange={(v) =>
                handleFieldChange(employee.tempId, "salaryScaleId", String(v))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hệ số lương</Label>
            <Input
              type="number"
              step="0.01"
              value={employee.salaryCoefficient}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "salaryCoefficient",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập hệ số"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mức lương (VNĐ)</Label>
            <Input
              type="number"
              value={employee.salaryAmount}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "salaryAmount",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập mức lương"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Ngày áp dụng lương</Label>
            <Input
              type="date"
              value={employee.effectiveDate}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "effectiveDate",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* TAB LƯƠNG ĐÓNG BHXH */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Lương đóng bảo hiểm xã hội
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {/* Lương BHXH */}
          <div className="space-y-1">
            <Label className="text-xs">Bảng lương BHXH</Label>
            <GenericSearchSelect
              api={categoryConfigs.payroll.api}
              config={categoryConfigs.payroll}
              value={employee.socialInsurancePayrollId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "socialInsurancePayrollId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Bậc lương BHXH</Label>
            <GenericSearchSelect
              api={categoryConfigs.salaryScale.api}
              config={categoryConfigs.salaryScale}
              value={employee.insuranceSalaryScaleId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "insuranceSalaryScaleId",
                  String(v),
                )
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Hệ số lương BHXH</Label>
            <Input
              type="number"
              step="0.01"
              value={employee.insuranceSalaryCoefficient}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "insuranceSalaryCoefficient",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập hệ số"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Mức lương BHXH (VNĐ)</Label>
            <Input
              type="number"
              value={employee.insuranceSalaryBase}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "insuranceSalaryBase",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập mức lương"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">
              Lương NS tài chính công đoàn (VNĐ)
            </Label>
            <Input
              type="number"
              value={employee.insuranceUnionSalary}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "insuranceUnionSalary",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập số tiền"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Chức danh BHXH</Label>
            <GenericSearchSelect
              api={categoryConfigs.jobTitle.api}
              config={categoryConfigs.jobTitle}
              value={employee.insurancePositionId}
              onChange={(v) =>
                handleFieldChange(
                  employee.tempId,
                  "insurancePositionId",
                  String(v),
                )
              }
            />
          </div>
        </div>
      </div>

      {/* TAB LỊCH SỬ BẢN THÂN */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-blue-600 border-b pb-1 uppercase tracking-wide">
          Đặc điểm lịch sử bản thân
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Lịch sử pháp lý</Label>
            <Input
              value={employee.legalHistory}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "legalHistory",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập lịch sử pháp lý"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Công tác tại chế độ cũ</Label>
            <Input
              value={employee.workedInOldRegime}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "workedInOldRegime",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập công tác tại chế độ cũ"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Quan hệ nước ngoài</Label>
            <Input
              value={employee.foreignOrganizationRelation}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "foreignOrganizationRelation",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập quan hệ nước ngoài"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Thân nhân ở nước ngoài</Label>
            <Input
              value={employee.relativesAbroad}
              onChange={(e) =>
                handleFieldChange(
                  employee.tempId,
                  "relativesAbroad",
                  e.target.value,
                )
              }
              className="h-8 text-sm"
              placeholder="Nhập thân nhân ở nước ngoài"
            />
          </div>
          {/* THÊM trước ô Ghi chú */}
          <div className="col-span-4 space-y-1">
            <Label className="text-xs">Ghi chú</Label>
            <Textarea
              value={employee.note}
              onChange={(e) =>
                handleFieldChange(employee.tempId, "note", e.target.value)
              }
              className="text-sm"
              rows={3}
              placeholder="Nhập ghi chú"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const ColumnSelector = () => {
    const groupedColumns = allColumns.optional.reduce(
      (acc, col) => {
        if (!acc[col.group]) acc[col.group] = [];
        acc[col.group].push(col);
        return acc;
      },
      {} as Record<string, typeof allColumns.optional>,
    );

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronDown className="h-4 w-4" />
            Tùy chỉnh cột ({visibleColumns.size}/
            {allColumns.required.length + allColumns.optional.length})
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 max-h-[400px] overflow-y-auto"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Cột bắt buộc</h4>
              <div className="space-y-2">
                {allColumns.required.map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center gap-2 opacity-50"
                  >
                    <Checkbox checked disabled />
                    <Label className="text-sm cursor-not-allowed">
                      {col.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {Object.entries(groupedColumns).map(([group, cols]) => (
              <div key={group}>
                <h4 className="font-semibold text-sm mb-2">{group}</h4>
                <div className="space-y-2">
                  {cols.map((col) => (
                    <div key={col.key} className="flex items-center gap-2">
                      <Checkbox
                        checked={visibleColumns.has(col.key)}
                        onCheckedChange={() => toggleColumn(col.key)}
                      />
                      <Label
                        className="text-sm cursor-pointer"
                        onClick={() => toggleColumn(col.key)}
                      >
                        {col.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Thêm nhân viên
          </DialogTitle>
          <DialogDescription>
            Có thể thêm nhiều nhân viên và lưu một lần
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Toolbar */}
          <div className="px-6 py-3 border-b flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImportExcel}
              />

              <Button
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Tải lên
              </Button>

              <Button size="sm" className="gap-2" onClick={handleExportExcel}>
                <Download className="h-4 w-4" />
                Tải xuống
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "table" ? "expanded" : "table")
                }
                className="gap-2"
              >
                {viewMode === "table" ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
                {viewMode === "table" ? "Mở rộng" : "Thu gọn"}
              </Button>

              {viewMode === "table" && <ColumnSelector />}

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleAddEmployee}
              >
                <Plus className="h-4 w-4" />
                Thêm nhân viên
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              Tổng số: <b>{employees.length}</b> nhân viên
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-6 py-4">
            {employees.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10">
                Chưa có nhân viên nào. Nhấn <b>Thêm nhân viên</b> để bắt đầu.
              </div>
            ) : viewMode === "table" ? (
              // TABLE VIEW
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky left-0 bg-background z-10">
                        #
                      </TableHead>
                      <TableHead className="w-32 text-center sticky left-12 bg-background z-10">
                        Thao tác
                      </TableHead>
                      {allColumns.required.map((col) => (
                        <TableHead key={col.key} className="whitespace-nowrap">
                          {col.label}
                        </TableHead>
                      ))}
                      {allColumns.optional
                        .filter((col) => visibleColumns.has(col.key))
                        .map((col) => (
                          <TableHead
                            key={col.key}
                            className="whitespace-nowrap"
                          >
                            {col.label}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((employee, index) => (
                      <>
                        <TableRow key={employee.tempId}>
                          <TableCell className="sticky left-0 bg-background z-10 border-r">
                            <span className="font-medium">{index + 1}</span>
                          </TableCell>
                          <TableCell className="sticky left-12 bg-background z-10 border-r">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleRowExpansion(employee.tempId)
                                }
                                title={
                                  expandedRows.has(employee.tempId)
                                    ? "Thu gọn"
                                    : "Mở rộng"
                                }
                              >
                                {expandedRows.has(employee.tempId) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCopyEmployee(employee.tempId)
                                }
                                title="Sao chép"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveEmployee(employee.tempId)
                                }
                                title="Xóa"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          {allColumns.required.map((col) => (
                            <TableCell key={col.key}>
                              {renderTableCell(employee, col.key)}
                            </TableCell>
                          ))}
                          {allColumns.optional
                            .filter((col) => visibleColumns.has(col.key))
                            .map((col) => (
                              <TableCell key={col.key}>
                                {renderTableCell(employee, col.key)}
                              </TableCell>
                            ))}
                        </TableRow>
                        {expandedRows.has(employee.tempId) && (
                          <TableRow>
                            <TableCell
                              colSpan={
                                2 +
                                allColumns.required.length +
                                allColumns.optional.filter((col) =>
                                  visibleColumns.has(col.key),
                                ).length
                              }
                            >
                              {renderEmployeeFieldsExpanded(employee, index)}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // EXPANDED VIEW
              <div className="space-y-4">
                {employees.map((employee, index) =>
                  renderEmployeeFieldsExpanded(employee, index),
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t">
          <div className="w-full flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={createMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || employees.length === 0}
              >
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {createMutation.isPending ? "Đang lưu..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
