import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { unitApi } from "@/features/departments/api/departmentApi";

const NameDescForm = ({ form, onChange }) => (
  <div className="space-y-2">
    <Label>Tên *</Label>
    <Input
      placeholder="Tên"
      value={form.name || ""}
      onChange={e => onChange("name", e.target.value)}
      required
    />
    <Label>Mô tả</Label>
    <Textarea
      placeholder="Mô tả"
      value={form.description || ""}
      onChange={e => onChange("description", e.target.value)}
    />
  </div>
);

const CodeNameForm = ({ form, onChange }) => (
  <div className="space-y-2">
    <Label>Mã *</Label>
    <Input
      placeholder="Mã"
      value={form.code || ""}
      onChange={e => onChange("code", e.target.value)}
      required
    />
    <Label>Tên *</Label>
    <Input
      placeholder="Tên"
      value={form.name || ""}
      onChange={e => onChange("name", e.target.value)}
      required
    />
  </div>
);

const CodeNameDescForm = ({ form, onChange }) => (
  <div className="space-y-3">
    <div>
      <Label>Mã</Label>
      <Input
        placeholder="Nhập mã (tùy chọn)"
        value={form.code || ""}
        onChange={e => onChange("code", e.target.value)}
      />
    </div>
    <div>
      <Label>Tên *</Label>
      <Input
        placeholder="Nhập tên"
        value={form.name || ""}
        onChange={e => onChange("name", e.target.value)}
        required
      />
    </div>
    <div>
      <Label>Mô tả</Label>
      <Textarea
        placeholder="Nhập mô tả"
        value={form.description || ""}
        onChange={e => onChange("description", e.target.value)}
        rows={3}
      />
    </div>
  </div>
);

// Form đặc biệt cho Training Institution
const TrainingInstitutionForm = ({ form, onChange }) => (
  <div className="space-y-3">
    <div>
      <Label>Tên trường đào tạo *</Label>
      <Input
        placeholder="Nhập tên trường đào tạo"
        value={form.name || ""}
        onChange={e => onChange("name", e.target.value)}
        required
      />
      <p className="text-xs text-muted-foreground mt-1">
        Ví dụ: Đại học Bách Khoa Hà Nội, Đại học Kinh tế Quốc dân...
      </p>
    </div>

    <div>
      <Label>Địa chỉ</Label>
      <Input
        placeholder="Nhập địa chỉ trường"
        value={form.address || ""}
        onChange={e => onChange("address", e.target.value)}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Địa chỉ chi tiết của trường đào tạo
      </p>
    </div>

    <div>
      <Label>Số điện thoại</Label>
      <Input
        placeholder="Nhập số điện thoại"
        value={form.phone || ""}
        onChange={e => onChange("phone", e.target.value)}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Số điện thoại liên hệ của trường
      </p>
    </div>

    <div>
      <Label>Email</Label>
      <Input
        type="email"
        placeholder="Nhập email"
        value={form.email || ""}
        onChange={e => onChange("email", e.target.value)}
      />
      <p className="text-xs text-muted-foreground mt-1">
        Email liên hệ của trường đào tạo
      </p>
    </div>
  </div>
);

// Form đặc biệt cho Department
const DepartmentForm = ({ form, onChange, departments = [], departmentTypes = [], loadingTypes = false }) => {
  return (
    <div className="space-y-3">
      <div>
        <Label>Tên phòng ban *</Label>
        <Input
          placeholder="Nhập tên phòng ban"
          value={form.name || ""}
          onChange={e => onChange("name", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Mã phòng ban *</Label>
        <Input
          placeholder="Nhập mã phòng ban"
          value={form.code || ""}
          onChange={e => onChange("code", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Loại phòng ban *</Label>
        <Select
          value={form.departmentTypeId || ""}
          onValueChange={v => onChange("departmentTypeId", v)}
          disabled={loadingTypes}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTypes ? "Đang tải..." : "Chọn loại phòng ban"} />
          </SelectTrigger>
          <SelectContent>
            {departmentTypes.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Không có loại phòng ban nào
              </div>
            ) : (
              departmentTypes.map(type => (
                <SelectItem key={type.id} value={String(type.id)}>
                  <div className="flex flex-col">
                    <span>{type.name}</span>
                    <span className="text-xs text-muted-foreground">{type.code}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {departmentTypes.length === 0 && !loadingTypes && (
          <p className="text-xs text-muted-foreground mt-1">
            Chưa có loại phòng ban. Vui lòng thêm loại phòng ban trong phần Danh mục.
          </p>
        )}
      </div>

      <div>
        <Label>Phòng ban gốc</Label>
        <Select
          value={form.parent || 'none'}
          onValueChange={v => onChange("parent", v === 'none' ? '' : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn phòng ban gốc" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <span className="italic text-muted-foreground">Không có (phòng ban gốc)</span>
            </SelectItem>
            {departments.map(d => (
              <SelectItem key={d.id} value={d.id.toString()}>
                <div className="flex flex-col">
                  <span>{d.name}</span>
                  {d.code && <span className="text-xs text-muted-foreground">{d.code}</span>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

import { jobPositionApi, jobTitleApi, positionApi } from "@/features/categories/api/categoriesApi";
import { degreeApi } from "@/features/categories/api/categoriesApi";
import { specialtyApi } from "@/features/categories/api/categoriesApi";
import { languageLevelApi } from "@/features/categories/api/categoriesApi";
import { politicalTheoryApi } from "@/features/categories/api/categoriesApi";
import { wardApi } from "@/features/categories/api/categoriesApi";
import { provinceCityApi } from "@/features/categories/api/categoriesApi";
import { ethnicityApi } from "@/features/categories/api/categoriesApi";
import { nationalityApi } from "@/features/categories/api/categoriesApi";
import { departmentTypeApi } from "@/features/departments/api/departmentTypeApi";
import { laborContractTypeApi } from "@/features/categories/api/categoriesApi";
import { culturalLevelApi } from "@/features/categories/api/categoriesApi";
import { professionalLevelApi } from "@/features/categories/api/categoriesApi";
import { itLevelApi } from "@/features/categories/api/categoriesApi";
import { trainingInstitutionApi } from "@/features/categories/api/categoriesApi";
import { trainingMajorApi } from "@/features/categories/api/categoriesApi";
import { trainingTypeApi } from "@/features/categories/api/categoriesApi";
import { militaryRankApi } from "@/features/categories/api/categoriesApi";
import { policyFamilyApi } from "@/features/categories/api/categoriesApi";
import { socialInsuranceJobApi } from "@/features/categories/api/categoriesApi";
import { partyCommitteeApi } from "@/features/categories/api/categoriesApi";
import { companyApi } from '@/features/company/api/company';


export const categoryConfigs = {
  company: {
    api: companyApi,
    placeholder: "Chọn công ty",
    modalTitle: "Tạo công ty mới",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" },
  },
  // Loại hợp đồng lao động
  laborContractType: {
    api: laborContractTypeApi,
    placeholder: "Chọn loại hợp đồng",
    modalTitle: "Tạo loại hợp đồng mới",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Chức vụ
  jobTitle: {
    api: jobTitleApi,
    placeholder: "Chọn chức danh",
    modalTitle: "Tạo chức danh mới",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Loại phòng ban
  departmentType: {
    api: departmentTypeApi,
    placeholder: "Chọn loại phòng ban",
    modalTitle: "Tạo loại phòng ban",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Trong categoryConfigs, thêm:
  position: {
    api: positionApi,
    placeholder: "Chọn chức vụ",
    modalTitle: "Tạo chức vụ mới",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" },
  },

  jobPosition: {
    api: jobPositionApi,
    placeholder: "Chọn vị trí công việc",
    modalTitle: "Tạo vị trí công việc mới",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" },
  },

  // Bậc học
  degree: {
    api: degreeApi,
    placeholder: "Chọn bậc học",
    modalTitle: "Tạo bậc học",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  // Dân tộc
  ethnicity: {
    api: ethnicityApi,
    placeholder: "Chọn dân tộc",
    modalTitle: "Tạo dân tộc",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  // Phường/Xã
  ward: {
    api: wardApi,
    placeholder: "Chọn phường/xã",
    modalTitle: "Tạo phường/xã",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" }
  },

  // Tỉnh/Thành phố
  provinceCity: {
    api: provinceCityApi,
    placeholder: "Chọn tỉnh/thành phố",
    modalTitle: "Tạo tỉnh/thành",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" }
  },

  // Nghề nghiệp (Specialty)
  specialty: {
    api: specialtyApi,
    placeholder: "Chọn nghề nghiệp",
    modalTitle: "Tạo nghề nghiệp",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Lý luận chính trị
  politicalTheory: {
    api: politicalTheoryApi,
    placeholder: "Chọn lý luận chính trị",
    modalTitle: "Tạo lý luận chính trị",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  // Trình độ ngoại ngữ
  languageLevel: {
    api: languageLevelApi,
    placeholder: "Chọn trình độ ngoại ngữ",
    modalTitle: "Tạo trình độ ngoại ngữ",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  // Quốc tịch
  nationality: {
    api: nationalityApi,
    placeholder: "Chọn quốc tịch",
    modalTitle: "Tạo quốc tịch",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" }
  },

  // Trình độ văn hóa
  culturalLevel: {
    api: culturalLevelApi,
    placeholder: "Chọn trình độ văn hóa",
    modalTitle: "Tạo trình độ văn hóa",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Trình độ chuyên môn
  professionalLevel: {
    api: professionalLevelApi,
    placeholder: "Chọn trình độ chuyên môn",
    modalTitle: "Tạo trình độ chuyên môn",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Trình độ tin học
  itLevel: {
    api: itLevelApi,
    placeholder: "Chọn trình độ tin học",
    modalTitle: "Tạo trình độ tin học",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Trường đào tạo (có form riêng)
  trainingInstitution: {
    api: trainingInstitutionApi,
    placeholder: "Chọn trường đào tạo",
    modalTitle: "Tạo trường đào tạo",
    FormComponent: TrainingInstitutionForm,
    defaultForm: { name: "", address: "", phone: "", email: "" },

    // Validation đặc biệt
    validate: (form) => {
      if (!form.name?.trim()) {
        return "Vui lòng nhập tên trường đào tạo";
      }
      // Validate email nếu có
      if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        return "Email không hợp lệ";
      }
      return null;
    }
  },

  // Ngành đào tạo
  trainingMajor: {
    api: trainingMajorApi,
    placeholder: "Chọn ngành đào tạo",
    modalTitle: "Tạo ngành đào tạo",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Hình thức đào tạo
  trainingType: {
    api: trainingTypeApi,
    placeholder: "Chọn hình thức đào tạo",
    modalTitle: "Tạo hình thức đào tạo",
    FormComponent: NameDescForm,
    defaultForm: { name: "", description: "" }
  },

  // Quân hàm
  militaryRank: {
    api: militaryRankApi,
    placeholder: "Chọn quân hàm",
    modalTitle: "Tạo quân hàm",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Gia đình chính sách
  policyFamily: {
    api: policyFamilyApi,
    placeholder: "Chọn gia đình chính sách",
    modalTitle: "Tạo gia đình chính sách",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  // Công việc BHXH
  socialInsuranceJob: {
    api: socialInsuranceJobApi,
    placeholder: "Chọn công việc BHXH",
    modalTitle: "Tạo công việc BHXH",
    FormComponent: CodeNameDescForm,
    defaultForm: { name: "", code: "", description: "" }
  },

  partyCommittee: {
    api: {
      ...partyCommitteeApi,
      getAll: async () => {
        const res = await partyCommitteeApi.getAll();
        // Trả array thẳng, KHÔNG wrap { data: [...] }
        return Array.isArray(res) ? res : res?.data ?? [];
      }
    },
    placeholder: "Chọn cấp ủy",
    modalTitle: "Tạo cấp ủy",
    FormComponent: CodeNameForm,
    defaultForm: { name: "", code: "" },
  },

  // Phòng ban (Department)
  department: {
    api: unitApi,
    placeholder: "Chọn phòng ban",
    modalTitle: "Tạo phòng ban",
    FormComponent: DepartmentForm,
    defaultForm: { name: "", code: "", departmentTypeId: "", parent: "" },

    // Custom transform để map payload đúng định dạng API
    transformPayload: (form) => {
      const payload: any = {
        company: { id: 2 },
        name: form.name?.trim() || "",
        departmentType: form.departmentTypeId ? { id: Number(form.departmentTypeId) } : null,
      };

      // Chỉ thêm code nếu có giá trị
      if (form.code?.trim()) {
        payload.code = form.code.trim();
      }

      // Chỉ thêm parent nếu có giá trị
      if (form.parent && form.parent !== 'none') {
        payload.parent = { id: Number(form.parent) };
      } else {
        payload.parent = null;
      }

      return payload;
    },

    // Validation đặc biệt cho department
    validate: (form) => {
      if (!form.name?.trim()) {
        return "Vui lòng nhập tên phòng ban";
      }
      if (!form.departmentTypeId) {
        return "Vui lòng chọn loại phòng ban";
      }
      return null;
    }
  }
};